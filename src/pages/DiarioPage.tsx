import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import ClinicalDisclaimer from "../components/ClinicalDisclaimer";
import CrisisModal from "../components/CrisisModal";
import { useAuth } from "../context/AuthContext";
import {
  detectCrisisSignals,
  CrisisRiskLevel,
} from "../utils/crisisSafety";
import {
  JournalEntry,
  StoredHabit,
  loadUserJournalEntries,
  saveUserJournalEntries,
  loadUserHabits,
  saveUserHabits,
  clearUserLocalData,
  exportJournalAsJson,
  exportJournalAsTxt,
  getEphemeralPrefKey,
  recordWellnessActivity,
} from "../utils/privacyStorage";
import {
  analyzeMoodEntry,
  type SuggestedMicroHabit,
  type RecommendedResource,
} from "../services/aiService";

const MOODS = [
  { emoji: "😊", label: "Calmado" },
  { emoji: "🌿", label: "Agradecido" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😰", label: "Ansioso" },
  { emoji: "😤", label: "Frustrado" },
  { emoji: "✨", label: "Motivado" },
];

const PROMPTS = [
  "¿Qué fue lo mejor que te pasó hoy, por pequeño que sea?",
  "¿Qué pensamiento ha estado rondando por tu mente?",
  "¿Qué emoción estás intentando evitar o procesar?",
  "Escribe sobre algo por lo que estés agradecido/a hoy.",
];

export default function DiarioPage() {
  const { user } = useAuth();

  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0].emoji);
  const [selectedTag, setSelectedTag] = useState("General");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ephemeralMode, setEphemeralMode] = useState<boolean>(false);

  // Estado de crisis y contención
  const [crisisRisk, setCrisisRisk] = useState<CrisisRiskLevel>("none");
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const lastAcknowledgedRiskRef = useRef<CrisisRiskLevel>("none");

  // Estado para confirmación visual de borrado y notificaciones limpias
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estado Opt-In de reflexión empática con IA (apagado por defecto)
  const [aiConsent, setAiConsent] = useState<boolean>(false);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState<boolean>(false);
  const [aiErrorNotice, setAiErrorNotice] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    emotionalTone: string;
    compassionateFeedback: string;
    suggestedMicroHabit: SuggestedMicroHabit;
    recommendedResources: RecommendedResource[];
  } | null>(null);
  const [habitAdded, setHabitAdded] = useState<boolean>(false);

  // Cargar entradas aisladas por usuario y preferencia de modo efímero
  useEffect(() => {
    const loaded = loadUserJournalEntries(user);
    setEntries(loaded);

    try {
      const pref = localStorage.getItem(getEphemeralPrefKey(user));
      setEphemeralMode(pref === "true");
    } catch {
      setEphemeralMode(false);
    }
  }, [user]);

  // Evaluación determinista en tiempo real
  useEffect(() => {
    const result = detectCrisisSignals(entry);
    if (result.riskLevel === "none") {
      lastAcknowledgedRiskRef.current = "none";
      setCrisisRisk("none");
      return;
    }

    setCrisisRisk(result.riskLevel);
    const timer = setTimeout(() => {
      const escalated =
        result.riskLevel === "high" &&
        lastAcknowledgedRiskRef.current !== "high";
      const firstDetection = lastAcknowledgedRiskRef.current === "none";

      if (firstDetection || escalated) {
        setIsCrisisModalOpen(true);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [entry]);

  const handleCloseCrisisModal = () => {
    lastAcknowledgedRiskRef.current = crisisRisk;
    setIsCrisisModalOpen(false);
  };

  const handleToggleEphemeral = () => {
    const next = !ephemeralMode;
    setEphemeralMode(next);
    try {
      localStorage.setItem(getEphemeralPrefKey(user), String(next));
    } catch {
      // Ignorar errores de storage
    }
    setStatusMessage(
      next
        ? "Modo Efímero activado: tus nuevas entradas no se guardarán en este dispositivo."
        : "Modo Efímero desactivado: tus nuevas entradas se guardarán localmente de forma privada para tu cuenta."
    );
  };

  const handleSave = async () => {
    const trimmedText = entry.trim();
    if (!trimmedText) return;

    const detection = detectCrisisSignals(trimmedText);
    if (detection.riskLevel !== "none") {
      setCrisisRisk(detection.riskLevel);
      setIsCrisisModalOpen(true);
    }

    const moodLabel =
      MOODS.find((m) => m.emoji === selectedMood)?.label || "Reflexivo";

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      createdAtISO: new Date().toISOString(),
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: selectedMood,
      text: trimmedText,
      tag: selectedTag,
      ephemeral: ephemeralMode,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    if (!ephemeralMode) {
      saveUserJournalEntries(user, updatedEntries);
      recordWellnessActivity(user);
      setStatusMessage("Entrada guardada de forma privada en tu sesión local.");
    } else {
      setStatusMessage(
        "Entrada añadida en Modo Efímero (se borrará automáticamente al cerrar o recargar)."
      );
    }

    setEntry("");
    lastAcknowledgedRiskRef.current = "none";

    // Análisis emocional Opt-In con IA
    if (aiConsent && detection.riskLevel === "none") {
      setIsAnalyzingMood(true);
      setAiErrorNotice(null);
      setAiAnalysis(null);
      setHabitAdded(false);

      const aiResult = await analyzeMoodEntry({
        text: trimmedText,
        moodLabel,
        tag: selectedTag,
        source: "journal",
      });

      setIsAnalyzingMood(false);

      if (aiResult.status === "ok" && aiResult.data) {
        if (aiResult.data.isCrisis) {
          setCrisisRisk(aiResult.data.riskLevel);
          setIsCrisisModalOpen(true);
          setAiAnalysis(null);
        } else {
          setAiAnalysis({
            emotionalTone: aiResult.data.emotionalTone,
            compassionateFeedback: aiResult.data.compassionateFeedback,
            suggestedMicroHabit: aiResult.data.suggestedMicroHabit,
            recommendedResources: aiResult.data.recommendedResources,
          });
        }
      } else {
        setAiErrorNotice(
          aiResult.errorMessage ||
            "No pudimos generar la reflexión empática en este momento, pero tu entrada quedó guardada."
        );
      }
    }
  };

  const handleAddSuggestedHabit = () => {
    if (!aiAnalysis || habitAdded) return;
    const currentHabits = loadUserHabits(user);
    const newHabit: StoredHabit = {
      id: Date.now(),
      text: `${aiAnalysis.suggestedMicroHabit.title} (${aiAnalysis.suggestedMicroHabit.durationMinutes} min)`,
      completed: false,
      category: aiAnalysis.suggestedMicroHabit.category,
    };
    saveUserHabits(user, [newHabit, ...currentHabits]);
    recordWellnessActivity(user);
    setHabitAdded(true);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveUserJournalEntries(user, updated);
  };

  const handleConfirmClearAll = () => {
    clearUserLocalData(user);
    setEntries([]);
    setEphemeralMode(false);
    setConfirmClearOpen(false);
    setStatusMessage(
      "Todos tus datos locales han sido eliminados de este dispositivo."
    );
  };

  const handleUsePrompt = (promptText: string) => {
    setEntry((prev) => (prev ? `${prev}\n\n${promptText} ` : `${promptText} `));
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-16 -z-0 flex justify-between overflow-hidden"
        >
          <div className="h-72 w-72 -translate-x-1/3 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
          <div className="h-72 w-72 translate-x-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/5" />
        </div>

        <Header />

        <main className="flex-grow relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-6">
            {/* Encabezado editorial */}
            <div className="space-y-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Expresión y reflexión
                </p>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  ← Volver a Mi Espacio
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Diario Emocional
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Escribir libera la carga mental. Tómate este espacio privado para plasmar tus pensamientos sin juicios.
              </p>
            </div>

            {/* Aviso Clínico Contextual */}
            <ClinicalDisclaimer compact />

            {/* Barra de Privacidad y Modo Efímero */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    Modo Efímero (no guardar en este dispositivo)
                  </span>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    ·{" "}
                    <span
                      className={
                        ephemeralMode
                          ? "text-teal-700 dark:text-teal-400 font-semibold"
                          : "text-neutral-500 dark:text-neutral-400"
                      }
                    >
                      {ephemeralMode ? "Activo" : "Inactivo"}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {ephemeralMode
                    ? "Tus textos permanecerán únicamente en memoria temporal y desaparecerán al cerrar la pestaña."
                    : `Tus entradas se almacenan aisladas exclusivamente para ${
                        user?.name || "tu cuenta"
                      } en este navegador.`}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={ephemeralMode}
                onClick={handleToggleEphemeral}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                  ephemeralMode
                    ? "bg-teal-600"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span className="sr-only">Activar Modo Efímero</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ${
                    ephemeralMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {statusMessage && (
              <div
                role="status"
                className="rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/70 dark:bg-teal-950/30 px-4 py-3 text-xs sm:text-sm text-teal-900 dark:text-teal-300 flex items-center justify-between gap-3"
              >
                <span>{statusMessage}</span>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="text-teal-800 dark:text-teal-300 hover:opacity-75 text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* Contenedor Principal de Escritura */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-5">
              {/* Selector de Ánimo */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2.5">
                  ¿Cómo te sientes en este momento?
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m.emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                        selectedMood === m.emoji
                          ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompts Sugeridos */}
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-2">
                  Presiona una idea si no sabes qué escribir:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleUsePrompt(prompt)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Área de Texto */}
              <textarea
                rows={6}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Escribe libremente aquí..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950 p-4 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />

              {/* Aviso discreto si hay señales activas */}
              {crisisRisk !== "none" && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-300">
                  <span>
                    Si necesitas apoyo humano inmediato, hay líneas gratuitas 24/7 disponibles para escucharte.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCrisisModalOpen(true)}
                    className="font-semibold underline text-left sm:text-right shrink-0 cursor-pointer"
                  >
                    Ver líneas de ayuda
                  </button>
                </div>
              )}

              {/* Consentimiento Opt-In para Reflexión Empática de IA */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="ai-reflection-consent"
                    className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white cursor-pointer"
                  >
                    Recibir reflexión empática de IA al guardar
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Opcional y apagado por defecto. Nunca enviamos tu nombre, correo ni datos de cuenta; solo el texto actual para devolución psicoeducativa.
                  </p>
                </div>
                <button
                  id="ai-reflection-consent"
                  type="button"
                  role="switch"
                  aria-checked={aiConsent}
                  onClick={() => setAiConsent((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    aiConsent
                      ? "bg-indigo-600"
                      : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span className="sr-only">
                    Activar reflexión empática de IA al guardar
                  </span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      aiConsent ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Opciones y Guardado */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor="journal-tag-select"
                    className="text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    Etiqueta:
                  </label>
                  <select
                    id="journal-tag-select"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="General">General</option>
                    <option value="Pensamientos">Pensamientos</option>
                    <option value="Gratitud">Gratitud</option>
                    <option value="Ansiedad">Ansiedad</option>
                    <option value="Logros">Logros</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!entry.trim() || isAnalyzingMood}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer"
                >
                  {isAnalyzingMood
                    ? "Guardando y analizando..."
                    : ephemeralMode
                    ? "Registrar (Efímero)"
                    : "Guardar Entrada"}
                </button>
              </div>
            </div>

            {/* Estado de carga o devolución empática Opt-In de IA */}
            {isAnalyzingMood && (
              <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-white dark:bg-neutral-900/70 p-5 flex items-center gap-3">
                <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                <p className="text-sm text-neutral-700 dark:text-neutral-200">
                  Preparando una reflexión empática y recomendaciones personalizadas para ti...
                </p>
              </div>
            )}

            {aiErrorNotice && (
              <div
                role="status"
                className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300"
              >
                <span>{aiErrorNotice}</span>
                <button
                  type="button"
                  onClick={() => setAiErrorNotice(null)}
                  className="text-xs font-semibold underline shrink-0 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}

            {aiAnalysis && (
              <section
                aria-label="Reflexión empática de IA"
                className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-5 animate-fadeIn"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {aiAnalysis.emotionalTone}
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Acompañamiento empático
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAnalysis(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {aiAnalysis.compassionateFeedback}
                </p>

                {/* Micro-hábito sugerido con separador hairline */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                      Micro-hábito sugerido · {aiAnalysis.suggestedMicroHabit.category} ·{" "}
                      {aiAnalysis.suggestedMicroHabit.durationMinutes} min
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {aiAnalysis.suggestedMicroHabit.title}
                    </p>
                  </div>

                  {habitAdded ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                        Añadido a tu Autocuidado
                      </span>
                      <Link
                        to="/autocuidado-diario"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline"
                      >
                        Ver hábitos
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddSuggestedHabit}
                      className="shrink-0 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                    >
                      Añadir micro-hábito a mi Autocuidado
                    </button>
                  )}
                </div>

                {/* Recursos recomendados */}
                {aiAnalysis.recommendedResources.length > 0 && (
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Recursos recomendados para ti
                    </h3>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {aiAnalysis.recommendedResources.map((resItem, idx) => (
                        <Link
                          key={`${resItem.route}-${idx}`}
                          to={resItem.route}
                          className="group py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
                        >
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                              {resItem.title}
                            </span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {resItem.reason}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                            Abrir →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  Orientación psicoeducativa generada como apoyo reflexivo; no constituye diagnóstico ni reemplaza acompañamiento clínico profesional.
                </p>
              </section>
            )}

            {/* Soberanía de Datos: Exportar y Borrar */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Control y privacidad de tus datos
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Descarga una copia de tu diario o borra todo el historial guardado en este dispositivo.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => exportJournalAsJson(entries, user)}
                    disabled={entries.length === 0}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Exportar .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => exportJournalAsTxt(entries, user)}
                    disabled={entries.length === 0}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Exportar .TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(true)}
                    disabled={entries.length === 0}
                    className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Eliminar datos locales
                  </button>
                </div>
              </div>

              {confirmClearOpen && (
                <div
                  role="alertdialog"
                  aria-labelledby="confirm-clear-diario-title"
                  className="pt-3 border-t border-rose-200/70 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <p
                    id="confirm-clear-diario-title"
                    className="text-xs sm:text-sm text-rose-900 dark:text-rose-200"
                  >
                    ¿Confirmas que deseas eliminar permanentemente todas tus entradas locales de este navegador? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmClearAll}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      Sí, eliminar todo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Historial de Entradas */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">
                Tus entradas ({entries.length})
              </h3>

              {entries.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Aún no has guardado ninguna entrada. Tómate un momento para escribir la primera.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 shadow-sm space-y-2 relative group"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="text-lg" aria-hidden="true">
                            {item.mood}
                          </span>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                            {item.tag}
                          </span>
                          {item.ephemeral && (
                            <span className="text-teal-700 dark:text-teal-300 font-medium">
                              · Efímera (solo esta sesión)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-400 tabular-nums">
                            {item.date}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-neutral-400 hover:text-rose-500 text-xs transition-colors cursor-pointer"
                            title="Eliminar entrada"
                            aria-label="Eliminar entrada"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <CrisisModal
          isOpen={isCrisisModalOpen}
          riskLevel={crisisRisk}
          onClose={handleCloseCrisisModal}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}