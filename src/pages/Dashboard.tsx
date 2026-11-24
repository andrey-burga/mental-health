import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import {
  JournalEntry,
  StoredHabit,
  WellnessStreakSummary,
  loadUserJournalEntries,
  loadUserHabits,
  calculateWellnessStreak,
  recordWellnessActivity,
  clearUserLocalData,
  exportJournalAsJson,
  exportJournalAsTxt,
} from "../utils/privacyStorage";
import { fetchDailyReflectionWithFallback } from "../services/reflectionsServices";
import type { DailyReflection } from "../types/reflections";
import { openEmotionalCompanion } from "../components/EmotionalCompanion";

interface CheckInOption {
  score: number;
  label: string;
  note: string;
}

const CHECK_IN_OPTIONS: CheckInOption[] = [
  {
    score: 1,
    label: "Abrumado/a",
    note: "Gracias por ser honesto/a contigo. Hoy prioriza el descanso y una pausa breve.",
  },
  {
    score: 2,
    label: "Cargado/a",
    note: "Está bien ir paso a paso. Una respiración guiada o conversar puede aligerar el momento.",
  },
  {
    score: 3,
    label: "En equilibrio",
    note: "Un punto sereno para observar cómo está tu cuerpo y sostener tus hábitos básicos.",
  },
  {
    score: 4,
    label: "Tranquilo/a",
    note: "Qué valioso reconocer esta calma. Aprovecha para registrar lo que te ayudó hoy.",
  },
  {
    score: 5,
    label: "Con energía",
    note: "Disfruta este impulso con amabilidad, sin exigirte de más.",
  },
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<StoredHabit[]>([]);
  const [streak, setStreak] = useState<WellnessStreakSummary>(() =>
    calculateWellnessStreak(user)
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState<string | null>(null);

  const [dailyReflection, setDailyReflection] = useState<DailyReflection | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInOption | null>(null);

  useEffect(() => {
    setSavedEntries(loadUserJournalEntries(user));
    setHabits(loadUserHabits(user));
    setStreak(calculateWellnessStreak(user));
  }, [user]);

  useEffect(() => {
    let active = true;
    fetchDailyReflectionWithFallback()
      .then((res) => {
        if (!active) return;
        if (res.reflection) setDailyReflection(res.reflection);
        if (res.notice) setReflectionNotice(res.notice);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleRefreshReflection = async () => {
    if (reflectionLoading) return;
    setReflectionLoading(true);
    setReflectionNotice(null);
    try {
      const res = await fetchDailyReflectionWithFallback({
        refresh: true,
        moodScore: selectedCheckIn?.score,
      });
      if (res.reflection) {
        setDailyReflection(res.reflection);
      }
      if (res.notice) {
        setReflectionNotice(res.notice);
      }
    } finally {
      setReflectionLoading(false);
    }
  };

  const handleSelectCheckIn = (option: CheckInOption) => {
    setSelectedCheckIn(option);
    recordWellnessActivity(user);
    setStreak(calculateWellnessStreak(user));
  };

  const handleConfirmClearAll = () => {
    clearUserLocalData(user);
    setSavedEntries([]);
    setHabits(loadUserHabits(user));
    setStreak(calculateWellnessStreak(user));
    setConfirmClearOpen(false);
    setPrivacyFeedback("Todos tus datos locales han sido eliminados de este dispositivo.");
  };

  const todayFormatted = useMemo(() => {
    const raw = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  const completedHabitsCount = habits.filter((h) => h.completed).length;
  const totalHabitsCount = habits.length;
  const recentEntries = savedEntries.slice(0, 3);

  const therapeuticTools = [
    {
      title: "Diario Emocional",
      description:
        "Expresa pensamientos sin juicios con aislamiento local, modo efímero y reflexión optativa.",
      metric: `${savedEntries.length} ${savedEntries.length === 1 ? "entrada" : "entradas"}`,
      actionText: "Abrir diario",
      to: "/diario",
      accent: "indigo" as const,
      iconPath:
        "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
    },
    {
      title: "Respiración Guiada",
      description:
        "Desacelera el sistema nervioso con ritmos visuales guiados (4-4-4-4, 4-7-8 y calma suave).",
      metric: "3 técnicas",
      actionText: "Iniciar práctica",
      to: "/respiracion",
      accent: "teal" as const,
      iconPath:
        "M3.75 12h2.25l2.25-5.25 3.75 10.5 2.25-6.75L16.5 12h3.75",
    },
    {
      title: "Paisajes Sonoros",
      description:
        "Combina lluvia fina, océano, ruido blanco o frecuencias alfa con temporizador de sueño.",
      metric: "4 ambientes",
      actionText: "Explorar sonidos",
      to: "/sonidos",
      accent: "indigo" as const,
      iconPath:
        "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
    },
    {
      title: "Autocuidado Diario",
      description:
        "Sostén micro-hábitos físicos, mentales, emocionales y sociales a tu propio ritmo.",
      metric: `${completedHabitsCount}/${totalHabitsCount} hábitos hoy`,
      actionText: "Ver rutinas",
      to: "/autocuidado-diario",
      accent: "teal" as const,
      iconPath:
        "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-clip">
        {/* Orbes ambientales sutiles coherentes con el sitio público */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-16 -z-0 flex justify-between overflow-hidden"
        >
          <div className="h-72 w-72 -translate-x-1/3 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
          <div className="h-72 w-72 translate-x-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/5" />
        </div>

        <Header />

        <main className="flex-grow relative z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
            {/* 1. CABECERA DE BIENVENIDA PERSONALIZADA */}
            <section
              aria-label="Bienvenida y estado personal"
              className="border-b border-neutral-200/80 dark:border-neutral-800 pb-8 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Mi Espacio de Bienestar · {todayFormatted}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
                    {getTimeGreeting()}, {user?.name || "Usuario"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
                    <span>
                      {streak.streakDays > 0
                        ? `${streak.streakDays} ${
                            streak.streakDays === 1 ? "día seguido" : "días seguidos"
                          } de cuidado`
                        : streak.isFirstDay
                        ? "Primer día en tu espacio personal"
                        : "Retoma a tu propio ritmo"}
                    </span>
                    <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                      ·
                    </span>
                    <span>
                      {savedEntries.length}{" "}
                      {savedEntries.length === 1 ? "entrada en diario" : "entradas en diario"}
                    </span>
                    <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                      ·
                    </span>
                    <span>
                      {completedHabitsCount}/{totalHabitsCount} hábitos hoy
                    </span>
                  </div>
                </div>

                {/* Acciones rápidas en 1 clic */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEmotionalCompanion()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
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
                    <span>Hablar con Acompañante IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckInOpen((prev) => !prev)}
                    aria-expanded={checkInOpen}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      checkInOpen || selectedCheckIn
                        ? "border-teal-300 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.9"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {selectedCheckIn ? `Check-in: ${selectedCheckIn.label}` : "Check-in rápido"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Panel interactivo de Check-in rápido */}
              {checkInOpen && (
                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      ¿Cómo sientes tu nivel de calma en este momento?
                    </p>
                    <button
                      type="button"
                      onClick={() => setCheckInOpen(false)}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Ocultar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {CHECK_IN_OPTIONS.map((opt) => {
                      const active = selectedCheckIn?.score === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleSelectCheckIn(opt)}
                          className={`flex items-center justify-between sm:flex-col sm:items-start gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                            active
                              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                              : "border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                          }`}
                        >
                          <span className="text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                            {opt.score}/5
                          </span>
                          <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCheckIn && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {selectedCheckIn.note}
                      </p>
                      {selectedCheckIn.score <= 2 && (
                        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                          <Link
                            to="/respiracion"
                            className="text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            Respirar 2 min
                          </Link>
                          <span className="text-neutral-300 dark:text-neutral-700">·</span>
                          <Link
                            to="/ayuda"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Ver líneas de apoyo
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 2. TARJETA EDITORIAL DESTACADA: REFLEXIÓN DEL DÍA */}
            <section aria-label="Reflexión del día">
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <span>Reflexión del día</span>
                    {dailyReflection?.theme && (
                      <>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                          ·
                        </span>
                        <span className="text-teal-700 dark:text-teal-400">
                          {dailyReflection.theme}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshReflection}
                    disabled={reflectionLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <svg
                      className={`h-3.5 w-3.5 ${reflectionLoading ? "animate-spin" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    <span>{reflectionLoading ? "Generando..." : "Nueva reflexión"}</span>
                  </button>
                </div>

                <blockquote className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-white leading-relaxed">
                  “
                  {dailyReflection?.phrase ||
                    "La salud mental no consiste en estar bien todo el tiempo, sino en aprender a acoger cada emoción con amabilidad."}
                  ”
                </blockquote>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="space-y-1">
                    {dailyReflection?.reflectionPrompt && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {dailyReflection.reflectionPrompt}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      — {dailyReflection?.author || "Tu Espacio Seguro"}
                    </p>
                  </div>

                  <Link
                    to={dailyReflection?.suggestedRoute || "/respiracion"}
                    className="inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>{dailyReflection?.suggestedLabel || "Ir a respiración guiada"}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {reflectionNotice && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                    {reflectionNotice}
                  </p>
                )}
              </div>
            </section>

            {/* 3. GRID EQUILIBRADO DE HERRAMIENTAS TERAPÉUTICAS */}
            <section aria-labelledby="tools-heading" className="space-y-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id="tools-heading"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
                >
                  Herramientas terapéuticas
                </h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Privadas y disponibles a tu ritmo
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {therapeuticTools.map((tool) => (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-700/70 hover:shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            tool.accent === "teal"
                              ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400"
                              : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={tool.iconPath}
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                          {tool.metric}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <span>{tool.actionText}</span>
                      <svg
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 4. SECCIÓN INFERIOR: ACTIVIDAD RECIENTE Y PRIVACIDAD */}
            <section
              aria-label="Actividad reciente y privacidad"
              className="grid gap-6 lg:grid-cols-12 items-start"
            >
              {/* Actividad reciente (sin tarjetas anidadas, separadores hairline) */}
              <div className="lg:col-span-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Actividad reciente
                  </h2>
                  <Link
                    to="/diario"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ir al diario →
                  </Link>
                </div>

                {recentEntries.length === 0 ? (
                  <div className="py-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Aún no has guardado reflexiones en tu diario local. Cuando registres cómo te sientes, aparecerán aquí para que puedas retomarlas fácilmente.
                    </p>
                    <Link
                      to="/diario"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                    >
                      Escribir primera entrada
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-200/70 dark:divide-neutral-800 border-t border-neutral-100 dark:border-neutral-800">
                    {recentEntries.map((item) => (
                      <li key={item.id} className="py-4 first:pt-4 last:pb-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {item.mood} · {item.tag}
                          </span>
                          <span className="tabular-nums">{item.date}</span>
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Panel discreto de Privacidad y Soberanía de Datos */}
              <div className="lg:col-span-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.9"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Privacidad y soberanía
                    </h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed tabular-nums">
                      Tienes {savedEntries.length}{" "}
                      {savedEntries.length === 1 ? "entrada" : "entradas"} guardadas únicamente para tu cuenta en este navegador.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => exportJournalAsJson(savedEntries, user)}
                    disabled={savedEntries.length === 0}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Exportar .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => exportJournalAsTxt(savedEntries, user)}
                    disabled={savedEntries.length === 0}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Borrar datos locales
                  </button>
                </div>

                {confirmClearOpen && (
                  <div
                    role="alertdialog"
                    aria-labelledby="dashboard-confirm-clear-title"
                    className="pt-3 border-t border-rose-200/70 dark:border-rose-900/50 space-y-3"
                  >
                    <p
                      id="dashboard-confirm-clear-title"
                      className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed"
                    >
                      ¿Confirmas eliminar permanentemente tus registros locales de este dispositivo? Esta acción no se puede revertir.
                    </p>
                    <div className="flex items-center gap-2">
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

                {privacyFeedback && (
                  <div
                    role="status"
                    className="pt-3 border-t border-teal-200/70 dark:border-teal-900/50 flex items-center justify-between gap-3 text-xs text-teal-800 dark:text-teal-300"
                  >
                    <span>{privacyFeedback}</span>
                    <button
                      type="button"
                      onClick={() => setPrivacyFeedback(null)}
                      className="font-semibold underline cursor-pointer shrink-0"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}