export type EthicalTelemetryEvent =
  | "respiracion"
  | "diario"
  | "sonidos"
  | "acompanante_ia"
  | "crisis_modal_opened";

const STORAGE_KEY = "bienestar_tool_usage_v1";

const ALLOWED_EVENTS: ReadonlySet<EthicalTelemetryEvent> = new Set([
  "respiracion",
  "diario",
  "sonidos",
  "acompanante_ia",
  "crisis_modal_opened",
]);

const DEFAULT_COUNTS: Record<EthicalTelemetryEvent, number> = {
  respiracion: 0,
  diario: 0,
  sonidos: 0,
  acompanante_ia: 0,
  crisis_modal_opened: 0,
};

declare global {
  interface Window {
    va?: (action: "event", payload: { name: string }) => void;
  }
}

export function getAnonymousToolUsage(): Record<EthicalTelemetryEvent, number> {
  if (typeof window === "undefined") {
    return { ...DEFAULT_COUNTS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COUNTS };
    const parsed = JSON.parse(raw) as Partial<Record<EthicalTelemetryEvent, unknown>>;
    return {
      respiracion:
        typeof parsed.respiracion === "number" && Number.isFinite(parsed.respiracion)
          ? parsed.respiracion
          : 0,
      diario:
        typeof parsed.diario === "number" && Number.isFinite(parsed.diario)
          ? parsed.diario
          : 0,
      sonidos:
        typeof parsed.sonidos === "number" && Number.isFinite(parsed.sonidos)
          ? parsed.sonidos
          : 0,
      acompanante_ia:
        typeof parsed.acompanante_ia === "number" &&
        Number.isFinite(parsed.acompanante_ia)
          ? parsed.acompanante_ia
          : 0,
      crisis_modal_opened:
        typeof parsed.crisis_modal_opened === "number" &&
        Number.isFinite(parsed.crisis_modal_opened)
          ? parsed.crisis_modal_opened
          : 0,
    };
  } catch {
    return { ...DEFAULT_COUNTS };
  }
}

/**
 * Registra únicamente qué herramienta fue abierta usando un catálogo cerrado
 * de eventos anónimos. Nunca recibe texto, identidad ni datos emocionales.
 */
export function trackToolEvent(event: EthicalTelemetryEvent): void {
  if (typeof window === "undefined" || !ALLOWED_EVENTS.has(event)) return;

  try {
    const current = getAnonymousToolUsage();
    current[event] = (current[event] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignorar errores de almacenamiento (modo privado / cuota)
  }

  try {
    if (typeof window.va === "function") {
      window.va("event", { name: event });
    }
  } catch {
    // Ignorar si Vercel Analytics no está inyectado en el entorno actual
  }
}
