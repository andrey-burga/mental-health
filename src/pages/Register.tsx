import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/Login.png";
import { registerUser } from "../services/auth";

function Register() {
  const navigate = useNavigate();
  
  // 1. Estados para controlar el formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 2. Respaldo legal extra en el cliente: Bloquear envío si no se aceptan términos
    if (!acceptTerms) {
      setError("Debes aceptar de forma obligatoria los Términos y Condiciones de salud mental para continuar.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        role_id: "1" // Reemplaza por el ID real del rol "user" de tu base de datos
      });
      
      // Registro exitoso -> Mandamos al usuario al Login
      navigate("/login");
    } catch (err: any) {
      const message = err.response?.data?.detail || "Ocurrió un error al registrar tu cuenta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-screen w-screen flex flex-col overflow-hidden from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        <Header />

        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-all">
            <div className="grid md:grid-cols-2 items-center">
              
              {/* Imagen lado izquierdo */}
              <div className="relative hidden md:block h-full min-h-[550px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                <img
                  src={IMG}
                  className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-700"
                  alt="Comunidad de bienestar"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 z-20 text-white">
                  <h1 className="text-3xl font-bold tracking-tight mb-4">Regístrate hoy</h1>
                  <p className="text-slate-200 text-sm leading-relaxed font-light">
                    Crea tu cuenta gratuita y accede a un espacio pensado para tu bienestar emocional. Explora herramientas de apoyo, contenido personalizado y recursos que te acompañarán en cada paso de tu proceso.
                  </p>
                  <p className="text-slate-300 text-xs mt-4 font-medium italic">Comienza a cuidar de ti.</p>
                </div>
              </div>

              {/* Formulario */}
              <div className="w-full px-8 py-8 sm:px-12 lg:px-16">
                <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
                  <div>
                    <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Regístrate ahora</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                      Únete a nuestra comunidad y prioriza tu salud mental.
                    </p>
                  </div>

                  {/* Alerta de Error */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg font-medium leading-relaxed">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full text-sm bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-sm bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crea una contraseña segura"
                      className="w-full text-sm bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="flex items-start pt-1">
                    <input 
                      id="terms"
                      type="checkbox" 
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-primary focus:ring-primary cursor-pointer" 
                      required 
                    />
                    <label htmlFor="terms" className="ml-2.5 text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                      Acepto los de forma obligatoria los{" "}
                      <Link to="/terms" className="text-primary font-medium hover:underline">
                        Términos y condiciones legales
                      </Link>
                    </label>
                  </div>

                  {/* Botón */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full shadow-lg shadow-primary/20 py-3 px-4 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creando cuenta..." : "Crear una cuenta"}
                    </button>

                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-6">
                      ¿Ya tienes una cuenta?
                      <Link to="/login" className="text-primary font-semibold ml-1.5 hover:underline">
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