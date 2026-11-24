// src/types/disorder.ts
export interface Disorder {
  id: string;
  slug: string;
  title: string;
  category?: string;
  description: string;
  symptoms: { id: string; text: string }[];
}
