import { apiClient, setStoredToken } from "../lib/api.js";
import { setStoredLoginType } from "../lib/authStorage.js";

const finalizeAuth = (data, loginType) => {
  if (data?.token) {
    setStoredToken(data.token);
  }
  if (loginType) {
    setStoredLoginType(loginType);
  }
  return data;
};

export const sendDashboardOtp = ({ email, loginType }) =>
  apiClient.post("/auth/dashboard/send-otp", { email, loginType });

export const verifyDashboardOtp = async ({ email, otp, loginType }) =>
  finalizeAuth(
    await apiClient.post("/auth/dashboard/verify-otp", { email, otp, loginType }),
    loginType
  );

export const registerSellerAccount = ({ email, password, signInProvider }) =>
  apiClient.post("/auth/seller/register", { email, password, signInProvider });

export const sendSellerSignupOtp = (email) =>
  apiClient.post("/auth/seller/send-otp", { email });

export const verifySellerSignupOtp = (email, otp) =>
  apiClient.post("/auth/seller/verify-otp", { email, otp });

// Legacy password-based login is intentionally not used by the dashboard UI anymore.
export const loginSeller = async ({ email, password }) =>
  finalizeAuth(await apiClient.post("/auth/login/seller", { email, password }), "seller");

export const loginAdmin = async ({ email, password, mobileNumber }) =>
  finalizeAuth(
    await apiClient.post("/auth/login/admin", { email, password, mobileNumber }),
    "admin"
  );

export const fetchProfile = () => apiClient.get("/users/me");

export const updateUserProfile = (profile) => apiClient.put("/users/me", profile);

export const logoutFromBackend = () => apiClient.post("/auth/logout");
