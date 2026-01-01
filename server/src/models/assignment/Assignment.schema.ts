import { model, Schema, Types } from "mongoose";
import { QuestionSchema, IQuestion } from "../shared/Question.schema";
export interface IAssignment {
  _id: Types.ObjectId;
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  videoUrl?: string;
  gradeId: Types.ObjectId;
  videoPublicId?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  textContent?: string;
  questions: IQuestion[];
  startDate: Date;
  endDate: Date;
  status: "active" | "locked" | "ended";
  createdBy: Types.ObjectId;
  totalMarks?: number;
  passingMarks?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    contentType: {
      type: String,
      enum: {
        values: ["video", "text", "pdf"],
        message: "{VALUE} is not a valid content type",
      },
      required: [true, "Content type is required"],
    },
    videoUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "video";
      },
    },
    videoPublicId: String,
    pdfUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "pdf";
      },
    },
    pdfPublicId: String,
    textContent: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "text";
      },
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (val: IQuestion[]) => val.length > 0,
        message: "At least one question is required",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "locked", "ended"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
      index: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade reference is required"],
      index: true,
    },
    totalMarks: {
      type: Number,
      min: [0, "Total marks cannot be negative"],
    },
    passingMarks: {
      type: Number,
      min: [0, "Passing marks cannot be negative"],
      validate: {
        validator: function (this: IAssignment, value: number) {
          return !this.totalMarks || value <= this.totalMarks;
        },
        message: "Passing marks cannot exceed total marks",
      },
    },
  },
  { timestamps: true }
);
AssignmentSchema.index({ status: 1, startDate: -1 });
AssignmentSchema.index({ createdBy: 1, status: 1 });
export const Assignment = model<IAssignment>("Assignment", AssignmentSchema);
