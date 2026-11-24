import type { CrisisRiskLevel } from "../utils/crisisSafety";
import type { HabitCategory } from "../utils/privacyStorage";

export interface AiHealthResponse {
  ok: boolean;
  service: string;
  aiConfigured: boolean;
  model: string;
  timestamp: string;
}

export interface ServerSafetyEvaluation {
  ok: boolean;
  isCrisis: boolean;
  riskLevel: CrisisRiskLevel;
  reason?: string;
  source: "deterministic" | "semantic" | "hybrid";
  matchedSignals: string[];
  semanticEvaluated: boolean;
  aiConfigured: boolean;
}

export type TimeOfDay = "mañana" | "tarde" | "noche";

export interface DailyReflectionRequest {
  timeOfDay?: TimeOfDay;
  moodScore?: number;
  refresh?: boolean;
}

export interface DailyReflectionAiResponse {
  ok: boolean;
  phrase: string;
  author: string;
  theme: string;
  reflectionPrompt: string;
  suggestedRoute: string;
  suggestedLabel: string;
  timeOfDay: TimeOfDay;
  cached: boolean;
}

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

export interface AnalyzeMoodRequest {
  text?: string;
  moodScore?: number;
  moodLabel?: string;
  tag?: string;
  source?: "journal" | "checkin";
}

export type AnalyzeMoodResponse =
  | {
      ok: boolean;
      isCrisis: true;
      riskLevel: "moderate" | "high";
      reason?: string;
      matchedSignals?: string[];
      safetySource?: "deterministic" | "semantic" | "hybrid";
    }
  | {
      ok: boolean;
      isCrisis: false;
      riskLevel: "none";
      emotionalTone: string;
      compassionateFeedback: string;
      suggestedMicroHabit: SuggestedMicroHabit;
      recommendedResources: RecommendedResource[];
    };

export type AiServiceStatus =
  | "ok"
  | "unconfigured"
  | "rate_limited"
  | "unavailable"
  | "error";

export interface AiServiceResult<T> {
  status: AiServiceStatus;
  data: T | null;
  errorMessage?: string;
}

const DEFAULT_TIMEOUT_MS = 12_000;

function getClientSessionId(): string {
  const key = "ai_session_id";
  try {
    let existing = sessionStorage.getItem(key);
    if (!existing) {
      existing =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, existing);
    }
    return existing;
  } catch {
    return "browser-session";
  }
}

/**
 * Cliente BFF de IA: siempre usa rutas relativas /api/ai/* alojadas en este
 * mismo proyecto (Express en desarrollo / Vercel Serverless en producción)
 * y nunca redirige hacia VITE_API_URL.
 */
async function requestAiApi<T>(
  relativeApiPath: `/api/ai/${string}`,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<AiServiceResult<T>> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(relativeApiPath, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": getClientSessionId(),
        ...(init.headers ?? {}),
      },
    });

    const payload = await response.json().catch(() => null);

    if (response.status === 429) {
      return {
        status: "rate_limited",
        data: null,
        errorMessage:
          payload?.error?.message ||
          "Demasiadas solicitudes seguidas. Por favor espera unos segundos.",
      };
    }

    if (response.status === 503 && payload?.error?.code === "AI_NOT_CONFIGURED") {
      return {
        status: "unconfigured",
        data: null,
        errorMessage:
          payload?.error?.message ||
          "El servicio de IA aún no está configurado en el servidor.",
      };
    }

    if (!response.ok || !payload) {
      return {
        status: response.status >= 500 ? "unavailable" : "error",
        data: null,
        errorMessage:
          payload?.error?.message ||
          "No se pudo conectar con el servicio de asistencia en este momento.",
      };
    }

    return {
      status: "ok",
      data: payload as T,
    };
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    return {
      status: "unavailable",
      data: null,
      errorMessage: isAbort
        ? "La solicitud tardó demasiado en responder. Inténtalo de nuevo."
        : "El servicio de IA no está disponible temporalmente.",
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function checkAiHealth(
  timeoutMs = 5000
): Promise<AiServiceResult<AiHealthResponse>> {
  const result = await requestAiApi<AiHealthResponse>(
    "/api/ai/health",
    { method: "GET" },
    timeoutMs
  );

  if (result.status === "ok" && result.data && !result.data.aiConfigured) {
    return {
      status: "unconfigured",
      data: result.data,
      errorMessage:
        "El servidor está activo, pero la clave de IA aún no ha sido configurada en el entorno.",
    };
  }

  return result;
}

export async function evaluateTextSafety(
  text: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<AiServiceResult<ServerSafetyEvaluation>> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      status: "error",
      data: null,
      errorMessage: "El texto a evaluar no puede estar vacío.",
    };
  }

  return requestAiApi<ServerSafetyEvaluation>(
    "/api/ai/safety",
    {
      method: "POST",
      body: JSON.stringify({ text: trimmed }),
    },
    timeoutMs
  );
}

export async function generateDailyReflection(
  params: DailyReflectionRequest = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<AiServiceResult<DailyReflectionAiResponse>> {
  return requestAiApi<DailyReflectionAiResponse>(
    "/api/ai/reflection",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
    timeoutMs
  );
}

export async function analyzeMoodEntry(
  params: AnalyzeMoodRequest,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<AiServiceResult<AnalyzeMoodResponse>> {
  return requestAiApi<AnalyzeMoodResponse>(
    "/api/ai/analyze-mood",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
    timeoutMs
  );
}
