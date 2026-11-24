import { ThinkingLevel, Type } from "@google/genai";
import {
  CLINICAL_SYSTEM_INSTRUCTION,
  GEMINI_TEXT_MODEL,
  getGeminiClient,
  getQuotaCooldownSecondsRemaining,
  isGeminiQuotaCoolingDown,
  isQuotaExhaustedError,
  markGeminiQuotaCooldown,
} from "../_lib/gemini.js";
import {
  applyCors,
  checkRateLimit,
  parseJsonBody,
  sendError,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

type TimeOfDay = "mañana" | "tarde" | "noche";

export interface DailyReflectionPayload {
  phrase: string;
  author: string;
  theme: string;
  reflectionPrompt: string;
  suggestedRoute: string;
  suggestedLabel: string;
}

interface CacheEntry {
  data: DailyReflectionPayload;
  createdAt: number;
}

const VALID_REFLECTION_ROUTES = [
  "/respiracion",
  "/diario",
  "/sonidos",
  "/autocuidado",
  "/autocuidado-diario",
  "/articulos",
  "/salud-mental",
] as const;

const CURATED_REFLECTIONS_BY_TIME: Record<TimeOfDay, DailyReflectionPayload[]> = {
  mañana: [
    {
      phrase:
        "No necesitas resolver toda la semana hoy; basta con elegir un primer paso amable y realista para esta mañana.",
      author: "Psicología del Autocuidado",
      theme: "Inicio sereno",
      reflectionPrompt: "¿Cuál es una cosa pequeña que puedes priorizar con calma hoy?",
      suggestedRoute: "/autocuidado-diario",
      suggestedLabel: "Planificar un micro-hábito",
    },
    {
      phrase:
        "Respirar profundo antes de mirar tus pendientes le recuerda a tu cuerpo que estás a salvo para comenzar a tu ritmo.",
      author: "Enfoque Mindfulness",
      theme: "Presencia matutina",
      reflectionPrompt: "¿Cómo se siente tu cuerpo al despertar y qué necesita ahora?",
      suggestedRoute: "/respiracion",
      suggestedLabel: "Respiración guiada",
    },
    {
      phrase:
        "Cuidar tu energía mental desde temprano no es perder tiempo, es construir base firme para todo el día.",
      author: "Tu Espacio Seguro",
      theme: "Cuidado preventivo",
      reflectionPrompt: "¿Qué límite saludable quieres proteger en tu jornada de hoy?",
      suggestedRoute: "/autocuidado",
      suggestedLabel: "Ver guías de autocuidado",
    },
  ],
  tarde: [
    {
      phrase:
        "Hacer una pausa breve a mitad del día no detiene tu avance; te devuelve claridad para seguir sin agotarte.",
      author: "Psicología del Autocuidado",
      theme: "Pausa restauradora",
      reflectionPrompt: "¿Qué tensión acumulada podrías soltar durante cinco minutos ahora?",
      suggestedRoute: "/respiracion",
      suggestedLabel: "Tomar 3 minutos de calma",
    },
    {
      phrase:
        "Tus pensamientos pueden ir rápido por la tarde; ponerlos en palabras te ayuda a mirarlos con perspectiva.",
      author: "Escritura Terapéutica",
      theme: "Orden mental",
      reflectionPrompt: "¿Qué emoción merece un poco de espacio y escucha en este momento?",
      suggestedRoute: "/diario",
      suggestedLabel: "Escribir en mi diario",
    },
    {
      phrase:
        "No todo lo que exige atención hoy merece tu desgaste; distingue lo urgente de lo verdaderamente importante.",
      author: "Tu Espacio Seguro",
      theme: "Equilibrio diario",
      reflectionPrompt: "¿Qué tarea puede esperar o hacerse de forma más sencilla hoy?",
      suggestedRoute: "/articulos",
      suggestedLabel: "Explorar artículos de apoyo",
    },
  ],
  noche: [
    {
      phrase:
        "Al caer la noche, permítete soltar lo que quedó pendiente; descansar también es una forma activa de cuidarte.",
      author: "Tu Espacio Seguro",
      theme: "Cierre y descanso",
      reflectionPrompt: "¿Qué pequeño momento de hoy puedes agradecer o dejar ir antes de dormir?",
      suggestedRoute: "/sonidos",
      suggestedLabel: "Escuchar sonidos relajantes",
    },
    {
      phrase:
        "Hiciste lo que pudiste con los recursos que tenías hoy; hablarte con amabilidad al cerrar el día sana la mente.",
      author: "Autocompasión Clínica",
      theme: "Trato amable",
      reflectionPrompt: "¿Qué palabras de aliento le darías hoy a alguien que quieres?",
      suggestedRoute: "/diario",
      suggestedLabel: "Soltar pensamientos en el diario",
    },
    {
      phrase:
        "Bajar el ritmo antes de dormir le da permiso a tu sistema nervioso para salir del modo alerta.",
      author: "Enfoque Mindfulness",
      theme: "Calma nocturna",
      reflectionPrompt: "¿Qué señal de tranquilidad puedes regalarte en los próximos diez minutos?",
      suggestedRoute: "/respiracion",
      suggestedLabel: "Hacer respiración nocturna",
    },
  ],
};

const reflectionCache = new Map<string, CacheEntry>();
const inFlightGenerations = new Map<string, Promise<DailyReflectionPayload>>();
const curatedCursorByTime = new Map<TimeOfDay, number>();
const MAX_CACHE_ENTRIES = 200;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function getLocalDateStamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeTimeOfDay(raw?: unknown): TimeOfDay {
  if (raw === "mañana" || raw === "tarde" || raw === "noche") {
    return raw;
  }
  const hour = new Date().getHours();
  if (hour < 12) return "mañana";
  if (hour < 19) return "tarde";
  return "noche";
}

function normalizeMoodScore(raw?: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const num = Number(raw);
  if (!Number.isFinite(num)) return undefined;
  const rounded = Math.round(num);
  if (rounded < 1 || rounded > 5) return undefined;
  return rounded;
}

function pruneCache(now: number): void {
  if (reflectionCache.size < MAX_CACHE_ENTRIES) return;
  for (const [key, entry] of reflectionCache.entries()) {
    if (now - entry.createdAt > CACHE_TTL_MS) {
      reflectionCache.delete(key);
    }
  }
  if (reflectionCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = reflectionCache.keys().next().value;
    if (firstKey) reflectionCache.delete(firstKey);
  }
}

function sanitizeSuggestedRoute(route?: string): string {
  if (
    route &&
    (VALID_REFLECTION_ROUTES as readonly string[]).includes(route.trim())
  ) {
    return route.trim();
  }
  return "/respiracion";
}

function pickCuratedReflection(
  timeOfDay: TimeOfDay,
  excludePhrase?: string
): DailyReflectionPayload {
  const pool = CURATED_REFLECTIONS_BY_TIME[timeOfDay];
  const currentIdx = curatedCursorByTime.get(timeOfDay) ?? 0;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const idx = (currentIdx + offset) % pool.length;
    const candidate = pool[idx];
    if (!excludePhrase || candidate.phrase !== excludePhrase) {
      curatedCursorByTime.set(timeOfDay, (idx + 1) % pool.length);
      return candidate;
    }
  }

  curatedCursorByTime.set(timeOfDay, (currentIdx + 1) % pool.length);
  return pool[currentIdx % pool.length];
}

