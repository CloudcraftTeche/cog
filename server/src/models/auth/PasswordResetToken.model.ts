import { Schema, model, Document, Types } from "mongoose";
export interface IPasswordResetToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "User reference is required"], 
      index: true 
    },
    token: { 
      type: String, 
      required: [true, "Token is required"], 
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);
PasswordResetTokenSchema.index({ userId: 1, isUsed: 1 });
export const PasswordResetToken = model<IPasswordResetToken>(
  "PasswordResetToken",
  PasswordResetTokenSchema
);