import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import ArticleFormModal from "../components/ArticleFormModal";
import { NormalizedRole, normalizeRole, useAuth } from "../context/AuthContext";
import { isMockBackendMode } from "../services/axios";
import {
  testimonialService,
  Testimonial,
  TestimonialStatus,
} from "../services/testimonialService";
import {
  addDisorderSymptom,
  createDisorder,
  deleteDisorder,
  getDisorders,
} from "../services/disorders";
import { getArticles } from "../services/articlesServices";
import { ManagedUser, searchUsers, updateUserRole } from "../services/usersService";
import { Disorder } from "../types/disorder";
import { ArticleType } from "./Articulos";
import {
  getRoleDisplayLabel,
  getUserRole,
  isAdminUser,
  isEditorialUser,
} from "../utils/permissions";

type AdminTab = "testimonials" | "disorders" | "users" | "publications";
type TestimonialFilter = TestimonialStatus | "all";

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getApiErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const msgs = detail
      .map((item) => (typeof item?.msg === "string" ? item.msg : null))
      .filter(Boolean);
    if (msgs.length > 0) return msgs.join(" ");
  }
  const msg = err?.response?.data?.message || err?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  return fallback;
}

function formatAuthorName(author: Testimonial["author"]): string {
  if (!author) return "Comunidad";
  if (typeof author === "string") return author;
  return author.name || author.email || "Comunidad";
}

