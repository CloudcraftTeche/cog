"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

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

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = () => {
      try {
        const userData = localStorage.getItem("user");
        const tokenData = localStorage.getItem("accessToken");

        if (userData && tokenData) {
          const parsedUser = JSON.parse(userData);
          setAuthState({
            user: parsedUser,
            token: tokenData,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await api.get("/auth/verify");
        if (res.data.success) {
          const { user, accessToken } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          setAuthState({
            user,
            token: accessToken,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        clearAuth();
      }
    };

    verifyToken();

    const interval = setInterval(verifyToken, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.get("/auth/logout");
      clearAuth();
      router.replace("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      clearAuth();
      router.replace("/login");
      toast.error("Error logging out");
    }
  }, [router, clearAuth]);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setAuthState((prev) => ({
      ...prev,
      user: userData,
    }));
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    logout,
    updateUser,
    clearAuth,
  };
}
