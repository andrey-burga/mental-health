import Section from "../components/Section";
import Header from "../components/Header";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import Warning from "../components/Warning";
import {
  mentalHealthIntro,
  commonDisorders,
  helpResources,
  pornographyResources,
  badHabitsResources,
  wellbeingResources,
} from "../data/homeContent";

function Home() {
  return (
    <>
      <Header />
      <Section>
        <h2 className="text-3xl font-semibold">
          Tu bienestar emocional importa
        </h2>
        <p className="mt-2 text-gray-700">
          Aquí encontrarás información clara sobre salud mental, trastornos
          comunes y recursos de ayuda para acompañarte cuando lo necesites.
        </p>
      </Section>

      <Section title={mentalHealthIntro.title}>
        {mentalHealthIntro.paragraphs.map((text, index) => (
          <p key={index} className="mb-4">
            {text}
          </p>
        ))}
      </Section>

      <Section title="Trastornos comunes">
        <div className="flex flex-wrap gap-4 p-4">
          {commonDisorders.map((item, index) => (
            <Warning key={index} title={item.title} text={item.text} />
          ))}
        </div>
      </Section>

      <Section title="Factores de riesgo para la salud mental">
        <p className="mb-6 text-gray-700">
          Algunas conductas y hábitos cotidianos pueden afectar la salud mental
          de forma progresiva. Conocerlos permite tomar decisiones más
          conscientes sobre el propio bienestar.
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {pornographyResources.title}
            </h3>
            {pornographyResources.paragraphs.map((text, index) => (
              <p key={index} className="mb-4">
                {text}
              </p>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {badHabitsResources.title}
            </h3>
            {badHabitsResources.paragraphs.map((text, index) => (
              <p key={index} className="mb-4">
                {text}
              </p>
            ))}
          </div>
        </div>
      </Section>

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

      <Section title="En desarrollo">
        <p className="mb-6 text-gray-700">
          //////////////////////////////////////////////////////
        </p>
      </Section>
      <Section title="Testimonios">
        <p className="mb-6 text-gray-700">
          //////////////////////////////////////////////////////
        </p>
        <div>
          <p>Mi testimonio y lo que he vivido</p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {helpResources.map((item, index) => (
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

      <Footer />
    </>
  );
}

export default Home;
