import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";

import { pornographyResources, badHabitsResources } from "../data/homeContent";

function FactoresDeRiesgo() {
  return (
    <>
      <Header />

      {/* INTRO */}
      <Section title="Factores de riesgo para la salud mental">
        <p className="max-w-3xl text-gray-700">
          Algunas conductas y hábitos cotidianos pueden afectar la salud mental
          de manera progresiva. Conocer estos factores no busca generar culpa,
          sino promover una mayor conciencia y decisiones más saludables para el
          bienestar emocional.
        </p>
      </Section>

      {/* PORNOGRAFÍA */}
      <Section title={pornographyResources.title}>
        <div className="space-y-4 ">
          {pornographyResources.paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-2">
            Cifras para tomar conciencia
          </h3>
          <p class="mb-8 text-gray-700 max-w-3xl">
            Estas cifras reflejan cómo el consumo de pornografía puede influir
            en la salud mental y emocional. Comprender su impacto ayuda a
            reconocer señales de alerta y a buscar apoyo a tiempo.
          </p>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <article
              class="
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
      "
            >
              <p class="text-3xl font-semibold text-primary mb-2">93%</p>
              <h3 class="text-lg font-semibold text-heading mb-2">
                Exposición temprana
              </h3>
              <p class="text-sm leading-relaxed text-body">
                De los adolescentes varones han estado expuestos a este
                contenido antes de cumplir los 18 años.
              </p>
            </article>
            <article
              class="
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
      "
            >
              <p class="text-3xl font-semibold text-primary mb-2">Dopamina</p>
              <h3 class="text-lg font-semibold text-heading mb-2">
                Efecto químico
              </h3>
              <p class="text-sm leading-relaxed text-body">
                El consumo compulsivo satura el sistema de recompensa,
                dificultando el placer en actividades cotidianas.
              </p>
            </article>
            <article
              class="
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
      "
            >
              <p class="text-3xl font-semibold text-primary mb-2">
                1 de cada 3
              </p>
              <h3 class="text-lg font-semibold text-heading mb-2">
                Imagen corporal
              </h3>
              <p class="text-sm leading-relaxed text-body">
                Usuarios reportan sentir inseguridad sobre su propio cuerpo
                debido a estándares irreales y editados.
              </p>
            </article>
            <article
              class="
        rounded-2xl
        border border-default
        bg-neutral-primary-soft
        p-6
        shadow-xs
      "
            >
              <p class="text-3xl font-semibold text-primary mb-2">45%</p>
              <h3 class="text-lg font-semibold text-heading mb-2">
                Menos conexión
              </h3>
              <p class="text-sm leading-relaxed text-body">
                El consumo frecuente puede correlacionarse con una menor
                satisfacción emocional en parejas reales.
              </p>
            </article>
          </div>
          <p class="mt-6 text-xs text-gray-500 max-w-xl">
            *Datos con fines informativos y de concientización. No sustituyen la
            evaluación ni el acompañamiento de un profesional de la salud
            mental.*
          </p>
        </div>
      </Section>

      {/* MALOS HÁBITOS */}
      <Section title={badHabitsResources.title}>
        <div className="space-y-4 ">
          {badHabitsResources.paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </Section>

      {/* CIERRE */}
      <Section>
        <div className="rounded-2xl border border-default bg-neutral-primary-soft p-6 ">
          <h3 className="text-xl font-semibold mb-2">Un mensaje importante</h3>
          <p className="text-gray-700">
            Identificar factores de riesgo es un primer paso hacia el cuidado
            personal. Si sientes que alguno de estos aspectos está afectando
            significativamente tu bienestar emocional, buscar apoyo profesional
            o conversar con alguien de confianza puede marcar la diferencia.
          </p>
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default FactoresDeRiesgo;
