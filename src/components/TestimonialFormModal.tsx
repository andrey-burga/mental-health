import { useState, useEffect, useRef } from "react";
import { TestimonialInput } from "../services/testimonialService";
import CrisisModal from "./CrisisModal";
import { detectCrisisSignals, CrisisRiskLevel } from "../utils/crisisSafety";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestimonialInput) => Promise<void>;
  initialData?: TestimonialInput | null;
}

export default function TestimonialFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<TestimonialInput>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [formData.title, formData.excerpt, formData.content, isOpen]);

  if (!isOpen) return null;

  // Genera un slug apto para URLs
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: initialData ? prev.slug : slug, // No sobrescribir slug al editar
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
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {initialData ? "Editar Testimonio" : "Crear Testimonio"}
          </h2>

          {err && <div className="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg">{err}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Título</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Slug (URL)</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Extracto (Resumen)</label>
              <textarea
                required
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Contenido completo</label>
              <textarea
                required
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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
                className="px-4 py-2 text-sm rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                type="submit"
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
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