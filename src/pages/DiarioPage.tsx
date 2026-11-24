import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Section from "../components/Section";
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

  // Evaluación determinista en tiempo real (sin latencia, evitando reabrir en bucle si el usuario ya cerró ese mismo nivel)
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

  // Guardar nueva entrada
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

    // Análisis emocional Opt-In con IA (solo si el usuario activó el consentimiento y no hay crisis determinista previa)
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

  // Eliminar entrada individual
  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveUserJournalEntries(user, updated);
  };

  // Eliminar todos los datos locales con confirmación visual
  const handleConfirmClearAll = () => {
    clearUserLocalData(user);
    setEntries([]);
    setEphemeralMode(false);
    setConfirmClearOpen(false);
    setStatusMessage(
      "Todos tus datos locales han sido eliminados de este dispositivo."
    );
  };

  // Insertar prompt al escribir
  const handleUsePrompt = (promptText: string) => {
    setEntry((prev) => (prev ? `${prev}\n\n${promptText} ` : `${promptText} `));
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50/20 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Encabezado */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Expresión & Reflexión
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Diario de Emociones
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Escribir libera la carga mental. Tómate este espacio para plasmar tus pensamientos sin juicios.
                </p>
              </div>

              {/* Aviso Clínico Contextual */}
              <ClinicalDisclaimer compact />

              {/* Barra de Privacidad y Modo Efímero */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Modo Efímero (No guardar en este dispositivo)
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        ephemeralMode
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {ephemeralMode ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ephemeralMode
                      ? "Tus textos permanecerán únicamente en memoria temporal y desaparecerán al cerrar la pestaña."
                      : `Tus entradas se almacenan aisladas exclusivamente para ${user?.name || "tu cuenta"} en este navegador.`}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={ephemeralMode}
                  onClick={handleToggleEphemeral}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    ephemeralMode
                      ? "bg-emerald-600"
                      : "bg-slate-300 dark:bg-slate-700"
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
                  className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3"
                >
                  <span>{statusMessage}</span>
                  <button
                    type="button"
                    onClick={() => setStatusMessage(null)}
                    className="text-emerald-700 dark:text-emerald-400 hover:opacity-75 text-xs font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {/* Contenedor Principal de Escritura */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                {/* Selector de Ánimo */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    ¿Cómo te sientes en este momento?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setSelectedMood(m.emoji)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                          selectedMood === m.emoji
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                  <span className="text-xs text-slate-400 block mb-1.5">
                    Presiona una idea si no sabes qué escribir:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                    {PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUsePrompt(prompt)}
                        className="whitespace-nowrap px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                />

                {/* Aviso discreto si hay señales activas */}
                {crisisRisk !== "none" && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-300">
                    <span>
                      Si necesitas apoyo humano inmediato, hay líneas gratuitas 24/7 disponibles para escucharte.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCrisisModalOpen(true)}
                      className="font-semibold underline text-left sm:text-right shrink-0"
                    >
                      Ver líneas de ayuda
                    </button>
                  </div>
                )}

                {/* Consentimiento Opt-In para Reflexión Empática de IA */}
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="ai-reflection-consent"
                      className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                    >
                      Recibir reflexión empática de IA al guardar
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
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
                        : "bg-slate-300 dark:bg-slate-700"
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400">Etiqueta:</span>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
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
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-sm"
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
                <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-5 flex items-center gap-3 animate-pulse">
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">
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
                    className="text-xs font-semibold underline shrink-0"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {aiAnalysis && (
                <section
                  aria-label="Reflexión empática de IA"
                  className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 animate-fadeIn"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {aiAnalysis.emotionalTone}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                        Acompañamiento empático
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiAnalysis(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Ocultar
                    </button>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiAnalysis.compassionateFeedback}
                  </p>

                  {/* Micro-hábito sugerido con botón de 1 clic */}
                  <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        <span>Micro-hábito sugerido</span>
                        <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/60 text-[10px]">
                          {aiAnalysis.suggestedMicroHabit.category} · {aiAnalysis.suggestedMicroHabit.durationMinutes} min
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {aiAnalysis.suggestedMicroHabit.title}
                      </p>
                    </div>

                    {habitAdded ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
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
                        className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        Añadir micro-hábito a mi Autocuidado
                      </button>
                    )}
                  </div>

                  {/* Recursos recomendados */}
                  {aiAnalysis.recommendedResources.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Recursos recomendados para ti
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiAnalysis.recommendedResources.map((resItem, idx) => (
                          <Link
                            key={`${resItem.route}-${idx}`}
                            to={resItem.route}
                            className="group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 hover:border-indigo-400 transition-colors flex flex-col justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                                {resItem.title}
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {resItem.reason}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              Abrir recurso →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    Orientación psicoeducativa generada como apoyo reflexivo; no constituye diagnóstico ni reemplaza acompañamiento clínico profesional.
                  </p>
                </section>
              )}

              {/* Soberanía de Datos: Exportar y Borrar */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Control y privacidad de tus datos
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Descarga una copia de tu diario o borra todo el historial guardado en este dispositivo.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => exportJournalAsJson(entries, user)}
                      disabled={entries.length === 0}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                      Exportar .JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => exportJournalAsTxt(entries, user)}
                      disabled={entries.length === 0}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                      Exportar .TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(true)}
                      disabled={entries.length === 0}
                      className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:opacity-50 transition-colors"
                    >
                      Eliminar datos locales
                    </button>
                  </div>
                </div>

                {confirmClearOpen && (
                  <div
                    role="alertdialog"
                    aria-labelledby="confirm-clear-diario-title"
                    className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmClearAll}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white"
                      >
                        Sí, eliminar todo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de Entradas */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Tus entradas ({entries.length})</span>
                </h3>

                {entries.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-400">
                      Aún no has guardado ninguna entrada. Tómate un momento para escribir la primera.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2 relative group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{item.mood}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {item.tag}
                            </span>
                            {item.ephemeral && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300">
                                Efímera · Solo esta sesión
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{item.date}</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-red-500 text-xs transition-colors"
                              title="Eliminar entrada"
                              aria-label="Eliminar entrada"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>
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