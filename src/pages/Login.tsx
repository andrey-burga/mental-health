import React, { FormEvent } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Header from "../components/Header";
import IMG from "../resources/Login.png";

function Login() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí irá tu lógica de autenticación futura
  };

  return (
    <PageTransition>
      {/* 1. Contenedor padre estricto: ocupa toda la pantalla y oculta barras de scroll */}
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">

        <Header />

        {/* 2. flex-1 y min-h-0 garantizan que use solo el espacio libre restante y se centre perfectamente */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0">

          {/* Contenedor principal de la tarjeta */}
          <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800/80 transition-all">

            <div className="grid md:grid-cols-2 items-stretch">

              {/* Imagen lado izquierdo (Corregido: añadida la clase h-full absoluta para que no queden líneas blancas) */}
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
                <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
                  <div>
                    <h2 className="text-neutral-900 dark:text-white text-3xl font-bold tracking-tight">
                      Iniciar sesión
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Introduce tus credenciales para acceder a tu espacio de bienestar.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Correo electrónico
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
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
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                    />
                  </div>

                  {/* Opciones (Remember me) */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 dark:bg-neutral-800 dark:checked:bg-indigo-500"
                    />
                    <label htmlFor="remember-me" className="text-neutral-600 dark:text-neutral-400 ml-2.5 text-sm select-none">
                      Recordarme en este dispositivo
                    </label>
                  </div>

                  {/* Botón de envío */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full shadow-lg shadow-indigo-500/10 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] transition-all duration-150"
                    >
                      Ingresar
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