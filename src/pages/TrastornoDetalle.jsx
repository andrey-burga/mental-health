import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";

import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import { getDisorderBySlug } from "../services/disorders";
import PageTransition from "../components/PageTransition";

function TrastornoDetalle() {
  const { slug } = useParams();
  const [disorder, setDisorder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDisorderBySlug(slug)
      .then(setDisorder)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="p-6">Cargando…</p>;
  }

  if (error || !disorder) {
    return (
      <>
        <PageTransition>
          <Header />
          <Section title="Trastorno no encontrado">
            <p className="p-6">
              Trastorno no encontrado.{" "}
              <NavLink to="/trastornos" className="text-primary underline">
                Volver
              </NavLink>
            </p>
          </Section>
          <Footer />
        </PageTransition>
      </>
    );
  }

  return (
    <>
      <PageTransition>
        <Header />

        <Section title={disorder.title}>
          <p className="max-w-3xl text-gray-700">{disorder.description}</p>
        </Section>

        <Section title="Síntomas frecuentes">
          <ul className="list-disc pl-6 space-y-2 max-w-3xl text-gray-700">
            {disorder.symptoms.map((symptom) => (
              <li key={symptom.id}>{symptom.text}</li>
            ))}
          </ul>
        </Section>

        <Section>
          <div className="rounded-2xl border border-default bg-neutral-primary-soft p-6 max-w-3xl">
            <h3 className="text-xl font-semibold mb-2">
              Un recordatorio importante
            </h3>
            <p className="mb-4 text-gray-700">
              La presencia de estos síntomas no constituye un diagnóstico. Solo
              un profesional de la salud mental puede realizar una evaluación
              adecuada.
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
      </PageTransition>
    </>
  );
}

export default TrastornoDetalle;
