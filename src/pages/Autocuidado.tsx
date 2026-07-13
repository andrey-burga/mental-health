import React from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { Link } from "react-router-dom";
import { wellbeingResources } from "../data/homeContent";

// 1. Definimos la interfaz para tipar los recursos de bienestar
interface WellbeingResource {
  id: string | number;
  title: string;
  description: string;
  content: string; // Obligatorio para nuestro bloque desplegable details
}

function Autocuidado() {
  return (
    <PageTransition>
      <Header />

      {/* INTRO */}
      <Section title="Autocuidado y bienestar emocional">
        <p className="max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
          El autocuidado no es egoísmo ni debilidad. Es una práctica consciente
          que ayuda a mantener el equilibrio emocional y prevenir dificultades
          de salud mental.
        </p>
      </Section>

      {/* RECURSOS */}
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {(wellbeingResources as WellbeingResource[]).map((item) => (
            <ResourceCard
              key={item.id}
              title={item.title}
              description={item.description}
            >
              {/* Desplegable interactivo estilizado para Dark Mode */}
              <details className="text-sm text-gray-600 dark:text-gray-400 group/details">
                <summary className="cursor-pointer text-primary font-semibold select-none list-none flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <span className="transition-transform duration-200 group-open/details:rotate-90">
                    ▶
                  </span>
                  Leer más
                </summary>
                <p className="mt-3 text-gray-600 dark:text-gray-400 font-light leading-relaxed bg-gray-50 dark:bg-slate-950/40 p-3 rounded-xl border border-gray-100/60 dark:border-slate-800/40 animate-fadeIn">
                  {item.content}
                </p>
              </details>
            </ResourceCard>
          ))}
        </div>
      </Section>

      {/* CIERRE / SECCIÓN PUENTE DE CONCIENTIZACIÓN */}
      <Section>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Grid de dos columnas para dar un ritmo sofisticado al cierre */}
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {/* Tarjeta 1: El Puente hacia Factores de Riesgo (Premium con sutil enfoque de marca) */}
            <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/30 to-violet-50/20 p-6 sm:p-8 dark:border-slate-800/60 dark:from-indigo-950/10 dark:to-slate-900/20 flex flex-col justify-between gap-6">
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  ¿Conoces tus factores de riesgo?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  El bienestar no solo se construye adoptando hábitos positivos, sino también identificando y desaprendiendo conductas silenciosas que impactan tu mente.
                </p>
              </div>

              <div>
                <Link
                  to="/factores-riesgo"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Ver factores de riesgo →
                </Link>
              </div>
            </div>
            {/* Tarjeta 2: Recordatorio de Apoyo Profesional (Limpiada y refinada) */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 dark:border-slate-800/60 dark:bg-slate-900/20 backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Cuidarte es importante
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                Si sientes que el autocuidado no es suficiente o que tus emociones
                te sobrepasan en el día a día, recordar que buscar apoyo profesional es un paso completamente válido y valiente.
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