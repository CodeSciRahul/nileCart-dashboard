import { apiClient } from "../lib/api.js";

export const getAdminStats = () => apiClient.get("/admin/stats");

export const listSellers = (params) => apiClient.get("/admin/sellers", { params });

export const getSellerById = (id) => apiClient.get(`/admin/sellers/${id}`);

export const approveSeller = (id, payload) =>
  apiClient.patch(`/admin/sellers/${id}/approve`, payload);

export const rejectSeller = (id, payload) =>
  apiClient.patch(`/admin/sellers/${id}/reject`, payload);

export const deactivateSeller = (id) =>
  apiClient.patch(`/admin/sellers/${id}/deactivate`);

export const listUsers = (params) => apiClient.get("/admin/users", { params });

export const updateUserStatus = (id, payload) =>
  apiClient.patch(`/admin/users/${id}/status`, payload);

export const getAdminOrders = (params) => apiClient.get("/admin/orders", { params });

export const updateAdminOrderStatus = (id, payload) =>
  apiClient.patch(`/admin/orders/${id}/status`, payload);

export const listCoupons = () => apiClient.get("/admin/coupons");

export const createCoupon = (payload) => apiClient.post("/admin/coupons", payload);

export const updateCoupon = (id, payload) => apiClient.put(`/admin/coupons/${id}`, payload);

export const toggleCouponStatus = (id, payload) =>
  apiClient.patch(`/admin/coupons/${id}/status`, payload);

export const listBanners = () => apiClient.get("/admin/banners");

export const createBanner = (payload) => apiClient.post("/admin/banners", payload);

export const updateBanner = (id, payload) => apiClient.put(`/admin/banners/${id}`, payload);

export const toggleBannerStatus = (id, payload) =>
  apiClient.patch(`/admin/banners/${id}/status`, payload);

export const deleteBanner = (id) => apiClient.delete(`/admin/banners/${id}`);

export const listAdminCategories = (params) =>
  apiClient.get("/admin/categories", { params });

export const createAdminCategory = (payload) =>
  apiClient.post("/admin/categories", payload);

export const updateAdminCategory = (id, payload) =>
  apiClient.put(`/admin/categories/${id}`, payload);

export const deleteAdminCategory = (id) =>
  apiClient.delete(`/admin/categories/${id}`);

export const listAnnouncements = () => apiClient.get("/admin/announcements");

export const createAnnouncement = (payload) =>
  apiClient.post("/admin/announcements", payload);

export const updateAnnouncement = (id, payload) =>
  apiClient.put(`/admin/announcements/${id}`, payload);

export const deleteAnnouncement = (id) =>
  apiClient.delete(`/admin/announcements/${id}`);
