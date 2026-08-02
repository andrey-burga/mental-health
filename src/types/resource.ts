export interface ResourceType {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  category: string;
  published_at: string;
  author_id?: string | null;
}
