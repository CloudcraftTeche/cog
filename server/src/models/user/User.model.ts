import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  profilePictureUrl?: string;
  profilePicturePublicId?: string;
  address?: IAddress;
  role: "student" | "teacher" | "admin" | "superAdmin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, "Please provide a valid phone number"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender",
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: (v: Date) => v < new Date(),
        message: "Date of birth must be in the past",
      },
    },
    profilePictureUrl: String,
    profilePicturePublicId: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    role: {
      type: String,
      enum: {
        values: ["student", "teacher", "admin", "superAdmin"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ email: 1, role: 1 });
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
UserSchema.virtual("displayName").get(function () {
  return this.name;
});
export const User = model<IUser>("User", UserSchema);
