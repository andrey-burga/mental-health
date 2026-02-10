import { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import ArticleModal from "../components/ArticleModal";
import PageTransition from "../components/PageTransition";

import { testimonials } from "../data/homeContent";

function Testimonial() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* CONTENIDO */}
        <main className="flex-grow">
          <Section title="Testimonios">
            <p className="max-w-2xl text-gray-700">
              Experiencias reales que reflejan procesos de crecimiento, sanación
              y bienestar emocional.
            </p>
          </Section>

          <Section>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <ArticlePreview
                  key={testimonial.id}
                  {...testimonial}
                  onClick={() => setSelectedTestimonial(testimonial)}
                />
              ))}
            </div>
          </Section>
        </main>

        {selectedTestimonial && (
          <ArticleModal
            article={selectedTestimonial}
            onClose={() => setSelectedTestimonial(null)}
          />
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Testimonial;
