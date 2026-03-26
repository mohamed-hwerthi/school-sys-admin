import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { storage } from "@/utils/storage";
import { authApi } from "@/api/auth.api";
import type { AuthUser, LoginRequest, LoginResponse } from "@/types/auth";

interface TwoFactorPending {
  userId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorPending: TwoFactorPending | null;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  verify2FA: (userId: number, code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorPending, setTwoFactorPending] = useState<TwoFactorPending | null>(null);

  const isAuthenticated = !!user;

  // Verify token on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        if (!token) { setIsLoading(false); return; }

        const userData = await authApi.getMe();
        setUser(userData);
        await storage.setItem(USER_KEY, JSON.stringify(userData));
      } catch {
        await clearAuth();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const clearAuth = useCallback(async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
    await storage.deleteItem(USER_KEY);
    await storage.deleteItem("tenantId");
    setUser(null);
    setTwoFactorPending(null);
  }, []);

  const storeTokens = useCallback(async (response: LoginResponse) => {
    await storage.setItem(TOKEN_KEY, response.accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(response.user));
    if (response.user.tenantId) {
      await storage.setItem("tenantId", response.user.tenantId);
    }
    setUser(response.user);
    setTwoFactorPending(null);
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.login(data);
    if (response.twoFactorRequired && response.twoFactorUserId) {
      setTwoFactorPending({ userId: response.twoFactorUserId });
      return response;
    }
    await storeTokens(response);
    return response;
  }, [storeTokens]);

  const verify2FA = useCallback(async (userId: number, code: string) => {
    const response = await authApi.verify2FA({ userId, code });
    await storeTokens(response);
  }, [storeTokens]);

  const cancelTwoFactor = useCallback(() => {
    setTwoFactorPending(null);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    await clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, twoFactorPending, login, verify2FA, cancelTwoFactor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
