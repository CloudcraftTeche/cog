// lib/constants/auth.ts
export const TOKEN_STORAGE_KEYS = {
  USER: "user",
  ACCESS_TOKEN: "accessToken",
  TOKEN_EXPIRY: "tokenExpiry",
} as const;

export const TOKEN_TIMING = {
  EXPIRY_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours
} as const;