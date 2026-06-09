const LOGIN_TYPE_KEY = "lc_dashboard_login_type";

export const getStoredLoginType = () =>
  sessionStorage.getItem(LOGIN_TYPE_KEY) || "seller";

export const setStoredLoginType = (type) => {
  sessionStorage.setItem(LOGIN_TYPE_KEY, type);
};

export const clearStoredLoginType = () => {
  sessionStorage.removeItem(LOGIN_TYPE_KEY);
};
