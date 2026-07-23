import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  text: string;
  tag: string;
}

const MOODS = [
  { emoji: "😊", label: "Calmado" },
  { emoji: "🌿", label: "Agradecido" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😰", label: "Ansioso" },
  { emoji: "😤", label: "Frustrado" },
  { emoji: "✨", label: "Motivado" },
];

const PROMPTS = [
  "¿Qué fue lo mejor que te pasó hoy, por pequeño que sea?",
  "¿Qué pensamiento ha estado rondando por tu mente?",
  "¿Qué emoción estás intentando evitar o procesar?",
  "Escribe sobre algo por lo que estés agradecido/a hoy.",
];

export default function DiarioPage() {
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0].emoji);
  const [selectedTag, setSelectedTag] = useState("General");
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Cargar entradas guardadas desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("journal_entries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar entradas", e);
      }
    }
  }, []);

  // Guardar nueva entrada
  const handleSave = () => {
    if (!entry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: selectedMood,
      text: entry,
      tag: selectedTag,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("journal_entries", JSON.stringify(updatedEntries));
    
    // Limpiar input
    setEntry("");
  };

  // Eliminar entrada
  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("journal_entries", JSON.stringify(updated));
  };

  // Insertar prompt al escribir
  const handleUsePrompt = (promptText: string) => {
    setEntry((prev) => (prev ? `${prev}\n\n${promptText} ` : `${promptText} `));
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50/20 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Encabezado */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Expresión & Reflexión
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Diario de Emociones ✍️
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Escribir libera la carga mental. Tómate este espacio para plasmar tus pensamientos sin juicios.
                </p>
              </div>

              {/* Contenedor Principal de Escritura */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                
                {/* Selector de Ánimo */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    ¿Cómo te sientes en este momento?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setSelectedMood(m.emoji)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                          selectedMood === m.emoji
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompts Sugeridos */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">💡 Presiona una idea si no sabes qué escribir:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                    {PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUsePrompt(prompt)}
                        className="whitespace-nowrap px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área de Texto */}
                <textarea
                  rows={6}
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Escribe libremente aquí..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                />

                {/* Opciones y Guardado */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400">Etiqueta:</span>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Pensamientos">Pensamientos</option>
                      <option value="Gratitud">Gratitud</option>
                      <option value="Ansiedad">Ansiedad</option>
                      <option value="Logros">Logros</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={!entry.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-sm"
                  >
                    Guardar Entrada
                  </button>
                </div>
              </div>

              {/* Historial de Entradas */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📖</span> Tus entradas anteriores ({entries.length})
                </h3>

                {entries.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-400">
                      Aún no has guardado ninguna entrada. Tómate un momento para escribir la primera.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2 relative group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.mood}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {item.tag}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{item.date}</span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-red-500 text-xs transition-colors"
                              title="Eliminar entrada"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </Section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}