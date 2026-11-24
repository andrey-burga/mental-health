import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import {
  detectDeterministicCrisisSignals,
  type CrisisRiskLevel,
} from "./crisisPatterns.ts";

export const GEMINI_TEXT_MODEL = "gemini-4-hydrogen";

export const CLINICAL_SYSTEM_INSTRUCTION = `Eres un asistente psicoeducativo y de acompañamiento emocional empático en español para la plataforma "Tu Espacio Seguro".

REGLAS ÉTICAS Y CLÍNICAS OBLIGATORIAS:
1. Tono y enfoque: Responde siempre en español con calidez, respeto, validación emocional, lenguaje claro y enfoque basado en evidencia psicológica (psicoeducación y autocuidado).
2. Prohibición de diagnóstico: NUNCA diagnostiques trastornos mentales ni afirmes que la persona padece una condición clínica específica. Aclara cuando corresponda que la orientación es educativa y no sustituye evaluación médica o psicológica profesional.
3. Prohibición de medicación: NUNCA prescribas, recomiendes, suspendas ni ajustes dosis de psicofármacos o medicamentos. Ante dudas sobre medicación, indica consultar con psiquiatría o medicina tratante.
4. Protocolo de crisis y riesgo vital: Si percibes señales explícitas o implícitas de ideación suicida, autolesión, desesperanza extrema o peligro inminente, prioriza la contención humana y remite de inmediato a líneas de ayuda gratuitas y confidenciales (por ejemplo: Colombia Línea 106 y Emergencias 123, México Línea de la Vida 800 911 2000, España 024, Argentina 135, Chile *4141, EE. UU./Canadá 988).
5. Límites saludables: No fomentes dependencia emocional hacia la IA ni desautorices la terapia profesional o las redes de apoyo humanas.`;

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | undefined;
let quotaCooldownUntil = 0;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isGeminiQuotaCoolingDown(now = Date.now()): boolean {
  return now < quotaCooldownUntil;
}

export function getQuotaCooldownSecondsRemaining(now = Date.now()): number {
  if (now >= quotaCooldownUntil) return 0;
  return Math.max(1, Math.ceil((quotaCooldownUntil - now) / 1000));
}

export function isQuotaExhaustedError(error: unknown): boolean {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "");
  const normalized = rawMessage.toUpperCase();
  return (
    normalized.includes("RESOURCE_EXHAUSTED") ||
    normalized.includes("QUOTA") ||
    normalized.includes("429")
  );
}

