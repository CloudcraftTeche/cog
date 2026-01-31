import { User, AuthState } from "@/types/auth/auth";
import { TOKEN_STORAGE_KEYS, TOKEN_TIMING } from "@/lib/auth/constant/auth";

export const authStorage = {
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem(TOKEN_STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getTokenExpiry: (): number | null => {
    if (typeof window === "undefined") return null;
    const expiry = localStorage.getItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    return expiry ? parseInt(expiry, 10) : null;
  },

  setAuth: (user: User, token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
    const expiry = Date.now() + TOKEN_TIMING.EXPIRY_DURATION;
    localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
  },

  clearAuth: (): void => {
    if (typeof window === "undefined") return;
    Object.values(TOKEN_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  isTokenExpired: (): boolean => {
    const expiry = authStorage.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() > expiry;
  },

  getTimeUntilExpiry: (): number => {
    const expiry = authStorage.getTokenExpiry();
    if (!expiry) return 0;
    return Math.max(0, expiry - Date.now());
  },
};