import Header from "../components/Header";
import Section from "../components/Section";
import Warning from "../components/Warning";
import Footer from "../components/Footer";

import { commonDisorders } from "../data/homeContent";

function Trastornos() {
  return (
    <>
      <Header />

      {/* INTRO */}
      <Section title="Trastornos de salud mental">
        <p className="max-w-3xl text-gray-700">
          Los trastornos de salud mental son condiciones que afectan la forma en
          que una persona piensa, siente, se comporta o se relaciona con los
          demás. Son más comunes de lo que suele creerse y pueden afectar a
          personas de todas las edades.
        </p>
      </Section>

      {/* LISTADO */}
      <Section title="Trastornos más comunes">
        <p className="mb-6 max-w-3xl text-gray-700">
          Conocer estos trastornos no significa diagnosticarse, sino reconocer
          señales que pueden indicar la necesidad de apoyo profesional.
        </p>

        <div className="flex flex-wrap gap-4">
          {commonDisorders.map((item, index) => (
            <Warning
              key={index}
              title={item.title}
              text={item.text}
              slug={item.slug}
            />
          ))}
        </div>
      </Section>

      {/* SEÑALES DE ALERTA */}
      <Section title="Señales de alerta">
        <ul className="list-disc pl-6 space-y-3 max-w-3xl text-gray-700">
          <li>Cambios persistentes en el estado de ánimo</li>
          <li>Dificultad para dormir o dormir en exceso</li>
          <li>Aislamiento social o pérdida de interés</li>
          <li>Problemas de concentración o memoria</li>
          <li>Sensación constante de angustia o desesperanza</li>
        </ul>

        <p className="mt-4 max-w-3xl text-gray-700">
          Si estas señales se mantienen en el tiempo o interfieren con la vida
          diaria, es recomendable buscar orientación profesional.
        </p>
      </Section>

      {/* MENSAJE FINAL */}
      <Section>
        <div className="rounded-2xl border border-default bg-neutral-primary-soft p-6 max-w-3xl">
          <h3 className="text-xl font-semibold mb-2">Un mensaje importante</h3>
          <p className="mb-4 text-gray-700">
            Tener un trastorno de salud mental no define a una persona. Con
            acompañamiento adecuado, muchas personas logran mejorar su bienestar
            emocional y su calidad de vida.
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

export default Trastornos;
