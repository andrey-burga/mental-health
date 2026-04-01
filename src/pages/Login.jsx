import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/LOGIN.png";

function Login() {
  return (
    <PageTransition>
      <Header />
      <div className="md:min-h-[700px]  flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto   bg-slate-300 shadow-lg rounded-xl overflow-hidden">
          <div className="flex items-center max-md:flex-col w-full gap-y-4">
            {/* Imagen lado izquierdo */}
            <div className="md:col-span-2 max-md:order-1 relative before:absolute before:inset-0 before:bg-blue-800/30 overflow-hidden w-full h-full">
              <div className="md:aspect-[6/10] max-sm:aspect-[6/7]">
                <img
                  src={IMG}
                  className="w-full h-full object-cover"
                  alt="login"
                />

                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="w-full bg-gradient-to-t from-black/50 via-black/50 to-transparent absolute bottom-0 p-6 max-md:hidden">
                    <h1 className="text-white text-3xl font-semibold">
                      Bienvenido/a
                    </h1>
                    <p className="text-slate-300 text-[15px] mt-3">
                      Este es un espacio seguro donde puedes compartir, escuchar
                      y sentirte acompañado/a. Conectando con personas que
                      entienden tu proceso y encuentra apoyo en una comunidad
                      que te cuida.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="w-full h-full px-8 lg:px-20 py-8 max-md:-order-1">
              <form className="md:max-w-md w-full mx-auto">
                <div className="mb-12">
                  <h2 className="text-slate-900 text-2xl font-semibold">
                    Iniciar sesion
                  </h2>
                </div>

                {/* Email */}
                <div>
                  <div className="relative flex items-center">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Ingresar correo electronico"
                      className="w-full text-sm border-b border-gray-300 focus:border-black pr-8 px-2 py-3 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-8">
                  <div className="relative flex items-center">
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Ingresar contraseña"
                      className="w-full text-sm border-b border-gray-300 focus:border-black pr-8 px-2 py-3 outline-none"
                    />
                  </div>
                </div>

                {/* Opciones */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4"
                    />
                    <label className="text-slate-600 ml-3 text-sm">
                      Recordarme
                    </label>
                  </div>

                  <a
                    href="#"
                    className="text-blue-600 font-medium text-sm hover:underline"
                  >
                    Olvido la contraseña?
                  </a>
                </div>

                {/* Botón */}
                <div className="mt-12">
                  <button
                    type="submit"
                    className="w-full shadow-xl py-2 px-4 text-[15px] font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Ingresar
                  </button>

                  <p className="text-slate-600 text-sm text-center mt-6">
                    No tiene una cuenta?
                    <a
                      href="/register"
                      className="text-blue-600 font-medium ml-1 hover:underline"
                    >
                      Registrate aqui
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;
