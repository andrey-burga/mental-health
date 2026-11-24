import api from "./axios";
import { Testimonial, TestimonialInput } from "../types/testimonial";
export type { Testimonial, TestimonialInput };
export const testimonialService = {
  // GET: Obtener todos (tipado con un array de Testimonial)
  getAll: async (skip = 0, limit = 10): Promise<Testimonial[]> => {
    const { data } = await api.get<Testimonial[]>("/testimonials", {
      params: { skip, limit },
    });
    return data;
  },

  // GET: Obtener por ID o Slug
  getOne: async (slugOrId: string): Promise<Testimonial> => {
    const { data } = await api.get<Testimonial>(`/testimonials/${slugOrId}`);
    return data;
  },

  // POST: Crear nuevo
  create: async (testimonialData: TestimonialInput): Promise<Testimonial> => {
    const { data } = await api.post<Testimonial>("/testimonials", testimonialData);
    return data;
  },

  // PUT: Editar existente
  update: async (id: string, testimonialData: Partial<TestimonialInput>): Promise<Testimonial> => {
    const { data } = await api.put<Testimonial>(`/testimonials/${id}`, testimonialData);
    return data;
  },

  // DELETE: Eliminar
  delete: async (id: string): Promise<boolean> => {
    await api.delete(`/testimonials/${id}`);
    return true;
  },
};