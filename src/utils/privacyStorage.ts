import { User } from "../context/AuthContext";

export interface JournalEntry {
  id: string;
  date: string;
  createdAtISO?: string;
  mood: string;
  text: string;
  tag: string;
  ephemeral?: boolean;
}

export type HabitCategory = "Físico" | "Mental" | "Emocional" | "Social";

export interface StoredHabit {
  id: number;
  text: string;
  completed: boolean;
  category: HabitCategory;
}

export const DEFAULT_HABITS: StoredHabit[] = [
  { id: 1, text: "Beber un vaso de agua al despertar", completed: false, category: "Físico" },
  { id: 2, text: "Tomar 5 minutos de estiramiento", completed: false, category: "Físico" },
  { id: 3, text: "Escribir 3 cosas por las que estoy agradecido/a", completed: false, category: "Emocional" },
  { id: 4, text: "Desconectar pantallas 30 min antes de dormir", completed: false, category: "Mental" },
];

export function getUserStorageIdentifier(user: User | null): string {
  if (user?.id) return user.id;
  if (user?.email) return user.email.toLowerCase().trim();
  return "anonymous";
}

export function getJournalStorageKey(user: User | null): string {
  return `journal_entries_${getUserStorageIdentifier(user)}`;
}

export function getEphemeralPrefKey(user: User | null): string {
  return `journal_ephemeral_mode_${getUserStorageIdentifier(user)}`;
}

export function getHabitsStorageKey(user: User | null): string {
  return `autocuidado_habits_${getUserStorageIdentifier(user)}`;
}

export function getActivityDatesKey(user: User | null): string {
  return `wellness_activity_dates_${getUserStorageIdentifier(user)}`;
}

function getLocalDateStamp(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function recordWellnessActivity(user: User | null, dateStamp = getLocalDateStamp()): void {
  try {
    const key = getActivityDatesKey(user);
    const raw = localStorage.getItem(key);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!dates.includes(dateStamp)) {
      dates.push(dateStamp);
      localStorage.setItem(key, JSON.stringify(dates));
    }
  } catch {
    // Ignorar errores de storage
  }
}

export function loadUserHabits(user: User | null): StoredHabit[] {
  try {
    const key = getHabitsStorageKey(user);
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveUserHabits(user: User | null, habits: StoredHabit[]): void {
  try {
    localStorage.setItem(getHabitsStorageKey(user), JSON.stringify(habits));
  } catch (err) {
    console.error("No se pudieron guardar los hábitos locales:", err);
  }
}

export function loadUserJournalEntries(user: User | null): JournalEntry[] {
  try {
    const key = getJournalStorageKey(user);
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserJournalEntries(
  user: User | null,
  entries: JournalEntry[]
): void {
  try {
    const key = getJournalStorageKey(user);
    const persistentEntries = entries.filter((e) => !e.ephemeral);
    localStorage.setItem(key, JSON.stringify(persistentEntries));
  } catch (err) {
    console.error("No se pudieron guardar las entradas locales:", err);
  }
}

export interface WellnessStreakSummary {
  streakDays: number;
  isFirstDay: boolean;
  totalEntries: number;
  completedHabitsCount: number;
}

export function calculateWellnessStreak(user: User | null): WellnessStreakSummary {
  const entries = loadUserJournalEntries(user);
  const habits = loadUserHabits(user);
  const completedHabitsCount = habits.filter((h) => h.completed).length;

  const activeDatesSet = new Set<string>();
  try {
    const rawDates = localStorage.getItem(getActivityDatesKey(user));
    if (rawDates) {
      const parsed: string[] = JSON.parse(rawDates);
      parsed.forEach((d) => activeDatesSet.add(d));
    }
  } catch {
    // Ignorar errores de parseo
  }

  entries.forEach((entry) => {
    if (entry.createdAtISO) {
      activeDatesSet.add(getLocalDateStamp(new Date(entry.createdAtISO)));
    }
  });

  // Contar días consecutivos hacia atrás empezando desde hoy (o desde ayer si hoy aún no registra)
  let streakDays = 0;
  const cursor = new Date();
  const todayStamp = getLocalDateStamp(cursor);

  if (!activeDatesSet.has(todayStamp)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDatesSet.has(getLocalDateStamp(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    streakDays,
    isFirstDay: streakDays === 0 && entries.length === 0 && completedHabitsCount === 0,
    totalEntries: entries.length,
    completedHabitsCount,
  };
}

export function clearUserLocalData(user: User | null): void {
  try {
    localStorage.removeItem(getJournalStorageKey(user));
    localStorage.removeItem(getEphemeralPrefKey(user));
    localStorage.removeItem(getHabitsStorageKey(user));
    localStorage.removeItem(getActivityDatesKey(user));
    // Limpiar también la clave global heredada si existiera para proteger privacidad
    localStorage.removeItem("journal_entries");
  } catch (err) {
    console.error("Error al limpiar datos locales:", err);
  }
}

function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportJournalAsJson(
  entries: JournalEntry[],
  user: User | null
): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    account: user?.name || "Usuario",
    totalEntries: entries.length,
    entries,
  };
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerFileDownload(
    JSON.stringify(payload, null, 2),
    `diario-bienestar-${dateStamp}.json`,
    "application/json;charset=utf-8"
  );
}

export function exportJournalAsTxt(
  entries: JournalEntry[],
  user: User | null
): void {
  const header = [
    "==========================================",
    "TU ESPACIO SEGURO — EXPORTACIÓN DE DIARIO",
    `Persona: ${user?.name || "Usuario"}`,
    `Fecha de exportación: ${new Date().toLocaleString("es-ES")}`,
    `Total de entradas: ${entries.length}`,
    "==========================================",
    "",
  ].join("\n");

  const body =
    entries.length === 0
      ? "No hay entradas registradas actualmente.\n"
      : entries
          .map(
            (e, idx) =>
              `#${idx + 1} | ${e.date} | Ánimo: ${e.mood} | Etiqueta: ${e.tag}${
                e.ephemeral ? " [Modo Efímero]" : ""
              }\n${"-".repeat(42)}\n${e.text}\n`
          )
          .join("\n");

  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerFileDownload(
    `${header}${body}`,
    `diario-bienestar-${dateStamp}.txt`,
    "text/plain;charset=utf-8"
  );
}
