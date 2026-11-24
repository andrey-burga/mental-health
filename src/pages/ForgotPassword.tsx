import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/auth"; // Ajusta la ruta de importación si es necesario

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. Llamada real a tu API backend
      await forgotPassword(email);
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      // Capturamos el error detallado de FastAPI si existe
      const message = error.response?.data?.detail || "No pudimos procesar tu solicitud. Inténtalo de nuevo.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No te preocupes. Introduce tu correo electrónico y te enviaremos un enlace seguro para restablecerla.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
              ¡Enlace enviado con éxito! Revisa tu bandeja de entrada (y la carpeta de spam por si acaso).
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={status === "loading"}
                className="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
              />
            </div>

            {status === "error" && (
              <p role="alert" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              {status === "loading" ? "Enviando enlace..." : "Enviar enlace de recuperación"}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}