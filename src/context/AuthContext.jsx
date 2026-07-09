import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setStoredToken, getStoredToken } from "../lib/api.js";
import {
  fetchProfile,
  logoutFromBackend,
} from "../services/authService.js";
import { getStoredLoginType, clearStoredLoginType } from "../lib/authStorage.js";
import { setUnauthorizedHandler } from "../lib/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setStoredToken(null);
    clearStoredLoginType();
  }, []);

  const establishBackendSession = useCallback(async (authCall, loginType) => {
    const type = loginType || getStoredLoginType();
    const data = await authCall(type);
    setUser(data.user);
    return data.user;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getStoredToken()) return null;
    try {
      const data = await fetchProfile();
      setUser(data.user);
      return data.user;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await logoutFromBackend();
    } catch {
      /* cookie may already be cleared */
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    (async () => {
      if (!getStoredToken()) {
        setUser(null);
        setLoading(false);
        return;
      }

      await refreshProfile();
      setLoading(false);
    })();
  }, [refreshProfile, clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      establishBackendSession,
      refreshProfile,
      logout,
      setUser,
    }),
    [user, loading, establishBackendSession, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
