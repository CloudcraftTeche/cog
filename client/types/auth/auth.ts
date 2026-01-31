export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superAdmin" | "teacher" | "student";
  avatar?: string | null;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type UserRole = User["role"];

