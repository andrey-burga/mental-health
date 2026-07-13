import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Section from "../components/Section";
import Warning from "../components/Warning";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getDisorders } from "../services/disorders";

// 1. Tipamos la estructura de los trastornos obtenidos de la API
interface Disorder {
  id: string | number;
  title: string;
  description: string;
  slug: string;
}

function Trastornos() {
  const [disorders, setDisorders] = useState<Disorder[]>([]);
  const [loadingDisorders, setLoadingDisorders] = useState<boolean>(true);

  useEffect(() => {
    getDisorders()
      .then((data) => {
        // Aseguramos que tipamos correctamente los datos que entran
        setDisorders(data as Disorder[]);
      })
      .catch((err) => {
        console.error("Error cargando trastornos:", err);
      })
      .finally(() => setLoadingDisorders(false));
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          
          {/* INTRO */}
          <Section title="Trastornos de salud mental">
            <p className="max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Los trastornos de salud mental son condiciones que afectan la forma
              en que una persona piensa, siente, se comporta o se relaciona con
              los demás. Son más comunes de lo que suele creerse y pueden afectar
              a personas de todas las edades.
            </p>
          </Section>

          {/* LISTADO */}
          <Section title="Trastornos más comunes">
            <p className="mb-6 max-w-3xl text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light">
              Conocer estos trastornos no significa diagnosticarse de forma autónoma, sino reconocer
              señales que pueden indicar la necesidad de un acompañamiento profesional calificado.
            </p>

            <div className="flex flex-wrap gap-4">
              {loadingDisorders ? (
                // Skeleton de carga moderno
                <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n} 
                      className="h-32 rounded-xl bg-gray-200/60 dark:bg-slate-800/60 animate-pulse border border-gray-100 dark:border-slate-800/40"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                  {disorders.map((item) => (
                    <Warning
                      key={item.id}
                      title={item.title}
                      text={item.description}
                      slug={item.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* SEÑALES DE ALERTA */}
          <Section title="Señales de alerta">
            <div className="max-w-3xl space-y-4">
              <ul className="space-y-3 pl-2">
                {[
                  "Cambios persistentes y abruptos en el estado de ánimo",
                  "Dificultad prolongada para dormir o tendencia a dormir en exceso",
                  "Aislamiento de tus seres queridos o pérdida de interés en tus pasatiempos",
                  "Problemas notables de concentración, atención o memoria",
                  "Sensación constante de angustia, fatiga mental o desesperanza"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-light">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Si estas señales se mantienen constantes a lo largo del tiempo o interfieren de manera negativa con las actividades de tu vida diaria, es sumamente recomendable buscar una orientación profesional.
              </p>
            </div>
          </Section>

          {/* MENSAJE FINAL */}
          <Section>
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 max-w-3xl shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Un mensaje importante
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Tener un trastorno de salud mental no define la identidad ni el valor de una persona. Con el 
                acompañamiento adecuado y profesional, la gran mayoría de personas logran equilibrar su bienestar emocional y disfrutar de una excelente calidad de vida.
              </p>

              <div className="flex gap-4 flex-wrap pt-2">
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

export default Trastornos;