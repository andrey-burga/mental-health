import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import {
  JournalEntry,
  WellnessStreakSummary,
  loadUserJournalEntries,
  calculateWellnessStreak,
  clearUserLocalData,
  exportJournalAsJson,
  exportJournalAsTxt,
} from "../utils/privacyStorage";
import { getDailyReflection } from "../services/reflectionsServices";
import type { DailyReflection } from "../types/reflections";

interface ToolCard {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  actionText: string;
  to: string;
}

const tools: ToolCard[] = [
  {
    title: "Diario de Emociones",
    description: "Registra cómo te sientes hoy y haz un seguimiento de tus patrones de ánimo con análisis asistido.",
    icon: "✍️",
    badge: "Recomendado hoy",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    actionText: "Escribir entrada",
    to: "/diario",
  },
  {
    title: "Respiración Guiada",
    description: "Tómate 3 minutos para calmar tu sistema nervioso con nuestro ejercicio de respiración cuadrada de ritmo constante.",
    icon: "🧘‍♂️",
    actionText: "Iniciar respiración",
    to: "/respiracion",
  },
  {
    title: "Planificador de Autocuidado",
    description: "Establece pequeñas rutinas diarias de bienestar y gana consistencia paso a paso.",
    icon: "🌱",
    badge: "Nuevo",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    actionText: "Ver mis hábitos",
    to: "/autocuidado-diario",
  },
  {
    title: "Biblioteca de Sonidos",
    description: "Escucha ruido blanco, sonidos de lluvia o frecuencias alfa ideales para calmar la ansiedad y concentrarte.",
    icon: "🎧",
    actionText: "Explorar audios",
    to: "/sonidos",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState<WellnessStreakSummary>(() =>
    calculateWellnessStreak(user)
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState<string | null>(null);
  const [dailyReflection, setDailyReflection] = useState<DailyReflection | null>(null);

  useEffect(() => {
    setSavedEntries(loadUserJournalEntries(user));
    setStreak(calculateWellnessStreak(user));
  }, [user]);

  useEffect(() => {
    getDailyReflection()
      .then((res) => setDailyReflection(res))
      .catch(() => {});
  }, []);

  const handleConfirmClearAll = () => {
    clearUserLocalData(user);
    setSavedEntries([]);
    setStreak(calculateWellnessStreak(user));
    setConfirmClearOpen(false);
    setPrivacyFeedback("Todos tus datos locales han sido eliminados de este dispositivo.");
  };

  // Fecha de hoy formateada de manera amigable
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          
          {/* CABECERA BIENVENIDA */}
          <Section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-200/60 dark:border-slate-800/60 pb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  Panel de Control
                </span>
                <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Hola de nuevo,{" "}
                  <span className="bg-gradient-to-r from-blue-300 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                    {user?.name || "Usuario"}
                  </span>{" "}
                  👋
                </h1>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400 font-light capitalize">
                  {today} • Este es tu espacio seguro de calma para hoy.
                </p>
              </div>

              {/* TARJETA DE ESTADO REAL */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-sm max-w-xs">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </div>
                <div>
                  {streak.streakDays > 0 ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {streak.streakDays}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {streak.streakDays === 1 ? "día seguido" : "días seguidos"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {streak.totalEntries} {streak.totalEntries === 1 ? "entrada" : "entradas"} • {streak.completedHabitsCount} hábitos hoy
                      </p>
                    </>
                  ) : streak.isFirstDay ? (
                    <>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Comienza tu primer día
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Escribe en tu diario o marca un hábito para iniciar tu racha.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Retoma a tu ritmo
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {streak.totalEntries} {streak.totalEntries === 1 ? "entrada" : "entradas"} • {streak.completedHabitsCount} hábitos completados
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* HERRAMIENTAS DE APOYO */}
          <Section title="Tus herramientas de apoyo">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 hover:shadow-md"
                >
                  {/* Resplandor decorativo sutil */}
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl transition-all duration-300 group-hover:bg-indigo-500/10 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl" role="img" aria-label={tool.title}>
                        {tool.icon}
                      </span>
                      {tool.badge && (
                        <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-slate-800/60">
                    <Link
                      to={tool.to}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 dark:hover:bg-indigo-600 hover:bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/10"
                    >
                      <span>{tool.actionText}</span>
                      <svg
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* PRIVACIDAD Y SOBERANÍA DE DATOS */}
          <Section title="Privacidad y soberanía de tus datos">
            <div className="rounded-2xl border border-gray-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tus registros locales ({savedEntries.length}{" "}
                    {savedEntries.length === 1 ? "entrada" : "entradas"} en el diario)
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    Tus entradas del diario están aisladas exclusivamente para tu cuenta en este navegador. Puedes descargar una copia o eliminar todos tus registros locales en cualquier momento.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => exportJournalAsJson(savedEntries, user)}
                    disabled={savedEntries.length === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    Exportar .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => exportJournalAsTxt(savedEntries, user)}
                    disabled={savedEntries.length === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    Exportar .TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(true)}
                    disabled={
                      savedEntries.length === 0 &&
                      streak.streakDays === 0 &&
                      streak.completedHabitsCount === 0
                    }
                    className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:opacity-50 transition-colors"
                  >
                    Eliminar todos mis datos locales
                  </button>
                </div>
              </div>

              {confirmClearOpen && (
                <div
                  role="alertdialog"
                  aria-labelledby="dashboard-confirm-clear-title"
                  className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <p
                    id="dashboard-confirm-clear-title"
                    className="text-xs sm:text-sm text-rose-900 dark:text-rose-200"
                  >
                    ¿Confirmas que deseas eliminar permanentemente todos tus registros locales de este dispositivo? Esta acción no se puede revertir.
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

              {privacyFeedback && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3"
                >
                  <span>{privacyFeedback}</span>
                  <button
                    type="button"
                    onClick={() => setPrivacyFeedback(null)}
                    className="text-xs font-semibold underline"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* REFLEXIÓN / RECORDATORIO DIARIO */}
          <Section>
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 max-w-4xl shadow-sm flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div className="space-y-3 flex-grow">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Reflexión para hoy
                  </h4>
                  {dailyReflection?.theme && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {dailyReflection.theme}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                  {dailyReflection?.phrase ||
                    "La salud mental no consiste en estar bien todo el tiempo, sino en aprender a acoger cada emoción con amabilidad. No tienes que resolverlo todo hoy, dar un pequeño paso ya es un gran avance."}
                </p>
                {dailyReflection?.reflectionPrompt && (
                  <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    {dailyReflection.reflectionPrompt}
                  </p>
                )}
                <div className="pt-1">
                  <Link
                    to={dailyReflection?.suggestedRoute || "/respiracion"}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{dailyReflection?.suggestedLabel || "Ir a respiración guiada"}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </Section>

        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}