import { DailyReflection } from "../types/reflections";
import api from "./axios";
import {
  generateDailyReflection,
  type TimeOfDay,
} from "./aiService";

export interface FetchDailyReflectionOptions {
  timeOfDay?: TimeOfDay;
  moodScore?: number;
  refresh?: boolean;
}

export interface DailyReflectionFetchResult {
  reflection: DailyReflection | null;
  rateLimited: boolean;
  notice?: string;
}

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "mañana";
  if (hour < 19) return "tarde";
  return "noche";
}

function getClientCacheKey(timeOfDay: TimeOfDay): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `reflection_cache:${y}-${m}-${d}:${timeOfDay}`;
}

function readClientReflectionCache(timeOfDay: TimeOfDay): DailyReflection | null {
  try {
    const raw = sessionStorage.getItem(getClientCacheKey(timeOfDay));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyReflection;
    if (parsed && parsed.phrase) {
      return { ...parsed, cached: true };
    }
    return null;
  } catch {
    return null;
  }
}

function writeClientReflectionCache(
  timeOfDay: TimeOfDay,
  reflection: DailyReflection
): void {
  try {
    sessionStorage.setItem(
      getClientCacheKey(timeOfDay),
      JSON.stringify(reflection)
    );
  } catch {
    // Ignorar errores de almacenamiento (modo privado / cuota)
  }
}

const inFlightClientRequests = new Map<string, Promise<DailyReflectionFetchResult>>();

const LOCAL_EMERGENCY_REFLECTION: DailyReflection = {
  id: "local-fallback",
  phrase:
    "Cuidar tu bienestar no exige resolverlo todo hoy; una pausa amable también es avanzar.",
  author: "Tu Espacio Seguro",
  theme: "Calma cotidiana",
  reflectionPrompt: "¿Qué necesitas soltar un poco para sentirte más ligero/a hoy?",
  suggestedRoute: "/respiracion",
  suggestedLabel: "Practicar respiración",
  source: "fallback",
};

async function performFetchDailyReflection(
  options: FetchDailyReflectionOptions,
  timeOfDay: TimeOfDay
): Promise<DailyReflectionFetchResult> {
  // 1. Intentar obtener reflexión dinámica desde el BFF de IA (/api/ai/reflection)
  const aiResult = await generateDailyReflection({
    timeOfDay,
    moodScore: options.moodScore,
    refresh: options.refresh,
  });

  if (aiResult.status === "ok" && aiResult.data) {
    const reflection: DailyReflection = {
      id: `ai-${Date.now()}`,
      phrase: aiResult.data.phrase,
      author: aiResult.data.author,
      theme: aiResult.data.theme,
      reflectionPrompt: aiResult.data.reflectionPrompt,
      suggestedRoute: aiResult.data.suggestedRoute,
      suggestedLabel: aiResult.data.suggestedLabel,
      source: aiResult.data.fallback ? "fallback" : "ai",
      cached: aiResult.data.cached,
    };

    if (!options.moodScore && !aiResult.data.fallback) {
      writeClientReflectionCache(timeOfDay, reflection);
    }

    return {
      reflection,
      rateLimited: false,
      notice: aiResult.data.notice,
    };
  }

  // Si fue límite de frecuencia al pedir "Nueva reflexión", avisamos sin borrar la reflexión previa
  if (aiResult.status === "rate_limited" && options.refresh) {
    return {
      reflection: null,
      rateLimited: true,
      notice:
        aiResult.errorMessage ||
        "Has generado varias reflexiones seguidas. Espera un momento antes de pedir otra.",
    };
  }

  // 2. Respaldo automático contra el backend tradicional (/reflections/today o mockApi)
  try {
    const { data } = await api.get<DailyReflection>("/reflections/today");
    if (data && data.phrase) {
      return {
        reflection: {
          ...data,
          theme: data.theme || "Bienestar diario",
          suggestedRoute: data.suggestedRoute || "/respiracion",
          suggestedLabel: data.suggestedLabel || "Practicar respiración",
          source: "fallback",
        },
        rateLimited: false,
      };
    }
  } catch (error) {
    console.warn("No se pudo cargar reflexión desde respaldo API:", error);
  }

  return {
    reflection: LOCAL_EMERGENCY_REFLECTION,
    rateLimited: aiResult.status === "rate_limited",
  };
}

export async function fetchDailyReflectionWithFallback(
  options: FetchDailyReflectionOptions = {}
): Promise<DailyReflectionFetchResult> {
  const timeOfDay = options.timeOfDay ?? getCurrentTimeOfDay();
  const isDefaultLoad = !options.refresh && !options.moodScore;

  if (isDefaultLoad) {
    const cached = readClientReflectionCache(timeOfDay);
    if (cached) {
      return {
        reflection: cached,
        rateLimited: false,
      };
    }

    const dedupeKey = getClientCacheKey(timeOfDay);
    const existing = inFlightClientRequests.get(dedupeKey);
    if (existing) {
      return existing;
    }

    const promise = performFetchDailyReflection(options, timeOfDay).finally(() => {
      inFlightClientRequests.delete(dedupeKey);
    });
    inFlightClientRequests.set(dedupeKey, promise);
    return promise;
  }

  return performFetchDailyReflection(options, timeOfDay);
}

export const getDailyReflection = async (
  options: FetchDailyReflectionOptions = {}
): Promise<DailyReflection | null> => {
  const result = await fetchDailyReflectionWithFallback(options);
  return result.reflection;
};
