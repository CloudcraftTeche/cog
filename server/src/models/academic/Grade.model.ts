import { Schema, model, Document, Types } from "mongoose";
import { IUnit, UnitSchema } from "./Unit.schema";
import { ISubmission } from "../assignment/Submission.schema";
import { IAttendance } from "../attendance/Attendance.schema";
export interface IGrade extends Document {
  _id: Types.ObjectId;
  grade: string;
  description?: string;
  units: IUnit[];
  isActive: boolean;
  academicYear?: string;
  createdAt: Date;
  updatedAt: Date;
  addUnit(unitData: Partial<IUnit>): Promise<IUnit>;
  updateUnit(
    unitId: Types.ObjectId,
    updateData: Partial<IUnit>
  ): Promise<IUnit>;
  deleteUnit(unitId: Types.ObjectId): Promise<boolean>;
  getChapters(unitId?: Types.ObjectId): Promise<any[]>;
  addSubmission(submission: Partial<ISubmission>): Promise<ISubmission>;
  addAttendance(attendance: Partial<IAttendance>): Promise<IAttendance>;
  getAttendancePercentage(studentId: Types.ObjectId): number;
  getAssignmentCompletionRate(studentId: Types.ObjectId): number;
  getAverageScore(studentId: Types.ObjectId): number | null;
}
const GradeSchema = new Schema<IGrade>(
  {
    grade: {
      type: String,
      required: [true, "Grade name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    units: {
      type: [UnitSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    academicYear: {
      type: String,
      match: [/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
GradeSchema.index({ grade: 1, isActive: 1 });
export const Grade = model<IGrade>("Grade", GradeSchema);
