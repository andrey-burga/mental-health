import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { openEmotionalCompanion } from "./EmotionalCompanion";
import { getRoleDisplayLabel, isEditorialUser } from "../utils/permissions";

interface DropdownItem {
  path: string;
  label: string;
  description: string;
  iconPath: string;
}

const exploreItems: DropdownItem[] = [
  {
    path: "/salud-mental",
    label: "Salud mental",
    description: "Conceptos clave y mitos frecuentes",
    iconPath:
      "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
  {
    path: "/trastornos",
    label: "Guías de trastornos",
    description: "Información clara y basada en evidencia",
    iconPath:
      "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  {
    path: "/factores-riesgo",
    label: "Factores de riesgo",
    description: "Señales de alerta y prevención temprana",
    iconPath:
      "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  },
  {
    path: "/articulos",
    label: "Artículos",
    description: "Lecturas psicoeducativas de bienestar",
    iconPath:
      "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z",
  },
  {
    path: "/testimonios",
    label: "Testimonios",
    description: "Historias reales de acompañamiento",
    iconPath:
      "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
  },
];

const toolItems: DropdownItem[] = [
  {
    path: "/diario",
    label: "Diario emocional",
    description: "Registra emociones con privacidad local",
    iconPath:
      "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
  },
  {
    path: "/respiracion",
    label: "Respiración guiada",
    description: "Ritmos 4-4-4-4 y 4-7-8 para calmar el cuerpo",
    iconPath:
      "M3.75 12h2.25l2.25-5.25 3.75 10.5 2.25-6.75L16.5 12h3.75",
  },
  {
    path: "/sonidos",
    label: "Paisajes sonoros",
    description: "Lluvia, océano y tonos de calma o enfoque",
    iconPath:
      "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  },
  {
    path: "/autocuidado-diario",
    label: "Autocuidado diario",
    description: "Micro-hábitos cotidianos y racha personal",
    iconPath:
      "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

function getInitials(name?: string): string {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user, logout } = useAuth();
  const userName = user?.name || "Usuario";
  const userEmail = user?.email || "";
  const canOpenEditorialCenter = isEditorialUser(user);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(target)) {
        setToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setToolsOpen(false);
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      setExploreOpen(false);
      setToolsOpen(false);
      setProfileOpen(false);
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors duration-200 py-1.5 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-indigo-600 dark:after:bg-indigo-400 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 font-semibold after:scale-x-100"
        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6 xl:gap-8">
          {/* ZONA IZQUIERDA: Marca */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-lg font-bold tracking-tight text-neutral-900 dark:text-white hover:opacity-90 transition-opacity"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-xs"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </span>
            <span>Bienestar</span>
          </NavLink>

          {/* ZONA CENTRAL: Máximo 4 elementos curados en escritorio (lg+) */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-6 xl:gap-8"
          >
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>

            {/* Dropdown Explorar */}
            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => {
                  setExploreOpen((prev) => !prev);
                  setToolsOpen(false);
                  setProfileOpen(false);
                }}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span>Explorar</span>
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    exploreOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {exploreOpen && (
                <div
                  role="menu"
                  aria-label="Explorar contenido psicoeducativo"
                  className="absolute left-0 mt-3 w-72 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-xl z-50"
                >
                  {exploreItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      onClick={() => setExploreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          isActive
                            ? "bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                            : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/70"
                        }`
                      }
                    >
                      <svg
                        className="h-4 w-4 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={item.iconPath}
                        />
                      </svg>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight">
                          {item.label}
                        </span>
                        <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/autocuidado" className={navLinkClass}>
              Autocuidado
            </NavLink>

            {/* Dropdown Herramientas */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => {
                  setToolsOpen((prev) => !prev);
                  setExploreOpen(false);
                  setProfileOpen(false);
                }}
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
                className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span>Herramientas</span>
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    toolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {toolsOpen && (
                <div
                  role="menu"
                  aria-label="Herramientas de bienestar"
                  className="absolute left-0 mt-3 w-72 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-xl z-50"
                >
                  {toolItems.map((tool) => (
                    <NavLink
                      key={tool.path}
                      to={tool.path}
                      role="menuitem"
                      onClick={() => setToolsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          isActive
                            ? "bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                            : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/70"
                        }`
                      }
                    >
                      <svg
                        className="h-4 w-4 mt-0.5 shrink-0 text-teal-600 dark:text-teal-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={tool.iconPath}
                        />
                      </svg>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight">
                          {tool.label}
                        </span>
                        <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {tool.description}
                        </span>
                      </div>
                    </NavLink>
                  ))}

                  <div className="my-1.5 border-t border-neutral-100 dark:border-neutral-800" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setToolsOpen(false);
                      openEmotionalCompanion();
                    }}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">
                        Acompañante emocional
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Orientación psicoeducativa en vivo
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* ZONA DERECHA: Acciones limpias y compactas */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Toggle Tema */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {darkMode ? (
                <svg
                  className="h-4 w-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58M17.66 6.34l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 12.83A9.5 9.5 0 0110.17 2.17 9 9 0 1021.75 12.83z"
                  />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `whitespace-nowrap shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-indigo-700 text-white shadow-sm"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                    }`
                  }
                >
                  Mi Espacio
                </NavLink>

                {/* Menú Avatar / Perfil */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen((prev) => !prev);
                      setExploreOpen(false);
                      setToolsOpen(false);
                    }}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label="Menú de cuenta y ayuda"
                    className="whitespace-nowrap shrink-0 inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-1.5 pr-2.5 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {getInitials(userName)}
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 text-neutral-500 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      aria-label="Opciones de perfil"
                      className="absolute right-0 mt-3 w-64 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-xl z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {userName}
                        </p>
                        {userEmail && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            {userEmail}
                          </p>
                        )}
                        {canOpenEditorialCenter && (
                          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                            {getRoleDisplayLabel(user)}
                          </p>
                        )}
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        {canOpenEditorialCenter && (
                          <NavLink
                            to="/admin"
                            role="menuitem"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
                          >
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.8"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                              />
                            </svg>
                            <span>Gestión Editorial</span>
                          </NavLink>
                        )}
                        <NavLink
                          to="/ayuda"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <svg
                            className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                            />
                          </svg>
                          <span>Ayuda y líneas de crisis</span>
                        </NavLink>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setProfileOpen(false);
                            openEmotionalCompanion();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <svg
                            className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                            />
                          </svg>
                          <span>Acompañante IA</span>
                        </button>
                      </div>

                      <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <svg
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                          </svg>
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 shrink-0">
                <NavLink
                  to="/login"
                  className="whitespace-nowrap shrink-0 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors px-2 py-1.5"
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/ayuda"
                  className="whitespace-nowrap shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
                >
                  Buscar ayuda
                </NavLink>
              </div>
            )}

            {/* Botón móvil / tablet (< lg) */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* DRAWER MÓVIL / TABLET (< lg) */}
      {menuOpen && (
        <nav
          aria-label="Menú móvil"
          className="lg:hidden border-t border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-950 max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-5">
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {getInitials(userName)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {userName}
                    </p>
                    {userEmail && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="whitespace-nowrap shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white"
                >
                  Mi Espacio
                </NavLink>
              </div>
            )}

            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                Explorar
              </p>
              <NavLink
                to="/"
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  }`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/autocuidado"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  }`
                }
              >
                Autocuidado
              </NavLink>
              {exploreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="space-y-1 pt-3 border-t border-neutral-200/70 dark:border-neutral-800">
              <p className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                Herramientas terapéuticas
              </p>
              {toolItems.map((tool) => (
                <NavLink
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    }`
                  }
                >
                  {tool.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openEmotionalCompanion();
                }}
                className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 cursor-pointer"
              >
                Acompañante emocional
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-2">
              {isAuthenticated && canOpenEditorialCenter && (
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/30 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
                >
                  Gestión Editorial
                </NavLink>
              )}
              <NavLink
                to="/ayuda"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/60 dark:bg-teal-950/20 py-2.5 text-sm font-semibold text-teal-800 dark:text-teal-300"
              >
                Ayuda y líneas de crisis
              </NavLink>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                >
                  Cerrar sesión
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-center rounded-xl border border-neutral-200 dark:border-neutral-800 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
                  >
                    Crear cuenta
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;