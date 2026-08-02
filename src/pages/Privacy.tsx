import React from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

const Privacy: React.FC = () => {
  const lastUpdated: string = "13 de julio de 2026";

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* HERO / ENCABEZADO */}
          <Section>
            <div className="relative max-w-7xl mx-auto pt-16 pb-6 text-center sm:text-left">
              <div className="absolute top-12 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />

              <div className="max-w-3xl">
                <span className="inline-block bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4 border border-neutral-200/40 dark:border-neutral-800/60">
                  Legal y Privacidad
                </span>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                  Política de Privacidad
                </h1>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">
                  Última actualización: {lastUpdated}
                </p>
              </div>
            </div>
          </Section>

          {/* CONTENIDO PRINCIPAL */}
          <Section>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Columna Izquierda */}
              <div className="lg:w-1/3 h-fit lg:sticky lg:top-28 space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Tu privacidad es nuestra prioridad
                </h2>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                  En <strong>Bienestar</strong> valoramos y protegemos la
                  información personal y los datos sensibles de todos nuestros
                  usuarios de acuerdo con las normativas vigentes.
                </p>

                <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-4 dark:border-indigo-500/10 dark:bg-indigo-500/5">
                  <p className="text-xs text-indigo-800 dark:text-indigo-400 font-medium leading-relaxed">
                    🔒 <strong>Compromiso de Datos:</strong> No compartimos ni
                    comercializamos tus datos de introspección con terceros ni
                    con fines publicitarios.
                  </p>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="lg:w-2/3 rounded-3xl border border-neutral-200/60 bg-white/60 p-6 sm:p-10 dark:border-neutral-800/60 dark:bg-neutral-900/20 backdrop-blur-sm space-y-8 text-neutral-600 dark:text-neutral-400 font-light leading-relaxed text-sm sm:text-base">
                {/* Sección 1 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    1. Información que Recopilamos
                  </h3>

                  <p>
                    Para el funcionamiento de la aplicación, podemos recopilar
                    información básica de registro (como correo electrónico y
                    nombre de usuario) en caso de que decidas crear una cuenta
                    para guardar tus avances.
                  </p>

                  <p>
                    Los datos ingresados en las herramientas de autoevaluación o
                    bienestar emocional se procesan de manera segura y están
                    diseñados para resguardar tu identidad.
                  </p>
                </section>

                <hr className="border-neutral-200/60 dark:border-neutral-800/60" />

                {/* Sección 2 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    2. Uso de los Datos del Usuario
                  </h3>

                  <p>
                    Utilizamos la información recopilada exclusivamente para:
                  </p>

                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                    <li>
                      Proporcionar, mantener y mejorar las funcionalidades de la
                      plataforma.
                    </li>
                    <li>
                      Personalizar tu experiencia de usuario y el seguimiento de
                      tus hábitos de bienestar.
                    </li>
                    <li>
                      Garantizar la seguridad de la comunidad y prevenir abusos
                      o incumplimientos de las normas.
                    </li>
                  </ul>
                </section>

                <hr className="border-neutral-200/60 dark:border-neutral-800/60" />

                {/* Sección 3 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    3. Permisos del Dispositivo (App Móvil)
                  </h3>

                  <p>
                    Nuestra aplicación móvil solicita únicamente los permisos
                    estrictamente necesarios para su correcto funcionamiento. No
                    accedemos a tu galería, cámara ni ubicación a menos que una
                    función específica de la app lo requiera de forma explícita
                    con tu autorización previa.
                  </p>
                </section>

                <hr className="border-neutral-200/60 dark:border-neutral-800/60" />

                {/* Sección 4 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    4. Seguridad de la Información
                  </h3>

                  <p>
                    Implementamos medidas de seguridad técnicas y organizativas
                    diseñadas para proteger tus datos contra accesos no
                    autorizados, pérdida o alteración. Sin embargo, recuerda que
                    ningún sistema de transmisión por internet es 100% seguro.
                  </p>
                </section>

                <hr className="border-neutral-200/60 dark:border-neutral-800/60" />

                {/* Sección 5 */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    5. Contacto
                  </h3>

                  <p>
                    Si tienes dudas, inquietudes o deseas solicitar la
                    eliminación de tus datos personales y cuenta de nuestra base
                    de datos, puedes ponerte en contacto con nosotros a través
                    de los canales de soporte de la aplicación o mediante
                    nuestro sitio web.
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
};

export default Privacy;