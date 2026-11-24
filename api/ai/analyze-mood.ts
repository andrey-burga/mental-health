import { ThinkingLevel, Type } from "@google/genai";
import {
  detectDeterministicCrisisSignals,
  type CrisisRiskLevel,
} from "../_lib/crisisPatterns.ts";
import {
  CLINICAL_SYSTEM_INSTRUCTION,
  GEMINI_TEXT_MODEL,
  getGeminiClient,
  isGeminiQuotaCoolingDown,
  isQuotaExhaustedError,
  markGeminiQuotaCooldown,
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
  riskLevel?: CrisisRiskLevel;
  isCrisis?: boolean;
  crisisReason?: string;
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

function buildCuratedMoodFallback(
  moodScore?: number,
  moodLabel?: string
): Omit<MoodAnalysisPayload, "riskLevel" | "isCrisis" | "crisisReason"> {
  const lowerLabel = (moodLabel || "").toLowerCase();

  if ((moodScore !== undefined && moodScore <= 2) || lowerLabel.includes("triste") || lowerLabel.includes("ansio")) {
    return {
      emotionalTone: "Cansancio emocional que merece cuidado",
      compassionateFeedback:
        "Gracias por expresarlo. Cuando el ánimo baja o la mente se siente cargada, no tienes que exigirte rendir al máximo; darte una pausa breve y amable ayuda a regular el cuerpo y ordenar lo que sientes.",
      suggestedMicroHabit: {
        title: "Realizar 3 minutos de respiración pausada exhalando más lento de lo que inhalas",
        category: "Físico",
        durationMinutes: 3,
      },
      recommendedResources: [
        {
          title: "Respiración Guiada",
          reason: "Ayuda a disminuir la activación física y recuperar sensación de calma.",
          route: "/respiracion",
        },
        {
          title: "Canales de Ayuda y Orientación",
          reason: "Si sientes que necesitas hablar con alguien, siempre hay apoyo disponible.",
          route: "/ayuda",
        },
      ],
    };
  }

  return {
    emotionalTone: "Introspección y autocuidado consciente",
    compassionateFeedback:
      "Tomarte un momento para observar tus emociones fortalece tu claridad y bienestar diario. Reconocer lo que vives hoy, sin juzgarte, ya es un paso valioso para cuidar tu equilibrio.",
    suggestedMicroHabit: {
      title: "Hacer una pausa de 5 minutos lejos de pantallas para estirar hombros y respirar",
      category: "Mental",
      durationMinutes: 5,
    },
    recommendedResources: [
      {
        title: "Planificador de Autocuidado Diario",
        reason: "Convierte pequeñas pausas en hábitos sostenibles a tu propio ritmo.",
        route: "/autocuidado-diario",
      },
      {
        title: "Biblioteca de Sonidos",
        reason: "Acompaña tu momento de calma o concentración con audios relajantes.",
        route: "/sonidos",
      },
    ],
  };
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

  // 1. Capa determinista instantánea (sin consumo de cuota) ANTES de llamar al modelo
  const deterministic = rawText
    ? detectDeterministicCrisisSignals(rawText)
    : { riskLevel: "none" as CrisisRiskLevel, matchedSignals: [] as string[] };

  if (deterministic.riskLevel === "high") {
    sendJson(res, 200, {
      ok: true,
      isCrisis: true,
      riskLevel: "high",
      reason: "Se detectaron expresiones explícitas de riesgo vital o autolesión.",
      matchedSignals: deterministic.matchedSignals,
      safetySource: "deterministic",
    });
    return;
  }

  // 2. Verificar cliente Gemini o enfriamiento de cuota
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

  if (isGeminiQuotaCoolingDown()) {
    if (deterministic.riskLevel === "moderate") {
      sendJson(res, 200, {
        ok: true,
        isCrisis: true,
        riskLevel: "moderate",
        reason: "Se detectaron señales emocionales que ameritan apoyo prioritario.",
        matchedSignals: deterministic.matchedSignals,
        safetySource: "deterministic",
      });
      return;
    }

    const fallbackAnalysis = buildCuratedMoodFallback(moodScore, moodLabel);
    sendJson(res, 200, {
      ok: true,
      isCrisis: false,
      riskLevel: "none",
      fallback: true,
      ...fallbackAnalysis,
    });
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

  const prompt = `Primero evalúa el nivel de riesgo clínico/de crisis del registro emocional anónimo (ideación suicida, autolesión, despedida implícita, deseo de desaparecer o desesperanza extrema):
- Si detectas riesgo "high" o "moderate", marca 'isCrisis: true' y explica brevemente en 'crisisReason'.
- Si 'riskLevel' es "none", analiza de manera empática, cálida y psicoeducativa el registro (sin datos personales):

${contextLines.join("\n")}

Devuelve:
1. 'riskLevel' ("none" | "moderate" | "high") e 'isCrisis' (boolean).
2. 'emotionalTone': etiqueta descriptiva, humana y no patologizante.
3. 'compassionateFeedback': devolución breve (2 a 3 oraciones) en español que valide lo que siente la persona con cercanía y enfoque psicoeducativo, sin diagnosticar trastornos ni mencionar medicación.
4. 'suggestedMicroHabit': un micro-hábito concreto, amable y realizable hoy mismo (duración entre 2 y 20 minutos) en una de estas categorías exactas: "Físico", "Mental", "Emocional", "Social".
5. 'recommendedResources': hasta 2 recursos reales de la plataforma elegidos estrictamente de estas rutas según la necesidad del momento:
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
            riskLevel: {
              type: Type.STRING,
              enum: ["none", "moderate", "high"],
              description: "Nivel de riesgo de crisis detectado en el texto.",
            },
            isCrisis: {
              type: Type.BOOLEAN,
              description: "True si se detecta ideación suicida, autolesión o riesgo vital.",
            },
            crisisReason: {
              type: Type.STRING,
              description: "Justificación breve y respetuosa si isCrisis es true.",
            },
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
            "riskLevel",
            "isCrisis",
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

    const semanticRisk: CrisisRiskLevel =
      parsed.riskLevel === "high" ||
      parsed.riskLevel === "moderate" ||
      parsed.riskLevel === "none"
        ? parsed.riskLevel
        : parsed.isCrisis
        ? "moderate"
        : "none";

    const finalRisk: CrisisRiskLevel =
      deterministic.riskLevel === "moderate" && semanticRisk === "none"
        ? "moderate"
        : semanticRisk;

    if (finalRisk !== "none" || parsed.isCrisis) {
      sendJson(res, 200, {
        ok: true,
        isCrisis: true,
        riskLevel: finalRisk === "none" ? "moderate" : finalRisk,
        reason:
          parsed.crisisReason?.trim() ||
          "Se detectaron señales emocionales que ameritan apoyo prioritario.",
        matchedSignals: deterministic.matchedSignals,
        safetySource: deterministic.riskLevel !== "none" ? "hybrid" : "semantic",
      });
      return;
    }

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

    const analysis = {
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
    if (isQuotaExhaustedError(error)) {
      const waitSeconds = markGeminiQuotaCooldown(error);
      console.warn(
        `Análisis de ánimo en respaldo empático temporal por cuota de Gemini (${waitSeconds}s).`
      );
    } else {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn("Análisis de ánimo degradado a respaldo empático:", reason);
    }

    if (deterministic.riskLevel !== "none") {
      sendJson(res, 200, {
        ok: true,
        isCrisis: true,
        riskLevel: deterministic.riskLevel,
        reason: "Se detectaron señales emocionales que ameritan apoyo prioritario.",
        matchedSignals: deterministic.matchedSignals,
        safetySource: "deterministic",
      });
      return;
    }

    const fallbackAnalysis = buildCuratedMoodFallback(moodScore, moodLabel);
    sendJson(res, 200, {
      ok: true,
      isCrisis: false,
      riskLevel: "none",
      fallback: true,
      ...fallbackAnalysis,
    });
  }
}
