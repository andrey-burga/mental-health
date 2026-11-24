import { normalizeRole, NormalizedRole, User } from "../context/AuthContext";

export function getUserRole(user: User | null | undefined): NormalizedRole {
  if (!user) return "user";
  return normalizeRole(user.role ?? user.rawRole, user.role_id);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return getUserRole(user) === "admin";
}

export function isEditorialUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  return role === "admin" || role === "editor";
}

export const canManageTestimonial = (user: User | null, author: any): boolean => {
  if (!user) return false;
  if (isAdminUser(user)) return true;

  const authorId = typeof author === "object" ? author?.id : author;

  return Boolean(user.id && authorId && String(user.id) === String(authorId));
};

export const canManageArticle = (
  user: User | null,
  authorId?: string | null
): boolean => {
  if (!user) return false;
  if (isEditorialUser(user)) return true;

  return Boolean(user.id && authorId && String(authorId) === String(user.id));
};