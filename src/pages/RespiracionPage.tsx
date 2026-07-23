import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

type Phase = "Inhala" | "Mantén" | "Exhala" | "Espera";

interface Technique {
  name: string;
  description: string;
  pattern: { phase: Phase; duration: number }[];
}

const TECHNIQUES: Technique[] = [
  {
    name: "Respiración Cuadrada (4-4-4-4)",
    description: "Excelente para reducir el estrés severo y recuperar el enfoque.",
    pattern: [
      { phase: "Inhala", duration: 4 },
      { phase: "Mantén", duration: 4 },
      { phase: "Exhala", duration: 4 },
      { phase: "Espera", duration: 4 },
    ],
  },
  {
    name: "Relajación Profunda (4-7-8)",
    description: "Ideal para calmar la ansiedad rápida o antes de dormir.",
    pattern: [
      { phase: "Inhala", duration: 4 },
      { phase: "Mantén", duration: 7 },
      { phase: "Exhala", duration: 8 },
    ],
  },
  {
    name: "Respiración Calmante (4-4)",
    description: "Ritmo suave y sencillo para principiantes.",
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

  const currentPhase = selectedTechnique.pattern[phaseIndex];

  // Manejar el cambio de técnica
  const handleSelectTechnique = (tech: Technique) => {
    setIsActive(false);
    setSelectedTechnique(tech);
    setPhaseIndex(0);
    setTimeLeft(tech.pattern[0].duration);
    setCompletedCycles(0);
  };


  
  // Lógica del temporizador
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Pasar a la siguiente fase
        const nextIndex = (phaseIndex + 1) % selectedTechnique.pattern.length;
        setPhaseIndex(nextIndex);

        // Si regresamos al inicio, sumamos un ciclo completo
        if (nextIndex === 0) {
          setCompletedCycles((c) => c + 1);
        }

        return selectedTechnique.pattern[nextIndex].duration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phaseIndex, selectedTechnique]);

  // Reiniciar cuando se detiene
  const toggleStart = () => {
    if (isActive) {
      setIsActive(false);
      setPhaseIndex(0);
      setTimeLeft(selectedTechnique.pattern[0].duration);
    } else {
      setIsActive(true);
    }
  };

  // Escalar el círculo dinámicamente según la fase
  const getCircleScale = () => {
    if (!isActive) return "scale-100";
    switch (currentPhase.phase) {
      case "Inhala":
        return "scale-125 bg-teal-500/20 border-teal-500";
      case "Mantén":
        return "scale-125 bg-sky-500/20 border-sky-500";
      case "Exhala":
        return "scale-90 bg-indigo-500/20 border-indigo-500";
      case "Espera":
        return "scale-90 bg-slate-500/20 border-slate-400";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              
              {/* Encabezado */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                  Regulación Nerviosa
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Respiración Guiada 🧘‍♂️
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Sincroniza tu ritmo respiratorio para desacelerar tu ritmo cardíaco y calmar la mente.
                </p>
              </div>

              {/* Selector de Técnicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TECHNIQUES.map((tech) => (
                  <button
                    key={tech.name}
                    onClick={() => handleSelectTechnique(tech)}
                    disabled={isActive}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedTechnique.name === tech.name
                        ? "bg-white dark:bg-slate-900 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                        : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    } ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {tech.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {tech.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Zona del Ejercicio de Respiración */}
              <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm space-y-8">
                
                {/* Visualizador Animado */}
                <div className="relative flex items-center justify-center w-64 h-64">
                  {/* Anillo exterior decorativo */}
                  <div
                    className={`absolute inset-0 rounded-full border border-dashed border-teal-500/30 transition-all duration-1000 ${
                      isActive ? "animate-spin-slow" : ""
                    }`}
                  />

                  {/* Círculo Principal Animado */}
                  <div
                    className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all ease-in-out duration-1000 ${getCircleScale()}`}
                  >
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                      {isActive ? currentPhase.phase : "Listos"}
                    </span>
                    {isActive && (
                      <span className="text-4xl font-black text-teal-600 dark:text-teal-400 mt-1">
                        {timeLeft}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Contador de Ciclos */}
                <div className="text-xs text-slate-500 font-medium">
                  Ciclos completados: <span className="font-bold text-slate-800 dark:text-white">{completedCycles}</span>
                </div>

                {/* Botones de Control */}
                <div className="flex gap-4">
                  <button
                    onClick={toggleStart}
                    className={`px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-md active:scale-95 ${
                      isActive
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-teal-600 hover:bg-teal-700"
                    }`}
                  >
                    {isActive ? "Detener" : "Comenzar Ejercicio"}
                  </button>
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