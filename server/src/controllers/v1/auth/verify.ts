import { Response } from "express";
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

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const tokenExists = await Token.exists({ token: refreshToken });
    if (!tokenExists) {
      return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken) as { userId: string };
    if (!decoded?.userId) {
      return res.status(403).json({ success: false, message: "Invalid refresh token payload" });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const accessToken = generateAccessToken(user._id as Types.ObjectId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
      userType: user.role,
      user,
    });
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized or invalid token" });
  }
};

export default verify;
