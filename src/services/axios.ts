import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Tu URL base centralizada
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (token) {
      // Adjuntamos el token usando el esquema estándar Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar tokens expirados o inválidos (Error 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el backend nos dice que el token ya no es válido,
      // limpiamos el almacenamiento local y redirigimos al login.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;