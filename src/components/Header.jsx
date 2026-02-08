import { NavLink } from "react-router-dom";
import { useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "font-medium text-primary"
      : "text-gray-700 hover:text-primary";

  return (
    <header className="sticky top-0 z-50 border-b border-default bg-primaryHeader">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <NavLink to="/" className="text-xl font-semibold text-heading">
          Bienestar
        </NavLink>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          <NavLink to="/salud-mental" className={linkClass}>Salud mental</NavLink>
          <NavLink to="/autocuidado" className={linkClass}>Autocuidado</NavLink>
          <NavLink to="/articulos" className={linkClass}>Artículos</NavLink>
        </nav>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-3">
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
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* NAV MOBILE */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-6 pb-4">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          <NavLink to="/salud-mental" onClick={() => setMenuOpen(false)}>Salud mental</NavLink>
          <NavLink to="/autocuidado" onClick={() => setMenuOpen(false)}>Autocuidado</NavLink>
          <NavLink to="/articulos" onClick={() => setMenuOpen(false)}>Artículos</NavLink>
        </nav>
      )}
    </header>
  );
}

export default Header;
