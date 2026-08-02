import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import ArticleModal from "../components/ArticleModal";
import ArticleFormModal from "../components/ArticleFormModal";
import PageTransition from "../components/PageTransition";
import { getArticles, deleteArticle } from "../services/articlesServices";

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

// Decodificador seguro de JWT
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function Articulos() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleType | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 1. Obtener el token e identificar al usuario
  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("access_token");

    setToken(storedToken);

    if (storedToken) {
      const decoded = parseJwt(storedToken);
      const roleInToken = String(decoded?.role || "");
      const isAdminRole = roleInToken === "2" || roleInToken.toLowerCase() === "admin" || Boolean(decoded?.is_admin);

      setUserRole(isAdminRole ? "admin" : "user");
      setCurrentUserId(decoded?.sub || decoded?.id || null);
    }
  }, []);

  // 2. Cargar los artículos usando el servicio externo
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

  const isAuthenticated = Boolean(token);
  const isAdmin = userRole === "admin";

  const canManageArticle = (article: ArticleType): boolean => {
    if (!token) return false;
    if (isAdmin) return true;
    if (currentUserId && String(article.author_id) === String(currentUserId)) return true;
    return false;
  };

  // 3. Manejadores
  const handleOpenCreate = () => {
    setArticleToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, article: ArticleType) => {
    e.stopPropagation();
    setArticleToEdit(article);
    setIsFormOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) return;

    try {
      if (!token) throw new Error("No hay un token de autenticación válido.");
      await deleteArticle(articleId, token);
      fetchArticles();
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
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

                {isAuthenticated && (
                  <button
                    onClick={handleOpenCreate}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>+ Crear Artículo</span>
                  </button>
                )}
              </div>
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
                            onClick={(e) => handleOpenEdit(e, featuredArticle)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, featuredArticle.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                          >
                            Eliminar
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
                                onClick={(e) => handleOpenEdit(e, article)}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, article.id)}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                              >
                                Eliminar
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