function formatDateLabel(raw?: string): string {
  if (!raw) return "Fecha reciente";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "Fecha reciente";
  return parsed.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusMeta(status?: TestimonialStatus) {
  if (status === "approved") {
    return {
      label: "Aprobado",
      classes:
        "border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rechazado",
      classes:
        "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300",
    };
  }
  return {
    label: "Pendiente",
    classes:
      "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
  };
}

function getRoleBadgeClasses(role: NormalizedRole): string {
  if (role === "admin") {
    return "border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300";
  }
  if (role === "editor") {
    return "border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300";
  }
  return "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
}

const EDITORIAL_RULES = [
  {
    title: "Lenguaje empático y libre de estigma",
    description:
      "Prioriza términos centrados en la persona, evita diagnósticos prescriptivos y valida las experiencias emocionales sin juicios.",
  },
  {
    title: "Rigor psicoeducativo y fuentes confiables",
    description:
      "Fundamenta guías y artículos en prácticas clínicas reconocidas (OMS, guías de salud mental basadas en evidencia) con tono claro y accesible.",
  },
  {
    title: "Cuidado de privacidad y testimonios",
    description:
      "Antes de aprobar un testimonio, verifica que no exponga datos personales sensibles de terceros ni promueva conductas de riesgo.",
  },
  {
    title: "Derivación visible ante señales de crisis",
    description:
      "Todo contenido sobre malestar agudo debe recordar que la plataforma complementa, pero nunca sustituye, la atención profesional o líneas de ayuda.",
  },
];

export default function AdminPanel() {
  const { user, token } = useAuth();
  const userIsAdmin = isAdminUser(user);
  const userIsEditorial = isEditorialUser(user);
  const isMockMode = isMockBackendMode();

  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    userIsAdmin ? "testimonials" : "publications"
  );

  useEffect(() => {
    if (!userIsAdmin && activeTab !== "publications") {
      setActiveTab("publications");
    }
  }, [userIsAdmin, activeTab]);

  // --- ESTADO PESTAÑA 1: MODERACIÓN DE TESTIMONIOS ---
  const [testimonialFilter, setTestimonialFilter] =
    useState<TestimonialFilter>("pending");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);
  const [testimonialsFeedback, setTestimonialsFeedback] = useState<string | null>(
    null
  );
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const loadTestimonials = useCallback(async () => {
    if (!userIsAdmin) return;
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      const data = await testimonialService.getByStatus(testimonialFilter);
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setTestimonialsError(
        getApiErrorMessage(err, "No se pudieron cargar los testimonios.")
      );
    } finally {
      setTestimonialsLoading(false);
    }
  }, [testimonialFilter, userIsAdmin]);

  useEffect(() => {
    if (activeTab === "testimonials" && userIsAdmin) {
      void loadTestimonials();
    }
  }, [activeTab, userIsAdmin, loadTestimonials]);

  const handleModerateTestimonial = async (
    item: Testimonial,
    nextStatus: "approved" | "rejected"
  ) => {
    setModeratingId(item.id);
    setTestimonialsError(null);
    setTestimonialsFeedback(null);

    try {
      const updated = await testimonialService.updateStatus(item.id, nextStatus);
      setTestimonials((prev) => {
        if (testimonialFilter === "all") {
          return prev.map((t) =>
            t.id === item.id ? { ...t, ...updated, status: nextStatus } : t
          );
        }
        if (testimonialFilter !== nextStatus) {
          return prev.filter((t) => t.id !== item.id);
        }
        return prev.map((t) =>
          t.id === item.id ? { ...t, ...updated, status: nextStatus } : t
        );
      });
      setTestimonialsFeedback(
        nextStatus === "approved"
          ? `Testimonio "${item.title}" aprobado y publicado.`
          : `Testimonio "${item.title}" marcado como rechazado.`
      );
    } catch (err: any) {
      setTestimonialsError(
        getApiErrorMessage(err, "No se pudo actualizar el estado del testimonio.")
      );
    } finally {
      setModeratingId(null);
    }
  };

  // --- ESTADO PESTAÑA 2: GUÍAS DE TRASTORNOS ---
  const [disorders, setDisorders] = useState<Disorder[]>([]);
  const [disordersLoading, setDisordersLoading] = useState(false);
  const [disordersError, setDisordersError] = useState<string | null>(null);
  const [disordersFeedback, setDisordersFeedback] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [newCategory, setNewCategory] = useState("ansiedad");
  const [newDescription, setNewDescription] = useState("");
  const [creatingDisorder, setCreatingDisorder] = useState(false);

  const [symptomDrafts, setSymptomDrafts] = useState<Record<string, string>>({});
  const [addingSymptomId, setAddingSymptomId] = useState<string | null>(null);
  const [pendingDeleteDisorder, setPendingDeleteDisorder] =
    useState<Disorder | null>(null);
  const [deletingDisorderId, setDeletingDisorderId] = useState<string | null>(
    null
  );

  const loadDisorders = useCallback(async () => {
    if (!userIsAdmin) return;
    setDisordersLoading(true);
    setDisordersError(null);
    try {
      const data = await getDisorders();
      setDisorders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setDisordersError(
        getApiErrorMessage(err, "No se pudieron cargar las guías de trastornos.")
      );
    } finally {
      setDisordersLoading(false);
    }
  }, [userIsAdmin]);

  useEffect(() => {
    if (activeTab === "disorders" && userIsAdmin) {
      void loadDisorders();
    }
  }, [activeTab, userIsAdmin, loadDisorders]);

  const handleDisorderTitleChange = (value: string) => {
    setNewTitle(value);
    if (!slugManuallyEdited) {
      setNewSlug(slugifyText(value));
    }
  };

  const handleCreateDisorder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    setCreatingDisorder(true);
    setDisordersError(null);
    setDisordersFeedback(null);

    try {
      const resolvedSlug = newSlug.trim() || slugifyText(newTitle);
      const created = await createDisorder({
        title: newTitle.trim(),
        slug: resolvedSlug,
        description: newDescription.trim(),
        category: newCategory,
      });
      setDisorders((prev) => [
        { ...created, symptoms: created.symptoms || [] },
        ...prev,
      ]);
      setNewTitle("");
      setNewSlug("");
      setSlugManuallyEdited(false);
      setNewDescription("");
      setDisordersFeedback(
        `Guía "${created.title}" creada correctamente en el catálogo.`
      );
    } catch (err: any) {
      setDisordersError(
        getApiErrorMessage(err, "No se pudo crear la guía del trastorno.")
      );
    } finally {
      setCreatingDisorder(false);
    }
  };

  const handleAddSymptom = async (disorderId: string) => {
    const text = (symptomDrafts[disorderId] || "").trim();
    if (!text) return;

    setAddingSymptomId(disorderId);
    setDisordersError(null);
    setDisordersFeedback(null);

    try {
      const created = await addDisorderSymptom({
        disorder_id: disorderId,
        text,
      });
      setDisorders((prev) =>
        prev.map((d) =>
          d.id === disorderId
            ? {
                ...d,
                symptoms: [
                  ...(d.symptoms || []),
                  { id: created.id || `sym-${Date.now()}`, text: created.text || text },
                ],
              }
            : d
        )
      );
      setSymptomDrafts((prev) => ({ ...prev, [disorderId]: "" }));
      setDisordersFeedback("Síntoma añadido a la guía correctamente.");
    } catch (err: any) {
      setDisordersError(
        getApiErrorMessage(err, "No se pudo añadir el síntoma.")
      );
    } finally {
      setAddingSymptomId(null);
    }
  };

  const handleConfirmDeleteDisorder = async () => {
    if (!pendingDeleteDisorder) return;
    const target = pendingDeleteDisorder;
    setDeletingDisorderId(target.id);
    setDisordersError(null);
    setDisordersFeedback(null);

    try {
      await deleteDisorder(target.id);
      setDisorders((prev) => prev.filter((d) => d.id !== target.id));
      setPendingDeleteDisorder(null);
      setDisordersFeedback(`Guía "${target.title}" eliminada del catálogo.`);
    } catch (err: any) {
      setDisordersError(
        getApiErrorMessage(err, "No se pudo eliminar la guía.")
      );
      setPendingDeleteDisorder(null);
    } finally {
      setDeletingDisorderId(null);
    }
  };

  // --- ESTADO PESTAÑA 3: EQUIPO Y ROLES ---
  const [userQuery, setUserQuery] = useState("");
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersFeedback, setUsersFeedback] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (queryText = "") => {
      if (!userIsAdmin) return;
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await searchUsers(queryText);
        setUsersList(data);
      } catch (err: any) {
        setUsersError(
          getApiErrorMessage(err, "No se pudo cargar la lista de usuarios.")
        );
      } finally {
        setUsersLoading(false);
      }
    },
    [userIsAdmin]
  );

  useEffect(() => {
    if (activeTab === "users" && userIsAdmin) {
      void loadUsers(userQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userIsAdmin]);

  const handleSearchUsersSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadUsers(userQuery);
  };

  const handleRoleChange = async (
    targetUser: ManagedUser,
    nextRole: NormalizedRole
  ) => {
    setUpdatingUserId(targetUser.id);
    setUsersError(null);
    setUsersFeedback(null);

    try {
      const updated = await updateUserRole(targetUser.id, nextRole);
      setUsersList((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? {
                ...item,
                ...updated,
                role: nextRole,
                role_id: `role-${nextRole}`,
              }
            : item
        )
      );
      setUsersFeedback(
        `Rol de ${targetUser.name} actualizado a ${getRoleDisplayLabel(nextRole)}.`
      );
    } catch (err: any) {
      setUsersError(
        getApiErrorMessage(err, "No se pudo actualizar el rol del usuario.")
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // --- ESTADO PESTAÑA 4: PUBLICACIONES (ADMIN Y EDITOR) ---
  const [recentArticles, setRecentArticles] = useState<ArticleType[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [articlesFeedback, setArticlesFeedback] = useState<string | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleType | null>(null);

  const loadArticles = useCallback(async () => {
    if (!userIsEditorial) return;
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const data = await getArticles();
      setRecentArticles(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err: any) {
      setArticlesError(
        getApiErrorMessage(err, "No se pudieron cargar las publicaciones.")
      );
    } finally {
      setArticlesLoading(false);
    }
  }, [userIsEditorial]);

  useEffect(() => {
    if (activeTab === "publications" && userIsEditorial) {
      void loadArticles();
    }
  }, [activeTab, userIsEditorial, loadArticles]);

  const currentRoleLabel = getRoleDisplayLabel(user);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
            {/* CABECERA EDITORIAL */}
            <section
              aria-label="Cabecera del Centro Editorial"
              className="border-b border-neutral-200/80 dark:border-neutral-800 pb-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav
                  aria-label="Ruta de navegación"
                  className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                >
                  <Link
                    to="/dashboard"
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Mi Espacio
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Gestión Editorial
                  </span>
                </nav>

                <Link
                  to="/dashboard"
                  className="whitespace-nowrap shrink-0 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  ← Volver a Mi Espacio
                </Link>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Rol activo · {currentRoleLabel}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Centro Editorial y de Moderación
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {userIsAdmin
                      ? "Supervisa testimonios de la comunidad, actualiza guías psicoeducativas, administra permisos del equipo y gestiona publicaciones."
                      : "Crea y actualiza artículos educativos cuidando un lenguaje empático, claro y basado en evidencia."}
                  </p>
                </div>

                {userIsEditorial && (
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                      to="/articulos"
                      className="whitespace-nowrap shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Ver catálogo público
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setArticleToEdit(null);
                        setIsArticleModalOpen(true);
                      }}
                      className="whitespace-nowrap shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      + Nuevo artículo
                    </button>
                  </div>
                )}
              </div>

              {isMockMode && (
                <div
                  role="note"
                  className="rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/60 dark:bg-teal-950/20 px-4 py-3 text-xs sm:text-sm text-teal-900 dark:text-teal-200 leading-relaxed"
                >
                  <strong>Modo de demostración local:</strong> No se detectó{" "}
                  <code className="font-mono text-xs">VITE_API_URL</code> activo, por lo que los cambios de moderación, guías y roles se almacenan localmente en este navegador.
                </div>
              )}
            </section>

            {/* NAVEGACIÓN POR PESTAÑAS SEGÚN PERMISOS */}
            <nav aria-label="Secciones del Centro Editorial" className="overflow-x-auto pb-1">
              <div className="inline-flex items-center gap-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1">
                {userIsAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab("testimonials")}
                      className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "testimonials"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Moderación de Testimonios
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("disorders")}
                      className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "disorders"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Guías de Trastornos
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("users")}
                      className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "users"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Equipo y Roles
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("publications")}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "publications"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Publicaciones
                </button>
              </div>
            </nav>

            {/* PESTAÑA 1: MODERACIÓN DE TESTIMONIOS (SOLO ADMIN) */}
            {activeTab === "testimonials" && userIsAdmin && (
              <section aria-label="Moderación de Testimonios" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1">
                    {(
                      [
                        { id: "pending", label: "Pendientes" },
                        { id: "approved", label: "Aprobados" },
                        { id: "rejected", label: "Rechazados" },
                        { id: "all", label: "Todos" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTestimonialsFeedback(null);
                          setTestimonialFilter(opt.id);
                        }}
                        className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          testimonialFilter === opt.id
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                            : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {testimonials.length}{" "}
                      {testimonials.length === 1 ? "testimonio" : "testimonios"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void loadTestimonials()}
                      disabled={testimonialsLoading}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>

                {testimonialsFeedback && (
                  <div
                    role="status"
                    className="rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/70 dark:bg-teal-950/30 px-4 py-3 text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between gap-3"
                  >
                    <span>{testimonialsFeedback}</span>
                    <button
                      type="button"
                      onClick={() => setTestimonialsFeedback(null)}
                      className="text-xs font-semibold underline shrink-0 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                )}

                {testimonialsError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
                  >
                    {testimonialsError}
                  </div>
                )}

                {testimonialsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((skeleton) => (
                      <div
                        key={skeleton}
                        className="h-40 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 animate-pulse"
                      />
                    ))}
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-10 text-center space-y-2">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Sin testimonios en esta vista
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {testimonialFilter === "pending"
                        ? "No hay historias pendientes de revisión en este momento."
                        : "Cambia el filtro superior para revisar otros estados editoriales."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((item) => {
                      const statusMeta = getStatusMeta(item.status);
                      const isProcessing = moderatingId === item.id;
                      return (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <span>{formatAuthorName(item.author)}</span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {formatDateLabel(item.created_at || item.createdAt)}
                                </span>
                                {item.category && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{item.category}</span>
                                  </>
                                )}
                              </div>
                              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                {item.title}
                              </h2>
                            </div>

                            <span
                              className={`inline-flex items-center self-start rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 ${statusMeta.classes}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>

                          {item.excerpt && (
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
                              {item.excerpt}
                            </p>
                          )}

                          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                              {item.content}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-end gap-2.5">
                            {item.status !== "rejected" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  void handleModerateTestimonial(item, "rejected")
                                }
                                className="whitespace-nowrap shrink-0 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {isProcessing ? "Procesando..." : "Rechazar"}
                              </button>
                            )}
                            {item.status !== "approved" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  void handleModerateTestimonial(item, "approved")
                                }
                                className="whitespace-nowrap shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {isProcessing
                                  ? "Publicando..."
                                  : "Aprobar y publicar"}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* PESTAÑA 2: GUÍAS DE TRASTORNOS (SOLO ADMIN) */}
            {activeTab === "disorders" && userIsAdmin && (
              <section aria-label="Guías de Trastornos" className="space-y-6">
                {disordersFeedback && (
                  <div
                    role="status"
                    className="rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/70 dark:bg-teal-950/30 px-4 py-3 text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between gap-3"
                  >
                    <span>{disordersFeedback}</span>
                    <button
                      type="button"
                      onClick={() => setDisordersFeedback(null)}
                      className="text-xs font-semibold underline shrink-0 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                )}

                {disordersError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
                  >
                    {disordersError}
                  </div>
                )}

                {pendingDeleteDisorder && (
                  <div
                    role="alertdialog"
                    aria-labelledby="delete-disorder-title"
                    className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <p
                      id="delete-disorder-title"
                      className="text-sm text-rose-900 dark:text-rose-200"
                    >
                      ¿Confirmas eliminar la guía{" "}
                      <strong>"{pendingDeleteDisorder.title}"</strong>? Esta acción retirará la ficha del catálogo psicoeducativo.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={Boolean(deletingDisorderId)}
                        onClick={() => setPendingDeleteDisorder(null)}
                        className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(deletingDisorderId)}
                        onClick={() => void handleConfirmDeleteDisorder()}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
                      >
                        {deletingDisorderId ? "Eliminando..." : "Sí, eliminar"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                  {/* FORMULARIO CREAR GUÍA */}
                  <form
                    onSubmit={handleCreateDisorder}
                    className="lg:col-span-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Nueva guía de trastorno
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Crea una ficha informativa; luego podrás añadir sus síntomas clave.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="disorder-title"
                        className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                      >
                        Título de la guía
                      </label>
                      <input
                        id="disorder-title"
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => handleDisorderTitleChange(e.target.value)}
                        placeholder="Ej. Trastorno de Ansiedad Social"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="disorder-slug"
                        className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                      >
                        Slug (URL editable)
                      </label>
                      <input
                        id="disorder-slug"
                        type="text"
                        required
                        value={newSlug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          setNewSlug(e.target.value);
                        }}
                        placeholder="trastorno-de-ansiedad-social"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2 text-sm font-mono text-neutral-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="disorder-category"
                        className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                      >
                        Categoría
                      </label>
                      <select
                        id="disorder-category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ansiedad">Ansiedad</option>
                        <option value="animo">Estado de ánimo</option>
                        <option value="conducta">Conducta</option>
                        <option value="otros">Otros procesos</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="disorder-description"
                        className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                      >
                        Descripción psicoeducativa
                      </label>
                      <textarea
                        id="disorder-description"
                        required
                        rows={4}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Describe de manera clara, empática y rigurosa en qué consiste..."
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingDisorder}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {creatingDisorder ? "Creando guía..." : "Crear guía"}
                    </button>
                  </form>

                  {/* LISTADO DE TRASTORNOS EXISTENTES */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Catálogo actual
                      </h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {disorders.length} {disorders.length === 1 ? "guía" : "guías"}
                      </span>
                    </div>

                    {disordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((n) => (
                          <div
                            key={n}
                            className="h-36 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : disorders.length === 0 ? (
                      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                        Aún no hay guías registradas en el catálogo.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {disorders.map((disorder) => {
                          const symptoms = disorder.symptoms || [];
                          const draftValue = symptomDrafts[disorder.id] || "";
                          const isAdding = addingSymptomId === disorder.id;
                          return (
                            <article
                              key={disorder.id}
                              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 sm:p-6 shadow-sm space-y-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span className="font-mono">{disorder.slug}</span>
                                    {disorder.category && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="capitalize">
                                          {disorder.category}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                                    {disorder.title}
                                  </h3>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteDisorder(disorder)}
                                  className="whitespace-nowrap shrink-0 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                                >
                                  Eliminar
                                </button>
                              </div>

                              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                {disorder.description}
                              </p>

                              {/* Síntomas */}
                              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                  <span>Síntomas y señales frecuentes</span>
                                  <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                                    {symptoms.length}
                                  </span>
                                </div>

                                {symptoms.length > 0 && (
                                  <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 list-disc pl-5">
                                    {symptoms.map((sym) => (
                                      <li key={sym.id}>{sym.text}</li>
                                    ))}
                                  </ul>
                                )}

                                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={draftValue}
                                    onChange={(e) =>
                                      setSymptomDrafts((prev) => ({
                                        ...prev,
                                        [disorder.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Añadir un síntoma o señal observable..."
                                    aria-label={`Añadir síntoma a ${disorder.title}`}
                                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                  />
                                  <button
                                    type="button"
                                    disabled={isAdding || !draftValue.trim()}
                                    onClick={() => void handleAddSymptom(disorder.id)}
                                    className="whitespace-nowrap shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer"
                                  >
                                    {isAdding ? "Añadiendo..." : "Añadir síntoma"}
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PESTAÑA 3: EQUIPO Y ROLES (SOLO ADMIN) */}
            {activeTab === "users" && userIsAdmin && (
              <section aria-label="Equipo y Roles" className="space-y-6">
                <form
                  onSubmit={handleSearchUsersSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <input
                      type="search"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Buscar por nombre, correo o rol..."
                      aria-label="Buscar usuarios"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={usersLoading}
                      className="whitespace-nowrap shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {usersLoading ? "Buscando..." : "Buscar"}
                    </button>
                    {userQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserQuery("");
                          void loadUsers("");
                        }}
                        className="whitespace-nowrap shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </form>

                {usersFeedback && (
                  <div
                    role="status"
                    className="rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/70 dark:bg-teal-950/30 px-4 py-3 text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between gap-3"
                  >
                    <span>{usersFeedback}</span>
                    <button
                      type="button"
                      onClick={() => setUsersFeedback(null)}
                      className="text-xs font-semibold underline shrink-0 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                )}

                {usersError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
                  >
                    {usersError}
                  </div>
                )}

                <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 shadow-sm overflow-hidden">
                  {usersLoading ? (
                    <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      Cargando equipo y usuarios...
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      No se encontraron usuarios que coincidan con tu búsqueda.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <th className="py-3.5 px-5">Usuario</th>
                            <th className="py-3.5 px-5">Correo</th>
                            <th className="py-3.5 px-5">Rol actual</th>
                            <th className="py-3.5 px-5 text-right">Asignar rol</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                          {usersList.map((member) => {
                            const memberRole = normalizeRole(
                              member.role,
                              member.role_id
                            );
                            const isSelf =
                              (user?.id && member.id === user.id) ||
                              (user?.email &&
                                member.email.toLowerCase() ===
                                  user.email.toLowerCase());
                            const isSaving = updatingUserId === member.id;

                            return (
                              <tr
                                key={member.id}
                                className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                              >
                                <td className="py-3.5 px-5 font-semibold text-neutral-900 dark:text-white">
                                  <span>{member.name}</span>
                                  {isSelf && (
                                    <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                                      (Tu cuenta actual)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-300">
                                  {member.email}
                                </td>
                                <td className="py-3.5 px-5">
                                  <span
                                    className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(
                                      memberRole
                                    )}`}
                                  >
                                    {getRoleDisplayLabel(memberRole)}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <select
                                    aria-label={`Cambiar rol de ${member.name}`}
                                    disabled={isSelf || isSaving}
                                    value={memberRole}
                                    onChange={(e) =>
                                      void handleRoleChange(
                                        member,
                                        e.target.value as NormalizedRole
                                      )
                                    }
                                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <option value="user">Usuario</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Administrador</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* PESTAÑA 4: PUBLICACIONES Y REGLAS EDITORIALES (ADMIN Y EDITOR) */}
            {activeTab === "publications" && userIsEditorial && (
              <section
                aria-label="Publicaciones y reglas editoriales"
                className="grid gap-6 lg:grid-cols-12 items-start"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                          Publicaciones educativas
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Acceso directo para redactar, revisar o actualizar artículos.
                        </p>
                      </div>
                      <Link
                        to="/articulos"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
                      >
                        Ir a Artículos →
                      </Link>
                    </div>

                    {articlesFeedback && (
                      <div
                        role="status"
                        className="rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/70 dark:bg-teal-950/30 px-4 py-2.5 text-xs text-teal-900 dark:text-teal-200"
                      >
                        {articlesFeedback}
                      </div>
                    )}

                    {articlesError && (
                      <div
                        role="alert"
                        className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-2.5 text-xs text-rose-800 dark:text-rose-200"
                      >
                        {articlesError}
                      </div>
                    )}

                    {articlesLoading ? (
                      <p className="text-sm text-neutral-500 py-4">
                        Cargando publicaciones recientes...
                      </p>
                    ) : recentArticles.length === 0 ? (
                      <p className="text-sm text-neutral-500 py-4">
                        No hay artículos publicados todavía.
                      </p>
                    ) : (
                      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 border-t border-neutral-100 dark:border-neutral-800">
                        {recentArticles.map((article) => (
                          <li
                            key={article.id}
                            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {article.category} ·{" "}
                                <span className="tabular-nums">
                                  {formatDateLabel(article.published_at)}
                                </span>
                              </p>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                {article.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setArticleToEdit(article);
                                setIsArticleModalOpen(true);
                              }}
                              className="whitespace-nowrap shrink-0 self-start sm:self-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                              Editar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* REGLAS EDITORIALES */}
                <aside className="lg:col-span-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 shadow-sm space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      Criterio de cuidado
                    </p>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                      Reglas editoriales
                    </h2>
                  </div>

                  <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {EDITORIAL_RULES.map((rule, index) => (
                      <li key={rule.title} className="py-3.5 first:pt-1 last:pb-0 space-y-1">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          <span className="tabular-nums text-indigo-600 dark:text-indigo-400 mr-1.5">
                            0{index + 1}.
                          </span>
                          {rule.title}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {rule.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </aside>
              </section>
            )}
          </div>
        </main>

        <Footer />

        <ArticleFormModal
          isOpen={isArticleModalOpen}
          articleToEdit={articleToEdit}
          token={token || ""}
          onClose={() => {
            setIsArticleModalOpen(false);
            setArticleToEdit(null);
          }}
          onSuccess={() => {
            setArticlesFeedback(
              articleToEdit
                ? "Artículo actualizado correctamente."
                : "Artículo publicado correctamente."
            );
            void loadArticles();
          }}
        />
      </div>
    </PageTransition>
  );
}
