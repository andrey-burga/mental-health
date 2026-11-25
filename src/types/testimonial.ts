export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface TestimonialAuthor {
  id?: string;
  name?: string;
  email?: string;
  role?: string | { id?: string; name?: string };
}

export interface TestimonialInput {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
}

export interface Testimonial extends TestimonialInput {
  id: string;
  status?: TestimonialStatus;
  category?: string;
  author?: TestimonialAuthor | string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}
