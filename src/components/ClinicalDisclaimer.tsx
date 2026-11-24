import React from "react";
import { Link } from "react-router-dom";

interface ClinicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export default function ClinicalDisclaimer({
  compact = false,
  className = "",
}: ClinicalDisclaimerProps) {
  return (
    <aside
      role="note"
      aria-label="Aviso clínico e informativo"
      className={`rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3.5 sm:px-5 sm:py-4 text-neutral-700 dark:text-neutral-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300"
            aria-hidden="true"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </span>
          <p className="text-xs sm:text-sm leading-relaxed font-light">
            <strong className="font-semibold text-neutral-900 dark:text-white">
              Espacio psicoeducativo y de autocuidado:
            </strong>{" "}
            {compact
              ? "Este contenido es informativo y no sustituye valoración médica ni terapia psicológica profesional."
              : "La información y herramientas de esta sección tienen fines de bienestar y orientación. No constituyen un diagnóstico clínico ni reemplazan la atención médica, psicológica o psiquiátrica profesional."}
          </p>
        </div>

        <Link
          to="/ayuda"
          className="self-start sm:self-center shrink-0 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:underline whitespace-nowrap"
        >
          Ver líneas de ayuda →
        </Link>
      </div>
    </aside>
  );
}