interface ReflectionRequestBody {
  timeOfDay?: unknown;
  moodScore?: unknown;
  refresh?: unknown;
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (!applyCors(req, res)) return;

  if (
    !checkRateLimit(req, res, {
      scope: "ai-reflection",
      maxRequests: 30,
      windowMs: 60_000,
    })
  ) {
    return;
  }

  if (req.method !== "POST" && req.method !== "GET") {
    sendError(
      res,
      405,
      "METHOD_NOT_ALLOWED",
      "Usa POST o GET para obtener la reflexión diaria."
    );
    return;
  }

  let body: ReflectionRequestBody = {};
  if (req.method === "POST") {
    try {
      body = await parseJsonBody<ReflectionRequestBody>(req);
    } catch (err) {
      sendError(
        res,
        400,
        "INVALID_JSON",
        err instanceof Error ? err.message : "JSON de solicitud inválido."
      );
      return;
    }
  } else if (req.query) {
    body = {
      timeOfDay: req.query.timeOfDay,
      moodScore: req.query.moodScore,
      refresh: req.query.refresh === "true",
    };
  }

  const timeOfDay = normalizeTimeOfDay(body.timeOfDay);
  const moodScore = normalizeMoodScore(body.moodScore);
  const wantsRefresh = Boolean(body.refresh);

