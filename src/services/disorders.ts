import api from "./axios";
import { Disorder } from "../types/disorder";

export interface CreateDisorderInput {
  title: string;
  slug: string;
  description: string;
  category?: string;
}

export type UpdateDisorderInput = Partial<CreateDisorderInput>;

export interface AddSymptomInput {
  disorder_id: string;
  text: string;
}

export interface DisorderSymptom {
  id: string;
  text: string;
  disorder_id?: string;
}

// GET /api/disorders
export async function getDisorders(): Promise<Disorder[]> {
  const { data } = await api.get<Disorder[]>("/disorders");
  return data;
}

// GET /api/disorders/slug/{slug}
export async function getDisorderBySlug(slug: string): Promise<Disorder> {
  const { data } = await api.get<Disorder>(`/disorders/slug/${slug}`);
  return data;
}

// POST /api/disorders (admin)
export async function createDisorder(payload: CreateDisorderInput): Promise<Disorder> {
  const { data } = await api.post<Disorder>("/disorders", payload);
  return data;
}

// PATCH /api/disorders/{id} (admin)
export async function updateDisorder(
  id: string,
  payload: UpdateDisorderInput
): Promise<Disorder> {
  const { data } = await api.patch<Disorder>(`/disorders/${id}`, payload);
  return data;
}

// DELETE /api/disorders/{id} (admin)
export async function deleteDisorder(id: string): Promise<void> {
  await api.delete(`/disorders/${id}`);
}

// POST /api/disorders/symptoms (admin)
export async function addDisorderSymptom(
  payload: AddSymptomInput
): Promise<DisorderSymptom> {
  const { data } = await api.post<DisorderSymptom>("/disorders/symptoms", payload);
  return data;
}