import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

function Help() {
  return (
    <>
      <PageTransition>
        <Header />

        {/* HERO */}
        <Section>
          <h2 className="text-3xl font-semibold">
            Pedir ayuda también es cuidarte
          </h2>
          <p className="mt-2 text-gray-700 max-w-2xl">
            Si te sientes abrumado, perdido o simplemente necesitas hablar con
            alguien, no estás solo. Existen distintas formas de recibir apoyo, y
            todas son válidas.
          </p>
        </Section>

        {/* CUÁNDO BUSCAR AYUDA */}
        <Section title="¿Cuándo es buena idea buscar ayuda?">
          <div className="max-w-3xl space-y-4 text-gray-700">
            <p>
              Buscar ayuda no significa que estés fallando. Es una decisión
              responsable cuando sientes que algo te supera o se mantiene en el
              tiempo.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Te sientes triste, ansioso o vacío la mayor parte del tiempo
              </li>
              <li>Has perdido el interés por cosas que antes disfrutabas</li>
              <li>Te cuesta dormir, concentrarte o mantener rutinas</li>
              <li>Sientes que no puedes solo con lo que te pasa</li>
            </ul>
          </div>
        </Section>

        {/* OPCIONES DE AYUDA */}
        <Section title="Formas de recibir apoyo">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              title="Hablar con alguien de confianza"
              description="Un amigo, familiar o persona cercana puede escucharte y acompañarte."
            />

            <ResourceCard
              title="Apoyo profesional"
              description="Psicólogos, psiquiatras o terapeutas están formados para ayudarte a comprender y manejar lo que sientes."
            />

            <ResourceCard
              title="Líneas de ayuda"
              description="Existen líneas gratuitas y confidenciales donde puedes hablar con alguien en momentos difíciles."
            />
          </div>
        </Section>

        {/* MENSAJE IMPORTANTE */}
        <Section>
          <div className="rounded-2xl border border-default bg-neutral-primary-soft p-8 text-center">
            <h3 className="text-2xl font-semibold mb-2">
              Tu vida y tu bienestar importan
            </h3>
            <p className="mb-4 text-gray-700 max-w-xl mx-auto">
              Pedir ayuda no te hace débil. Al contrario, es un paso valiente
              hacia sentirte mejor. No tienes que tener todo resuelto para
              empezar a cuidarte.
            </p>
            <p className="text-sm text-gray-600">
              Si sientes que estás en riesgo inmediato, busca ayuda de
              emergencia en tu país.
            </p>
          </div>
        </Section>

        <Footer />
      </PageTransition>
    </>
  );
}

export default Help;
