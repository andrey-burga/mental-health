import { useState, useEffect, useRef } from "react";
import { TestimonialInput } from "../services/testimonialService";
import CrisisModal from "./CrisisModal";
import { detectCrisisSignals, CrisisRiskLevel } from "../utils/crisisSafety";
import { useAuth } from "../context/AuthContext";
import { isEditorialUser } from "../utils/permissions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestimonialInput) => Promise<void>;
  initialData?: TestimonialInput | null;
}

export default function TestimonialFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const { user } = useAuth();
  const isStaff = isEditorialUser(user);

  const [formData, setFormData] = useState<TestimonialInput>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submittedPendingNotice, setSubmittedPendingNotice] = useState(false);

  const [crisisRisk, setCrisisRisk] = useState<CrisisRiskLevel>("none");
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const lastAcknowledgedRiskRef = useRef<CrisisRiskLevel>("none");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: "", slug: "", excerpt: "", content: "" });
    }
    lastAcknowledgedRiskRef.current = "none";
    setCrisisRisk("none");
    setIsCrisisModalOpen(false);
    setErr(null);
    setSubmittedPendingNotice(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen || submittedPendingNotice) return;
    const combined = `${formData.title} ${formData.excerpt} ${formData.content}`;
    const result = detectCrisisSignals(combined);

    if (result.riskLevel === "none") {
      lastAcknowledgedRiskRef.current = "none";
      setCrisisRisk("none");
      return;
    }

    setCrisisRisk(result.riskLevel);
    const timer = setTimeout(() => {
      const escalated =
        result.riskLevel === "high" &&
        lastAcknowledgedRiskRef.current !== "high";
      const firstDetection = lastAcknowledgedRiskRef.current === "none";

      if (firstDetection || escalated) {
        setIsCrisisModalOpen(true);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.title, formData.excerpt, formData.content, isOpen, submittedPendingNotice]);

  if (!isOpen) return null;

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: initialData ? prev.slug : slug,
    }));
  };

  const handleCloseCrisisModal = () => {
    lastAcknowledgedRiskRef.current = crisisRisk;
    setIsCrisisModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const combined = `${formData.title} ${formData.excerpt} ${formData.content}`;
    const detection = detectCrisisSignals(combined);
    if (detection.riskLevel !== "none") {
      setCrisisRisk(detection.riskLevel);
      setIsCrisisModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      if (!initialData && !isStaff) {
        setSubmittedPendingNotice(true);
      } else {
        onClose();
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo guardar el testimonio. Inténtalo de nuevo.";
      setErr(typeof msg === "string" ? msg : "Ocurrió un error al enviar tu testimonio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8">
          {submittedPendingNotice ? (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  Gracias por compartir tu historia
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Tu testimonio ha sido recibido y pasará por una breve revisión editorial antes de publicarse para cuidar la seguridad de la comunidad.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                {initialData ? "Editar Testimonio" : "Crear Testimonio"}
              </h2>

              {err && (
                <div className="mb-4 text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 rounded-xl">
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Título
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Extracto (Resumen)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Contenido completo
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {!initialData && !isStaff && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Para proteger el bienestar de la comunidad, cada testimonio nuevo pasa por una revisión editorial breve antes de hacerse visible.
                  </p>
                )}

                {crisisRisk !== "none" && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-300">
                    <span>¿Necesitas hablar con alguien ahora?</span>
                    <button
                      type="button"
                      onClick={() => setIsCrisisModalOpen(true)}
                      className="font-semibold underline shrink-0"
                    >
                      Ver líneas de ayuda
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Enviando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <CrisisModal
        isOpen={isCrisisModalOpen}
        riskLevel={crisisRisk}
        onClose={handleCloseCrisisModal}
      />
    </>
  );
}