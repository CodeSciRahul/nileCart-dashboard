import { apiClient } from "../lib/api.js";

/** Read-only category list for sellers (product forms, storefront). */
export const getCategories = (params) => apiClient.get("/categories", { params });
