import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { trackToolEvent } from "../utils/telemetry";

type Phase = "Inhala" | "Mantén" | "Exhala" | "Espera";

interface Technique {
  name: string;
  description: string;
  pattern: { phase: Phase; duration: number }[];
}

const TECHNIQUES: Technique[] = [
  {
    name: "Respiración Cuadrada (4-4-4-4)",
    description: "Excelente para reducir el estrés agudo y recuperar el enfoque.",
    pattern: [
      { phase: "Inhala", duration: 4 },
      { phase: "Mantén", duration: 4 },
      { phase: "Exhala", duration: 4 },
      { phase: "Espera", duration: 4 },
    ],
  },
  {
    name: "Relajación Profunda (4-7-8)",
    description: "Ideal para calmar la ansiedad rápida o antes de descansar.",
    pattern: [
      { phase: "Inhala", duration: 4 },
      { phase: "Mantén", duration: 7 },
      { phase: "Exhala", duration: 8 },
    ],
  },
  {
    name: "Respiración Calmante (4-4)",
    description: "Ritmo suave y sencillo para comenzar sin presión.",
    pattern: [
      { phase: "Inhala", duration: 4 },
      { phase: "Exhala", duration: 4 },
    ],
  },
];

export default function RespiracionPage() {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>(TECHNIQUES[0]);
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES[0].pattern[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const currentPhase = selectedTechnique.pattern[phaseIndex];

  useEffect(() => {
    trackToolEvent("respiracion");
  }, []);

  const handleSelectTechnique = (tech: Technique) => {
    setIsActive(false);
    setSelectedTechnique(tech);
    setPhaseIndex(0);
    setTimeLeft(tech.pattern[0].duration);
    setCompletedCycles(0);
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        const nextIndex = (phaseIndex + 1) % selectedTechnique.pattern.length;
        setPhaseIndex(nextIndex);

        if (nextIndex === 0) {
          setCompletedCycles((c) => c + 1);
        }

        return selectedTechnique.pattern[nextIndex].duration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phaseIndex, selectedTechnique]);

  const toggleStart = () => {
    if (isActive) {
      setIsActive(false);
      setPhaseIndex(0);
      setTimeLeft(selectedTechnique.pattern[0].duration);
    } else {
      setIsActive(true);
    }
  };

  const getCircleScale = () => {
    if (!isActive) {
      return "scale-100 bg-neutral-100/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700";
    }
    const scaleIn = shouldReduceMotion ? "scale-100" : "scale-125";
    const scaleOut = shouldReduceMotion ? "scale-100" : "scale-90";
    switch (currentPhase.phase) {
      case "Inhala":
        return `${scaleIn} bg-teal-500/15 border-teal-500`;
      case "Mantén":
        return `${scaleIn} bg-indigo-500/15 border-indigo-500`;
      case "Exhala":
        return `${scaleOut} bg-indigo-500/10 border-indigo-400`;
      case "Espera":
        return `${scaleOut} bg-neutral-400/15 border-neutral-400 dark:border-neutral-600`;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-16 -z-0 flex justify-between overflow-hidden"
        >
          <div className="h-72 w-72 -translate-x-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/5" />
          <div className="h-72 w-72 translate-x-1/3 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
        </div>

        <Header />

        <main className="flex-grow relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
            {/* Encabezado */}
            <div className="space-y-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Regulación del sistema nervioso
                </p>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  ← Volver a Mi Espacio
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Respiración Guiada
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Sincroniza tu ritmo respiratorio para desacelerar el pulso y recuperar la calma.
              </p>
            </div>

            {/* Selector de Técnicas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TECHNIQUES.map((tech) => {
                const selected = selectedTechnique.name === tech.name;
                return (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => handleSelectTechnique(tech)}
                    disabled={isActive}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selected
                        ? "bg-white dark:bg-neutral-900 border-teal-500 shadow-sm ring-1 ring-teal-500/30"
                        : "bg-white/70 dark:bg-neutral-900/50 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    } ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <h2 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                      {tech.name}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {tech.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Zona del Ejercicio de Respiración */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-8 sm:p-12 shadow-sm space-y-8">
              {/* Visualizador Animado */}
              <div className="relative flex items-center justify-center w-64 h-64">
                <div
                  className={`absolute inset-0 rounded-full border border-dashed border-teal-500/30 ${
                    shouldReduceMotion ? "" : "transition-all duration-1000"
                  } ${isActive && !shouldReduceMotion ? "animate-spin-slow" : ""}`}
                />

                <div
                  aria-live="polite"
                  className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center ${
                    shouldReduceMotion
                      ? "transition-colors duration-300"
                      : "transition-all ease-in-out duration-1000"
                  } ${getCircleScale()}`}
                >
                  <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    {isActive ? currentPhase.phase : "Listos"}
                  </span>
                  {isActive && (
                    <span className="text-4xl font-black text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
                      {timeLeft}s
                    </span>
                  )}
                </div>
              </div>

              {/* Contador de Ciclos */}
              <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium tabular-nums">
                Ciclos completados:{" "}
                <span className="font-bold text-neutral-900 dark:text-white">
                  {completedCycles}
                </span>
              </div>

              {/* Botón de Control */}
              <div>
                <button
                  type="button"
                  onClick={toggleStart}
                  className={`px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors shadow-xs active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  {isActive ? "Detener ejercicio" : "Comenzar ejercicio"}
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}