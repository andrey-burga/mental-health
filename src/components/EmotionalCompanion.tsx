import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  streamCompanionChat,
  type CompanionActionCategory,
  type CompanionActionItem,
  type CompanionCatalogContext,
  type CompanionMessage,
} from "../services/aiService";
import { getArticles } from "../services/articlesServices";
import { getDisorders } from "../services/disorders";
import {
  detectCrisisSignals,
  type CrisisRiskLevel,
} from "../utils/crisisSafety";
import { trackToolEvent } from "../utils/telemetry";

export const OPEN_COMPANION_EVENT = "bienestar:open-companion";

export function openEmotionalCompanion(initialPrompt?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<{ prompt?: string }>(OPEN_COMPANION_EVENT, {
      detail: initialPrompt ? { prompt: initialPrompt } : {},
    })
  );
}

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: CompanionActionItem[];
  isStreaming?: boolean;
}

interface EmotionalCompanionProps {
  onCrisisDetected: (riskLevel: CrisisRiskLevel) => void;
}

const QUICK_START_PROMPTS = [
  "Me siento abrumado/a hoy",
  "No puedo dormir bien",
  "Quiero entender qué es la ansiedad",
  "Necesito calmar mi mente ahora",
];

const CATEGORY_BADGES: Record<
  CompanionActionCategory,
  { label: string; className: string }
> = {
  herramienta: {
    label: "Herramienta",
    className:
      "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60",
  },
  lectura: {
    label: "Lectura",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60",
  },
  trastorno: {
    label: "Guía psicoeducativa",
    className:
      "bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60",
  },
};

