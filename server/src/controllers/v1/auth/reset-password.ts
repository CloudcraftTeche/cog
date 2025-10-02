import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { PasswordResetToken } from "../../../models/passwordReset";
import { User } from "../../../models/user";
import { sendPasswordResetEmail } from "../../../lib/mail/sendPasswordResetEmail";

import { ApiError } from "../../../utils/ApiError";

const handlePasswordResetRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "If an account with that email exists, we've sent a password reset link." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({ userId: user._id, userType: user.role, token: hashedToken });

    const resetUrl = `${process.env.FrontEnd_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(user.name, email, resetUrl, user.role);

    res.status(200).json({ success: true, message: "Password reset link has been sent to your email address." });
  } catch (err) {
    next(err);
  }
};

export default handlePasswordResetRequest;
