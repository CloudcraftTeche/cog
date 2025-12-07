import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

const getSecrets = () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets not configured");
  }

  return { accessSecret, refreshSecret };
};


const TOKEN_EXPIRY = {
  access: "15m",
  refresh: "30d",
} as const;


export const generateAccessToken = (userId: Types.ObjectId | string): string => {
  const { accessSecret } = getSecrets();

  return jwt.sign(
    { userId: userId.toString(), type: "access" },
    accessSecret,
    { expiresIn: TOKEN_EXPIRY.access } as SignOptions
  );
};

export const generateRefreshToken = (userId: Types.ObjectId | string): string => {
  const { refreshSecret } = getSecrets();

  return jwt.sign(
    { userId: userId.toString(), type: "refresh" },
    refreshSecret,
    { expiresIn: TOKEN_EXPIRY.refresh } as SignOptions
  );
};


export const verifyAccessToken = (token: string) => {
  const { accessSecret } = getSecrets();
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token: string) => {
  const { refreshSecret } = getSecrets();
  return jwt.verify(token, refreshSecret);
};


export const decodeToken = (token: string) => {
  return jwt.decode(token);
};

export const isTokenExpiringSoon = (token: string, thresholdMinutes = 5): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;

    const expiresAt = decoded.exp * 1000;
    const threshold = thresholdMinutes * 60 * 1000;

    return expiresAt - Date.now() < threshold;
  } catch {
    return true;
  }
};