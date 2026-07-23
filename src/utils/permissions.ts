// utils/permissions.ts
import { User } from "../context/AuthContext";

export const canManageTestimonial = (user: User | null, author: any): boolean => {
  if (!user) return false; // Si no está autenticado, cero permisos
  if (user.role === "admin") return true; // El admin puede con todo

  // Extraer el ID del autor sin importar si viene como string u objeto
  const authorId = typeof author === "object" ? author?.id : author;

  return Boolean(user.id && authorId && user.id === authorId);
};