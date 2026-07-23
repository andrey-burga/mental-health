import { useState, useEffect } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticleModal from "../components/ArticleModal";
import PageTransition from "../components/PageTransition";
import TestimonialFormModal from "../components/TestimonialFormModal";
import { testimonialService, TestimonialInput } from "../services/testimonialService";
import { useAuth } from "../context/AuthContext";
import { canManageTestimonial } from "../utils/permissions";

// --- TIPOS E INTERFACES ---
interface RoleType {
  id?: string;
  name?: string;
}

interface AuthorType {
  id?: string;
  name?: string;
  role?: RoleType | string;
}

interface TestimonialType {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author?: AuthorType | string;
  created_at: string;
  category?: string;
}

// --- HELPER FUNCTIONS ---
const getAuthorName = (author: TestimonialType["author"]): string => {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && author.name) return author.name;
  return "Anónimo";
};

const getAuthorRole = (author: TestimonialType["author"]): string => {
  if (author && typeof author === "object" && author.role) {
    if (typeof author.role === "object" && author.role.name) return author.role.name;
    if (typeof author.role === "string") return author.role;
  }
  return "Paciente";
};

// Patrón de distribución para el Bento Grid
const getSizeClasses = (idx: number) => {
  const patterns = [
    "md:col-span-2 md:row-span-2", // Destacado grande
    "md:col-span-1 md:row-span-2", // Vertical alto
    "md:col-span-1 md:row-span-1", // Cuadrado normal
    "md:col-span-2 md:row-span-1", // Ancho horizontal
    "md:col-span-1 md:row-span-1", // Cuadrado normal
    "md:col-span-1 md:row-span-2", // Vertical alto
  ];
  return patterns[idx % patterns.length];
};

// --- COMPONENTE PRINCIPAL ---
function Testimonial() {
  const { user, isAuthenticated } = useAuth();

  // Estados de datos y paginación
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para Modales
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialType | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialType | null>(null);

  // Cargar testimonios desde la API
  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const data = await testimonialService.getAll();
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al cargar los testimonios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Handlers CRUD
  const handleCreateOrUpdate = async (formData: TestimonialInput) => {
    if (editingItem) {
      const updated = await testimonialService.update(editingItem.id, formData);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === editingItem.id ? updated : t))
      );
    } else {
      const created = await testimonialService.create(formData);
      setTestimonials((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evita abrir el modal de lectura al hacer clic en eliminar
    if (!confirm("¿Estás seguro de que deseas eliminar este testimonio?")) return;

    try {
      await testimonialService.delete(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el testimonio");
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, item: TestimonialType) => {
    e.stopPropagation(); // Evita abrir el modal de lectura al hacer clic en editar
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          {/* SECCIÓN INTRODUCTORIA */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <span className="inline-block bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Voces compartidas
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-4">
                  Historias de{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    valentía
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  Experiencias reales y anónimas que reflejan procesos profundos de crecimiento, sanación y el camino hacia el bienestar emocional.
                </p>
              </div>

              {/* Botón de publicación condicionado a estar autenticado */}
              {isAuthenticated && (
                <div>
                  <button
                    onClick={handleOpenCreate}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    + Publicar historia
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* GRID BENTO DE TESTIMONIOS */}
          <Section>
            <div className="max-w-7xl mx-auto">
              {isLoading && (
                <div className="text-center py-20 text-neutral-500 font-light">
                  Cargando testimonios...
                </div>
              )}

              {error && (
                <div className="text-center py-20 text-red-500 font-medium">
                  {error}
                </div>
              )}

              {!isLoading && !error && (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[240px] md:auto-rows-[280px] grid-flow-dense">
                  {testimonials.slice(0, visibleCount).map((testimonial, idx) => {
                    const sizeClasses = getSizeClasses(idx);
                    const currentPatternIdx = idx % 6;

                    const isProtagonist = currentPatternIdx === 0;
                    const isVertical = currentPatternIdx === 1 || currentPatternIdx === 5;
                    const isHorizontal = currentPatternIdx === 3;

                    const formattedDate = new Date(testimonial.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    const authorName = getAuthorName(testimonial.author);
                    const authorRole = getAuthorRole(testimonial.author);

                    // Permiso estricto: Solo Admin o el propio Autor
                    const canEditOrDelete = canManageTestimonial(user, testimonial.author);

                    return (
                      <div
                        key={testimonial.id}
                        onClick={() => setSelectedTestimonial(testimonial)}
                        className={`${sizeClasses} rounded-3xl border border-neutral-200/60 bg-white/70 p-6 sm:p-8 dark:border-neutral-800/60 dark:bg-neutral-900/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative`}
                      >
                        <div className="relative h-full flex flex-col justify-between z-10">
                          <div className="flex flex-col justify-center flex-grow">
                            <span className="absolute -top-4 -left-2 text-6xl text-indigo-600/10 dark:text-indigo-400/10 font-serif pointer-events-none select-none">
                              “
                            </span>

                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md">
                                {testimonial.category || "Testimonio"}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-light mr-1">
                                  {formattedDate}
                                </span>

                                {/* Botones de Edición / Borrado (Protegidos) */}
                                {canEditOrDelete && (
                                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg">
                                    <button
                                      onClick={(e) => handleOpenEdit(e, testimonial)}
                                      className="p-1 text-xs text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                      title="Editar"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => handleDelete(e, testimonial.id)}
                                      className="p-1 text-xs text-neutral-500 hover:text-red-500 transition-colors"
                                      title="Eliminar"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h3 className={`font-bold text-neutral-900 dark:text-white tracking-tight leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isProtagonist ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>
                              {testimonial.title}
                            </h3>

                            <p className={`text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-4 
                              ${isProtagonist ? "text-sm sm:text-base line-clamp-6 md:line-clamp-10" : ""}
                              ${isVertical ? "text-sm line-clamp-8 md:line-clamp-11" : ""}
                              ${isHorizontal ? "text-sm line-clamp-3 md:line-clamp-4" : ""}
                              ${!isProtagonist && !isVertical && !isHorizontal ? "text-sm line-clamp-3 md:line-clamp-4" : ""}
                            `}>
                              {testimonial.excerpt}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center gap-3 backdrop-blur-sm mt-auto">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-100 dark:border-neutral-800 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {authorName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{authorName}</h4>
                              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-light uppercase">{authorRole}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BOTÓN CARGAR MÁS */}
              {!isLoading && visibleCount < testimonials.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all"
                  >
                    Ver más historias
                  </button>
                </div>
              )}
            </div>
          </Section>
        </main>

        {/* MODAL 1: LECTURA DETALLADA (ArticleModal) */}
        {selectedTestimonial && (
          <ArticleModal
            article={{
              ...selectedTestimonial,
              category: selectedTestimonial.category || "Testimonio",
              author: getAuthorName(selectedTestimonial.author),
            } as any}
            onClose={() => setSelectedTestimonial(null)}
          />
        )}

        {/* MODAL 2: CREACIÓN Y EDICIÓN (TestimonialFormModal) */}
        <TestimonialFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          initialData={
            editingItem
              ? {
                  title: editingItem.title,
                  slug: editingItem.slug,
                  excerpt: editingItem.excerpt,
                  content: editingItem.content,
                }
              : null
          }
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
export default Testimonial;