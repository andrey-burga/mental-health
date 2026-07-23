import React, { useState } from "react";
import Header from "../components/Header";
import Section from "../components/Section";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

type Category = "Físico" | "Mental" | "Emocional" | "Social";

interface Habit {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
}

export default function AutocuidadoPage() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, text: "Beber un vaso de agua al despertar", completed: true, category: "Físico" },
    { id: 2, text: "Tomar 5 minutos de estiramiento", completed: false, category: "Físico" },
    { id: 3, text: "Escribir 3 cosas por las que estoy agradecido/a", completed: false, category: "Emocional" },
    { id: 4, text: "Desconectar pantallas 30 min antes de dormir", completed: false, category: "Mental" },
  ]);

  const [newHabitText, setNewHabitText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Mental");
  const [filter, setFilter] = useState<string>("Todas");

  // Toggle completar hábito
  const toggleHabit = (id: number) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)));
  };

  // Agregar nuevo hábito
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;

    const newHabit: Habit = {
      id: Date.now(),
      text: newHabitText,
      completed: false,
      category: selectedCategory,
    };

    setHabits([...habits, newHabit]);
    setNewHabitText("");
  };

  // Eliminar hábito
  const deleteHabit = (id: number) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  // Cálculos de progreso
  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Filtrado de hábitos
  const filteredHabits = habits.filter((h) => (filter === "Todas" ? true : h.category === filter));

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-gray-100 transition-colors duration-300">
        <Header />

        <main className="flex-grow">
          <Section>
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Encabezado */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                  Espacio Personal
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Rutinas de Autocuidado 🌱
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Recuerda: el autocuidado no es una obligación, es un gesto de amabilidad contigo mismo/a. Haz lo que puedas hoy.
                </p>
              </div>

              {/* Tarjeta de Afirmación / Mensaje Cálido */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-4">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm">
                    Recordatorio del día
                  </h4>
                  <p className="text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300/80 mt-1">
                    "Avanzar despacio sigue siendo avanzar. Celebra los pequeños pasos."
                  </p>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Tu progreso de hoy</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {completedCount} de {habits.length} ({progressPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Formularios y Filtros */}
              <div className="space-y-4">
                {/* Formulario para Agregar Hábitos */}
                <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newHabitText}
                    onChange={(e) => setNewHabitText(e.target.value)}
                    placeholder="¿Qué micro-hábitat necesitas hoy?"
                    className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Físico">💪 Físico</option>
                    <option value="Mental">🧠 Mental</option>
                    <option value="Emocional">💖 Emocional</option>
                    <option value="Social">🤝 Social</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Agregar
                  </button>
                </form>

                {/* Filtros por Categoría */}
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {["Todas", "Físico", "Mental", "Emocional", "Social"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        filter === cat
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-semibold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Hábitos */}
              <div className="space-y-3">
                {filteredHabits.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-400">
                    No hay hábitos en esta categoría. ¡Agrega uno arriba!
                  </p>
                ) : (
                  filteredHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/40 transition-all shadow-2xs"
                    >
                      <div
                        onClick={() => toggleHabit(habit.id)}
                        className="flex items-center gap-3.5 cursor-pointer flex-grow"
                      >
                        <input
                          type="checkbox"
                          checked={habit.completed}
                          onChange={() => {}} // Manejado por el div contenedor
                          className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                        />
                        <span
                          className={`text-sm font-medium transition-all ${
                            habit.completed
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {habit.text}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold ml-2">
                          {habit.category}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 text-xs"
                        title="Eliminar hábito"
                      >
                        ✕
                      </button>
                    </div>
                  ))
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