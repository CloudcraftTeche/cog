"use client";

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

  const logout = useCallback(async () => {
    try {
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
