import { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticleModal from "../components/ArticleModal";
import PageTransition from "../components/PageTransition";

import { testimonials } from "../data/homeContent";

interface TestimonialType {
  id: string | number;
  title: string;
  description: string;
  content?: string;
  author?: {
    name: string;
    role: string;
  };
  date?: string;
  image?: string;
  category: string;
}

// Estructura limpia de patrones
const getSizeClasses = (idx: number) => {
  const patterns = [
    "md:col-span-2 md:row-span-2", // protagonista (0)
    "md:col-span-1 md:row-span-2", // vertical (1)
    "md:col-span-1 md:row-span-1", // normal (2)
    "md:col-span-2 md:row-span-1", // horizontal (3)
    "md:col-span-1 md:row-span-1", // normal (4)
    "md:col-span-1 md:row-span-2", // vertical (5)
  ];
  return patterns[idx % patterns.length];
};

function Testimonial() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialType | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow">

          {/* INTRODUCCIÓN CON ORBES EMOCIONALES */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              <div className="absolute top-10 left-1/4 -z-10 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />
              <div className="absolute top-20 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />

              <div className="max-w-3xl">
                <span className="inline-block bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Voces compartidas
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                  Historias de{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    valentía
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  Experiencias reales y anónimas que reflejan procesos profundos de crecimiento, sanación y el camino hacia el bienestar emocional.
                </p>
              </div>
            </div>
          </Section>

          {/* GRID ASIMÉTRICO EDITORIAL (Bento Style) */}
          <Section>
            <div className="max-w-7xl mx-auto">

              {/* CORRECCIÓN: Clases separadas correctamente con espacios */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[240px] md:auto-rows-[280px] grid-flow-dense">
                {testimonials.slice(0, visibleCount).map((testimonial, idx) => {
                  const sizeClasses = getSizeClasses(idx);
                  const currentPatternIdx = idx % 6;

                  // Ajustes dinámicos del contenido basados en la forma real de la tarjeta
                  const isProtagonist = currentPatternIdx === 0;
                  const isVertical = currentPatternIdx === 1 || currentPatternIdx === 5;
                  const isHorizontal = currentPatternIdx === 3;

                  return (
                    <div
                      key={testimonial.id}
                      onClick={() => setSelectedTestimonial(testimonial)}
                      className={`${sizeClasses} rounded-3xl border border-slate-200/60 bg-white/70 p-6 sm:p-8 dark:border-slate-800/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative`}
                    >
                      <div className="relative h-full flex flex-col justify-between z-10">
                        <div className="flex flex-col justify-center flex-grow">
                          {/* Comillas decorativas de fondo */}
                          <span className="absolute -top-4 -left-2 text-6xl text-indigo-600/10 dark:text-indigo-400/10 font-serif pointer-events-none select-none">
                            “
                          </span>

                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md">
                              {testimonial.category}
                            </span>
                            {testimonial.date && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-light">
                                {testimonial.date}
                              </span>
                            )}
                          </div>

                          {/* Ajuste de fuentes: Título más grande para la tarjeta protagonista */}
                          <h3 className={`font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isProtagonist ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>
                            {testimonial.title}
                          </h3>

                          {/* Ajuste inteligente de corte de texto por tipo de caja */}
                          <p className={`text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-4 
                            ${isProtagonist ? "text-sm sm:text-base line-clamp-6 md:line-clamp-10" : ""}
                            ${isVertical ? "text-sm line-clamp-8 md:line-clamp-11" : ""}
                            ${isHorizontal ? "text-sm line-clamp-3 md:line-clamp-4" : ""}
                            ${!isProtagonist && !isVertical && !isHorizontal ? "text-sm line-clamp-3 md:line-clamp-4" : ""}
                          `}>
                            {testimonial.description}
                          </p>
                        </div>

                        {/* Meta Info del Autor */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3 bg-white/10 dark:bg-transparent backdrop-blur-sm mt-auto">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 dark:from-indigo-500/10 dark:to-violet-500/10 border border-indigo-100 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {testimonial.author?.name ? testimonial.author.name.charAt(0) : "A"}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {testimonial.author?.name || "Anónimo"}
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-light">
                              {testimonial.author?.role || "Testimonio Verificado"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Decoración sutil en esquinas vacías para las cajas grandes */}
                      {isProtagonist && (
                        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/5 to-violet-500/5 blur-2xl pointer-events-none -z-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón "Ver más" Estilizado e Interactivo */}
              {visibleCount < testimonials.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 active:scale-98 transition-all duration-150"
                  >
                    Ver más historias
                  </button>
                </div>
              )}
            </div>
          </Section>
        </main>

        {/* MODAL DETALLADO */}
        {selectedTestimonial && (
          <ArticleModal
            article={selectedTestimonial}
            onClose={() => setSelectedTestimonial(null)}
          />
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Testimonial;