import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import ArticleCard from "../components/ArticleCard";
import StatsCard from "../components/StatsCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

// Data estática necesaria (Stats y Recursos de autocuidado)
import {
  wellbeingResources,
  mentalHealthStats,
} from "../data/homeContent";

import { DailyReflection } from "../types/reflections";

// Servicios dinámicos para la API
import { getArticles } from "../services/articlesServices";
import { fetchDailyReflectionWithFallback } from "../services/reflectionsServices";
import { ResourceType } from "../types/resource";

export default function Home() {
  const [articles, setArticles] = useState<ResourceType[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  // Estados para la reflexión diaria dinámica usando tu interfaz
  const [dailyReflection, setDailyReflection] = useState<DailyReflection | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(true);
  const [isRefreshingReflection, setIsRefreshingReflection] = useState(false);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  // Cargar artículos y reflexión diaria desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getArticles();
        setArticles(data.slice(0, 3));
      } catch (err) {
        console.warn("No se pudieron cargar los artículos de la Home:", err);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    const loadInitialReflection = async () => {
      try {
        const result = await fetchDailyReflectionWithFallback();
        if (result.reflection) {
          setDailyReflection(result.reflection);
        }
      } catch (err) {
        console.error("Error al cargar la reflexión diaria:", err);
      } finally {
        setIsLoadingReflection(false);
      }
    };

    fetchData();
    loadInitialReflection();
  }, []);

  const handleRefreshReflection = async () => {
    if (isRefreshingReflection) return;
    setIsRefreshingReflection(true);
    setReflectionNotice(null);

    try {
      const result = await fetchDailyReflectionWithFallback({ refresh: true });
      if (result.reflection) {
        setDailyReflection(result.reflection);
      }
      if (result.notice) {
        setReflectionNotice(result.notice);
      }
    } catch (err) {
      console.warn("No se pudo actualizar la reflexión diaria:", err);
    } finally {
      setIsRefreshingReflection(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          {/* HERO SECTION */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-12 flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Orbes decorativos */}
              <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />

              <div className="max-w-2xl space-y-6 text-center lg:text-left">
                <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  Espacio de Acompañamiento
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
                  Tu bienestar emocional{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    importa
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Información clara, accesible y científica sobre salud mental, autocuidado y
                  recursos de apoyo para acompañarte en cada etapa de tu camino.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <Link
                    to="/ayuda"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 transition-all duration-200 transform active:scale-95"
                  >
                    Buscar ayuda inmediata
                  </Link>
                  <Link
                    to="/salud-mental"
                    className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/50 transition-all duration-200"
                  >
                    Explorar conceptos
                  </Link>
                </div>
              </div>

              {/* Tarjeta Visual de Reflexión Dinámica */}
              <div className="w-full max-w-md lg:w-[440px] flex-shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl opacity-10 blur-xl dark:opacity-20" />
                <div className="relative rounded-3xl border border-neutral-200/80 bg-white/85 p-6 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/85 shadow-xl space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Reflexión diaria
                      </span>
                    </div>
                    {dailyReflection?.theme && (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {dailyReflection.theme}
                      </span>
                    )}
                  </div>

                  {isLoadingReflection ? (
                    <div className="space-y-2 py-2 animate-pulse">
                      <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  ) : (
                    <>
                      <p className="text-neutral-800 dark:text-neutral-200 font-serif italic text-base sm:text-lg leading-relaxed">
                        "{dailyReflection?.phrase || "El autocuidado es el primer paso hacia el bienestar."}"
                      </p>

                      {dailyReflection?.reflectionPrompt && (
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/70 rounded-xl px-3.5 py-2.5 border border-neutral-200/50 dark:border-neutral-800">
                          {dailyReflection.reflectionPrompt}
                        </p>
                      )}

                      {dailyReflection?.author && (
                        <span className="block text-xs text-neutral-500 dark:text-neutral-400 font-medium text-right">
                          — {dailyReflection.author}
                        </span>
                      )}

                      <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
                        <Link
                          to={dailyReflection?.suggestedRoute || "/respiracion"}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                        >
                          <span>{dailyReflection?.suggestedLabel || "Practicar respiración"}</span>
                          <span aria-hidden="true">→</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleRefreshReflection}
                          disabled={isRefreshingReflection}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-60 transition-colors"
                        >
                          <svg
                            className={`h-3.5 w-3.5 ${isRefreshingReflection ? "animate-spin" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          <span>{isRefreshingReflection ? "Generando..." : "Nueva reflexión"}</span>
                        </button>
                      </div>

                      {reflectionNotice && (
                        <p role="status" className="text-[11px] text-amber-700 dark:text-amber-400">
                          {reflectionNotice}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ESTADÍSTICAS */}
          <Section>
            <div className="max-w-7xl mx-auto bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/60 rounded-3xl p-8 sm:p-10">
              <div className="mb-8 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  La salud mental en cifras
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base">
                  Comprender la magnitud global de la salud mental ayuda a normalizar el
                  cuidado emocional y mitiga el estigma social de buscar apoyo a tiempo.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mentalHealthStats.map((stat) => (
                  <StatsCard key={stat.id} {...stat} />
                ))}
              </div>
            </div>
          </Section>

          {/* AUTOCUIDADO */}
          <Section>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3 lg:sticky lg:top-28 h-fit space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Autocuidado y bienestar
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base leading-relaxed">
                  Pequeñas acciones intencionales integradas en tus rutinas cotidianas construyen la resiliencia necesaria para equilibrar tu salud mental.
                </p>
              </div>
              <div className="lg:w-2/3 grid gap-6 sm:grid-cols-2">
                {wellbeingResources.slice(0, 4).map((item) => (
                  <ResourceCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* ARTÍCULOS DESDE LA API */}
          <Section>
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                  Artículos y reflexiones
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm sm:text-base">
                  Lecturas validadas pensadas para comprender mejor tus emociones y fortalecer tu bienestar integral.
                </p>
              </div>

              {isLoadingArticles ? (
                <div className="text-center py-12 text-neutral-500 font-light">
                  Cargando publicaciones recientes...
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <Link key={article.id} to="/articulos" className="block h-full">
                      <ArticleCard
                        title={article.title}
                        description={article.excerpt || article.description}
                        date={article.published_at}
                        datetime={article.published_at}
                        category={article.category || "General"}
                        author={{ name: "Equipo Editorial", role: "Salud Mental" }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* CALL TO ACTION AYUDA */}
          <Section>
            <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 to-violet-50/40 backdrop-blur-sm p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm dark:border-neutral-800/60 dark:from-indigo-950/20 dark:to-neutral-900/40">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                No tienes que hacerlo solo
              </h3>
              <p className="mb-8 text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
                Buscar apoyo es un reflejo de autoconocimiento y valentía. Existen redes, canales profesionales y personas cualificadas listas para escucharte.
              </p>

              <Link
                to="/ayuda"
                className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150"
              >
                Buscar ayuda
              </Link>
            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}