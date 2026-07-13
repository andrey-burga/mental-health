import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

import { pornographyResources, badHabitsResources } from "../data/homeContent";

interface ResourceData {
  title: string;
  paragraphs: string[];
}

function FactoresDeRiesgo() {
  const pornData = pornographyResources as ResourceData;
  const habitsData = badHabitsResources as ResourceData;

  // Estado para controlar qué factor de riesgo se está visualizando
  const [activeTab, setActiveTab] = useState<"pornography" | "habits">("pornography");

  // Estado para la sección interactiva de autoevaluación silenciosa
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selfReflectionQuestions = [
    "¿Siento que paso más tiempo del que desearía consumiendo contenido digital o en redes sociales?",
    "¿He notado que mis niveles de ansiedad aumentan si no reviso mis dispositivos constantemente?",
    "¿Postergó mis horas de sueño, descanso o alimentación por mantener rutinas automáticas?",
    "¿Me cuesta experimentar placer o motivación en actividades cotidianas fuera de las pantallas?"
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">

          {/* HERO / INTRODUCCIÓN */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              <div className="absolute top-12 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              <div className="absolute top-24 right-1/4 -z-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />

              <div className="max-w-4xl">
                <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Concientización y Prevención
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                  Factores de riesgo
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-3xl">
                  Algunas conductas y hábitos cotidianos pueden afectar la salud
                  mental de manera progresiva. Conocer estos factores no busca generar
                  culpa, sino promover una mayor conciencia y decisiones más
                  saludables para tu bienestar emocional.
                </p>
              </div>
            </div>
          </Section>

          {/* SELECTOR DE ENFOQUE (TABS ANMADOS) */}
          <Section>
            <div className="max-w-7xl mx-auto flex justify-center">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 shadow-sm">
                <button
                  onClick={() => setActiveTab("pornography")}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === "pornography"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Consumos Digitales
                </button>
                <button
                  onClick={() => setActiveTab("habits")}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === "habits"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Hábitos y Rutinas
                </button>
              </div>
            </div>
          </Section>

          {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
          <Section>
            <div className="max-w-7xl mx-auto transition-all duration-300">
              {activeTab === "pornography" ? (
                <div className="space-y-12 animate-fadeIn">
                  <div className="max-w-3xl space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {pornData.title}
                    </h2>
                    <div className="space-y-4 text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                      {pornData.paragraphs.map((text, index) => (
                        <p key={index}>{text}</p>
                      ))}
                    </div>
                  </div>

                  {/* Contenedor enfocado para las estadísticas */}
                  <div className="rounded-3xl border border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/20 backdrop-blur-sm p-6 sm:p-8">
                    <div className="mb-6 max-w-2xl">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                        Cifras para tomar conciencia
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                        Impacto correlacionado entre el consumo compulsivo y las respuestas del sistema psicofisiológico.
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { stat: "93%", title: "Exposición temprana", desc: "De los adolescentes varones han estado expuestos a este contenido antes de cumplir los 18 años." },
                        { stat: "Saturación", title: "Efecto de dopamina", desc: "El consumo compulsivo satura el sistema de recompensa, dificultando el placer en actividades cotidianas." },
                        { stat: "1 de cada 3", title: "Imagen corporal", desc: "Usuarios reportan sentir inseguridad sobre su propio cuerpo debido a estándares irreales y editados." },
                        { stat: "45%", title: "Menos conexión", desc: "El consumo frecuente puede correlacionarse con una menor satisfacción emocional en parejas reales." }
                      ].map((item, idx) => (
                        <article key={idx} className="rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-950 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                          <div className="space-y-2">
                            <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                              {item.stat}
                            </p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                              {item.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                    <p className="mt-6 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 italic">
                      *Datos con fines meramente informativos. No sustituyen el diagnóstico ni el acompañamiento de un profesional de la salud.
                    </p>
                  </div>
                </div>
              ) : (
                /* SECCIÓN 2: MALOS HÁBITOS */
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 animate-fadeIn">
                  <div className="lg:w-1/3 h-fit lg:sticky lg:top-28">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {habitsData.title}
                    </h2>
                  </div>
                  <div className="lg:w-2/3 rounded-3xl border border-slate-200/60 bg-white/60 p-6 sm:p-8 dark:border-slate-800/60 dark:bg-slate-900/20 backdrop-blur-sm">
                    <div className="space-y-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                      {habitsData.paragraphs.map((text, index) => (
                        <p key={index}>{text}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* NUEVO BLOQUE: AUTOEVALUACIÓN ESPACIO INTIMO */}
          <Section>
            <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 sm:p-10 dark:border-slate-800/60 dark:bg-slate-900/10 backdrop-blur-sm">
              <div className="max-w-2xl mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-2.5 py-1 rounded-md">
                  Reflexión Privada
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-3 mb-2">
                  Un momento de introspección
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                  Estas preguntas son exclusivamente para ti. No guardamos tus respuestas. Tómate un instante para responder de forma honesta.
                </p>
              </div>

              <div className="space-y-4">
                {selfReflectionQuestions.map((question, id) => (
                  <div 
                    key={id}
                    onClick={() => toggleCheck(id)}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/40 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 cursor-pointer select-none transition-colors hover:bg-slate-100/30 dark:hover:bg-slate-800/20"
                  >
                    <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      checkedItems[id] 
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white" 
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    }`}>
                      {checkedItems[id] && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-light leading-tight">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* CIERRE Y ACCIÓN */}
          <Section>
            <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 to-violet-50/40 backdrop-blur-sm p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm dark:border-slate-800/60 dark:from-indigo-950/20 dark:to-slate-900/40 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Un mensaje importante
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                  Identificar factores de riesgo es un primer paso fundamental hacia el autocuidado. 
                  Si sientes que alguno de estos aspectos está afectando significativamente tu balance diario, 
                  dar un giro a tus rutinas o conversar con un profesional puede marcar la diferencia.
                </p>
              </div>

              <div className="flex gap-6 items-center justify-center flex-wrap pt-2">
                <Link
                  to="/autocuidado"
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Explorar autocuidado
                </Link>
                
                <Link
                  to="/ayuda"
                  className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 transition-all duration-200"
                >
                  Buscar ayuda
                </Link>
              </div>
            </div>
          </Section>

        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default FactoresDeRiesgo;