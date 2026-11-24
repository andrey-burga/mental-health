import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CRISIS_COUNTRIES,
  CountryCode,
  CrisisRiskLevel,
} from "../utils/crisisSafety";

interface CrisisModalProps {
  isOpen: boolean;
  riskLevel: CrisisRiskLevel;
  onClose: () => void;
  defaultCountry?: CountryCode;
}

export default function CrisisModal({
  isOpen,
  riskLevel,
  onClose,
  defaultCountry = "CO",
}: CrisisModalProps) {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);

  useEffect(() => {
    setSelectedCountry(defaultCountry);
  }, [defaultCountry]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || riskLevel === "none") return null;

  const activeCountry =
    CRISIS_COUNTRIES.find((c) => c.code === selectedCountry) ||
    CRISIS_COUNTRIES[0];

  const isHighRisk = riskLevel === "high";

  const handleGoToBreathing = () => {
    onClose();
    navigate("/respiracion");
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      aria-describedby="crisis-modal-description"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden my-8">
        {/* Franja superior cálida y serena */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-teal-50/70 dark:from-amber-950/40 dark:via-neutral-900 dark:to-teal-950/30 px-6 sm:px-8 pt-7 pb-6 border-b border-amber-100 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 dark:bg-amber-900/40 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                Acompañamiento Inmediato
              </span>
              <h2
                id="crisis-modal-title"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight"
              >
                {isHighRisk
                  ? "No tienes que cargar con esto en soledad"
                  : "Tu bienestar importa. Estamos aquí para acompañarte"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana de apoyo"
              className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p
            id="crisis-modal-description"
            className="mt-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-light leading-relaxed"
          >
            {isHighRisk
              ? "Percibimos que puedes estar atravesando un momento muy difícil o de dolor intenso. Hay personas reales, capacitadas y disponibles ahora mismo para escucharte con calidez y sin juicios."
              : "Notamos señales de mucho agotamiento o malestar en lo que expresas. Hablar con alguien capacitado o hacer una pausa breve puede ayudarte a sentirte más acompañado ahora mismo."}
          </p>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Selector rápido de país */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Selecciona tu país para ver líneas gratuitas 24/7
            </label>
            <div className="flex flex-wrap gap-2">
              {CRISIS_COUNTRIES.map((country) => {
                const active = country.code === selectedCountry;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setSelectedCountry(country.code)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all border ${
                      active
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm dark:bg-teal-600 dark:border-teal-600"
                        : "bg-neutral-50 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botones grandes de llamada directa */}
          <div className="space-y-3">
            {activeCountry.helplines.map((line) => (
              <div
                key={line.label}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                      {line.label}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
                      {line.availability}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light">
                    {line.description}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <a
                    href={line.telHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98]"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    <span>Llamar {line.numberDisplay}</span>
                  </a>

                  {line.whatsappHref && (
                    <a
                      href={line.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-300 dark:border-teal-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                    >
                      <span>{line.whatsappLabel || "Escribir por WhatsApp"}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Acciones de calma y cierre */}
          <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleGoToBreathing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/50 transition-colors"
            >
              <span>Hacer respiración guiada ahora</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Estoy a salvo por ahora, cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
