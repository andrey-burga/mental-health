function Footer() {
  return (
    <footer className="bg-primaryFooter text-slate-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">
              Salud Mental
            </span>
            . Todos los derechos reservados.
          </p>

          <nav className="flex gap-4 text-sm">
            <a
              href="/contacto"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Contáctanos
            </a>
            <span className="text-slate-500">|</span>
            <a
              href="/privacidad"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Política de privacidad
            </a>
          </nav>
        </div>

        {/* Línea inferior */}
        <div className="mt-6 border-t border-slate-700 pt-4 text-center text-xs text-slate-400">
          <p>
            Este sitio ofrece información orientativa y no sustituye la atención
            profesional en salud mental.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
