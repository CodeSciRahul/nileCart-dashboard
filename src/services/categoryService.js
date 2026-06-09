import { apiClient } from "../lib/api.js";

export const getCategories = () => apiClient.get("/categories");

export const createCategory = (payload) => apiClient.post("/categories", payload);

export const updateCategory = (id, payload) => apiClient.put(`/categories/${id}`, payload);

export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);
