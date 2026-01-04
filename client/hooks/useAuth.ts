"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
const TOKEN_CHECK_INTERVAL = 24 * 60 * 60 * 1000; 
const TOKEN_REFRESH_THRESHOLD = 24 * 60 * 60 * 1000;

export function useAuth() {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVerifyingRef = useRef(false);
  const hasInitialized = useRef(false);
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return {
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
      };
    }
    const userData = localStorage.getItem("user");
    const tokenData = localStorage.getItem("accessToken");
    if (userData && tokenData) {
      try {
        return {
          user: JSON.parse(userData),
          token: tokenData,
          isLoading: true,
          isAuthenticated: true,
        };
      } catch {
        return {
          user: null,
          token: null,
          isLoading: true,
          isAuthenticated: false,
        };
      }
    }
    return {
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
    };
  });
  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiry");
    }
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);
  const setAuth = useCallback((user: User, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", token);
      const expiry = Date.now() + 15 * 60 * 1000;
      localStorage.setItem("tokenExpiry", expiry.toString());
    }
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);
  const verifyAndRefreshToken = useCallback(async () => {
    if (isVerifyingRef.current) return false;
    isVerifyingRef.current = true;
    try {
      const response = await api.get("/auth/verify");
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        setAuth(user, accessToken);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        clearAuth();
      }
      return false;
    } finally {
      isVerifyingRef.current = false;
    }
  }, [clearAuth, setAuth]);
  const checkTokenExpiry = useCallback(() => {
    if (typeof window === "undefined") return;
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (!tokenExpiry) return;
    const expiryTime = parseInt(tokenExpiry, 10);
    const timeUntilExpiry = expiryTime - Date.now();
    if (timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD) {
      verifyAndRefreshToken();
    }
  }, [verifyAndRefreshToken]);
  useEffect(() => {
    if (typeof window === "undefined" || hasInitialized.current) return;
    hasInitialized.current = true;
    const initAuth = async () => {
      const userData = localStorage.getItem("user");
      const tokenData = localStorage.getItem("accessToken");
      if (userData && tokenData) {
        const isValid = await verifyAndRefreshToken();
        if (!isValid) {
          clearAuth();
          router.replace("/login");
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, [clearAuth, router, verifyAndRefreshToken]);
  useEffect(() => {
    if (!authState.isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    checkTokenExpiry();
    intervalRef.current = setInterval(checkTokenExpiry, TOKEN_CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [authState.isAuthenticated, checkTokenExpiry]);
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      clearAuth();
      router.replace("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      clearAuth();
      router.replace("/login");
      toast.error("Error logging out, but you've been signed out locally");
    }
  }, [router, clearAuth]);
  const updateUser = useCallback((userData: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setAuthState((prev) => ({ ...prev, user: userData }));
  }, []);
  const refreshToken = useCallback(async () => {
    return await verifyAndRefreshToken();
  }, [verifyAndRefreshToken]);
  const authValue = useMemo(
    () => ({
      ...authState,
      logout,
      updateUser,
      clearAuth,
      refreshToken,
      setAuth,
    }),
    [authState, logout, updateUser, clearAuth, refreshToken, setAuth]
  );
  return authValue;
}
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}