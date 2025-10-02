import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { PasswordResetToken } from "../../../models/passwordReset";
import { User } from "../../../models/user";
import { ApiError } from "../../../utils/ApiError";

const handlePasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    if (!token || !email || !password || !confirmPassword)
      throw new ApiError(400, "All fields are required");

    if (password !== confirmPassword) throw new ApiError(400, "Passwords do not match");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const resetTokenDoc = await PasswordResetToken.findOne({ token: hashedToken, expiresAt: { $gt: new Date() } });
    if (!resetTokenDoc) throw new ApiError(400, "Invalid or expired reset token");

    const user = await User.findOne({ _id: resetTokenDoc.userId, email });
    if (!user) throw new ApiError(404, "User not found");

    user.password = password;
    await user.save();

    await PasswordResetToken.deleteMany({ userId: user._id });

    res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (err) {
    next(err);
  }
};

export default handlePasswordReset;
