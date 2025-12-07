import { model, Schema, Types } from "mongoose";
import { IQuestion, QuestionSchema } from "../shared/Question.schema";
export interface IChapter {
  _id: Types.ObjectId;
  title: string;
  gradeId: Types.ObjectId;
  unitId: Types.ObjectId;
  chapterNumber: number;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  videoPublicId?: string;
  textContent?: string;
  questions: IQuestion[];
  createdBy: Types.ObjectId;
  isPublished: boolean;
  requiresPreviousChapter: boolean;
  studentProgress?: {
    studentId: Types.ObjectId;
    status: "locked" | "accessible" | "in_progress" | "completed";
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
export interface IChapterWithStatus extends IChapter {
  status: "locked" | "accessible" | "in_progress" | "completed";
  isCompleted: boolean;
  isAccessible: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}
const StudentProgressSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["locked", "accessible", "in_progress", "completed"],
      default: "accessible",
      required: true,
    },
    startedAt: Date,
    completedAt: Date,
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false, timestamps: true }
);
const ChapterSchema = new Schema<IChapter>(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: [1, "Chapter number must be at least 1"],
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade reference is required"],
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit reference is required"],
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
        values: ["video", "text"],
        message: "{VALUE} is not a valid content type",
      },
      required: [true, "Content type is required"],
    },
    videoUrl: {
      type: String,
      required: function (this: IChapter) {
        return this.contentType === "video";
      },
    },
    videoPublicId: String,
    textContent: {
      type: String,
      required: function (this: IChapter) {
        return this.contentType === "text";
      },
    },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: (val: IQuestion[]) => val.length > 0,
        message: "At least one question is required",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required"],
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    requiresPreviousChapter: {
      type: Boolean,
      default: true,
    },
    studentProgress: {
      type: [StudentProgressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
ChapterSchema.index({ gradeId: 1, unitId: 1, chapterNumber: 1 }, { unique: true });
ChapterSchema.index({ gradeId: 1, unitId: 1, isPublished: 1, chapterNumber: 1 });
ChapterSchema.index({ createdBy: 1, createdAt: -1 });
ChapterSchema.index({ "studentProgress.studentId": 1, "studentProgress.status": 1 });
ChapterSchema.index({ "studentProgress.studentId": 1, "studentProgress.completedAt": -1 });
export const Chapter = model<IChapter>("Chapter", ChapterSchema);