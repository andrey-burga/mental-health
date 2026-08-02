// services/reflections.services.ts
import { DailyReflection } from "../types/reflections";
import api from "./axios";

export const getDailyReflection = async (): Promise<DailyReflection | null> => {
  try {
    const { data } = await api.get<DailyReflection>("/reflections/today");
    return data;
  } catch (error) {
    console.error("Error fetching daily reflection:", error);
    return null;
  }
};
