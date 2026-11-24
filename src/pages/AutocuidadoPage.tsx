import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import {
  StoredHabit,
  HabitCategory,
  loadUserHabits,
  saveUserHabits,
  recordWellnessActivity,
} from "../utils/privacyStorage";

export default function AutocuidadoPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<StoredHabit[]>(() => loadUserHabits(user));

  const [newHabitText, setNewHabitText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>("Mental");
  const [filter, setFilter] = useState<string>("Todas");

  useEffect(() => {
    setHabits(loadUserHabits(user));
  }, [user]);

  const toggleHabit = (id: number) => {
    let becameCompleted = false;
    const updated = habits.map((h) => {
      if (h.id === id) {
        becameCompleted = !h.completed;
        return { ...h, completed: !h.completed };
      }
      return h;
    });

    setHabits(updated);
    saveUserHabits(user, updated);
    if (becameCompleted) {
      recordWellnessActivity(user);
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;

    const newHabit: StoredHabit = {
      id: Date.now(),
      text: newHabitText.trim(),
      completed: false,
      category: selectedCategory,
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    saveUserHabits(user, updated);
    recordWellnessActivity(user);
    setNewHabitText("");
  };

  const deleteHabit = (id: number) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    saveUserHabits(user, updated);
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercentage =
    habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const filteredHabits = habits.filter((h) =>
    filter === "Todas" ? true : h.category === filter
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-16 -z-0 flex justify-between overflow-hidden"
        >
          <div className="h-72 w-72 -translate-x-1/3 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
          <div className="h-72 w-72 translate-x-1/3 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/5" />
        </div>

        <Header />

        <main className="flex-grow relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
            {/* Encabezado */}
            <div className="space-y-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Espacio personal
                </p>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  ← Volver a Mi Espacio
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Autocuidado Diario
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                El autocuidado no es una obligación, es un gesto de amabilidad contigo mismo/a. Haz lo que puedas hoy.
              </p>
            </div>

            {/* Recordatorio sereno */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-start gap-3.5">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.9"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-white text-sm">
                  Recordatorio del día
                </h2>
                <p className="font-serif text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  “Avanzar despacio sigue siendo avanzar. Celebra los pequeños pasos.”
                </p>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-neutral-700 dark:text-neutral-300">
                  Tu progreso de hoy
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                  {completedCount} de {habits.length} ({progressPercentage}%)
                </span>
              </div>
              <div
                className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso diario de autocuidado"
              >
                <div
                  className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Formularios y Filtros */}
            <div className="space-y-4">
              <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="new-habit-input" className="sr-only">
                  Nuevo micro-hábito de autocuidado
                </label>
                <input
                  id="new-habit-input"
                  type="text"
                  value={newHabitText}
                  onChange={(e) => setNewHabitText(e.target.value)}
                  placeholder="¿Qué micro-hábito necesitas hoy?"
                  className="flex-grow px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <label htmlFor="habit-category-select" className="sr-only">
                  Categoría del hábito
                </label>
                <select
                  id="habit-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as HabitCategory)}
                  className="px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Físico">Físico</option>
                  <option value="Mental">Mental</option>
                  <option value="Emocional">Emocional</option>
                  <option value="Social">Social</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Agregar
                </button>
              </form>

              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {["Todas", "Físico", "Mental", "Emocional", "Social"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      filter === cat
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent font-semibold"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Hábitos */}
            <div className="space-y-2.5">
              {filteredHabits.length === 0 ? (
                <p className="text-center py-8 text-sm text-neutral-500 dark:text-neutral-400">
                  No hay hábitos en esta categoría. Agrega uno arriba cuando lo necesites.
                </p>
              ) : (
                filteredHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 hover:border-indigo-300 dark:hover:border-indigo-700/70 transition-colors shadow-2xs"
                  >
                    <label className="flex items-center gap-3.5 cursor-pointer flex-grow min-w-0">
                      <input
                        type="checkbox"
                        checked={habit.completed}
                        onChange={() => toggleHabit(habit.id)}
                        className="h-5 w-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-sm font-medium transition-all truncate ${
                          habit.completed
                            ? "line-through text-neutral-400 dark:text-neutral-500"
                            : "text-neutral-800 dark:text-neutral-200"
                        }`}
                      >
                        {habit.text}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium ml-auto shrink-0">
                        {habit.category}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity p-1.5 rounded-lg cursor-pointer shrink-0"
                      aria-label="Eliminar hábito"
                      title="Eliminar hábito"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}