export function markGeminiQuotaCooldown(error: unknown): number {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "");
  const retryMatch =
    rawMessage.match(/retryDelay["']?\s*:\s*["']?(\d+(?:\.\d+)?)s/i) ||
    rawMessage.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  const parsedSeconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : 45;
  const boundedSeconds = Number.isFinite(parsedSeconds)
    ? Math.min(90, Math.max(15, parsedSeconds))
    : 45;

  quotaCooldownUntil = Date.now() + boundedSeconds * 1000;
  return boundedSeconds;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

export interface ClassifiedGeminiError {
  status: number;
  code: string;
  message: string;
}

export function classifyGeminiError(error: unknown): ClassifiedGeminiError {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "Error desconocido");
  const normalized = rawMessage.toUpperCase();

  if (
    normalized.includes("API_KEY_INVALID") ||
    normalized.includes("PERMISSION_DENIED") ||
    normalized.includes("403")
  ) {
    return {
      status: 503,
      code: "AI_CREDENTIALS_INVALID",
      message:
        "El servicio de IA no pudo autenticarse. Verifica la clave configurada en el servidor.",
    };
  }

  if (isQuotaExhaustedError(error)) {
    return {
      status: 429,
      code: "AI_QUOTA_EXCEEDED",
      message:
        "El servicio de IA alcanzó temporalmente su límite de solicitudes. Intenta nuevamente en unos momentos.",
    };
  }

  if (normalized.includes("NOT_FOUND") || normalized.includes("404")) {
    return {
      status: 502,
      code: "AI_MODEL_UNAVAILABLE",
      message: "El modelo de IA configurado no está disponible en este momento.",
    };
  }

  return {
    status: 502,
    code: "AI_UPSTREAM_ERROR",
    message:
      "No fue posible completar la consulta con el servicio de IA en este momento.",
  };
}

export interface SafetyEvaluationResult {
  isCrisis: boolean;
  riskLevel: CrisisRiskLevel;
  reason?: string;
  source: "deterministic" | "semantic" | "hybrid";
  matchedSignals: string[];
  semanticEvaluated: boolean;
  aiConfigured: boolean;
}

const RISK_PRIORITY: Record<CrisisRiskLevel, number> = {
  none: 0,
  moderate: 1,
  high: 2,
};

function higherRisk(a: CrisisRiskLevel, b: CrisisRiskLevel): CrisisRiskLevel {
  return RISK_PRIORITY[a] >= RISK_PRIORITY[b] ? a : b;
}

interface SemanticSafetyPayload {
  riskLevel?: CrisisRiskLevel;
  isCrisis?: boolean;
  reason?: string;
}

export async function evaluateSafetyServerSide(
  text: string
): Promise<SafetyEvaluationResult> {
  const safeText = (text || "").trim().slice(0, 4000);
  const aiConfigured = isGeminiConfigured();

  const deterministic = detectDeterministicCrisisSignals(safeText);

  if (deterministic.riskLevel === "high") {
    return {
      isCrisis: true,
      riskLevel: "high",
      reason: "Se detectaron expresiones explícitas de riesgo vital o autolesión.",
      source: "deterministic",
      matchedSignals: deterministic.matchedSignals,
      semanticEvaluated: false,
      aiConfigured,
    };
  }

  const ai = getGeminiClient();
  if (!ai || safeText.length < 4 || isGeminiQuotaCoolingDown()) {
    return {
      isCrisis: deterministic.riskLevel !== "none",
      riskLevel: deterministic.riskLevel,
      reason:
        deterministic.riskLevel !== "none"
          ? "Se detectaron señales de malestar emocional intenso."
          : undefined,
      source: "deterministic",
      matchedSignals: deterministic.matchedSignals,
      semanticEvaluated: false,
      aiConfigured,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: `Evalúa el nivel de riesgo clínico/de crisis del siguiente texto escrito por una persona en español. Detecta ideación suicida, intención de autolesión, despedida implícita, desesperanza severa o peligro inminente incluso si está expresado con metáforas o de forma indirecta.

Texto a evaluar:
"""
${safeText}
"""`,
      config: {
        systemInstruction:
          "Eres un clasificador clínico de seguridad en salud mental. Responde únicamente con el JSON estructurado requerido. Usa 'high' para riesgo inminente, ideación suicida o autolesión explícita/implícita; 'moderate' para desesperanza grave, desgaste extremo o señales indirectas de querer desaparecer; 'none' cuando no haya señales de crisis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: ["none", "moderate", "high"],
              description: "Nivel de riesgo detectado en el texto.",
            },
            isCrisis: {
              type: Type.BOOLEAN,
              description:
                "True si el riesgo es moderate o high y requiere mostrar contención/líneas de ayuda.",
            },
            reason: {
              type: Type.STRING,
              description:
                "Breve justificación objetiva y respetuosa en español (máximo 140 caracteres).",
            },
          },
          required: ["riskLevel", "isCrisis"],
        },
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const rawJson = (response.text ?? "{}").trim();
    const parsed = JSON.parse(rawJson) as SemanticSafetyPayload;

    const semanticLevel: CrisisRiskLevel =
      parsed.riskLevel === "high" ||
      parsed.riskLevel === "moderate" ||
      parsed.riskLevel === "none"
        ? parsed.riskLevel
        : parsed.isCrisis
        ? "moderate"
        : "none";

    const finalRisk = higherRisk(deterministic.riskLevel, semanticLevel);
    const isCrisis = finalRisk !== "none" || Boolean(parsed.isCrisis);

    return {
      isCrisis,
      riskLevel: finalRisk,
      reason:
        parsed.reason?.trim() ||
        (finalRisk !== "none"
          ? "Se detectaron señales emocionales que ameritan apoyo prioritario."
          : undefined),
      source: deterministic.riskLevel !== "none" ? "hybrid" : "semantic",
      matchedSignals: deterministic.matchedSignals,
      semanticEvaluated: true,
      aiConfigured,
    };
  } catch (error) {
    if (isQuotaExhaustedError(error)) {
      const waitSec = markGeminiQuotaCooldown(error);
      console.warn(
        `Evaluación semántica en modo determinista temporal por límite de cuota (${waitSec}s).`
      );
    } else {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn("Evaluación semántica degradada a modo determinista:", msg);
    }
    return {
      isCrisis: deterministic.riskLevel !== "none",
      riskLevel: deterministic.riskLevel,
      reason:
        deterministic.riskLevel !== "none"
          ? "Se detectaron señales de alerta mediante verificación inmediata."
          : undefined,
      source: "deterministic",
      matchedSignals: deterministic.matchedSignals,
      semanticEvaluated: false,
      aiConfigured,
    };
  }
}
