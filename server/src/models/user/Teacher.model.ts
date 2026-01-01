import { Schema, Types } from "mongoose";
import { User, IUser } from "./User.model";

export interface ITeacher extends IUser {
  qualifications?: string;
  gradeId: Types.ObjectId;
  createdBy: Types.ObjectId;
  specializations?: string[];
}

const TeacherSchema = new Schema<ITeacher>({
  qualifications: {
    type: String,
    trim: true,
  },
  specializations: [
    {
      type: String,
      trim: true,
    },
  ],
  gradeId: {
    type: Schema.Types.ObjectId,
    ref: "Grade",
    required: [true, "GradeId assignment is required"],
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Creator reference is required"],
  },
});

TeacherSchema.index({ gradeId: 1, createdBy: 1 });

export const Teacher = User.discriminator<ITeacher>("teacher", TeacherSchema);
