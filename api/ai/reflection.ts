import { ThinkingLevel, Type } from "@google/genai";
import {
  CLINICAL_SYSTEM_INSTRUCTION,
  GEMINI_TEXT_MODEL,
  classifyGeminiError,
  getGeminiClient,
} from "../_lib/gemini.ts";
import {
  applyCors,
  checkRateLimit,
  parseJsonBody,
  sendError,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.ts";

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

const reflectionCache = new Map<string, CacheEntry>();
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

  try {
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

    const payload: DailyReflectionPayload = {
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

    pruneCache(now);
    reflectionCache.set(cacheKey, { data: payload, createdAt: now });

    sendJson(res, 200, {
      ok: true,
      ...payload,
      timeOfDay,
      cached: false,
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error("Error generando reflexión diaria con Gemini:", error);
    sendError(res, classified.status, classified.code, classified.message);
  }
}
