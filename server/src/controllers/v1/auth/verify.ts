import { Response } from "express";
import { User } from "../../../models/user";
import Token from "../../../models/token";
import { generateAccessToken, verifyRefreshToken, verifyAccessToken } from "../../../utils/jwt";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

const verify = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    let token: string | undefined;
    let tokenType: 'access' | 'refresh' = 'access';

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenType = 'access';
    }
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
      tokenType = 'access';
    }
    
    if (!token && req.cookies?.refreshToken) {
      token = req.cookies.refreshToken;
      tokenType = 'refresh';
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No authentication token provided" 
      });
    }

    let userId: string;

    if (tokenType === 'access') {
      try {
        const decoded = verifyAccessToken(token) as { userId: string };
        if (!decoded?.userId) {
          throw new Error("Invalid token payload");
        }
        userId = decoded.userId;
      } catch (accessError) {
        const refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
          return res.status(401).json({ 
            success: false, 
            message: "Access token expired and no refresh token available" 
          });
        }

        const tokenExists = await Token.exists({ token: refreshToken });
        if (!tokenExists) {
          return res.status(403).json({ 
            success: false, 
            message: "Invalid or expired refresh token" 
          });
        }

        const refreshDecoded = verifyRefreshToken(refreshToken) as { userId: string };
        if (!refreshDecoded?.userId) {
          return res.status(403).json({ 
            success: false, 
            message: "Invalid refresh token payload" 
          });
        }

        userId = refreshDecoded.userId;
      }
    } else {
      const tokenExists = await Token.exists({ token });
      if (!tokenExists) {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid or expired refresh token" 
        });
      }

      const decoded = verifyRefreshToken(token) as { userId: string };
      if (!decoded?.userId) {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid refresh token payload" 
        });
      }

      userId = decoded.userId;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const accessToken = generateAccessToken(user._id as Types.ObjectId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, 
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Token verified and refreshed successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.profilePictureUrl,
      },
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    
    res.clearCookie("accessToken");
    
    return res.status(401).json({ 
      success: false, 
      message: "Token verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export default verify;