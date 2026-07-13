import React from "react";

interface PageLoaderProps {
  /**
   * Si es true, ocupará toda la pantalla (h-screen). 
   * Si es false, se adaptará al tamaño del contenedor padre.
   * @default true
   */
  fullScreen?: boolean;
}

function PageLoader({ fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        bg-gradient-to-br from-slate-50 to-gray-100 
        dark:from-slate-950 dark:to-slate-900 
        transition-colors duration-300 px-6 text-center
        ${fullScreen ? "min-h-screen w-screen" : "w-full py-12"}
      `}
    >
      {/* Luz difuminada sutil de fondo */}
      {fullScreen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 dark:bg-primary/5 blur-3xl pointer-events-none" />
      )}

      {/* Contenedor del Esqueleto Animado */}
      <div className="w-full max-w-lg space-y-6 animate-pulse relative z-10">
        
        {/* Cabecera simulada: Icono/Logo circular + título */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-full w-1/3" />
        </div>

        {/* Separador decorativo */}
        <div className="h-[1px] bg-gray-200/60 dark:bg-slate-800/60 w-1/2 mx-auto" />

        {/* Bloque de líneas de texto simulando párrafos */}
        <div className="space-y-3 max-w-md mx-auto">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-full w-full" />
          <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-full w-11/12 mx-auto" />
          <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-full w-4/5 mx-auto" />
        </div>

        {/* Mensaje sutil debajo del esqueleto */}
        <p className="text-[11px] font-medium tracking-wider text-gray-400 dark:text-slate-500 uppercase pt-4">
          Sincronizando espacio de bienestar...
        </p>
      </div>
    </div>
  );
}

export default PageLoader;