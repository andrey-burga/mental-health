import { ResourceType } from "../types/resource";
import api from "./axios";

export async function getArticles(): Promise<ResourceType[]> {
  const { data } = await api.get<ResourceType[]>("/articles");
  return data;
}

export async function getArticleBySlug(slug: string): Promise<ResourceType> {
  const { data } = await api.get<ResourceType>(`/articles/slug/${slug}`);
  return data;
}

export async function deleteArticle(id: string, token: string): Promise<void> {
  await api.delete(`/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createArticle(formData: any, token: string): Promise<ResourceType> {
  const { data } = await api.post<ResourceType>("/articles", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function updateArticle(id: string, formData: any, token: string): Promise<ResourceType> {
  const { data } = await api.patch<ResourceType>(`/articles/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}