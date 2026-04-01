import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/Login.png";
import { Link } from "react-router-dom";

function Register() {
  return (
    <PageTransition>
      <Header />

      <div className="md:min-h-[700px]  flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto   bg-slate-300 shadow-lg rounded-xl overflow-hidden">
          <div className="flex items-center max-md:flex-col w-full gap-y-4">
            {/* Imagen */}
            <div className="md:col-span-2 max-md:order-1 relative before:absolute before:inset-0 before:bg-blue-800/30 overflow-hidden w-full h-full">
              <div className="md:aspect-[6/10] max-sm:aspect-[6/7]">
                <img
                  src={IMG}
                  className="w-full h-full object-cover"
                  alt="signup"
                />
              </div>

              <div className="absolute inset-0 m-auto flex items-end justify-center max-md:text-center">
                <div className="bg-gradient-to-t from-black/50 via-black/50 to-transparent p-6 w-full">
                  <div className="max-w-md mx-auto">
                    <h1 className="text-white text-3xl font-semibold">
                      Registrate hoy
                    </h1>
                    <p className="text-slate-300 text-[15px] mt-4">
                      Crea tu cuenta gratuita y accede a un espacio pensado para
                      tu bienestar emocional, Explorando herramientas de apoyo,
                      contenido personalizado y recursos que te acompañarán en
                      cada paso de tu proceso.
                      <br />
                      <br />
                      Regístrate hoy y comienza a cuidar de ti.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="md:col-span-3 w-full p-6 md:p-8 max-w-lg mx-auto">
              <form>
                <div className="mb-8">
                  <h2 className="text-slate-900 text-2xl font-semibold">
                    Registrate ahora
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label className="text-slate-900 text-sm font-medium block mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ingresa tu nombre"
                      className="w-full text-sm text-slate-900 border-b border-slate-300 focus:border-blue-600 px-2 py-3 outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-slate-900 text-sm font-medium block mb-2">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ingresa correo electronico"
                      className="w-full text-sm text-slate-900 border-b border-slate-300 focus:border-blue-600 px-2 py-3 outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-slate-900 text-sm font-medium block mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ingresa contraseña"
                      className="w-full text-sm text-slate-900 border-b border-slate-300 focus:border-blue-600 px-2 py-3 outline-none"
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4" required />
                    <label className="ml-3 text-sm text-slate-600">
                      Aceptar los{" "}
                      <Link
                        to="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Términos y condiciones
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Botón */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-sm rounded-md text-white bg-slate-800 hover:bg-slate-900"
                  >
                    Crear una cuenta
                  </button>
                </div>

                <p className="text-slate-600 text-sm mt-6 text-center">
                  Ya tienes una cuenta?
                  <a
                    href="/login"
                    className="text-blue-600 font-medium ml-1 hover:underline"
                  >
                    Inicia sesion aqui
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Register;
