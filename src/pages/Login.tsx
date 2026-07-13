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
      <Header />
      {/* 1. Ajustado el min-h para dar espacio al Header flotante y centrar mejor el contenido */}
      <div className="min-h-[calc(100vh-110px)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        
        {/* 2. Contenedor principal con sombra suavizada para mantener la coherencia */}
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 transition-all">
          
          <div className="grid md:grid-cols-2 items-stretch">
            
            {/* Imagen lado izquierdo (Se cambió h-full a items-stretch para alineación perfecta) */}
            <div className="relative hidden md:block overflow-hidden min-h-[550px]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent z-10" />
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
                <p className="text-slate-200/90 text-sm leading-relaxed font-light">
                  Este es un espacio seguro donde puedes compartir, escuchar
                  y sentirte acompañado/a. Conecta con personas que
                  entienden tu proceso y encuentra apoyo en una comunidad
                  que te cuida.
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="w-full px-6 py-12 sm:px-12 lg:px-16 flex items-center">
              <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
                <div>
                  <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                    Iniciar sesión
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Introduce tus credenciales para acceder a tu espacio de bienestar.
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Correo electrónico
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all dark:focus:border-indigo-400"
                  />
                </div>

                {/* Opciones (Remember me) */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:checked:bg-indigo-500"
                  />
                  <label htmlFor="remember-me" className="text-slate-600 dark:text-slate-400 ml-2.5 text-sm select-none">
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

                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-6">
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
    </PageTransition>
  );
}

export default Login;