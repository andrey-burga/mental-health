import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getDisorderBySlug } from "../services/disorders";

interface Symptom {
  id: string | number;
  text: string;
}

interface DisorderDetail {
  id: string | number;
  title: string;
  description: string;
  slug: string;
  symptoms: Symptom[];
}

function TrastornoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const [disorder, setDisorder] = useState<DisorderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;

    getDisorderBySlug(slug)
      .then((data) => {
        if (data) {
          setDisorder(data as DisorderDetail);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.error("Error al cargar el detalle del trastorno:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Pantalla de carga con un Esqueleto Estructural Moderno (Evita saltos visuales)
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-neutral-950">
          <Header />
          <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8 animate-pulse">
            <div className="h-6 w-32 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
            <div className="space-y-3">
              <div className="h-10 w-2/3 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-800 rounded-md" />
            </div>
            <div className="pt-6 space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 4].map((n) => (
                  <div key={n} className="h-16 bg-gray-200/60 dark:bg-neutral-800/60 rounded-xl" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Pantalla de Error o Trastorno No Encontrado
  if (error || !disorder) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-neutral-950">
          <Header />
          <main className="flex-grow flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 p-8 rounded-3xl shadow-sm">
              <span className="text-4xl">🔍</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Trastorno no encontrado
              </h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                Lo sentimos, la condición o trastorno de salud mental que estás buscando no se encuentra disponible o no existe en nuestros registros actuales.
              </p>
              <div className="pt-2">
                <Link
                  to="/trastornos"
                  className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white font-semibold text-sm transition-all"
                >
                  ← Volver al listado
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        {/* CONTENEDOR PRINCIPAL */}
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
          
          {/* BOTÓN VOLVER (Volver atrás sutil y flotante) */}
          <div className="pt-2">
            <Link
              to="/trastornos"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-primary transition-colors group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              Volver a trastornos
            </Link>
          </div>

          {/* CABECERA EDITORIAL */}
          <section className="space-y-4">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              Información Especializada
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
              {disorder.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-300 font-light leading-relaxed max-w-3xl pt-2">
              {disorder.description}
            </p>
          </section>

          <hr className="border-neutral-200/60 dark:border-neutral-800/60" />

          {/* SÍNTOMAS FRECUENTES COMO TARJETAS GRID */}
          <Section title="Síntomas frecuentes">
            <div className="space-y-6">
              <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400 font-light max-w-3xl">
                Aunque varían en intensidad y frecuencia según cada persona, estos suelen ser los indicadores clínicos y emocionales más comunes:
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {disorder.symptoms.map((symptom, index) => (
                  <div 
                    key={symptom.id}
                    className="flex items-start gap-4 p-5 bg-white dark:bg-neutral-900/40 border border-gray-100 dark:border-neutral-800/60 rounded-2xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-200"
                  >
                    {/* Indicador numérico estilizado */}
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-neutral-300 font-light leading-snug">
                      {symptom.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* TARJETA DE ADVERTENCIA Y PREVENCIÓN (Aspecto Premium) */}
          <section className="pt-4">
            <div className="rounded-2xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 p-6 sm:p-8 space-y-4 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 tracking-tight flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Un recordatorio sumamente importante
              </h3>
              <p className="text-sm text-amber-900/80 dark:text-neutral-300 font-light leading-relaxed">
                La presencia de uno o varios de estos síntomas no constituye ni reemplaza de ninguna manera un diagnóstico médico oficial. Cada proceso psicológico es único, y únicamente un profesional clínico calificado puede emitir una evaluación diagnóstica certera y segura.
              </p>

              <div className="flex gap-4 flex-wrap pt-2 border-t border-amber-200/30 dark:border-amber-900/20">
                <Link
                  to="/autocuidado"
                  className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 hover:opacity-80 transition-opacity flex items-center gap-1 group"
                >
                  Explorar autocuidado
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
                <span className="text-amber-300/60 dark:text-amber-900/50">|</span>
                <Link
                  to="/ayuda"
                  className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 hover:opacity-80 transition-opacity flex items-center gap-1 group"
                >
                  Buscar ayuda profesional
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default TrastornoDetalle;