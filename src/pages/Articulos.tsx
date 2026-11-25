import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import ArticleModal from "../components/ArticleModal";
import ArticleFormModal from "../components/ArticleFormModal";
import PageTransition from "../components/PageTransition";
import { getArticles, deleteArticle } from "../services/articlesServices";
import { useAuth } from "../context/AuthContext";
import { canManageArticle as canUserManageArticle, isEditorialUser } from "../utils/permissions";

export interface ArticleType {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  category: string;
  published_at: string;
  author_id?: string | null;
}

function Articulos() {
  const { user, token, isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleType | null>(null);
  const [articlePendingDelete, setArticlePendingDelete] = useState<ArticleType | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cargar los artículos usando el servicio externo
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArticles();
      setArticles(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const canManageArticle = (article: ArticleType): boolean => {
    if (!isAuthenticated || !user) return false;
    return canUserManageArticle(user, article.author_id);
  };

  // Manejadores
  const handleOpenCreate = () => {
    setActionError(null);
    setArticleToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, article: ArticleType) => {
    e.stopPropagation();
    setActionError(null);
    setArticleToEdit(article);
    setIsFormOpen(true);
  };

  const handleRequestDelete = (e: React.MouseEvent, article: ArticleType) => {
    e.stopPropagation();
    setActionError(null);
    setArticlePendingDelete(article);
  };

  const handleConfirmDelete = async () => {
    if (!articlePendingDelete) return;
    setDeleting(true);
    setActionError(null);

    try {
      if (!token) throw new Error("No hay una sesión de autenticación válida.");
      await deleteArticle(articlePendingDelete.id, token);
      setArticlePendingDelete(null);
      await fetchArticles();
    } catch (err: any) {
      setActionError(err.message || "Error al eliminar el artículo.");
      setArticlePendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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
                </div>

                {isAuthenticated && isEditorialUser(user) && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>+ Crear Artículo</span>
                  </button>
                )}
              </div>

              {actionError && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-3"
                >
                  <span>{actionError}</span>
                  <button
                    type="button"
                    onClick={() => setActionError(null)}
                    className="text-xs font-semibold underline shrink-0"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {articlePendingDelete && (
                <div
                  role="alertdialog"
                  aria-labelledby="article-delete-confirm-title"
                  className="mt-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <p
                    id="article-delete-confirm-title"
                    className="text-sm text-rose-900 dark:text-rose-200"
                  >
                    ¿Confirmas que deseas eliminar el artículo{" "}
                    <strong>"{articlePendingDelete.title}"</strong>? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => setArticlePendingDelete(null)}
                      className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleConfirmDelete}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {deleting ? "Eliminando..." : "Sí, eliminar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {loading && (
            <Section>
              <div className="max-w-7xl mx-auto text-center py-12 text-neutral-500">
                Cargando publicaciones...
              </div>
            </Section>
          )}

          {error && (
            <Section>
              <div className="max-w-7xl mx-auto text-center py-12 text-red-500">
                {error}
              </div>
            </Section>
          )}

          {!loading && !error && (
            <>
              {featuredArticle && (
                <Section>
                  <div className="max-w-7xl mx-auto">
                    <div className="group relative rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/20 to-violet-50/20 dark:border-neutral-800/60 dark:from-indigo-950/10 dark:to-neutral-900/10 p-8 sm:p-12 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                      {canManageArticle(featuredArticle) && (
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, featuredArticle)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRequestDelete(e, featuredArticle)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}

                      <div
                        onClick={() => setSelectedArticle(featuredArticle)}
                        className="cursor-pointer flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
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
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {remainingArticles.length > 0 && (
                <Section>
                  <div className="max-w-7xl mx-auto">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                      {remainingArticles.map((article) => (
                        <div key={article.id} className="relative group transform transition-all duration-300 hover:-translate-y-1">
                          {canManageArticle(article) && (
                            <div className="absolute top-4 right-4 z-10 flex gap-1.5 opacity-90 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEdit(e, article)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleRequestDelete(e, article)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                          <ArticlePreview {...article} onClick={() => setSelectedArticle(article)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              )}
            </>
          )}
        </main>

        <ArticleFormModal
          isOpen={isFormOpen}
          articleToEdit={articleToEdit}
          token={token || ""}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchArticles}
        />

        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Articulos;