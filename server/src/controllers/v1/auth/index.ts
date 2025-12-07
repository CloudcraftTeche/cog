import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import crypto from "crypto";
import { TokenExpiredError } from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../../utils/jwt";
import { ApiError } from "../../../utils/ApiError";
import { sendPasswordResetEmail } from "../../../lib/mail/sendPasswordResetEmail";
import { User } from "../../../models/user/User.model";
import { Token } from "../../../models/auth/Token.model";
import { PasswordResetToken } from "../../../models/auth/PasswordResetToken.model";
export interface AuthenticatedRequest extends Request {
  userId?: Types.ObjectId;
  userRole?: string;
  user?: InstanceType<typeof User>;
}
interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}
const TOKEN_CONFIG = {
  access: { maxAge: 15 * 60 * 1000 },
  refresh: { maxAge: 30 * 24 * 60 * 60 * 1000 },
} as const;
const getCookieOptions = (isRefresh = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "lax" | "none" | "strict",
  maxAge: isRefresh ? TOKEN_CONFIG.refresh.maxAge : TOKEN_CONFIG.access.maxAge,
  path: "/",
});
const generateTokenPair = async (userId: Types.ObjectId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  await Token.findOneAndUpdate(
    { userId },
    {
      token: refreshToken,
      expiresAt: new Date(Date.now() + TOKEN_CONFIG.refresh.maxAge),
    },
    { upsert: true, new: true }
  );
  return { accessToken, refreshToken };
};
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, getCookieOptions(false));
  res.cookie("refreshToken", refreshToken, getCookieOptions(true));
};
const clearAuthCookies = (res: Response) => {
  const opts = { httpOnly: true, path: "/" };
  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);
};
const formatUserResponse = (user: InstanceType<typeof User>) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.profilePictureUrl,
});
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }
    const { accessToken, refreshToken } = await generateTokenPair(user._id);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: formatUserResponse(user), accessToken },
    });
  } catch (err) {
    next(err);
  }
};
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const refreshToken = req.cookies?.refreshToken;
    if (userId) await Token.deleteMany({ userId });
    else if (refreshToken) await Token.deleteOne({ token: refreshToken });
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }
    const storedToken = await Token.findOne({ token: refreshToken });
    if (!storedToken) {
      clearAuthCookies(res);
      throw new ApiError(401, "Invalid refresh token");
    }
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken) as TokenPayload;
    } catch (err) {
      await Token.deleteOne({ token: refreshToken });
      clearAuthCookies(res);
      if (err instanceof TokenExpiredError) {
        throw new ApiError(401, "Session expired, please login again");
      }
      throw new ApiError(401, "Invalid refresh token");
    }
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      new Types.ObjectId(payload.userId)
    );
    setAuthCookies(res, accessToken, newRefreshToken);
    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
};
export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accessToken =
      req.headers.authorization?.replace("Bearer ", "") || req.cookies?.accessToken;
    let userId: string | null = null;
    let needsRefresh = false;
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken) as TokenPayload;
        userId = payload.userId;
      } catch {
        needsRefresh = true;
      }
    } else {
      needsRefresh = true;
    }
    if (needsRefresh) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(401, "No valid authentication token");
      }
      const storedToken = await Token.findOne({ token: refreshToken });
      if (!storedToken) {
        clearAuthCookies(res);
        throw new ApiError(401, "Session invalid");
      }
      try {
        const payload = verifyRefreshToken(refreshToken) as TokenPayload;
        userId = payload.userId;
        const tokens = await generateTokenPair(new Types.ObjectId(userId));
        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        accessToken = tokens.accessToken;
      } catch {
        await Token.deleteOne({ token: refreshToken });
        clearAuthCookies(res);
        throw new ApiError(401, "Session expired");
      }
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      clearAuthCookies(res);
      throw new ApiError(404, "User not found");
    }
    res.status(200).json({
      success: true,
      data: { user: formatUserResponse(user), accessToken },
    });
  } catch (err) {
    next(err);
  }
};
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new ApiError(401, "Unauthorized");
    const user = await User.findById(req.userId).select("-password").populate("gradeId","grade _id");
    if (!user) throw new ApiError(404, "User not found");
    res.status(200).json({ success: true, data:  user  });
  } catch (err) {
    next(err);
  }
};
export const forgotPassword = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");
    const successMsg = "If an account exists, a reset link has been sent";
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: successMsg });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      { token: hashedToken, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true }
    );
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(user.name, email, resetUrl, user.role);
    res.status(200).json({ success: true, message: successMsg });
  } catch (err) {
    next(err);
  }
};
export const resetPassword = async (
  req: Request<{}, {}, { token: string; email: string; password: string; confirmPassword: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email, password, confirmPassword } = req.body;
    if (!token || !email || !password || !confirmPassword) {
      throw new ApiError(400, "All fields are required");
    }
    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const resetDoc = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });
    if (!resetDoc) {
      throw new ApiError(400, "Invalid or expired reset token");
    }
    const user = await User.findOne({ _id: resetDoc.userId, email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.password = password;
    await user.save();
    await Promise.all([
      PasswordResetToken.deleteMany({ userId: user._id }),
      Token.deleteMany({ userId: user._id }),
    ]);
    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};