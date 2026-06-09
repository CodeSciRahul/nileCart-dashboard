import { apiClient } from "../lib/api.js";

export const applyForSeller = (payload) => apiClient.post("/sellers/apply", payload);

export const getMySellerProfile = () => apiClient.get("/sellers/me/profile");

export const updateMySellerProfile = (payload) =>
  apiClient.patch("/sellers/me/profile", payload);

export const getSellerStats = () => apiClient.get("/sellers/me/stats");
