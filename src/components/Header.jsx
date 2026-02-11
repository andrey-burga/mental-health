import { NavLink } from "react-router-dom";
import { useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "font-medium text-primary"
      : "text-gray-700 hover:text-primary transition";

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-primaryHeader/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <NavLink to="/" className="text-xl font-semibold text-heading">
          Bienestar
        </NavLink>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/salud-mental" className={linkClass}>
            Salud mental
          </NavLink>
          <NavLink to="/autocuidado" className={linkClass}>
            Autocuidado
          </NavLink>
          <NavLink to="/articulos" className={linkClass}>
            Artículos
          </NavLink>
          <NavLink to="/testimonios" className={linkClass}>
            Testimonios
          </NavLink>
        </nav>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-3">
          
          {/* LOGIN / SIGNUP (Futuro) */}
          <NavLink
            to="/login"
            className="hidden md:inline-block text-sm text-gray-700 hover:text-primary transition"
          >
            Iniciar sesión
          </NavLink>

          <NavLink
            to="/signup"
            className="hidden md:inline-block rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition"
          >
            Crear cuenta
          </NavLink>

          {/* CTA */}
          <NavLink
            to="/ayuda"
            className="rounded-lg bg-primary px-4 py-2 text-black font-medium hover:opacity-90 transition"
          >
            Buscar ayuda
          </NavLink>

          {/* HAMBURGUESA (solo móvil) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-default text-xl hover:bg-white/10 transition"
            aria-label="Abrir menú"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* NAV MOBILE (Drawer) */}
      {menuOpen && (
        <nav className="md:hidden bg-primaryHeader border-t border-default">
          <div className="px-6 py-6 flex flex-col gap-4">
            <NavLink
              to="/"
              className="text-base font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/salud-mental"
              className="text-base font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              Salud mental
            </NavLink>
            <NavLink
              to="/autocuidado"
              className="text-base font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              Autocuidado
            </NavLink>
            <NavLink
              to="/articulos"
              className="text-base font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              Artículos
            </NavLink>
            <NavLink
              to="/testimonios"
              className="text-base font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              Testimonios
            </NavLink>

            <div className="mt-2 pt-4 border-t border-white/20">
              <NavLink
                to="/login"
                className="block text-sm text-white/80 hover:text-white transition"
                onClick={() => setMenuOpen(false)}
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/signup"
                className="mt-2 block rounded-lg bg-white text-primary px-4 py-2 text-center font-medium hover:opacity-90 transition"
                onClick={() => setMenuOpen(false)}
              >
                Crear cuenta
              </NavLink>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
