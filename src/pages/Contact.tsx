import React, { useState, ChangeEvent, FormEvent } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    alert("Mensaje enviado correctamente 💙");

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow flex items-center justify-center">
          <Section>
            {/* Layout maestro en Grid de 2 columnas con orbe de fondo */}
            <div className="relative max-w-7xl mx-auto pt-12 pb-6 grid gap-12 lg:grid-cols-12 lg:items-start">
              
              {/* Orbe decorativo de fondo */}
              <div className="absolute top-1/3 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />

              {/* COLUMNA IZQUIERDA: Contexto Editorial (Hero + Mensaje Humano integrados) */}
              <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
                <div className="space-y-4">
                  <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Contacto directo
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
                    Contáctanos
                  </h1>
                  <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Si tienes preguntas, sugerencias o deseas compartir algo con nosotros, 
                    puedes escribirnos. Tu mensaje es leído con atención y respeto.
                  </p>
                </div>

                {/* Mensaje Humano transformado en un discreto bloque de confianza */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white/40 p-5 dark:border-neutral-800/60 dark:bg-neutral-900/20 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight mb-1">
                    Gracias por confiar
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                    Este proyecto busca crear un espacio informativo y humano sobre salud mental. 
                    Cada sugerencia nos ayuda a construir un entorno más seguro, accesible y útil para todos.
                  </p>
                </div>
              </div>

              {/* COLUMNA DERECHA: Formulario como Tarjeta Premium Flotante */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-neutral-200/60 bg-white/70 dark:border-neutral-800/60 dark:bg-neutral-900/40 p-6 sm:p-10 shadow-xl shadow-neutral-100/50 dark:shadow-none backdrop-blur-md">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Ej. Alejandro Delgado"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="type"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Mensaje
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                        placeholder="¿En qué podemos ayudarte o qué te gustaría compartir?"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:opacity-95 transition-all duration-150 transform active:scale-[0.99]"
                    >
                      Enviar mensaje
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Contact;