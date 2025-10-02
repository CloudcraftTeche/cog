import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";


export const generateAccessToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWTACCESSTOKENSECRET||"secreat", {
    expiresIn: config.JWTACCESSTOKENEXPIRESIN || "1h",
    subject: "accessToken",
  });
};


export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWTREFRESHTOKENSECRET||"secreat", {
    expiresIn: config.JWTREFRESHTOKENEXPIRESIN || "7d",
    subject: "refreshToken",
  });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.JWTACCESSTOKENSECRET||"secreat");
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.JWTREFRESHTOKENSECRET||"secreat");
};
