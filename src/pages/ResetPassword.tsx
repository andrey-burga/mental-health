import { useState, FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/auth"; // Ajusta la ruta de importación si es necesario

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extrae el token de la URL (?token=...)

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validación de coincidencia local
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("El token de recuperación falta o no es válido.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // 2. Llamada real al endpoint en FastAPI pasando el token y la nueva contraseña
      await resetPassword(token, password);
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      // Captura el mensaje detallado de FastAPI (p. ej., si el token ya expiró)
      const errorMsg = error.response?.data?.detail || "Ocurrió un problema al actualizar tu contraseña. Inténtalo de nuevo.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Crea una contraseña segura que no uses en otros sitios web.
          </p>
        </div>

        {!token ? (
          <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              Enlace no válido. Parece que el token de recuperación ha expirado o es incorrecto.
            </p>
            <div className="mt-6">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        ) : status === "success" ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
              ¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={status === "loading"}
                  className="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  disabled={status === "loading"}
                  className="mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                />
              </div>
            </div>

            {status === "error" && (
              <p role="alert" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{message}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all"
            >
              {status === "loading" ? "Guardando..." : "Restablecer contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}