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
  mentalHealthStats,
  pornImpactStats,
  articles,
} from "../data/homeContent";

import StatsCard from "../components/StatsCard";
import ArticleCard from "../components/ArticleCard";

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
      <Section title="Números que nos invitan a cuidar la mente">
        <p className="mb-8 text-gray-700 max-w-3xl">
          Comprender la magnitud de la salud mental ayuda a normalizar el
          cuidado emocional y a buscar apoyo a tiempo.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mentalHealthStats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-500 max-w-xl">
          *Datos con fines informativos. No sustituyen la evaluación de un
          profesional de la salud mental.*
        </p>
      </Section>

      <Section title="Trastornos comunes">
        <p className="mb-6 text-gray-700 max-w-3xl">
          Algunas dificultades de salud mental son más comunes de lo que
          imaginamos y pueden afectar a personas de cualquier edad. Identificar
          sus señales a tiempo es un paso clave para cuidar el bienestar
          emocional y buscar apoyo cuando sea necesario. A continuación, se
          presentan seis de los trastornos más frecuentes.
        </p>

        <div className="flex flex-wrap gap-4 p-4">
          {commonDisorders.map((item, index) => (
            <Warning key={index} title={item.title} text={item.text} />
          ))}
        </div>
      </Section>

      <Section title="Factores de riesgo para la salud mental">
        <p className="mb-6 text-gray-700 max-w-3xl">
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
              Cifras para tomar conciencia
            </h3>

            <p className="mb-8 text-gray-700 max-w-3xl">
              Estas cifras reflejan cómo el consumo de pornografía puede influir
              en la salud mental y emocional. Comprender su impacto ayuda a
              reconocer señales de alerta y a buscar apoyo a tiempo.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pornImpactStats.map((stat) => (
                <StatsCard key={stat.id} {...stat} />
              ))}
            </div>

            <p className="mt-6 text-xs text-gray-500 max-w-xl">
              *Datos con fines informativos y de concientización. No sustituyen
              la evaluación ni el acompañamiento de un profesional de la salud
              mental.*
            </p>
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
      <Section title="Artículos y reflexiones">
        <p className="mb-8 text-gray-700 max-w-2xl">
          Lecturas pensadas para comprender mejor la salud mental, reflexionar
          sobre el bienestar emocional y aprender a cuidarte.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default Home;
