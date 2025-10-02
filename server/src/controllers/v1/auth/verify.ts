import {  Response } from "express";
import { User } from "../../../models/user";
import Token from "../../../models/token";
import { generateAccessToken, verifyRefreshToken } from "../../../utils/jwt";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

const verify = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken && req.headers.authorization?.startsWith("Bearer ")) {
      refreshToken = req.headers.authorization.split(" ")[1];
    }
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    const tokenExists = await Token.exists({ token: refreshToken });
    if (!tokenExists) return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });

    const decoded = verifyRefreshToken(refreshToken) as { userId: string };
    const userId = decoded.userId;
    console.log(userId);
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const accessToken = generateAccessToken(user._id as Types.ObjectId);
    
    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
      userType: user.role,
      user:user
    });
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized or invalid token" });
  }
};

export default verify;