  const dateStamp = getLocalDateStamp();
  const cacheKey = moodScore
    ? `${dateStamp}:${timeOfDay}:mood-${moodScore}`
    : `${dateStamp}:${timeOfDay}`;

  const now = Date.now();
  const cached = reflectionCache.get(cacheKey);

  if (!wantsRefresh && cached && now - cached.createdAt < CACHE_TTL_MS) {
    sendJson(res, 200, {
      ok: true,
      ...cached.data,
      timeOfDay,
      cached: true,
    });
    return;
  }

  if (wantsRefresh) {
    if (
      !checkRateLimit(req, res, {
        scope: "ai-reflection-refresh",
        maxRequests: 5,
        windowMs: 5 * 60_000,
      })
    ) {
      return;
    }
  }

  const ai = getGeminiClient();
  if (!ai) {
    sendError(
      res,
      503,
      "AI_NOT_CONFIGURED",
      "El servicio de reflexión con IA aún no está configurado en el servidor."
    );
    return;
  }

  // Si hay una generación concurrente en curso para el mismo cacheKey (p. ej. StrictMode), reutilizarla
  if (!wantsRefresh) {
    const existingPromise = inFlightGenerations.get(cacheKey);
    if (existingPromise) {
      try {
        const sharedPayload = await existingPromise;
        sendJson(res, 200, {
          ok: true,
          ...sharedPayload,
          timeOfDay,
          cached: true,
        });
        return;
      } catch {
        // Continúa hacia respaldo curado abajo si falló la promesa compartida
      }
    }
  }

  // Si la cuota de Gemini está en enfriamiento, responder amablemente con reflexión curada (sin disparar 429)
  if (isGeminiQuotaCoolingDown()) {
    const waitSeconds = getQuotaCooldownSecondsRemaining();
    const fallback = pickCuratedReflection(timeOfDay, cached?.data.phrase);
    sendJson(res, 200, {
      ok: true,
      ...fallback,
      timeOfDay,
      cached: false,
      fallback: true,
      ...(wantsRefresh
        ? {
            notice: `Mostrando una reflexión curada mientras se restablece el límite temporal de IA (~${waitSeconds}s).`,
          }
        : {}),
    });
    return;
  }

  const moodContext = moodScore
    ? `La persona reportó de forma anónima un nivel de ánimo/energía de ${moodScore} sobre 5.`
    : "No se especificó nivel de ánimo; brinda una reflexión equilibrada y acogedora para cualquier estado emocional.";

  const prompt = `Genera una reflexión diaria breve, cálida, realista y psicológicamente saludable en español para el momento del día: "${timeOfDay}".
${moodContext}
${wantsRefresh ? "Genera una perspectiva fresca y distinta a frases clichés." : ""}

Elige exactamente una ruta de herramienta sugerida entre estas opciones reales:
- "/respiracion" (para regular ansiedad o activar la calma)
- "/diario" (para ordenar pensamientos y soltar carga mental)
- "/sonidos" (para descanso, enfoque o calma auditiva)
- "/autocuidado" (para explorar hábitos y recursos preventivos)
- "/autocuidado-diario" (para registrar pequeños hábitos cotidianos)
- "/articulos" (para leer contenido psicoeducativo)
- "/salud-mental" (para comprender mejor las emociones)`;

