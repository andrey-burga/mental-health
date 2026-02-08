import Header from "../components/Header";
import Section from "../components/Section";
import ResourceCard from "../components/ResourceCard";
import ArticleCard from "../components/ArticleCard";
import StatsCard from "../components/StatsCard";
import Footer from "../components/Footer";

import {
  mentalHealthIntro,
  wellbeingResources,
  mentalHealthStats,
  articles,
} from "../data/homeContent";

function Home() {
  return (
    <>
      <Header />

      {/* HERO */}
      <Section>
        <h2 className="text-3xl font-semibold">
          Tu bienestar emocional importa
        </h2>
        <p className="mt-2 text-gray-700 max-w-2xl">
          Información clara y accesible sobre salud mental, autocuidado
          y recursos de ayuda para acompañarte cuando lo necesites.
        </p>
      </Section>

      {/* INTRO BREVE */}
      <Section title={mentalHealthIntro.title}>
        <p className="max-w-3xl">
          {mentalHealthIntro.paragraphs[0]}
        </p>
      </Section>

      {/* STATS */}
      <Section title="La salud mental en cifras">
        <p className="mb-8 text-gray-700 max-w-2xl">
          Comprender la magnitud de la salud mental ayuda a normalizar
          el cuidado emocional y a buscar apoyo a tiempo.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mentalHealthStats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>
      </Section>

      {/* AUTOCUIDADO – PREVIEW */}
      <Section title="Autocuidado y bienestar">
        <p className="mb-8 text-gray-700 max-w-2xl">
          Pequeñas acciones cotidianas pueden tener un impacto positivo
          en la salud mental.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wellbeingResources.slice(0, 3).map((item) => (
            <ResourceCard
              key={item.id}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </Section>

      {/* ARTÍCULOS – PREVIEW */}
      <Section title="Artículos y reflexiones">
        <p className="mb-8 text-gray-700 max-w-2xl">
          Lecturas pensadas para comprender mejor la salud mental
          y fortalecer tu bienestar emocional.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </Section>

      {/* CTA AYUDA */}
      <Section>
        <div className="rounded-2xl border border-default bg-neutral-primary-soft p-8 text-center">
          <h3 className="text-2xl font-semibold mb-2">
            No tienes que hacerlo solo
          </h3>
          <p className="mb-6 text-gray-700 max-w-xl mx-auto">
            Buscar ayuda es una decisión valiente. Existen recursos y
            personas dispuestas a acompañarte.
          </p>

          <a
            href="/ayuda"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-white font-medium hover:opacity-90 transition"
          >
            Buscar ayuda
          </a>
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default Home;
