import { Response, NextFunction, Request } from "express";
import { Types } from "mongoose";
import { TokenExpiredError } from "jsonwebtoken";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { User } from "../models/user/User.model";
import { Token } from "../models/auth/Token.model";
export interface AuthenticatedRequest extends Request {
  userId?: any;
  userRole?: string;
  user?: any;
}
const TOKEN_CONFIG = {
  access: { maxAge: 15 * 60 * 1000 },
  refresh: { maxAge: 30 * 24 * 60 * 60 * 1000 },
};
const getCookieOptions = (isRefresh = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: isRefresh ? TOKEN_CONFIG.refresh.maxAge : TOKEN_CONFIG.access.maxAge,
  path: "/",
});
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    let accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    accessToken ??= req.cookies?.accessToken;
    let userId: Types.ObjectId | null = null;
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken) as { userId: string };
        userId = new Types.ObjectId(payload.userId);
      } catch (err) {
        if (!(err instanceof TokenExpiredError)) {
          return res.status(401).json({
            code: "AuthenticationError",
            message: "Invalid access token",
          });
        }
      }
    }
    if (!userId) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          code: "AuthenticationError",
          message: "Authentication required",
        });
      }
      const storedToken = await Token.findOne({ token: refreshToken });
      if (!storedToken) {
        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });
        return res.status(401).json({
          code: "AuthenticationError",
          message: "Session expired, please login again",
        });
      }
      try {
        const payload = verifyRefreshToken(refreshToken) as { userId: string };
        userId = new Types.ObjectId(payload.userId);
        const newAccessToken = generateAccessToken(userId);
        const newRefreshToken = generateRefreshToken(userId);
        await Token.findOneAndUpdate(
          { userId },
          {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + TOKEN_CONFIG.refresh.maxAge),
          },
          { upsert: true }
        );
        res.cookie("accessToken", newAccessToken, getCookieOptions(false));
        res.cookie("refreshToken", newRefreshToken, getCookieOptions(true));
        res.setHeader("X-Access-Token", newAccessToken);
      } catch {
        await Token.deleteOne({ token: refreshToken });
        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });
        return res.status(401).json({
          code: "AuthenticationError",
          message: "Session expired, please login again",
        });
      }
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "User not found",
      });
    }
    req.userId = userId;
    req.user = user;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      code: "AuthenticationError",
      message: "Authentication failed",
    });
  }
};
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies?.accessToken;
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken) as { userId: string };
        const user = await User.findById(payload.userId).select("-password");
        if (user) {
          req.userId = user._id;
          req.user = user;
          req.userRole = user.role;
        }
      } catch {}
    }
    next();
  } catch {
    next();
  }
};
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
    next();
  };
};
export const adminOnly = authorize("admin", "superAdmin");
export const teacherOnly = authorize("teacher", "admin", "superAdmin");
export const studentOnly = authorize("student");
