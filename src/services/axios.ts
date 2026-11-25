import axios, { type InternalAxiosRequestConfig } from "axios";
import { mockApiAdapter } from "./mockApi";

const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();
const apiUrl = rawApiUrl.replace(/\/+$/, "");

// Si no hay URL configurada o apunta al antiguo servicio inactivo, usamos mockApiAdapter directamente
const useMockDirectly =
  !apiUrl || /mental-health-api-tjys\.onrender\.com/i.test(apiUrl);

export function isMockBackendMode(): boolean {
  return useMockDirectly;
}

const api = axios.create({
  baseURL: useMockDirectly ? undefined : apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  ...(useMockDirectly ? { adapter: mockApiAdapter } : {}),
});

function getValidStoredToken(): string | null {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  return trimmed;
}

function isPublicReadRoute(config?: InternalAxiosRequestConfig): boolean {
  if (!config) return false;
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") return false;
  const url = String(config.url || "");
  return (
    url.startsWith("/articles") ||
    url.startsWith("/disorders") ||
    url.startsWith("/testimonials") ||
    url.startsWith("/reflections")
  );
}

// Interceptor para inyectar el token Bearer en cada petición
api.interceptors.request.use(
  (config) => {
    const token = getValidStoredToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar sesiones inválidas (401) y respaldo local en errores de red/CORS de lectura pública
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as
      | (InternalAxiosRequestConfig & { _retriedMock?: boolean })
      | undefined;

    if (config && !config._retriedMock && isPublicReadRoute(config)) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      const isCorsBlocked =
        status === 403 && typeof detail === "string" && /cors/i.test(detail);
      const isNetworkOrCors =
        !error?.response ||
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        isCorsBlocked ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (isNetworkOrCors) {
        config._retriedMock = true;
        return mockApiAdapter(config);
      }
    }

    if (error.response && error.response.status === 401) {
      const requestUrl = String(error.config?.url || "");
      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/forgot-password") ||
        requestUrl.includes("/auth/reset-password") ||
        requestUrl.includes("/auth/me");

      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;