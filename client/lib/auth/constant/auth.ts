
export const TOKEN_STORAGE_KEYS = {
  USER: "user",
  ACCESS_TOKEN: "accessToken",
  TOKEN_EXPIRY: "tokenExpiry",
} as const;

export const TOKEN_TIMING = {
  EXPIRY_DURATION: 24 * 60 * 60 * 1000, 
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, 
  REFRESH_THRESHOLD: 24 * 60 * 60 * 1000, 
} as const;