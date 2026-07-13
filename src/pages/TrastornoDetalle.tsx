import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getDisorderBySlug } from "../services/disorders";

// 1. Definimos las interfaces para un tipado estricto
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

  // Pantalla de Carga integrada en la estructura visual de la app
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
          <Header />
          <main className="flex-grow flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                Cargando información...
              </p>
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
          <Header />
          <main className="flex-grow">
            <Section title="Trastorno no encontrado">
              <div className="max-w-3xl space-y-6">
                <p className="text-base text-gray-600 dark:text-gray-400 font-light">
                  Lo sentimos, la condición o trastorno de salud mental que estás buscando no se encuentra disponible o no existe en nuestros registros actuales.
                </p>
                <div className="pt-2">
                  <Link
                    to="/trastornos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 shadow-sm transition-all text-sm"
                  >
                    <span>←</span> Volver al listado de trastornos
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

  // Renderizado del Detalle del Trastorno
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          
          {/* INTRO Y DESCRIPCIÓN */}
          <Section title={disorder.title}>
            <p className="max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed">
              {disorder.description}
            </p>
          </Section>

          {/* SÍNTOMAS FRECUENTES */}
          <Section title="Síntomas frecuentes">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-light">
                Aunque varían de persona a persona en intensidad y frecuencia, estos suelen ser los indicadores más comunes:
              </p>
              
              <ul className="space-y-3.5 pl-2">
                {disorder.symptoms.map((symptom) => (
                  <li 
                    key={symptom.id} 
                    className="flex items-start gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-light"
                  >
                    <span className="text-primary font-bold mt-1 text-xs">•</span>
                    <span>{symptom.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* MENSAJE DE PREVENCIÓN / DESCARGO DE RESPONSABILIDAD */}
          <Section>
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 max-w-3xl shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-amber-500 dark:text-amber-400">⚠️</span>
                Un recordatorio importante
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                La presencia de uno o varios de estos síntomas no constituye ni reemplaza un diagnóstico médico. Cada proceso es único, y únicamente un especialista cualificado en salud mental puede realizar una evaluación diagnóstica certera y segura.
              </p>

              <div className="flex gap-4 flex-wrap pt-3">
                <Link
                  to="/autocuidado"
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                >
                  Explorar autocuidado
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
                <span className="text-gray-300 dark:text-slate-800">|</span>
                <Link
                  to="/ayuda"
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                >
                  Buscar ayuda profesional
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
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

export default TrastornoDetalle;