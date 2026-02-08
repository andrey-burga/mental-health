import { NavLink } from "react-router-dom";

import Header from "../components/Header";
import Section from "../components/Section";
import Warning from "../components/Warning";
import Footer from "../components/Footer";

import { mentalHealthIntro, commonDisorders } from "../data/homeContent";

function SaludMental() {
  return (
    <>
      <Header />

      {/* INTRO */}
      <Section title="Salud mental">
        <p className="max-w-5xl text-gray-700">
          La salud mental forma parte fundamental del bienestar general. Afecta
          cómo pensamos, sentimos, actuamos y nos relacionamos con los demás.
          Hablar de salud mental es hablar de vida, equilibrio y cuidado
          personal.
        </p>
      </Section>

      {/* ¿QUÉ ES? */}
      <Section title={mentalHealthIntro.title}>
        <div className="space-y-4">
          {mentalHealthIntro.paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </Section>

      {/* IMPORTANCIA */}
      <Section title="¿Por qué es importante la salud mental?">
        <div className="space-y-4 text-gray-700">
          <p>
            La salud mental influye en la forma en que enfrentamos el estrés,
            tomamos decisiones, mantenemos relaciones y cuidamos de nosotros
            mismos. Descuidarla puede afectar la calidad de vida, el rendimiento
            académico o laboral y la salud física. Cuidarla, en cambio,
            fortalece la resiliencia y el bienestar emocional.
          </p>
        </div>
      </Section>

      {/* MITOS */}
      <Section title="Mitos y verdades sobre la salud mental">
        <ul className="list-disc pl-6 space-y-3 max-w-3xl text-gray-700">
          <li>
            <strong>Mito:</strong> Solo las personas “débiles” tienen problemas
            de salud mental.
            <br />
            <strong>Verdad:</strong> Cualquiera puede atravesar dificultades
            emocionales.
          </li>
          <li>
            <strong>Mito:</strong> Hablar de salud mental empeora los problemas.
            <br />
            <strong>Verdad:</strong> Hablarlo puede ser el primer paso para
            mejorar.
          </li>
          <li>
            <strong>Mito:</strong> Pedir ayuda es señal de fracaso.
            <br />
            <strong>Verdad:</strong> Pedir ayuda es un acto de valentía.
          </li>
        </ul>
      </Section>

      {/* TRASTORNOS – PREVIEW */}
      <Section title="Trastornos comunes de salud mental">
        <p className="mb-6 max-w-3xl text-gray-700">
          Algunas condiciones de salud mental son más frecuentes de lo que se
          suele pensar. Conocerlas ayuda a identificar señales de alerta y a
          buscar apoyo oportunamente.
        </p>
        <div className="flex flex-wrap gap-4">
          {commonDisorders.slice(0, 4).map((item, index) => (
            <Warning key={index} title={item.title} text={item.text} />
          ))}
        </div>
        <div className="mt-6">
          <NavLink
            to="/trastornos"
            className="text-primary font-medium hover:underline"
          >
            Ver todos los trastornos →
          </NavLink>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-2xl border border-default bg-neutral-primary-soft p-6 max-w-3xl">
          <h3 className="text-xl font-semibold mb-2">
            Seguir aprendiendo y cuidarte
          </h3>
          <p className="mb-4 text-gray-700">
            Informarte es un primer paso, pero no tienes que hacerlo solo.
            Existen recursos, profesionales y personas dispuestas a acompañarte.
          </p>

          <div className="flex gap-4 flex-wrap">
            <a
              href="/autocuidado"
              className="text-primary font-medium hover:underline"
            >
              Explorar autocuidado
            </a>
            <a
              href="/ayuda"
              className="text-primary font-medium hover:underline"
            >
              Buscar ayuda
            </a>
          </div>
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default SaludMental;
