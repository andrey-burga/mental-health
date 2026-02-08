import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="sticky top-0 z-50  border-b border-default bg-primaryHeader">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* LOGO */}
        <NavLink to="/" className="text-xl font-semibold text-heading">
          Bienestar
        </NavLink>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-primary"
                : "text-gray-700 hover:text-primary"
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/salud-mental"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-primary"
                : "text-gray-700 hover:text-primary"
            }
          >
            Salud mental
          </NavLink>

          <NavLink
            to="/autocuidado"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-primary"
                : "text-gray-700 hover:text-primary"
            }
          >
            Autocuidado
          </NavLink>

          <NavLink
            to="/articulos"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-primary"
                : "text-gray-700 hover:text-primary"
            }
          >
            Artículos
          </NavLink>
        </nav>

        {/* CTA */}
        <NavLink
          to="/ayuda"
          className="
            rounded-lg
            bg-primary
            px-4 py-2
            text-white
            font-medium
            hover:opacity-90
            transition
          "
        >
          Buscar ayuda
        </NavLink>
      </div>
    </header>
  );
}

export default Header;
