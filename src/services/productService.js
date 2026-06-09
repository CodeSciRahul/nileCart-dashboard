import { apiClient } from "../lib/api.js";

export const getMyProducts = (params) => apiClient.get("/products/mine", { params });

export const createProduct = (payload) => apiClient.post("/products", payload);

export const updateProduct = (id, payload) => apiClient.put(`/products/${id}`, payload);

export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
