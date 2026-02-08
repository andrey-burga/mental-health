import { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import ArticleModal from "../components/ArticleModal";

import { articlesDetails } from "../data/homeContent";

function Articulos() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <>
      <Header />

      <Section title="Artículos y reflexiones">
        <p className="max-w-2xl text-gray-700">
          Lecturas pensadas para reflexionar, comprender la salud mental y
          fortalecer el bienestar emocional.
        </p>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articlesDetails.map((article) => (
            <ArticlePreview
              key={article.id}
              {...article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      </Section>

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <Footer />
    </>
  );
}

export default Articulos;
