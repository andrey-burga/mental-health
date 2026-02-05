import Section from "../components/Section";
import Header from "../components/Header";
import ResourceCard from "../components/ResourceCard";
import Footer from "../components/Footer";
import Warning from "../components/Warning";
function Home() {
  return (
    <>
      <Header />
      <Section title="¿Qué es la salud mental?">
        <p>
          La salud mental es un estado de bienestar mental que permite a las
          personas hacer frente a los momentos de estrés de la vida, desarrollar
          todas sus habilidades, poder aprender y trabajar adecuadamente y
          contribuir a la mejora de su comunidad. Es parte fundamental de la
          salud y el bienestar que sustenta nuestras capacidades individuales y
          colectivas para tomar decisiones, establecer relaciones y dar forma al
          mundo en el que vivimos. La salud mental es, además, un derecho humano
          fundamental. Y un elemento esencial para el desarrollo personal,
          comunitario y socioeconómico. La salud mental es más que la mera
          ausencia de trastornos mentales. Se da en un proceso complejo, que
          cada persona experimenta de una manera diferente, con diversos grados
          de dificultad y angustia y resultados sociales y clínicos que pueden
          ser muy diferentes. Las afecciones de salud mental comprenden
          trastornos mentales y discapacidades psicosociales, así como otros
          estados mentales asociados a un alto grado de angustia, discapacidad
          funcional o riesgo de conducta autolesiva. Las personas que las
          padecen son más propensas a experimentar niveles más bajos de
          bienestar mental, aunque no siempre es necesariamente así. Los
          trastornos mentales y los trastornos relacionados con sustancias
          psicoactivas tienen una gran prevalencia en todo el mundo y son causas
          importantes de morbilidad, discapacidad y mortalidad prematura. Sin
          embargo, los recursos asignados por los países para abordar esta carga
          son insuficientes, se distribuyen de manera desigual y, a veces, se
          utilizan de manera ineficiente. En conjunto, esto ha provocado una
          brecha de tratamiento que, en muchos países, supera el 70%. El
          estigma, la exclusión social y la discriminación que rodean a las
          personas con trastornos mentales agravan la situación.
        </p>
      </Section>
      <Section title={"Trastornos comunes"}>
        <div className="flex flex-wrap gap-4 p-4">
          <Warning
            title="Ansiedad"
            text="Cambios de ánimo, aislamiento e insomnio pueden ser señales de alerta. Si notas estos síntomas de forma persistente, busca ayuda profesional."
          />
          <Warning
            title="Depresión"
            text="Si sientes que tus emociones te sobrepasan o afectan tu vida diaria, hablar con un profesional puede ayudarte a sentirte mejor."
          />
          <Warning
            title="Estrés crónico"
            text="Compartir lo que sientes con alguien de confianza puede aliviar la carga emocional y abrir la puerta a soluciones."
          />
        </div>
      </Section>
      <Section>
        <div className="flex flex-wrap gap-4 p-4">
          <ResourceCard
            title={"¿Qué hacer?"}
            description={
              "Reconocer cómo te sientes es el primer paso. Mantener rutinas, descansar bien, expresar tus emociones y evitar el aislamiento puede ayudar a mejorar tu bienestar emocional."
            }
          />
          <ResourceCard
            title={"¿Con quién ir?"}
            description={
              "Puedes acudir a un psicólogo, psiquiatra o profesional de la salud mental. También es importante apoyarte en familiares, amigos o personas de confianza."
            }
          />
          <ResourceCard
            title={"¿Cómo pedir ayuda?"}
            description={
              "Hablar con honestidad sobre lo que sientes es clave. Puedes empezar con alguien cercano o buscar servicios de atención psicológica, líneas de ayuda o centros de salud."
            }
          />
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default Home;
