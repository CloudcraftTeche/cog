

import { model, Schema, Types } from "mongoose";

export interface ITeacherAttendance {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  gradeId?: Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const TeacherAttendanceSchema = new Schema<ITeacherAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
      index: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      index: true,
    },
    date: { 
      type: Date, 
      required: [true, "Date is required"], 
      index: true,
      validate: {
        validator: (v: Date) => v <= new Date(),
        message: "Attendance date cannot be in the future",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["present", "absent", "late", "excused"],
        message: "{VALUE} is not a valid attendance status",
      },
      required: [true, "Status is required"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

TeacherAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
TeacherAttendanceSchema.index({ date: -1, status: 1 });
TeacherAttendanceSchema.index({ gradeId: 1, date: -1 });
TeacherAttendanceSchema.index({ teacherId: 1, date: -1 });
export const TeacherAttendance = model<ITeacherAttendance>("TeacherAttendance", TeacherAttendanceSchema);