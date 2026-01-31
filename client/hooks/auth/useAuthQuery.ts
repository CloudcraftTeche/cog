import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { authStorage } from "@/utils/auth/auth-storage";
import { User, AuthResponse } from "@/types/auth/auth";

const AUTH_QUERY_KEY = ["auth", "verify"] as const;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useAuthQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialUser = authStorage.getUser();
  const initialToken = authStorage.getToken();

  const verifyQuery = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await api.get<AuthResponse>("/auth/verify");
        if (response.data.success) {
          const { user, accessToken } = response.data.data;
          authStorage.setAuth(user, accessToken);
          return user;
        }
        return null;
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          authStorage.clearAuth();
        }
        return null;
      }
    },
    enabled: !!initialToken,
    staleTime: STALE_TIME,
    retry: 1,
    initialData: initialUser || undefined,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      authStorage.clearAuth();
      queryClient.clear();
      router.replace("/login");
      toast.success("Logged out successfully");
    },
    onError: () => {
      authStorage.clearAuth();
      queryClient.clear();
      router.replace("/login");
      toast.error("Error logging out, but you've been signed out locally");
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateUserMutation = useMutation({
    mutationFn: (userData: User) => {
      authStorage.setAuth(userData, authStorage.getToken() || "");
      return Promise.resolve(userData);
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get<AuthResponse>("/auth/verify");
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        authStorage.setAuth(user, accessToken);
        return response.data.data;
      }
      throw new Error("Token refresh failed");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
    onError: () => {
      authStorage.clearAuth();
      queryClient.clear();
    },
  });

  return {
    user: verifyQuery.data ?? null,
    isLoading: verifyQuery.isLoading,
    isAuthenticated: !!verifyQuery.data,
    logout: handleLogout,
    updateUser: (userData: User) => updateUserMutation.mutate(userData),
    refreshToken: () => refreshTokenMutation.mutateAsync(),
  };
}