import { apiClient } from "../lib/api.js";

export const getSellerOrders = (params) => apiClient.get("/orders/seller", { params });

export const getSellerOrder = (id) => apiClient.get(`/orders/seller/${id}`);

export const updateSellerOrderStatus = (id, payload) =>
  apiClient.patch(`/orders/seller/${id}/status`, payload);
