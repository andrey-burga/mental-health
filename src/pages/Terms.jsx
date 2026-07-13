import React from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

function Terms() {
  const lastUpdated = "13 de julio de 2026";

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          {/* HERO / ENCABEZADO */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6 text-center sm:text-left">
              <div className="absolute top-12 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
              
              <div className="max-w-3xl">
                <span className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4 border border-slate-200/40 dark:border-slate-800/60">
                  Legal y Transparencia
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                  Términos y Condiciones de Uso
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                  Última actualización: {lastUpdated}
                </p>
              </div>
            </div>
          </Section>

          {/* CONTENIDO PRINCIPAL EN DISEÑO ASIMÉTRICO */}
          <Section>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Columna Izquierda: Mensaje de navegación/resumen */}
              <div className="lg:w-1/3 h-fit lg:sticky lg:top-28 space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Tu compromiso con el bienestar
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  Por favor, lee atentamente estas disposiciones. Al navegar, registrarte o consumir el contenido de nuestra plataforma, aceptas de manera explícita cumplir con estos términos.
                </p>
                
                {/* Nota de exención destacada */}
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-500/10 dark:bg-amber-500/5">
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                    ⚠️ <strong>Cláusula Esencial:</strong> Nada en este sitio web sustituye la atención médica, psicológica o psiquiátrica formal. Si te encuentras en una situación de crisis, utiliza el botón "Buscar ayuda" de inmediato.
                  </p>
                </div>
              </div>

              {/* Columna Derecha: Secciones Legales */}
              <div className="lg:w-2/3 rounded-3xl border border-slate-200/60 bg-white/60 p-6 sm:p-10 dark:border-slate-800/60 dark:bg-slate-900/20 backdrop-blur-sm space-y-8 text-slate-600 dark:text-slate-400 font-light leading-relaxed text-sm sm:text-base">
                
                {/* Sección 1 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    1. Naturaleza del Servicio e Información
                  </h3>
                  <p>
                    La plataforma <strong>Bienestar</strong> provee herramientas de autocuidado, artículos educativos, testimonios y visualizaciones estadísticas con el único fin de promover la concientización personal. 
                  </p>
                  <p>
                    No somos una entidad proveedora de salud. Las autoevaluaciones privadas o guías compartidas en este espacio actúan como un ejercicio autónomo de introspección y bajo ninguna circunstancia constituyen diagnósticos clínicos ni planes terapéuticos.
                  </p>
                </section>

                <hr className="border-slate-200/60 dark:border-slate-800/60" />

                {/* Sección 2 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    2. Registro de Cuentas y Privacidad
                  </h3>
                  <p>
                    Para acceder a ciertas funciones premium o de seguimiento, es posible que debas crear una cuenta. Te comprometes a suministrar información verídica. 
                  </p>
                  <p>
                    Para nosotros tu privacidad es sagrada. Las respuestas que marcas en tus dinámicas de introspección o hábitos no se guardan en nuestros servidores con fines comerciales ni de rastreo de identidad.
                  </p>
                </section>

                <hr className="border-slate-200/60 dark:border-slate-800/60" />

                {/* Sección 3 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    3. Comunidad y Testimonios
                  </h3>
                  <p>
                    Al interactuar en las zonas comunitarias o compartir testimonios, aceptas mantener un tono empático, constructivo y respetuoso. Queda estrictamente prohibida la publicación de:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                    <li>Contenido explícito, pornográfico u obsceno.</li>
                    <li>Discurso de odio, acoso o discriminación institucional.</li>
                    <li>Promoción de conductas que atenten contra la integridad física o psicológica propia o de terceros.</li>
                  </ul>
                </section>

                <hr className="border-slate-200/60 dark:border-slate-800/60" />

                {/* Sección 4 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    4. Limitación de Responsabilidad
                  </h3>
                  <p>
                    En la medida máxima permitida por la ley aplicable, <strong>Bienestar</strong> no será responsable de ningún daño indirecto, incidental o derivado del uso o la incapacidad de usar el material educativo proporcionado en la web.
                  </p>
                  <p>
                    El usuario asume la responsabilidad total de sus decisiones personales basadas en las lecturas, factores de riesgo analizados o rutinas adoptadas de forma libre y voluntaria a través de esta página web.
                  </p>
                </section>

                <hr className="border-slate-200/60 dark:border-slate-800/60" />

                {/* Sección 5 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    5. Modificaciones de los Términos
                  </h3>
                  <p>
                    Nos reservamos el derecho de actualizar o modificar estas pautas de uso en cualquier momento para adaptarlas a nuevas regulaciones legales o mecánicas de la plataforma. La continuidad en el uso del sitio tras una modificación representa tu aceptación de las nuevas políticas.
                  </p>
                </section>

              </div>
            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Terms;