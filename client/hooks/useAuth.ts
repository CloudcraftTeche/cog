"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
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

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Initialize auth from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const userData = localStorage.getItem("user");
      const tokenData = localStorage.getItem("accessToken");

      if (userData && tokenData) {
        const parsedUser: User = JSON.parse(userData);
        setAuthState({
          user: parsedUser,
          token: tokenData,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  // Token verification
  useEffect(() => {
    if (typeof window === "undefined") return;

    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await api.get("/auth/verify", { withCredentials: true });
        if (res.data.success) {
          const { user, accessToken } = res.data;

          // Only update state if data changed
          setAuthState((prev) => {
            if (
              prev.token === accessToken &&
              JSON.stringify(prev.user) === JSON.stringify(user)
            ) {
              return prev; // prevent unnecessary re-render
            }
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
            return {
              user,
              token: accessToken,
              isLoading: false,
              isAuthenticated: true,
            };
          });
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    };

    verifyToken();
    const interval = setInterval(verifyToken, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clearAuth]);

  const logout = useCallback(async () => {
    try {
      await api.get("/auth/logout");
      clearAuth();
      router.replace("/login");
      toast.success("Logged out successfully");
    } catch {
      clearAuth();
      router.replace("/login");
      toast.error("Error logging out");
    }
  }, [router, clearAuth]);

  const updateUser = useCallback((userData: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setAuthState((prev) => ({ ...prev, user: userData }));
  }, []);

  return {
    ...authState,
    logout,
    updateUser,
    clearAuth,
  };
}
