import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { User } from "../models/user/User.model";



export const authorizeRoles = (...allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });

      const user = await User.findById(req.userId).select("role");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (!allowedRoles.includes(user.role))
        return res.status(403).json({ success: false, message: "Unauthorized access: insufficient permissions" });

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error("Authorization Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
};