export default function EmotionalCompanion({
  onCrisisDetected,
}: EmotionalCompanionProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [catalogContext, setCatalogContext] = useState<CompanionCatalogContext | undefined>(
    undefined
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const catalogLoadedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadCatalogSilently = useCallback(async () => {
    if (catalogLoadedRef.current) return;
    catalogLoadedRef.current = true;

    try {
      const [disorders, articles] = await Promise.all([
        getDisorders().catch(() => []),
        getArticles().catch(() => []),
      ]);

      setCatalogContext({
        disorders: disorders.slice(0, 12).map((d) => ({
          title: d.title,
          slug: d.slug,
          category: d.category,
        })),
        articles: articles.slice(0, 8).map((a) => ({
          title: a.title,
          category: a.category,
        })),
      });
    } catch {
      // El backend tiene el mapa base completo si falla la precarga ligera
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      trackToolEvent("acompanante_ia");
      void loadCatalogSilently();
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, loadCatalogSilently]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleExternalOpen = (e: Event) => {
      const custom = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (custom.detail?.prompt) {
        setInputValue(custom.detail.prompt);
      }
    };
    window.addEventListener(OPEN_COMPANION_EVENT, handleExternalOpen);
    return () => {
      window.removeEventListener(OPEN_COMPANION_EVENT, handleExternalOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [turns, isOpen, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleStopStream = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setTurns((prev) =>
      prev.map((t) => (t.isStreaming ? { ...t, isStreaming: false } : t))
    );
  };

  const handleResetConversation = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setTurns([]);
    setErrorMessage(null);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSendMessage = async (rawText?: string) => {
    const text = (rawText ?? inputValue).trim();
    if (!text || isStreaming) return;

    setErrorMessage(null);

    // 1. Chequeo determinista instantáneo antes de enviar
    const localSafety = detectCrisisSignals(text);
    if (localSafety.riskLevel !== "none") {
      onCrisisDetected(localSafety.riskLevel);
      setIsOpen(false);
      return;
    }

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const assistantTurnId = `assistant-${Date.now() + 1}`;
    const assistantPlaceholder: ChatTurn = {
      id: assistantTurnId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    const historyToSend: CompanionMessage[] = [
      ...turns.map((t) => ({ role: t.role, content: t.content })),
      { role: "user", content: text },
    ];

    setTurns((prev) => [...prev, userTurn, assistantPlaceholder]);
    setInputValue("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamCompanionChat({
      messages: historyToSend,
      catalogContext,
      signal: controller.signal,
      onChunk: (chunk) => {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurnId
              ? { ...t, content: t.content + chunk }
              : t
          )
        );
      },
      onActions: (items) => {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurnId ? { ...t, actions: items } : t
          )
        );
      },
      onCrisis: (crisis) => {
        setIsStreaming(false);
        setTurns((prev) => prev.filter((t) => t.id !== assistantTurnId));
        setIsOpen(false);
        onCrisisDetected(crisis.riskLevel);
      },
      onError: (msg) => {
        setIsStreaming(false);
        setErrorMessage(msg);
        setTurns((prev) =>
          prev.filter((t) => !(t.id === assistantTurnId && !t.content.trim()))
        );
      },
      onDone: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurnId ? { ...t, isStreaming: false } : t
          )
        );
      },
    });
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleNavigateAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* Botón flotante discreto en esquina inferior derecha */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir acompañante emocional"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/70 bg-gradient-to-r from-indigo-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
          <span className="hidden sm:inline">Acompañante emocional</span>
          <span className="sm:hidden">Acompañante</span>
        </button>
      )}

      {/* Drawer lateral sereno y accesible */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="companion-dialog-title"
          aria-describedby="companion-dialog-disclaimer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <section className="flex h-full w-full max-w-md flex-col bg-white dark:bg-neutral-950 border-l border-neutral-200/80 dark:border-neutral-800 shadow-2xl">
            {/* Cabecera terapéutica */}
            <header className="border-b border-neutral-200/80 dark:border-neutral-800 px-4 py-3.5 sm:px-5 space-y-2.5 bg-neutral-50/70 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-teal-500/15 text-indigo-600 dark:text-indigo-400"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h2
                      id="companion-dialog-title"
                      className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate"
                    >
                      Acompañante Emocional
                    </h2>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      Guía de triage psicoeducativo · Conversación efímera
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {turns.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetConversation}
                      aria-label="Reiniciar conversación"
                      title="Reiniciar conversación"
                      className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Reiniciar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar acompañante emocional"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Disclaimer clínico compacto */}
              <div
                id="companion-dialog-disclaimer"
                role="note"
                className="flex items-center justify-between gap-2 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/25 px-3 py-2 text-[11px] text-neutral-700 dark:text-neutral-300"
              >
                <span>
                  Acompañamiento psicoeducativo con IA · No sustituye terapia ni
                  urgencias
                </span>
                <Link
                  to="/ayuda"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 font-semibold text-amber-900 dark:text-amber-300 hover:underline"
                >
                  Ayuda
                </Link>
              </div>
            </header>

            {/* Área de conversación */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4"
              aria-live="polite"
            >
              {turns.length === 0 ? (
                <div className="space-y-4 py-2">
                  <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/25 p-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p className="font-medium text-neutral-900 dark:text-white mb-1">
                      Hola, este es un espacio tranquilo para escucharte.
                    </p>
                    <p className="text-xs sm:text-sm font-light">
                      Cuéntame cómo te sientes o qué te gustaría comprender hoy,
                      y te orientaré hacia herramientas prácticas o lecturas de
                      la plataforma. Esta charla es efímera y no se guarda en
                      ninguna base de datos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Puedes empezar con una idea
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_START_PROMPTS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => void handleSendMessage(chip)}
                          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${
                      turn.role === "user" ? "items-end" : "items-start"
                    } space-y-2`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        turn.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-800 rounded-bl-sm"
                      }`}
                    >
                      {turn.content ? (
                        turn.content
                      ) : turn.isStreaming ? (
                        <span
                          className="inline-flex items-center gap-1 py-1 text-neutral-500 dark:text-neutral-400"
                          aria-label="Escribiendo respuesta"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse delay-150" />
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse delay-300" />
                        </span>
                      ) : null}

                      {turn.content && turn.isStreaming && (
                        <span
                          className="inline-block ml-1 h-3.5 w-1.5 align-middle bg-indigo-500/70 animate-pulse rounded-sm"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Tarjetas clicables de recursos sugeridos */}
                    {turn.role === "assistant" &&
                      !turn.isStreaming &&
                      turn.actions &&
                      turn.actions.length > 0 && (
                        <div className="w-full max-w-[92%] space-y-1.5 pt-0.5">
                          <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                            Recursos sugeridos en la plataforma:
                          </p>
                          <div className="grid gap-1.5">
                            {turn.actions.map((action) => {
                              const badge =
                                CATEGORY_BADGES[action.category] ||
                                CATEGORY_BADGES.herramienta;
                              return (
                                <button
                                  key={`${turn.id}-${action.route}`}
                                  type="button"
                                  onClick={() => handleNavigateAction(action.route)}
                                  className="group flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 px-3 py-2 text-left hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <span
                                      className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold mb-0.5 ${badge.className}`}
                                    >
                                      {badge.label}
                                    </span>
                                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                                      {action.label}
                                    </p>
                                  </div>
                                  <span
                                    aria-hidden="true"
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0"
                                  >
                                    →
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                ))
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-200"
                >
                  {errorMessage}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Pie de entrada + aviso de privacidad */}
            <footer className="border-t border-neutral-200/80 dark:border-neutral-800 p-3.5 sm:p-4 bg-white dark:bg-neutral-950 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendMessage();
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="companion-message-input" className="sr-only">
                  Escribe cómo te sientes
                </label>
                <textarea
                  ref={inputRef}
                  id="companion-message-input"
                  rows={2}
                  maxLength={1500}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Cuéntame cómo te sientes o qué necesitas hoy..."
                  className="flex-1 resize-none rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStream}
                    aria-label="Detener respuesta"
                    className="h-11 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer shrink-0"
                  >
                    Detener
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    aria-label="Enviar mensaje"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-45 transition-colors cursor-pointer shrink-0"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </button>
                )}
              </form>

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center">
                Conversación efímera: no se almacena en base de datos ni perfil.
              </p>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
