import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

import { wellbeingResources } from "../data/homeContent";

function Autocuidado() {
  return (
    <>
          <PageTransition>

      <Header />

      {/* INTRO */}
      <Section title="Autocuidado y bienestar emocional">
        <p className="max-w-3xl text-gray-700">
          El autocuidado no es egoísmo ni debilidad. Es una práctica consciente
          que ayuda a mantener el equilibrio emocional y prevenir dificultades
          de salud mental.
        </p>
      </Section>

      {/* RECURSOS */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wellbeingResources.map((item) => (
            <ResourceCard
              key={item.id}
              title={item.title}
              description={item.description}
            >
              <details className="text-sm text-body">
                <summary className="cursor-pointer text-primary font-medium">
                  Leer más
                </summary>
                <p className="mt-2">{item.content}</p>
              </details>
            </ResourceCard>
          ))}
        </div>
      </Section>

      {/* CIERRE */}
      <Section>
        <div className="rounded-2xl border border-default bg-neutral-primary-soft p-6 max-w-3xl">
          <h3 className="text-xl font-semibold mb-2">
            Cuidarte es importante
          </h3>
          <p className="text-gray-700">
            Si sientes que el autocuidado no es suficiente o que tus emociones
            te sobrepasan, buscar apoyo profesional es un paso válido y valiente.
          </p>
        </div>
      </Section>

      <Footer />
      </PageTransition>

    </>
  );
}

export default Autocuidado;
