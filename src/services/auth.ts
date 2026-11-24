import api from "./axios";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterData) {
  const { data } = await api.post("/auth/register", userData);
  return data;
}

export async function loginUser(loginData: LoginData) {
  const { data } = await api.post("/auth/login", loginData);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return data;
}
