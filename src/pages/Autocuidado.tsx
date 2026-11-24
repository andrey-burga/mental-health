import React, { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import CrisisModal from "../components/CrisisModal";
import { Link } from "react-router-dom";
import { wellbeingResources } from "../data/homeContent";
import { useAuth } from "../context/AuthContext";
import {
  analyzeMoodEntry,
  type SuggestedMicroHabit,
  type RecommendedResource,
} from "../services/aiService";
import {
  detectCrisisSignals,
  type CrisisRiskLevel,
} from "../utils/crisisSafety";
import {
  loadUserHabits,
  saveUserHabits,
  recordWellnessActivity,
  type StoredHabit,
} from "../utils/privacyStorage";

interface WellbeingResource {
  id: string | number;
  title: string;
  description: string;
  content: string;
  category?: "cuerpo" | "mente" | "emociones";
}

function Autocuidado() {
  const { user, isAuthenticated } = useAuth();
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [checkInNote, setCheckInNote] = useState<string>("");
  const [isLoadingSupport, setIsLoadingSupport] = useState<boolean>(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportResult, setSupportResult] = useState<{
    emotionalTone: string;
    compassionateFeedback: string;
    suggestedMicroHabit: SuggestedMicroHabit;
    recommendedResources: RecommendedResource[];
  } | null>(null);
  const [habitSaved, setHabitSaved] = useState<boolean>(false);

  const [crisisRisk, setCrisisRisk] = useState<CrisisRiskLevel>("none");
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);

  const handleSelectMood = (num: number) => {
    setMoodRating(num);
    setSupportError(null);
    if (num > 2) {
      setSupportResult(null);
    }
  };

  const handleRequestLowMoodSupport = async () => {
    if (moodRating === null || isLoadingSupport) return;

    const noteText = checkInNote.trim();
    if (noteText) {
      const localCheck = detectCrisisSignals(noteText);
      if (localCheck.riskLevel !== "none") {
        setCrisisRisk(localCheck.riskLevel);
        setIsCrisisModalOpen(true);
        return;
      }
    }

    setIsLoadingSupport(true);
    setSupportError(null);
    setSupportResult(null);
    setHabitSaved(false);

    const payloadText =
      noteText ||
      `Hoy marqué mi nivel de energía y paz emocional en ${moodRating} de 5 y me siento bajo de ánimo.`;

    const result = await analyzeMoodEntry({
      text: payloadText,
      moodScore: moodRating,
      source: "checkin",
    });

    setIsLoadingSupport(false);

    if (result.status === "ok" && result.data) {
      if (result.data.isCrisis) {
        setCrisisRisk(result.data.riskLevel);
        setIsCrisisModalOpen(true);
        return;
      }

      setSupportResult({
        emotionalTone: result.data.emotionalTone,
        compassionateFeedback: result.data.compassionateFeedback,
        suggestedMicroHabit: result.data.suggestedMicroHabit,
        recommendedResources: result.data.recommendedResources,
      });
    } else {
      setSupportError(
        result.errorMessage ||
          "No pudimos cargar recomendaciones personalizadas en este momento. Puedes explorar las guías de abajo o buscar ayuda inmediata."
      );
    }
  };

  const handleAddSupportHabit = () => {
    if (!supportResult || habitSaved || !isAuthenticated) return;
    const current = loadUserHabits(user);
    const newHabit: StoredHabit = {
      id: Date.now(),
      text: `${supportResult.suggestedMicroHabit.title} (${supportResult.suggestedMicroHabit.durationMinutes} min)`,
      completed: false,
      category: supportResult.suggestedMicroHabit.category,
    };
    saveUserHabits(user, [newHabit, ...current]);
    recordWellnessActivity(user);
    setHabitSaved(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          {/* INTRO HÉROE */}
          <Section title="Autocuidado y bienestar emocional">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 max-w-7xl mx-auto">
              <p className="max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                El autocuidado no es egoísmo ni debilidad. Es una práctica consciente
                que ayuda a mantener el equilibrio emocional y prevenir dificultades
                de salud mental en tu día a día.
              </p>

              {/* Micro-interacción de Check-in Diario */}
              <div className="bg-white dark:bg-neutral-900/70 p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 shadow-sm w-full md:w-96 shrink-0 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Check-in de Bienestar
                </h4>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  ¿Cómo evaluarías tu nivel de energía/paz hoy?
                </p>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectMood(num)}
                      aria-label={`Nivel ${num} de 5`}
                      className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
                        moodRating === num
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {moodRating !== null && moodRating > 2 && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium pt-1 animate-fadeIn">
                    ¡Excelente! Mantén ese ritmo priorizando tu espacio y descanso.
                  </p>
                )}

                {moodRating !== null && moodRating <= 2 && (
                  <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800 space-y-3 animate-fadeIn">
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Recuerda ser amable contigo hoy. Si deseas, podemos sugerirte un micro-paso y recursos breves para acompañarte ahora.
                    </p>

                    <label htmlFor="checkin-note-input" className="sr-only">
                      Nota breve opcional sobre cómo te sientes
                    </label>
                    <input
                      id="checkin-note-input"
                      type="text"
                      value={checkInNote}
                      onChange={(e) => setCheckInNote(e.target.value)}
                      placeholder="¿Qué sientes en este momento? (opcional)"
                      maxLength={240}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleRequestLowMoodSupport}
                        disabled={isLoadingSupport}
                        className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                      >
                        {isLoadingSupport
                          ? "Preparando apoyo..."
                          : "Recibir apoyo personalizado"}
                      </button>
                      <Link
                        to="/ayuda"
                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Líneas 24/7
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {supportError && (
              <div
                role="status"
                className="max-w-7xl mx-auto mt-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300"
              >
                {supportError}
              </div>
            )}

            {supportResult && (
              <div className="max-w-7xl mx-auto mt-6 rounded-3xl border border-indigo-200/70 dark:border-indigo-900/50 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {supportResult.emotionalTone}
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Sugerencia de cuidado para este momento
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSupportResult(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    Cerrar
                  </button>
                </div>

                <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                  {supportResult.compassionateFeedback}
                </p>

                <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Micro-hábito sugerido · {supportResult.suggestedMicroHabit.category} ({supportResult.suggestedMicroHabit.durationMinutes} min)
                    </span>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {supportResult.suggestedMicroHabit.title}
                    </p>
                  </div>

                  {isAuthenticated ? (
                    habitSaved ? (
                      <Link
                        to="/autocuidado-diario"
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline shrink-0"
                      >
                        Guardado · Ver mis hábitos →
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddSupportHabit}
                        className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        Añadir a mi Autocuidado
                      </button>
                    )
                  ) : (
                    <Link
                      to="/autocuidado-diario"
                      className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      Ir a planificador de hábitos
                    </Link>
                  )}
                </div>

                {supportResult.recommendedResources.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {supportResult.recommendedResources.map((item, idx) => (
                      <Link
                        key={`${item.route}-${idx}`}
                        to={item.route}
                        className="group rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 p-4 hover:border-indigo-400 transition-colors flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {item.reason}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          Ir al recurso →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* RECURSOS */}
          <Section>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Herramientas y Prácticas Disponibles
              </h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {(wellbeingResources as WellbeingResource[]).map((item) => (
                <ResourceCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                >
                  <details className="text-sm text-gray-600 dark:text-gray-400 group/details [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold select-none list-none flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                      <svg
                        className="h-3.5 w-3.5 transition-transform duration-200 group-open/details:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      <span>Leer guía práctica</span>
                    </summary>

                    <div className="mt-3 text-neutral-600 dark:text-neutral-400 font-light leading-relaxed bg-neutral-50 dark:bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 animate-fadeIn">
                      {item.content}
                    </div>
                  </details>
                </ResourceCard>
              ))}
            </div>
          </Section>

          {/* CIERRE / SECCIÓN PUENTE DE CONCIENTIZACIÓN */}
          <Section>
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="grid gap-6 md:grid-cols-2 items-stretch">
                {/* Tarjeta 1: El Puente hacia Factores de Riesgo */}
                <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/40 to-violet-50/30 p-6 sm:p-8 dark:border-neutral-800/60 dark:from-indigo-950/10 dark:to-neutral-900/20 flex flex-col justify-between gap-6 hover:shadow-sm transition-shadow">
                  <div className="space-y-2 text-left">
                    <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 mb-1">
                      Prevención activa
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      ¿Conoces tus factores de riesgo?
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                      El bienestar no solo se construye adoptando hábitos positivos, sino también identificando y desaprendiendo conductas silenciosas que impactan tu mente.
                    </p>
                  </div>

                  <div>
                    <Link
                      to="/factores-riesgo"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-neutral-950 dark:bg-white px-5 py-3 text-sm font-semibold text-white dark:text-neutral-950 shadow-sm hover:opacity-90 transition-opacity"
                    >
                      Ver factores de riesgo →
                    </Link>
                  </div>
                </div>

                {/* Tarjeta 2: Recordatorio de Apoyo Profesional */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white/50 dark:border-neutral-800/60 dark:bg-neutral-900/20 backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                    Cuidarte es importante
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Si sientes que el autocuidado no es suficiente o que tus emociones
                    te sobrepasan en el día a día, recordar que buscar apoyo profesional es un paso completamente válido, humano y valiente.
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </main>

        <CrisisModal
          isOpen={isCrisisModalOpen}
          riskLevel={crisisRisk}
          onClose={() => setIsCrisisModalOpen(false)}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Autocuidado;