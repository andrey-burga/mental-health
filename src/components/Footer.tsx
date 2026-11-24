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
              <FooterLink to="/terms">Términos y condiciones</FooterLink>
              <FooterLink to="/privacy">Política de privacidad</FooterLink>
              <li className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 p-3 flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span className="text-xs text-amber-800/90 dark:text-amber-300/90 font-light leading-relaxed block">
                    Este sitio no reemplaza la atención o el diagnóstico médico profesional.
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
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 dark:text-neutral-600">
            <span>v1.0.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;