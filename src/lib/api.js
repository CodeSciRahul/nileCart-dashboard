import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "lc_dashboard_token";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data || {};
    const status = error.response?.status;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    let message = data.message;

    if (!message) {
      if (!status && error.message === "Network Error") {
        message = "Unable to connect. Check your internet connection.";
      } else if (status === 401) {
        message = "Session expired. Please sign in again.";
      } else if (status === 403) {
        message = "You don't have permission to perform this action.";
      } else if (status === 404) {
        message = "Resource not found.";
      } else if (status >= 500) {
        message = "Server error. Please try again later.";
      } else {
        message = `Request failed (${status || "network"})`;
      }
    }

    const apiError = new Error(message);
    apiError.status = status;
    apiError.data = data;
    return Promise.reject(apiError);
  }
);
