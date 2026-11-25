import api from "./axios";
import { BackendRole, NormalizedRole } from "../context/AuthContext";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: NormalizedRole | BackendRole | string;
  role_id?: string;
  created_at?: string;
}

export async function searchUsers(query = ""): Promise<ManagedUser[]> {
  const trimmed = query.trim();
  const { data } = await api.get<ManagedUser[]>("/users", {
    params: trimmed ? { q: trimmed } : undefined,
  });
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(
  userId: string,
  role: NormalizedRole
): Promise<ManagedUser> {
  const { data } = await api.patch<ManagedUser>(`/users/${userId}/role`, {
    role,
  });
  return data;
}
