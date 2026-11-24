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

export async function fetchDailyReflectionWithFallback(
  options: FetchDailyReflectionOptions = {}
): Promise<DailyReflectionFetchResult> {
  const timeOfDay = options.timeOfDay ?? getCurrentTimeOfDay();

  // 1. Intentar obtener reflexión dinámica desde el BFF de IA (/api/ai/reflection)
  const aiResult = await generateDailyReflection({
    timeOfDay,
    moodScore: options.moodScore,
    refresh: options.refresh,
  });

  if (aiResult.status === "ok" && aiResult.data) {
    return {
      reflection: {
        id: `ai-${Date.now()}`,
        phrase: aiResult.data.phrase,
        author: aiResult.data.author,
        theme: aiResult.data.theme,
        reflectionPrompt: aiResult.data.reflectionPrompt,
        suggestedRoute: aiResult.data.suggestedRoute,
        suggestedLabel: aiResult.data.suggestedLabel,
        source: "ai",
        cached: aiResult.data.cached,
      },
      rateLimited: false,
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
    console.error("Error fetching fallback daily reflection:", error);
  }

  return {
    reflection: LOCAL_EMERGENCY_REFLECTION,
    rateLimited: aiResult.status === "rate_limited",
  };
}

export const getDailyReflection = async (
  options: FetchDailyReflectionOptions = {}
): Promise<DailyReflection | null> => {
  const result = await fetchDailyReflectionWithFallback(options);
  return result.reflection;
};
