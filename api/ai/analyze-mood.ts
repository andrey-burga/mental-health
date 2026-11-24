import { ThinkingLevel, Type } from "@google/genai";
import {
  CLINICAL_SYSTEM_INSTRUCTION,
  GEMINI_TEXT_MODEL,
  classifyGeminiError,
  evaluateSafetyServerSide,
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

type HabitCategory = "Físico" | "Mental" | "Emocional" | "Social";

export interface SuggestedMicroHabit {
  title: string;
  category: HabitCategory;
  durationMinutes: number;
}

export interface RecommendedResource {
  title: string;
  reason: string;
  route: string;
}

export interface MoodAnalysisPayload {
  emotionalTone: string;
  compassionateFeedback: string;
  suggestedMicroHabit: SuggestedMicroHabit;
  recommendedResources: RecommendedResource[];
}

const VALID_CATEGORIES: HabitCategory[] = [
  "Físico",
  "Mental",
  "Emocional",
  "Social",
];

const VALID_RESOURCE_ROUTES = [
  "/respiracion",
  "/sonidos",
  "/diario",
  "/autocuidado-diario",
  "/autocuidado",
  "/articulos",
  "/factores-riesgo",
  "/trastornos",
  "/trastornos/trastorno-de-ansiedad-generalizada",
  "/trastornos/trastorno-depresivo-mayor",
  "/trastornos/trastorno-por-estres-postraumatico",
  "/trastornos/trastorno-de-panico",
  "/ayuda",
] as const;

function sanitizeCategory(raw?: string): HabitCategory {
  if (raw && (VALID_CATEGORIES as string[]).includes(raw)) {
    return raw as HabitCategory;
  }
  return "Emocional";
}

function sanitizeRoute(raw?: string): string {
  if (raw && (VALID_RESOURCE_ROUTES as readonly string[]).includes(raw.trim())) {
    return raw.trim();
  }
  return "/respiracion";
}

interface AnalyzeMoodBody {
  text?: unknown;
  moodScore?: unknown;
  moodLabel?: unknown;
  tag?: unknown;
  source?: unknown;
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (!applyCors(req, res)) return;

  if (
    !checkRateLimit(req, res, {
      scope: "ai-analyze-mood",
      maxRequests: 20,
      windowMs: 60_000,
    })
  ) {
    return;
  }

  if (req.method !== "POST") {
    sendError(
      res,
      405,
      "METHOD_NOT_ALLOWED",
      "Solo se permite el método POST en este endpoint."
    );
    return;
  }

  let body: AnalyzeMoodBody;
  try {
    body = await parseJsonBody<AnalyzeMoodBody>(req);
  } catch (err) {
    sendError(
      res,
      400,
      "INVALID_JSON",
      err instanceof Error ? err.message : "No se pudo interpretar la solicitud JSON."
    );
    return;
  }

  const rawText = typeof body.text === "string" ? body.text.trim() : "";
  const rawMoodScore =
    body.moodScore !== undefined && body.moodScore !== null
      ? Number(body.moodScore)
      : undefined;
  const moodScore =
    rawMoodScore !== undefined &&
    Number.isFinite(rawMoodScore) &&
    rawMoodScore >= 1 &&
    rawMoodScore <= 5
      ? Math.round(rawMoodScore)
      : undefined;
  const moodLabel =
    typeof body.moodLabel === "string" ? body.moodLabel.trim().slice(0, 60) : "";
  const tag = typeof body.tag === "string" ? body.tag.trim().slice(0, 60) : "";
  const sourceContext = body.source === "checkin" ? "checkin" : "journal";

  if (!rawText && moodScore === undefined) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Debes enviar una entrada de texto o un puntaje de estado de ánimo."
    );
    return;
  }

  if (rawText.length > 4000) {
    sendError(
      res,
      400,
      "TEXT_TOO_LONG",
      "El texto supera el límite permitido de 4000 caracteres."
    );
    return;
  }

  // 1. Capa obligatoria de seguridad y detección de crisis ANTES de generar consejos
  if (rawText.length > 0) {
    const safety = await evaluateSafetyServerSide(rawText);
    if (safety.isCrisis || safety.riskLevel === "moderate" || safety.riskLevel === "high") {
      sendJson(res, 200, {
        ok: true,
        isCrisis: true,
        riskLevel: safety.riskLevel === "none" ? "moderate" : safety.riskLevel,
        reason: safety.reason,
        matchedSignals: safety.matchedSignals,
        safetySource: safety.source,
      });
      return;
    }
  }

  // 2. Verificar cliente Gemini para análisis emocional
  const ai = getGeminiClient();
  if (!ai) {
    sendError(
      res,
      503,
      "AI_NOT_CONFIGURED",
      "El análisis empático con IA no está configurado en el servidor todavía."
    );
    return;
  }

  const contextLines: string[] = [
    `Origen: ${sourceContext === "checkin" ? "Check-in rápido de autocuidado" : "Entrada privada de diario emocional"}.`,
  ];
  if (moodLabel) contextLines.push(`Emoción seleccionada: ${moodLabel}.`);
  if (moodScore !== undefined) {
    contextLines.push(`Nivel de energía/paz reportado: ${moodScore} de 5.`);
  }
  if (tag) contextLines.push(`Etiqueta: ${tag}.`);
  if (rawText) {
    contextLines.push(`Texto anónimo:\n"""\n${rawText}\n"""`);
  }

  const prompt = `Analiza de manera empática, cálida y psicoeducativa el siguiente registro emocional anónimo (sin datos personales):

${contextLines.join("\n")}

Devuelve:
1. 'emotionalTone': una etiqueta descriptiva, humana y no patologizante (ej. "Sobrecarga y cansancio mental", "Inquietud con búsqueda de calma", "Serenidad agradecida").
2. 'compassionateFeedback': devolución breve (2 a 3 oraciones) en español que valide lo que siente la persona con cercanía y enfoque psicoeducativo, sin diagnosticar trastornos ni mencionar medicación.
3. 'suggestedMicroHabit': un micro-hábito concreto, amable y realizable hoy mismo (duración entre 2 y 20 minutos) en una de estas categorías exactas: "Físico", "Mental", "Emocional", "Social".
4. 'recommendedResources': hasta 2 recursos reales de la plataforma elegidos estrictamente de estas rutas según la necesidad del momento:
   - "/respiracion" (Ejercicio de respiración guiada para regular activación o ansiedad)
   - "/sonidos" (Biblioteca de sonidos relajantes y ruido blanco)
   - "/diario" (Diario de emociones para seguir procesando pensamientos)
   - "/autocuidado-diario" (Planificador personal de micro-hábitos)
   - "/autocuidado" (Guías prácticas de autocuidado físico, mental y emocional)
   - "/articulos" (Artículos psicoeducativos sobre límites, descanso y bienestar)
   - "/factores-riesgo" (Identificación temprana de señales de desgaste)
   - "/trastornos/trastorno-de-ansiedad-generalizada" (Psicoeducación sobre ansiedad persistente)
   - "/trastornos/trastorno-depresivo-mayor" (Psicoeducación sobre tristeza prolongada y fatiga emocional)
   - "/trastornos/trastorno-por-estres-postraumatico" (Psicoeducación sobre respuesta al estrés intenso)
   - "/trastornos/trastorno-de-panico" (Psicoeducación sobre episodios súbitos de angustia)
   - "/ayuda" (Directorio confidencial de líneas de apoyo y profesionales)`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: CLINICAL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalTone: {
              type: Type.STRING,
              description: "Etiqueta empática y no clínica del tono emocional.",
            },
            compassionateFeedback: {
              type: Type.STRING,
              description: "Devolución breve (2-3 oraciones) validante y psicoeducativa.",
            },
            suggestedMicroHabit: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Acción concreta y amable realizable hoy.",
                },
                category: {
                  type: Type.STRING,
                  enum: [...VALID_CATEGORIES],
                  description: "Categoría del hábito.",
                },
                durationMinutes: {
                  type: Type.INTEGER,
                  description: "Duración estimada en minutos (1 a 30).",
                },
              },
              required: ["title", "category", "durationMinutes"],
            },
            recommendedResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Nombre claro del recurso de la plataforma.",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "Motivo breve por el cual este recurso ayuda ahora.",
                  },
                  route: {
                    type: Type.STRING,
                    enum: [...VALID_RESOURCE_ROUTES],
                    description: "Ruta real dentro de la plataforma.",
                  },
                },
                required: ["title", "reason", "route"],
              },
            },
          },
          required: [
            "emotionalTone",
            "compassionateFeedback",
            "suggestedMicroHabit",
            "recommendedResources",
          ],
        },
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const parsed = JSON.parse(
      (response.text ?? "{}").trim()
    ) as Partial<MoodAnalysisPayload>;

    const rawHabit = parsed.suggestedMicroHabit;
    const durationRaw = Number(rawHabit?.durationMinutes ?? 5);
    const clampedDuration = Number.isFinite(durationRaw)
      ? Math.min(30, Math.max(1, Math.round(durationRaw)))
      : 5;

    const suggestedMicroHabit: SuggestedMicroHabit = {
      title:
        rawHabit?.title?.trim().slice(0, 110) ||
        "Hacer 3 minutos de respiración pausada lejos de pantallas",
      category: sanitizeCategory(rawHabit?.category),
      durationMinutes: clampedDuration,
    };

    const rawResources = Array.isArray(parsed.recommendedResources)
      ? parsed.recommendedResources
      : [];

    const recommendedResources: RecommendedResource[] = rawResources
      .slice(0, 2)
      .map((item) => ({
        title: item?.title?.trim() || "Respiración Guiada",
        reason:
          item?.reason?.trim() ||
          "Ayuda a regular el sistema nervioso con un ritmo suave y guiado.",
        route: sanitizeRoute(item?.route),
      }));

    if (recommendedResources.length === 0) {
      recommendedResources.push({
        title: "Respiración Guiada",
        reason: "Un par de minutos de pausa respiratoria ayudan a recuperar calma.",
        route: "/respiracion",
      });
    }

    const analysis: MoodAnalysisPayload = {
      emotionalTone:
        parsed.emotionalTone?.trim() || "Momento de introspección emocional",
      compassionateFeedback:
        parsed.compassionateFeedback?.trim() ||
        "Gracias por darte este espacio para escuchar cómo te sientes. Validar tus emociones sin exigirte perfección es un paso valioso para cuidar tu equilibrio.",
      suggestedMicroHabit,
      recommendedResources,
    };

    sendJson(res, 200, {
      ok: true,
      isCrisis: false,
      riskLevel: "none",
      ...analysis,
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error("Error analizando estado de ánimo con Gemini:", error);
    sendError(res, classified.status, classified.code, classified.message);
  }
}
