
// 1. Interfaz para el objeto que viene de la base de datos (con ID y fechas)
export interface Testimonial extends TestimonialInput {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// 2. Interfaz para la entrada (haciendo el slug opcional si el backend lo autogenera)
export interface TestimonialInput {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
}
