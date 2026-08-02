import { useState, useEffect } from "react";
import { ArticleType } from "../pages/Articulos"; // O desde tu archivo de tipos compartido
import { createArticle, updateArticle } from "../services/articlesServices";

interface ArticleFormModalProps {
    isOpen: boolean;
    articleToEdit: ArticleType | null;
    onClose: () => void;
    onSuccess: () => void;
    token: string;
}

export default function ArticleFormModal({
    isOpen,
    articleToEdit,
    onClose,
    onSuccess,
    token,
}: ArticleFormModalProps) {
    const isEdit = Boolean(articleToEdit);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        excerpt: "",
        description: "",
        content: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (articleToEdit) {
            setFormData({
                title: articleToEdit.title,
                slug: articleToEdit.slug,
                category: articleToEdit.category,
                excerpt: articleToEdit.excerpt,
                description: articleToEdit.description,
                content: articleToEdit.content,
            });
        } else {
            setFormData({
                title: "",
                slug: "",
                category: "",
                excerpt: "",
                description: "",
                content: "",
            });
        }
    }, [articleToEdit, isOpen]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const generatedSlug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setFormData((prev) => ({
            ...prev,
            title,
            slug: articleToEdit ? prev.slug : generatedSlug,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit && articleToEdit) {
                await updateArticle(articleToEdit.id, formData, token);
            } else {
                await createArticle(formData, token);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            // Axios guarda la respuesta de error del backend en err.response?.data
            const errorMsg =
                err.response?.data?.detail || err.message || "Error al procesar la solicitud";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-xl border border-neutral-200 dark:border-neutral-800 my-8">
                <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                    {articleToEdit ? "Editar Artículo" : "Crear Nuevo Artículo"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                            Título
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                                Slug
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                                Categoría
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                            Resumen (Excerpt)
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                            Descripción Breve
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-600 dark:text-neutral-400">
                            Contenido Completo
                        </label>
                        <textarea
                            rows={5}
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Publicar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}