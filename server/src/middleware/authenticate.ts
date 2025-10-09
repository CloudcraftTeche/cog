import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Types } from "mongoose";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/user"; 

export interface AuthenticatedRequest extends Request {
  userId?: Types.ObjectId|string;
  userRole?: string;
  user?: any; 
}

interface JwtPayload {
  userId: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.Authorization ||req.headers.authorization as any

    if (!authHeader) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Authorization header must start with 'Bearer '",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Token is missing from the authorization header",
      });
    }

    const jwtPayload = verifyAccessToken(token) as JwtPayload;

    if (!jwtPayload?.userId) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid or expired token",
      });
    }

    const userId = new Types.ObjectId(jwtPayload.userId);
    req.userId = userId;

    const user = await User.findById(userId).select("-password"); 
    if (!user) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "User not found",
      });
    }

    req.user = user;

    return next();
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired. Please login again.",
      });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid access token",
      });
    }

    return res.status(401).json({
      code: "AuthenticationError",
      message: "Unauthorized access",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
