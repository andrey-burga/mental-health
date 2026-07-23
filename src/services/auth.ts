import api from "./axios";

interface RegisterData {
  name: string;
  email: string;
  role_id: string;
}

export async function registerUser(userData: any) {
  const { data } = await api.post("/auth/register", userData);
  return data;
}

export async function loginUser(loginData: any) {
  const { data } = await api.post("/auth/login", loginData);
  return data;
}

// --- NUEVO: Solicitar recuperación de contraseña ---
export async function forgotPassword(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

// --- NUEVO: Confirmar restablecimiento de contraseña ---
export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword, // Coincide con ResetPasswordRequest en FastAPI
  });
  return data;
}