  const generationPromise = (async (): Promise<DailyReflectionPayload> => {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: `${CLINICAL_SYSTEM_INSTRUCTION}

Para esta tarea de reflexión diaria:
- Mantén la frase principal ('phrase') en máximo 28 palabras, cercana y serena (sin positivismo tóxico).
- 'author' debe ser una firma conceptual breve (ej. "Psicología del Autocuidado", "Enfoque Mindfulness", "Tu Espacio Seguro").
- 'reflectionPrompt' debe ser una pregunta abierta amable de máximo 18 palabras.
- 'suggestedLabel' debe ser un texto corto de botón (ej. "Probar respiración guiada", "Escribir en mi diario").`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phrase: {
              type: Type.STRING,
              description: "Reflexión breve y serena en español.",
            },
            author: {
              type: Type.STRING,
              description: "Firma o enfoque conceptual breve.",
            },
            theme: {
              type: Type.STRING,
              description: "Tema emocional breve (2-4 palabras).",
            },
            reflectionPrompt: {
              type: Type.STRING,
              description: "Pregunta breve y amable de introspección.",
            },
            suggestedRoute: {
              type: Type.STRING,
              enum: [...VALID_REFLECTION_ROUTES],
              description: "Ruta real de la plataforma sugerida para hoy.",
            },
            suggestedLabel: {
              type: Type.STRING,
              description: "Etiqueta clara y breve para el botón de acción.",
            },
          },
          required: [
            "phrase",
            "author",
            "theme",
            "reflectionPrompt",
            "suggestedRoute",
            "suggestedLabel",
          ],
        },
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const parsed = JSON.parse(
      (response.text ?? "{}").trim()
    ) as Partial<DailyReflectionPayload>;

    return {
      phrase:
        parsed.phrase?.trim() ||
        "Permítete avanzar a un ritmo amable hoy; incluso una pausa consciente es una forma de cuidado.",
      author: parsed.author?.trim() || "Tu Espacio Seguro",
      theme: parsed.theme?.trim() || "Pausa consciente",
      reflectionPrompt:
        parsed.reflectionPrompt?.trim() ||
        "¿Qué pequeño gesto te daría un poco más de calma hoy?",
      suggestedRoute: sanitizeSuggestedRoute(parsed.suggestedRoute),
      suggestedLabel:
        parsed.suggestedLabel?.trim() || "Practicar respiración guiada",
    };
  })();

  if (!wantsRefresh) {
    inFlightGenerations.set(cacheKey, generationPromise);
  }

  try {
    const payload = await generationPromise;

    pruneCache(Date.now());
    reflectionCache.set(cacheKey, { data: payload, createdAt: Date.now() });

    sendJson(res, 200, {
      ok: true,
      ...payload,
      timeOfDay,
      cached: false,
    });
  } catch (error) {
    if (isQuotaExhaustedError(error)) {
      const waitSeconds = markGeminiQuotaCooldown(error);
      console.warn(
        `Reflexión diaria en respaldo curado temporal por cuota de Gemini (${waitSeconds}s).`
      );
      const fallback = pickCuratedReflection(timeOfDay, cached?.data.phrase);
      sendJson(res, 200, {
        ok: true,
        ...fallback,
        timeOfDay,
        cached: false,
        fallback: true,
        ...(wantsRefresh
          ? {
              notice: `Mostrando una reflexión curada mientras se restablece el límite temporal de IA (~${waitSeconds}s).`,
            }
          : {}),
      });
      return;
    }

    const reason = error instanceof Error ? error.message : String(error);
    console.warn("Reflexión diaria degradada a respaldo curado:", reason);

    const fallback = pickCuratedReflection(timeOfDay, cached?.data.phrase);
    sendJson(res, 200, {
      ok: true,
      ...fallback,
      timeOfDay,
      cached: false,
      fallback: true,
    });
  } finally {
    if (!wantsRefresh) {
      inFlightGenerations.delete(cacheKey);
    }
  }
}
