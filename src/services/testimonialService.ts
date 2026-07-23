const API_BASE = "http://localhost:8000/api/testimonials";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface TestimonialInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
}

export const testimonialService = {
  // GET: Obtener todos
  getAll: async (skip = 0, limit = 10) => {
    const res = await fetch(`${API_BASE}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error("Error al cargar testimonios");
    return res.json();
  },

  // GET: Obtener por ID o Slug
  getOne: async (slugOrId: string) => {
    const res = await fetch(`${API_BASE}/${slugOrId}`);
    if (!res.ok) throw new Error("Testimonio no encontrado");
    return res.json();
  },

  // POST: Crear nuevo
  create: async (data: TestimonialInput) => {
    const res = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Error al crear el testimonio");
    }
    return res.json();
  },

  // PUT: Editar existente
  update: async (id: string, data: Partial<TestimonialInput>) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Error al actualizar testimonio");
    }
    return res.json();
  },

  // DELETE: Eliminar
  delete: async (id: string) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Error al eliminar el testimonio");
    }
    return true;
  },
};
