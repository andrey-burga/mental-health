import Section from "../components/Section";
import Header from "../components/Header";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import Warning from "../components/Warning";
import {
  mentalHealthIntro,
  commonDisorders,
  helpResources,
} from "../data/homeContent";

function Home() {
  return (
    <>
      <Header />
      <Section>
        <h2 className="text-2xl font-semibold">
          Cuidar tu salud mental también es cuidarte
        </h2>
        <p className="mt-2 text-gray-700">
          Este espacio busca informar, acompañar y orientar sobre el bienestar
          emocional de forma clara y humana.
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

      <Section>
        <div className="flex flex-wrap gap-4 p-4">
          {helpResources.map((item, index) => (
            <ResourceCard
              key={index}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default Home;
