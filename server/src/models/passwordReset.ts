import { model, Schema, Types, Document, Model } from "mongoose";


export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}


const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);


passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export const PasswordResetToken: Model<IPasswordResetToken> =
  model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);
