import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";

import Header from "../components/Header";
import Section from "../components/Section";
import Warning from "../components/Warning";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getDisorders } from "../services/disorders";
import { mentalHealthIntro } from "../data/homeContent";

interface Disorder {
  id: string | number;
  title: string;
  description: string;
}

function SaludMental() {
  const [disorders, setDisorders] = useState<Disorder[]>([]);
  const [loadingDisorders, setLoadingDisorders] = useState<boolean>(true);

  useEffect(() => {
    getDisorders()
      .then((data) => setDisorders(data || []))
      .catch((err) => console.error("Error cargando trastornos:", err))
      .finally(() => setLoadingDisorders(false));
  }, []);

  return (
    <PageTransition>
      {/* 
        LIMPIEZA: El contenedor principal permanece libre de clases redundantes de fondo 
        o colores de texto, las cuales son manejadas globalmente por la aplicación.
      */}
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* HERO / INTRO - Con efectos de profundidad de orbes (Glow Effects) */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              {/* Orbes decorativos integrados con la identidad visual */}
              <div className="absolute top-12 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              <div className="absolute top-24 right-1/4 -z-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />

              <div className="max-w-4xl">
                <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Conceptos Clave
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-6">
                  Salud mental
                </h1>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  La salud mental forma parte fundamental del bienestar general.
                  Afecta cómo pensamos, sentimos, actuamos y nos relacionamos con los
                  demás. Hablar de salud mental es hablar de vida, equilibrio y
                  cuidado personal.
                </p>
              </div>
            </div>
          </Section>

          {/* ¿QUÉ ES? E IMPORTANCIA - Layout asimétrico de dos columnas */}
          <Section>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Columna Izquierda: El concepto */}
              <div className="lg:w-1/2 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  {mentalHealthIntro.title}
                </h2>
                <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed font-light text-base sm:text-lg">
                  {mentalHealthIntro.paragraphs.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Por qué importa (Destacada en un contenedor sutil) */}
              <div className="lg:w-1/2 rounded-3xl border border-neutral-100 bg-neutral-50/40 p-6 sm:p-8 dark:border-neutral-800/60 dark:bg-neutral-900/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
                  ¿Por qué es importante?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-light text-base sm:text-lg">
                  La salud mental influye en la forma en que enfrentamos el estrés,
                  tomamos decisiones, mantenemos relaciones y cuidamos de nosotros
                  mismos. Descuidarla puede afectar la calidad de vida, el
                  rendimiento académico o laboral y la salud física. Cuidarla, en
                  cambio, fortalece la resiliencia y el bienestar emocional de manera integral.
                </p>
              </div>
            </div>
          </Section>

          {/* MITOS Y VERDADES */}
          <Section>
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                  Mitos y verdades sobre la salud mental
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base">
                  Derribar estigmas sociales nos permite construir comunidades más empáticas y seguras para todos.
                </p>
              </div>

              <div className="grid gap-6 max-w-5xl">
                {[
                  { m: "Solo las personas “débiles” tienen problemas de salud mental.", v: "Cualquiera puede atravesar dificultades emocionales." },
                  { m: "Hablar de salud mental empeora los problemas.", v: "Hablarlo puede ser el primer paso para mejorar." },
                  { m: "Pedir ayuda es señal de fracaso.", v: "Pedir ayuda es un acto de valentía." }
                ].map((item, idx) => (
                  <div key={idx} className="grid sm:grid-cols-2 gap-0 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="bg-red-50/30 dark:bg-red-950/10 p-6 border-b sm:border-b-0 sm:border-r border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-center">
                      <span className="inline-flex items-center w-fit text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-md mb-2">Mito</span>
                      <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">{item.m}</p>
                    </div>
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/5 p-6 flex flex-col justify-center">
                      <span className="inline-flex items-center w-fit text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-md mb-2">Verdad</span>
                      <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* TRASTORNOS – PREVIEW */}
          <Section>
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                  Trastornos comunes de salud mental
                </h2>
                <p className="max-w-3xl text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base">
                  Algunas condiciones de salud mental son más frecuentes de lo que se
                  suele pensar. Conocerlas ayuda a identificar señales de alerta y a
                  buscar apoyo oportunamente.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingDisorders ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="w-full h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                  ))
                ) : (
                  disorders.slice(0, 4).map((item) => (
                    <Warning
                      key={item.id}
                      title={item.title}
                      text={item.description}
                    />
                  ))
                )}
              </div>

              <div className="mt-8">
                <NavLink
                  to="/trastornos"
                  className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline group"
                >
                  Ver todos los trastornos 
                  {/* CORRECCIÓN: Se corrigió "tranneutral-x-1" a la clase nativa de Tailwind "translate-x-1" */}
                  <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                </NavLink>
              </div>
            </div>
          </Section>

          {/* CTA */}
          <Section>
            <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 to-violet-50/40 backdrop-blur-sm p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm dark:border-neutral-800/60 dark:from-indigo-950/20 dark:to-neutral-900/40">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                Seguir aprendiendo y cuidarte
              </h3>
              <p className="mb-8 text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
                Informarte es un primer paso, pero no tienes que hacerlo solo.
                Existen recursos, profesionales y personas dispuestas a acompañarte.
              </p>

              <div className="flex gap-6 items-center justify-center flex-wrap">
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

export default SaludMental;