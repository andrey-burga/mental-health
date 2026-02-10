import { Disorder } from "../types/disorder";

const API_URL = import.meta.env.VITE_API_URL;

export async function getDisorders(): Promise<Disorder[]> {
  const res = await fetch(`${API_URL}/disorders`);
  if (!res.ok) throw new Error("Error fetching disorders");
  return (await res.json()) as Disorder[];
}

export async function getDisorderBySlug(slug: string): Promise<Disorder> {
  const res = await fetch(`${API_URL}/disorders/${slug}`);
  if (!res.ok) throw new Error("Error fetching disorder");
  return res.json();
}
