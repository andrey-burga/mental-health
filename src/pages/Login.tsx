import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/Login.png";
import { loginUser } from "../services/auth";
import { extractAuthToken, useAuth } from "../context/AuthContext";

interface LoginLocationState {
  registeredEmail?: string;
  registrationMessage?: string;
}

function getAuthErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((item) => (typeof item?.msg === "string" ? item.msg : null))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  const message = err?.response?.data?.message || err?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallback;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LoginLocationState | null) ?? null;

  const { login, refreshUser, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState(locationState?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    locationState?.registrationMessage || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      const token = extractAuthToken(response);
      if (!token) {
        throw new Error(
          "No se recibió un token de acceso válido del servidor."
        );
      }

      const rawUser = response?.user ?? response?.data?.user ?? null;
      login(token, rawUser, rememberMe);

      if (!rawUser) {
        try {
          await refreshUser();
        } catch {
          // Si /auth/me falla de forma transitoria, mantenemos la sesión del token
        }
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        getAuthErrorMessage(
          err,
          "Error al intentar iniciar sesión. Por favor, verifica tus datos."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0">
          <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800/80 transition-all">
            <div className="grid md:grid-cols-2 items-stretch">
              {/* Imagen lado izquierdo */}
              <div className="relative hidden md:block overflow-hidden h-full min-h-[550px]">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent z-10" />
                <img
                  src={IMG}
                  className="absolute inset-0 w-full h-full object-cover transform scale-102 hover:scale-100 transition-transform duration-1000 ease-out"
                  alt="Espacio seguro de bienestar"
                />

                <div className="absolute inset-x-0 bottom-0 p-10 z-20 text-white">
                  <span className="inline-block bg-white/10 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full mb-4 border border-white/10">
                    Espacio Seguro
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Bienvenido/a de vuelta
                  </h1>
                  <p className="text-neutral-200/90 text-sm leading-relaxed font-light">
                    Este es un espacio seguro donde puedes compartir, escuchar
                    y sentirte acompañado/a. Conecta con personas que
                    entienden tu proceso y encuentra apoyo en una comunidad
                    que te cuida.
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <div className="w-full px-6 py-10 sm:px-12 lg:px-16 flex items-center">
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-md mx-auto space-y-5"
                >
                  <div>
                    <h2 className="text-neutral-900 dark:text-white text-3xl font-bold tracking-tight">
                      Iniciar sesión
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Introduce tus credenciales para acceder a tu espacio de
                      bienestar.
                    </p>
                  </div>

                  {/* Alerta de confirmación tras registro */}
                  {notice && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs p-3.5 rounded-xl font-medium leading-relaxed flex items-start gap-2">
                      <svg
                        className="h-4 w-4 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{notice}</span>
                    </div>
                  )}

                  {/* Alerta de Error */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-xl font-medium leading-relaxed flex items-start gap-2">
                      <svg
                        className="h-4 w-4 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="login-email"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                      >
                        Contraseña
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Opciones (Remember me) */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 dark:bg-neutral-800 dark:checked:bg-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-neutral-600 dark:text-neutral-400 ml-2.5 text-sm select-none cursor-pointer"
                    >
                      Recordarme en este dispositivo
                    </label>
                  </div>

                  {/* Botón de envío */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full shadow-lg shadow-indigo-500/10 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Iniciando sesión..." : "Ingresar"}
                    </button>

                    <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center mt-6">
                      ¿No tienes una cuenta?
                      <Link
                        to="/register"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1.5 hover:underline"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;