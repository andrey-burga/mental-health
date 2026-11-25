import api from "./axios";
import { Testimonial, TestimonialInput, TestimonialStatus } from "../types/testimonial";

export type { Testimonial, TestimonialInput, TestimonialStatus };

export const testimonialService = {
  // GET: Obtener todos públicos o filtrados
  getAll: async (skip = 0, limit = 10): Promise<Testimonial[]> => {
    const { data } = await api.get<Testimonial[]>("/testimonials", {
      params: { skip, limit },
    });
    return data;
  },

  // GET: Obtener testimonios por estado editorial (admin)
  getByStatus: async (
    status: TestimonialStatus | "all" = "pending",
    skip = 0,
    limit = 100
  ): Promise<Testimonial[]> => {
    const { data } = await api.get<Testimonial[]>("/testimonials", {
      params: { status, skip, limit },
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

  // PATCH: Moderar estado editorial (admin)
  updateStatus: async (
    id: string,
    status: "approved" | "rejected"
  ): Promise<Testimonial> => {
    const { data } = await api.patch<Testimonial>(`/testimonials/${id}/status`, {
      status,
    });
    return data;
  },

  // DELETE: Eliminar
  delete: async (id: string): Promise<boolean> => {
    await api.delete(`/testimonials/${id}`);
    return true;
  },
};