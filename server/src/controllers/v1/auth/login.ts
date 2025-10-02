import { Request, Response, NextFunction } from "express";
import { User } from "../../../models/user";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import Token from "../../../models/token";
import { ApiError } from "../../../utils/ApiError";
import { Types } from "mongoose";

interface LoginRequestBody {
  email: string;
  password: string;
}

const authenticateUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id as Types.ObjectId);
    const refreshToken = generateRefreshToken(user._id as Types.ObjectId);

    await Token.deleteMany({ userId: user._id });
    await Token.create({ 
      token: refreshToken, 
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.profilePictureUrl,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default authenticateUser;