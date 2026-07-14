import React from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

function Help() {
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
              
              {/* Banner de Emergencia Rediseñado con Estilo Institucional Limpio */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="rounded-2xl bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-900/30 p-4 sm:p-5 text-left max-w-3xl mx-auto flex gap-4 items-start">
                  <span className="text-xl sm:text-2xl flex-shrink-0 animate-pulse">🚨</span>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      Línea de Crisis o Emergencia Inmediata
                    </h4>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400/90 font-light leading-relaxed">
                      Si experimentas pensamientos de autolesión, te encuentras en una crisis severa o sientes que estás en riesgo inminente, por favor comunícate de inmediato con las líneas de emergencia locales o asiste al centro de salud u hospital más cercano.
                    </p>
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