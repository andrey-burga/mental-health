import React, { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import ClinicalDisclaimer from "../components/ClinicalDisclaimer";
import { CRISIS_COUNTRIES, CountryCode } from "../utils/crisisSafety";

function Help() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("CO");

  const activeCountry =
    CRISIS_COUNTRIES.find((c) => c.code === selectedCountry) ||
    CRISIS_COUNTRIES[0];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow">
          
          {/* HERO con Orbes de Luz */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              {/* Glow effects para mantener la identidad visual premium */}
              <div className="absolute top-12 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              <div className="absolute top-24 right-1/3 -z-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />

              <div className="max-w-3xl">
                <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Acompañamiento
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
                  Pedir ayuda también es{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    cuidarte
                  </span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Si te sientes abrumado, perdido o simplemente necesitas hablar con
                  alguien, no estás solo. Existen distintas formas de recibir apoyo, y
                  todas son un reflejo de valentía.
                </p>
              </div>
            </div>
          </Section>

          {/* DIRECTORIO REAL DE LÍNEAS DE AYUDA INMEDIATA */}
          <Section>
            <div className="max-w-7xl mx-auto rounded-3xl border border-teal-200/70 dark:border-teal-900/40 bg-gradient-to-br from-teal-50/50 via-white to-indigo-50/40 dark:from-teal-950/20 dark:via-neutral-900/70 dark:to-neutral-900/40 p-6 sm:p-10 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 dark:bg-teal-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
                    Atención Gratuita y Confidencial
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Directorio de líneas de apoyo y crisis
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light">
                    Selecciona tu país para comunicarte directamente con canales oficiales de escucha, orientación psicológica y emergencias.
                  </p>
                </div>

                {/* Selector de País */}
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Seleccionar país">
                  {CRISIS_COUNTRIES.map((country) => {
                    const isActive = country.code === selectedCountry;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCountry(country.code)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all border ${
                          isActive
                            ? "bg-teal-700 text-white border-teal-700 shadow-sm dark:bg-teal-600 dark:border-teal-600"
                            : "bg-white/80 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCountry.helplines.map((line) => (
                  <article
                    key={line.label}
                    className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 shadow-sm space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                          {line.availability}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                        {line.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                        {line.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <a
                        href={line.telHref}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <span>Llamar al {line.numberDisplay}</span>
                      </a>

                      {line.whatsappHref && (
                        <a
                          href={line.whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 dark:border-teal-800/70 bg-teal-50/50 dark:bg-teal-950/30 px-4 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100/60 dark:hover:bg-teal-950/60 transition-colors"
                        >
                          <span>{line.whatsappLabel || "Chat oficial por WhatsApp"}</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <ClinicalDisclaimer compact />
            </div>
          </Section>

          {/* CUÁNDO BUSCAR AYUDA - Reestructurado a Layout Asimétrico de 2 Columnas */}
          <Section>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Columna Izquierda: Introducción */}
              <div className="lg:w-5/12 space-y-4 lg:sticky lg:top-28 h-fit">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  ¿Cuándo es buena idea buscar ayuda?
                </h2>
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Buscar apoyo no significa que estés fallando. Al contrario, es una decisión
                  consciente y responsable cuando sientes que las situaciones superan tus herramientas actuales o se mantienen de manera prolongada.
                </p>
              </div>

              {/* Columna Derecha: Indicadores detallados en contenedor */}
              <div className="lg:w-7/12 rounded-3xl border border-neutral-200/60 bg-white/60 p-6 sm:p-8 dark:border-neutral-800/60 dark:bg-neutral-900/20 backdrop-blur-sm">
                <ul className="space-y-4">
                  {[
                    "Te sientes triste, ansioso, irritable o vacío la mayor parte del tiempo.",
                    "Has perdido el interés o el placer por actividades que antes disfrutabas rutinariamente.",
                    "Te cuesta conciliar el sueño, concentrarte o mantener tus responsabilidades habituales.",
                    "Sientes que el peso de tus emociones es demasiado complejo para llevarlo en soledad."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-4 text-sm sm:text-base font-light text-neutral-700 dark:text-neutral-300">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span className="leading-relaxed pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </Section>

          {/* OPCIONES DE AYUDA - Grid Limpio y Equilibrado */}
          <Section>
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Formas de recibir apoyo
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base mt-2">
                  Explora las alternativas disponibles y elige el canal con el que sientas mayor comodidad y seguridad.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                <ResourceCard
                  title="Hablar con alguien de confianza"
                  description="Un amigo, un familiar o una persona cercana con quien te sientas seguro puede escucharte, ayudarte a desahogarte y acompañarte en el proceso inicial."
                />
                <ResourceCard
                  title="Apoyo profesional calificado"
                  description="Psicólogos, psiquiatras o terapeutas están clínicamente capacitados para proporcionarte herramientas eficaces que te ayuden a procesar y manejar tus emociones."
                />
                <ResourceCard
                  title="Líneas de ayuda y escucha"
                  description="Existen canales gratuitos, totalmente confidenciales y accesibles las 24 horas del día donde puedes hablar de forma segura con un consejero experto."
                />
              </div>
            </div>
          </Section>

          {/* SECCIÓN CRÍTICA: MENSAJE IMPORTANTE / ALERTA DE EMERGENCIA */}
          <Section>
            <div className="rounded-3xl border border-neutral-200/60 bg-white/70 dark:border-neutral-800/60 dark:bg-neutral-900/40 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl backdrop-blur-md space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Tu vida y tu bienestar importan
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
                  No necesitas tener todas las respuestas claras ni resolver tus problemas por completo para empezar a cuidar de ti. Dar el primer paso ya es un avance significativo.
                </p>
              </div>
              
              {/* Banner de Emergencia con llamada directa */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-5 text-left max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      ¿Estás en riesgo inmediato?
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                      Si experimentas pensamientos de autolesión o sientes que estás en peligro inminente, comunícate de inmediato con emergencias o acude al centro de salud más cercano.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <a
                      href={activeCountry.helplines[0]?.telHref || "tel:106"}
                      className="rounded-xl bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors whitespace-nowrap"
                    >
                      Llamar {activeCountry.helplines[0]?.numberDisplay || "106"}
                    </a>
                  </div>
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

export default Help;