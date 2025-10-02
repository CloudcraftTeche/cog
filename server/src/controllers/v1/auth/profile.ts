import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { User } from "../../../models/user";
import { ApiError } from "../../../utils/ApiError";

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({ 
      success: true,
      data: { user } 
    });
  } catch (err) {
    next(err);
  }
};