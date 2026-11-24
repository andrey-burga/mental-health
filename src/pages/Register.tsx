import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/Login.png";
import { loginUser, registerUser } from "../services/auth";
import { extractAuthToken, useAuth } from "../context/AuthContext";

function getRegisterErrorMessage(err: any, fallback: string): string {
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

function Register() {
  const navigate = useNavigate();
  const { login, refreshUser, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
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

    if (!acceptTerms) {
      setError(
        "Debes aceptar de forma obligatoria los Términos y Condiciones de salud mental para continuar."
      );
      return;
    }

    setLoading(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    try {
      const registerResponse = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role_id: "role-user",
      });

      const directToken = extractAuthToken(registerResponse);
      if (directToken) {
        const directUser =
          registerResponse?.user ?? registerResponse?.data?.user ?? registerResponse;
        login(directToken, directUser, true);
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        const loginResponse = await loginUser({
          email: trimmedEmail,
          password,
        });
        const loginToken = extractAuthToken(loginResponse);
        if (loginToken) {
          const loginUserPayload =
            loginResponse?.user ?? loginResponse?.data?.user ?? null;
          login(loginToken, loginUserPayload, true);

          if (!loginUserPayload) {
            try {
              await refreshUser();
            } catch {
              // Mantenemos el token válido aunque /auth/me falle temporalmente
            }
          }

          navigate("/dashboard", { replace: true });
          return;
        }
      } catch {
        // Si el backend requiere verificación o inicio manual, redirigimos al login con confirmación
      }

      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: trimmedEmail,
          registrationMessage:
            "Tu cuenta fue creada correctamente. Inicia sesión para entrar a tu espacio.",
        },
      });
    } catch (err: any) {
      setError(
        getRegisterErrorMessage(
          err,
          "Ocurrió un error al registrar tu cuenta."
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
              <div className="relative hidden md:block h-full min-h-[550px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent z-10" />
                <img
                  src={IMG}
                  className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-700"
                  alt="Comunidad de bienestar"
                />
                <div className="absolute inset-x-0 bottom-0 p-10 z-20 text-white">
                  <span className="inline-block bg-white/10 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full mb-4 border border-white/10">
                    Comunidad de Apoyo
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Regístrate hoy
                  </h1>
                  <p className="text-neutral-200/90 text-sm leading-relaxed font-light">
                    Crea tu cuenta gratuita y accede a un espacio pensado para
                    tu bienestar emocional. Explora herramientas de apoyo,
                    contenido personalizado y recursos que te acompañarán en
                    cada paso de tu proceso.
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
                      Regístrate ahora
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Únete a nuestra comunidad y prioriza tu salud mental.
                    </p>
                  </div>

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

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-name"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-email"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="register-email"
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
                    <label
                      htmlFor="register-password"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Contraseña
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crea una contraseña segura"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="flex items-start pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 dark:bg-neutral-800 cursor-pointer"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2.5 text-sm text-neutral-600 dark:text-neutral-400 select-none cursor-pointer"
                    >
                      Acepto de forma obligatoria los{" "}
                      <Link
                        to="/terms"
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        Términos y condiciones legales
                      </Link>
                    </label>
                  </div>

                  {/* Botón */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full shadow-lg shadow-indigo-500/10 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Creando cuenta..." : "Crear una cuenta"}
                    </button>

                    <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center mt-6">
                      ¿Ya tienes una cuenta?
                      <Link
                        to="/login"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1.5 hover:underline"
                      >
                        Inicia sesión aquí
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

export default Register;