import React, { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { Link } from "react-router-dom";
import { wellbeingResources } from "../data/homeContent";

// 1. Interfaz para los recursos
interface WellbeingResource {
  id: string | number;
  title: string;
  description: string;
  content: string;
  category?: "cuerpo" | "mente" | "emociones"; // Añadido opcional para filtrado/etiquetas
}

function Autocuidado() {
  // Estado para un micro "Check-in" interactivo de bienestar
  const [moodRating, setMoodRating] = useState<number | null>(null);

  return (
    <PageTransition>
      <Header />

      {/* INTRO HÉROE */}
      <Section title="Autocuidado y bienestar emocional">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 max-w-7xl mx-auto">
          <p className="max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
            El autocuidado no es egoísmo ni debilidad. Es una práctica consciente
            que ayuda a mantener el equilibrio emocional y prevenir dificultades
            de salud mental en tu día a día.
          </p>

          {/* NUEVO: Micro-interacción de Check-in Diario */}
          <div className="bg-neutral-50 dark:bg-neutral-900/60 p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/60 w-full md:w-80 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
              Check-in de Bienestar
            </h4>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">
              ¿Cómo evaluarías tu nivel de energía/paz hoy?
            </p>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setMoodRating(num)}
                  className={`w-9 h-9 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
                    moodRating === num
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            {moodRating !== null && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-3 animate-fadeIn">
                {moodRating <= 2 
                  ? "Recuerda ser amable contigo. Revisa los recursos de abajo." 
                  : "¡Excelente! Mantén ese ritmo priorizando tu espacio."}
              </p>
            )}
          </div>
        </div>
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
              {/* Desplegable interactivo estilizado y corregido para navegadores modernos */}
              <details className="text-sm text-gray-600 dark:text-gray-400 group/details [&_summary::-webkit-details-marker]:hidden">
                <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold select-none list-none flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <span className="text-xs transition-transform duration-200 group-open/details:rotate-90">
                    ▶
                  </span>
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 text-lg font-bold">
                ✓
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

      <Footer />
    </PageTransition>
  );
}

export default Autocuidado;