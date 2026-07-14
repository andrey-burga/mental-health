import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

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
    actionText: "Iniciar sesión",
    to: "/respiracion",
  },
  {
    title: "Planificador de Autocuidado",
    description: "Establece pequeñas rutinas diarias de bienestar y gana consistencia paso a paso.",
    icon: "🌱",
    badge: "Nuevo",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    actionText: "Ver mis hábitos",
    to: "/autocuidado",
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
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
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

              {/* NUEVA TARJETA DE ESTADO / RACHA DIARIA (Reemplaza al logout) */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-xs max-w-xs">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 text-2xl">
                  🔥
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">3</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">días seguidos</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ¡Vas por excelente camino!
                  </p>
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/30 hover:shadow-md"
                >
                  {/* Resplandor decorativo sutil */}
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10 pointer-events-none" />

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
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 dark:hover:bg-primary hover:bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all group-hover:shadow-lg group-hover:shadow-primary/10"
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

          {/* RECORDATORIO DIARIO */}
          <Section>
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 max-w-4xl shadow-sm flex flex-col sm:flex-row items-start gap-4">
              <span className="text-3xl p-2 bg-primary/10 rounded-xl" role="img" aria-label="Idea">
                💡
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Recordatorio para hoy
                </h4>
                <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                  La salud mental no consiste en estar bien todo el tiempo, sino en aprender a acoger cada emoción con amabilidad. No tienes que resolverlo todo hoy, dar un pequeño paso ya es un gran avance.
                </p>
              </div>
            </div>
          </Section>

        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}