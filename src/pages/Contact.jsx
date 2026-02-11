import { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Formulario enviado:", formData);

    // Aquí luego conectamos backend
    alert("Mensaje enviado correctamente 💙");

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <Section>
        <h2 className="text-3xl font-semibold">
          Contáctanos
        </h2>
        <p className="mt-2 text-gray-700 max-w-2xl">
          Si tienes preguntas, sugerencias o deseas compartir algo,
          puedes escribirnos. Tu mensaje es importante.
        </p>
      </Section>

      {/* FORMULARIO */}
      <Section>
        <div className="max-w-2xl mx-auto rounded-2xl border border-default bg-neutral-primary-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-default px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-default px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mensaje
              </label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-default px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:opacity-90 transition"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </Section>

      {/* MENSAJE HUMANO */}
      <Section>
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">
            Gracias por confiar
          </h3>
          <p className="text-gray-700">
            Este proyecto busca crear un espacio informativo y humano
            sobre salud mental. Tu aporte ayuda a mejorar y crecer.
          </p>
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default Contact;
