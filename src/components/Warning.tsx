import { useState } from "react";
import { NavLink } from "react-router-dom";

// Definimos la interfaz para tipar las propiedades
interface WarningProps {
  title: string;
  text: string;
  slug?: string; // El slug es opcional por si solo quieres mostrar texto sin enlace
}

function Warning({ title, text, slug }: WarningProps) {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="flex-1 basis-[280px] min-w-[250px] flex flex-col items-center mb-6">
      {/* BOTÓN REVELADOR */}
      <button
        type="button"
        aria-expanded={show}
        aria-controls={`warning-${slug || title.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={() => setShow(!show)}
        className={`
          w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm
          border transition-all duration-300 outline-none
          focus:ring-2 focus:ring-primary/40 focus:outline-none
          ${
            show
              ? "bg-primary text-white border-primary shadow-md"
              : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-200 dark:border-neutral-700"
          }
        `}
      >
        <span className="flex items-center justify-center gap-2">
          {title}
          <span 
            className={`inline-block text-xs transition-transform duration-300 ${
              show ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </span>
      </button>

      {/* CONTENIDO DESPLEGABLE */}
      <div
        id={`warning-${slug || title.replace(/\s+/g, "-").toLowerCase()}`}
        className={`w-full max-w-md mx-auto overflow-hidden transition-all duration-500 ease-in-out ${
          show 
            ? "max-h-[300px] opacity-100 mt-4" 
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800/80 shadow-inner">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
            {text}
          </p>

          {slug && (
            <NavLink
              to={`/trastornos/${slug}`}
              className="inline-flex items-center text-primary font-semibold hover:underline text-xs group"
            >
              Leer más 
              <span className="ml-1 transform group-hover:tranneutral-x-0.5 transition-transform">→</span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Warning;