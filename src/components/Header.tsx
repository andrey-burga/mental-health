import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

interface NavRoute {
  path: string;
  label: string;
}

const routes: NavRoute[] = [
  { path: "/", label: "Inicio" },
  { path: "/salud-mental", label: "Salud mental" },
  { path: "/autocuidado", label: "Autocuidado" },
  { path: "/articulos", label: "Artículos" },
  { path: "/testimonios", label: "Testimonios" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Inicialización síncrona para evitar parpadeos visuales (FOUC)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    // Sincroniza la clase en el HTML basado en el estado inicial y sus cambios
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `text-sm font-medium transition-all duration-300 relative py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-indigo-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 dark:after:bg-indigo-400 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 font-semibold after:scale-x-100"
        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
    }`;

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80 shadow-lg shadow-neutral-100/40 dark:shadow-none transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}
            <div className="flex flex-1 items-center justify-start">
              <NavLink
                to="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                Bienestar
              </NavLink>
            </div>

            {/* NAV DESKTOP */}
            <nav className="hidden md:flex items-center gap-6 mx-6">
              {routes.map((route) => (
                <NavLink key={route.path} to={route.path} className={linkClass}>
                  {route.label}
                </NavLink>
              ))}
            </nav>

            {/* BOTONES ACCIÓN DERECHA */}
            <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
              
              {/* BOTÓN DARK MODE */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-indigo-400 dark:hover:bg-neutral-800/60 transform active:scale-95"
                aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
              >
                {darkMode ? (
                  <svg className="h-5 w-5 text-amber-500 animate-fadeIn" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58M17.66 6.34l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-neutral-600 animate-fadeIn" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.83A9.5 9.5 0 0110.17 2.17 9 9 0 1021.75 12.83z" />
                  </svg>
                )}
              </button>

              <NavLink
                to="/login"
                className="hidden md:inline-block text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                Iniciar sesión
              </NavLink>

              <NavLink
                to="/register"
                className="hidden md:inline-block rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/50 transition-all duration-200"
              >
                Crear cuenta
              </NavLink>

              <NavLink
                to="/ayuda"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:opacity-95 transition-all duration-200 transform active:scale-95"
              >
                Buscar ayuda
              </NavLink>

              {/* HAMBURGUESA (Móvil) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex md:hidden items-center justify-center p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200 transition-colors transform active:scale-95"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <svg className="h-6 w-6 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* NAV MOBILE (Drawer) */}
        {menuOpen && (
          <nav className="md:hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-lg dark:border-neutral-800/60 dark:bg-neutral-950/95 rounded-b-2xl overflow-hidden animate-fadeIn duration-200">
            <div className="space-y-1 px-4 py-4">
              {routes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {route.label}
                </NavLink>
              ))}

              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 px-2">
                <NavLink
                  to="/login"
                  className="w-full text-center rounded-xl py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className="w-full text-center rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 shadow hover:opacity-95 transition-opacity"
                  onClick={() => setMenuOpen(false)}
                >
                  Crear cuenta
                </NavLink>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;