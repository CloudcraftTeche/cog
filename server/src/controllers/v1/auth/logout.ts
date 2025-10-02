import {  Response, NextFunction } from "express";
import Token from "../../../models/token";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

const handleUserLogout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const userId = req.userId;

    if (userId) {
      await Token.deleteMany({ userId });
    }

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.status(200).json({ 
      success: true, 
      message: "Logout successful" 
    });
  } catch (err) {
    next(err);
  }
};

export default handleUserLogout;