import { Schema, model, Document, Types, Model } from "mongoose";
import bcrypt from "bcrypt";

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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  role: "student" | "teacher" | "admin" | "superAdmin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
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
      enum: ["student", "teacher", "admin", "superAdmin"],
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        if (ret.password) delete ret.password;
        if (ret.__v) delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", UserSchema);

export interface IStudent extends IUser {
  rollNumber: string;
  class: string;
  parentContact?: string;
  completedChapters: {
    chapter: Types.ObjectId;
    completedAt: Date;
    quizScore: number;
  }[];
  assignmentsCompleted: Types.ObjectId[];
}

const StudentSchema = new Schema<IStudent>({
  rollNumber: { type: String, required: true, trim: true },
  class: { type: String, required: true },
  parentContact: { type: String },
  completedChapters: [
    {
      chapter: { type: Schema.Types.ObjectId, ref: "Chapter" },
      completedAt: { type: Date, default: Date.now },
      quizScore: { type: Number, default: 0 },
    },
  ],
  assignmentsCompleted: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
});

export const Student = User.discriminator<IStudent>("student", StudentSchema);

export interface ITeacher extends IUser {
  classTeacherFor: string;
  qualifications?: string;
  createdBy: Types.ObjectId;
  completedChapters: {
    chapter: Types.ObjectId;
    completedAt: Date;
    quizScore: number;
  }[];
}

const TeacherSchema = new Schema<ITeacher>({
  classTeacherFor: { type: String, required: true, trim: true },
  qualifications: { type: String, trim: true },
  completedChapters: [
    {
      chapter: { type: Schema.Types.ObjectId, ref: "TeacherChapter" },
      completedAt: { type: Date, default: Date.now },
      quizScore: { type: Number, default: 0 },
    },
  ],
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
});

export const Teacher = User.discriminator<ITeacher>("teacher", TeacherSchema);

export interface IAdmin extends IUser {}
export interface ISuperAdmin extends IUser {}

export const Admin = User.discriminator<IAdmin>("admin", new Schema({}));
export const SuperAdmin = User.discriminator<ISuperAdmin>(
  "superAdmin",
  new Schema({})
);
