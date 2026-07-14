import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Section from "../components/Section";
import Warning from "../components/Warning";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getDisorders } from "../services/disorders";

interface Disorder {
  id: string | number;
  title: string;
  description: string;
  slug: string;
  category?: string;
}

function Trastornos() {
  const [disorders, setDisorders] = useState<Disorder[]>([]);
  const [loadingDisorders, setLoadingDisorders] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  useEffect(() => {
    getDisorders()
      .then((data) => {
        setDisorders(data as Disorder[]);
      })
      .catch((err) => {
        console.error("Error cargando trastornos:", err);
      })
      .finally(() => setLoadingDisorders(false));
  }, []);

  const categories = ["todos", "ansiedad", "animo", "conducta", "otros"];

  const filteredDisorders = useMemo(() => {
    return disorders.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "todos" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [disorders, searchQuery, selectedCategory]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-16">
          {/* INTRO HERO */}
          <Section>
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-semibold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                Información y Conciencia
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Trastornos de salud mental
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                Condiciones que afectan la forma en que pensamos, sentimos o nos relacionamos.
                Comprenderlos es el primer paso para derribar estigmas.
              </p>
            </div>
          </Section>

          {/* CONTROL BAR (Buscador y Filtros Premium) */}
          <section className="bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar trastorno... (ej. Ansiedad)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-neutral-900 dark:text-white"
                />
                <span className="absolute right-3 top-3 text-gray-400">🔍</span>
              </div>

              {/* Filtros rápidos */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium capitalize transition-all duration-200 ${
                      selectedCategory === cat
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                        : "bg-gray-100 dark:bg-neutral-800/40 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECCIÓN LISTADO CON GRID OPTIMIZADO */}
          <Section title="Explorar Trastornos">
            {loadingDisorders ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-44 rounded-2xl bg-gray-200/50 dark:bg-neutral-850 animate-pulse border border-gray-100 dark:border-neutral-800/20"
                  />
                ))}
              </div>
            ) : filteredDisorders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-gray-400 dark:text-neutral-500 text-sm">
                  No se encontraron trastornos que coincidan con tu búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full items-stretch">
                {filteredDisorders.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between p-6 bg-white dark:bg-neutral-900/40 border border-gray-100 dark:border-neutral-800/60 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 hover:-translate-y-0.5"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 font-light line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50 dark:border-neutral-800/40 flex justify-between items-center">
                      <Link
                        to={`/trastornos/${item.slug}`}
                        className="text-xs font-semibold text-neutral-900 dark:text-neutral-300 group-hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Leer más
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* SEÑALES DE ALERTA */}
          <Section title="Señales de alerta">
            <div className="max-w-3xl bg-neutral-100/40 dark:bg-neutral-900/20 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-6 sm:p-8 space-y-6">
              <ul className="grid gap-3 sm:grid-cols-1">
                {[
                  "Cambios persistentes y abruptos en el estado de ánimo",
                  "Dificultad prolongada para dormir o tendencia a dormir en exceso",
                  "Aislamiento de tus seres queridos o pérdida de interés en tus pasatiempos",
                  "Problemas notables de concentración, atención o memoria",
                  "Sensación constante de angustia, fatiga mental o desesperanza"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-neutral-300 font-light">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-neutral-500 font-light italic leading-relaxed">
                * Si estas señales se mantienen constantes a lo largo del tiempo o interfieren de manera negativa con las actividades de tu vida diaria, es sumamente recomendable buscar una orientación profesional.
              </p>
            </div>
          </Section>

          {/* MENSAJE FINAL */}
          <Section>
            <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 max-w-3xl shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Un mensaje importante
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Tener un trastorno de salud mental no define la identidad ni el valor de una persona. Con el
                acompañamiento adecuado, la gran mayoría logra equilibrar su bienestar emocional.
              </p>

              <div className="flex gap-4 flex-wrap pt-2">
                <Link
                  to="/autocuidado"
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                >
                  Explorar autocuidado
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
                <span className="text-gray-300 dark:text-neutral-800">|</span>
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