function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Título */}
        <h1 className="text-2xl font-bold">🌱 Tu Espacio Seguro</h1>

        {/* Navegación principal */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-blue-200 transition">
            Inicio
          </a>
          <a href="/salud-mental" className="hover:text-blue-200 transition">
            Salud mental
          </a>
          <a href="/trastornos" className="hover:text-blue-200 transition">
            Trastornos
          </a>
          <a href="/autocuidado" className="hover:text-blue-200 transition">
            Autocuidado
          </a>
          <a href="/ayuda" className="hover:text-blue-200 transition">
            Buscar ayuda
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
