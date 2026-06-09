import { apiClient, setStoredToken } from "../lib/api.js";
import { setStoredLoginType } from "../lib/authStorage.js";

const syncSession = async (endpoint, firebaseToken, loginType) => {
  const data = await apiClient.post(endpoint, { token: firebaseToken });

  if (data.token) {
    setStoredToken(data.token);
  }

  setStoredLoginType(loginType);
  return data;
};

export const registerSellerAccount = (firebaseToken) =>
  apiClient.post("/auth/seller/register", { token: firebaseToken });

export const sendSellerSignupOtp = (email) =>
  apiClient.post("/auth/seller/send-otp", { email });

export const verifySellerSignupOtp = (email, otp) =>
  apiClient.post("/auth/seller/verify-otp", { email, otp });

export const syncSellerBackendSession = (firebaseToken) =>
  syncSession("/auth/login/seller", firebaseToken, "seller");

export const syncAdminBackendSession = (firebaseToken) =>
  syncSession("/auth/login/admin", firebaseToken, "admin");

export const syncBackendSession = (firebaseToken, loginType = "seller") => {
  if (loginType === "admin") {
    return syncAdminBackendSession(firebaseToken);
  }
  return syncSellerBackendSession(firebaseToken);
};

export const fetchProfile = () => apiClient.get("/users/me");

export const updateUserProfile = (profile) => apiClient.put("/users/me", profile);

export const logoutFromBackend = () => apiClient.post("/auth/logout");
