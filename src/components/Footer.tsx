import React from "react";
import { NavLink } from "react-router-dom";

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

function FooterLink({ to, children }: FooterLinkProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `text-sm font-light transition-all duration-300 relative py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-indigo-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 dark:after:bg-indigo-400 ${isActive
            ? "text-indigo-600 dark:text-indigo-400 font-medium after:scale-x-100"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

function Footer() {
  return (
    <footer className="w-full mt-20 px-4 pb-6 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl rounded-3xl border border-neutral-200/60 bg-white/50 backdrop-blur-md p-8 sm:p-12 dark:border-neutral-800/60 dark:bg-neutral-950/40 shadow-sm">

        {/* Contenedor principal Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-neutral-200/60 dark:border-neutral-800/60">

          {/* Marca / Proyecto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              Bienestar
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              Proyecto informativo sobre salud mental y bienestar emocional.
              Un espacio creado para aprender, reflexionar y acompañar.
            </p>
          </div>

          {/* Menú: Navegación */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Navegación
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/">Inicio</FooterLink>
              <FooterLink to="/salud-mental">Salud mental</FooterLink>
              <FooterLink to="/trastornos">Trastornos</FooterLink>
              <FooterLink to="/articulos">Artículos</FooterLink>
              <FooterLink to="/testimonios">Testimonios</FooterLink>
            </ul>
          </div>

          {/* Menú: Recursos */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Recursos
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/autocuidado">Autocuidado</FooterLink>
              <FooterLink to="/ayuda">Buscar ayuda</FooterLink>
            </ul>
          </div>

          {/* Menú: Información / Aviso Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Información
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/contacto">Contacto</FooterLink>
              <li className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 p-3">
                  <span className="text-xs text-amber-700/90 dark:text-amber-400/80 font-light leading-relaxed block">
                    ⚠️ Este sitio no reemplaza la atención o el diagnóstico médico profesional.
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Barra inferior de derechos reservados */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 dark:text-neutral-500 font-light">
          <div>
            © {new Date().getFullYear()} AWD S.A.S. — Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-sans font-medium">
              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
              En desarrollo (15%)
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span>v1.0.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;