import { Schema, model, Document, Types } from "mongoose";
export interface IToken extends Document {
  _id: Types.ObjectId;
  token: string;
  userId: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true }
);
export const Token = model<IToken>("Token", TokenSchema);
