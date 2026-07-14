import api from "./axios";

interface RegisterData {
  name: string;
  email: string;
  role_id: string; // Puedes mandar un ID por defecto de rol 'user'
}

export async function registerUser(userData: any) {
  const { data } = await api.post("/auth/register", userData);
  return data;
}

export async function loginUser(loginData: any) {
  const { data } = await api.post("/auth/login", loginData);
  return data;
}