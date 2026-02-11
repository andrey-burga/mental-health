import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-default mt-20 bg-gradient-to-r bg-primaryFooter text-white">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Contenedor principal */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Marca */}
          <div>
            <h3 className="text-lg font-semibold text-white">AWD S.A.S.</h3>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">
              Proyecto informativo sobre salud mental y bienestar emocional.
              Espacio creado para aprender, reflexionar y acompañar.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Navegación
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Inicio
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/salud-mental"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Salud mental
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/trastornos"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Trastornos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/articulos"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Artículos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/testimonios"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Testimonios
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Recursos
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <NavLink
                  to="/autocuidado"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Autocuidado
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ayuda"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Buscar ayuda
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contacto / Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Información
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <NavLink
                  to="/contacto"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? "text-white font-semibold" : "text-white/80"}`
                  }
                >
                  Contacto
                </NavLink>
              </li>
              <li>
                <span className="text-xs text-white/60">
                  Este sitio no reemplaza atención profesional.
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/20 py-6 text-center text-xs text-white/60">
        © {new Date().getFullYear()} AWD S.A.S. — Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
