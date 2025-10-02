import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import Token from "../../../models/token";
import { Types } from "mongoose";
import { generateAccessToken, verifyRefreshToken } from "../../../utils/jwt";
import { ApiError } from "../../../utils/ApiError";

export const handleRefreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }

    const tokenExists = await Token.exists({ token: refreshToken });
    if (!tokenExists) {
      throw new ApiError(401, "Refresh token not found or invalid");
    }

    let jwtPayload: { userId: Types.ObjectId };
    try {
      jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new ApiError(401, "Refresh token expired, please log in again");
      }
      if (err instanceof JsonWebTokenError) {
        throw new ApiError(401, "Invalid refresh token");
      }
      throw err;
    }

    const accessToken = generateAccessToken(jwtPayload.userId);
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};
