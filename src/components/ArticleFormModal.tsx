import { useState, useEffect } from "react";

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

interface ArticleFormModalProps {
    isOpen: boolean;
    articleToEdit: ArticleType | null;
    onClose: () => void;
    onSuccess: () => void;
    token: string; // Token de autenticación
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

    // Cargar datos en el formulario si se pasa un artículo a editar
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
            // Limpiar datos si es creación
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

    // Generador automático de slug básico al escribir el título
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
            slug: articleToEdit ? prev.slug : generatedSlug, // Solo autogenera si es nuevo
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isEdit
            ? `http://localhost:8000/api/articles/${articleToEdit?.id}`
            : "http://localhost:8000/api/articles";
        const method = isEdit ? "PATCH" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Pasa tu Bearer token
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Error al procesar la solicitud");
            }

            onSuccess(); // Recarga la lista o ejecuta callback
            onClose();   // Cierra el modal
        } catch (err: any) {
            setError(err.message);
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