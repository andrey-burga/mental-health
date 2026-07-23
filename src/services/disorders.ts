import api from "./axios"; // 👈 Importamos nuestra instancia centralizada
import { Disorder } from "../types/disorder";

// GET /api/disorders (FastAPI tiene este endpoint en "/api/disorders")
export async function getDisorders(): Promise<Disorder[]> {
  // Axios ya resuelve la respuesta a JSON automáticamente y la guarda en '.data'
  const { data } = await api.get<Disorder[]>("/disorders");
  return data;
}

// GET /api/disorders/slug/{slug} (FastAPI lo tiene en "/api/disorders/slug/{slug}")
export async function getDisorderBySlug(slug: string): Promise<Disorder> {
  const { data } = await api.get<Disorder>(`/disorders/slug/${slug}`);
  return data;
}