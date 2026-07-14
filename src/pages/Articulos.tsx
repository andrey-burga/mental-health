import { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import ArticleModal from "../components/ArticleModal";
import PageTransition from "../components/PageTransition";

import { articles } from "../data/homeContent";

interface ArticleType {
  id: string | number;
  title: string;
  excerpt: string;
  category: string;
  content?: string;
}

function Articulos() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);

  // Separamos el primer artículo para darle el rol de "Destacado"
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <PageTransition>
      {/* 1. Cambiado bg-slate-50/30 a bg-neutral-50/30 y text-slate-800 a text-neutral-800 */}
      <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow">
          
          {/* INTRODUCCIÓN CON ORBES DE LUZ */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              {/* Glow effects premium de fondo */}
              <div className="absolute top-12 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              <div className="absolute top-24 right-1/4 -z-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />

              <div className="max-w-3xl">
                <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Espacio de lectura
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-4">
                  Artículos y{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    reflexiones
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Lecturas pensadas para reflexionar con calma, comprender los procesos de la mente y fortalecer el bienestar emotional.
                </p>
              </div>
            </div>
          </Section>

          {/* SECCIÓN EDITORIAL: ARTÍCULO DESTACADO (Layout Asimétrico) */}
          {featuredArticle && (
            <Section>
              <div className="max-w-7xl mx-auto">
                {/* 2. Cambiado bordes y fondos oscuros a neutral */}
                <div 
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="group relative rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/20 to-violet-50/20 dark:border-neutral-800/60 dark:from-indigo-950/10 dark:to-neutral-900/10 p-8 sm:p-12 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
                >
                  <div className="space-y-4 lg:max-w-2xl">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Destacado • {featuredArticle.category}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>
                  
                  {/* 3. Cambiado el botón interno de bg-slate-900 y border-slate-200 a neutral */}
                  <div className="flex-shrink-0 w-full lg:w-auto">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-250 w-full lg:w-auto justify-center">
                      Comenzar lectura →
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* CUADRÍCULA DE LECTURAS RESTANTES */}
          <Section>
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Más publicaciones recientes
                </h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                {remainingArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className="transform transition-all duration-300 hover:-translate-y-1"
                  >
                    <ArticlePreview
                      {...article}
                      onClick={() => setSelectedArticle(article)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </main>

        {/* MODAL DETALLADO DE LECTURA */}
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Articulos;