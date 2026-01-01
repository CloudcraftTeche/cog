import { model, Schema, Types } from "mongoose";
import { IQuestion, QuestionSchema } from "../shared/Question.schema";
export interface IContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  url?: string;
  publicId?: string;
  textContent?: string;
  title?: string;
  order: number;
}
export interface IStudentSubmission {
  type: "text" | "video" | "pdf";
  content?: string;
  fileUrl?: string;
  filePublicId?: string;
  submittedAt: Date;
}
export interface IChapter {
  _id: Types.ObjectId;
  title: string;
  gradeId: Types.ObjectId;
  unitId: Types.ObjectId;
  chapterNumber: number;
  description: string;
  contentItems: IContentItem[];
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
    submissions?: IStudentSubmission[];
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
  submissions?: IStudentSubmission[];
}
const ContentItemSchema = new Schema<IContentItem>(
  {
    type: {
      type: String,
      enum: ["video", "text", "pdf", "mixed"],
      required: true,
    },
    url: {
      type: String,
    required:false,
      default: null
    },
    publicId: {
      type: String,
   required:false,
   default: null
    },
    textContent: {
      type: String,
      required: function (this: IContentItem) {
        return this.type === "text";
      },
    },
    title: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);
const StudentSubmissionSchema = new Schema<IStudentSubmission>(
  {
    type: {
      type: String,
      enum: ["text", "video", "pdf"],
      required: true,
    },
    content: {
      type: String,
      required: function (this: IStudentSubmission) {
        return this.type === "text";
      },
    },
    fileUrl: {
      type: String,
      required: function (this: IStudentSubmission) {
        return this.type === "video" || this.type === "pdf";
      },
    },
    filePublicId: {
      type: String,
      required: function (this: IStudentSubmission) {
        return this.type === "video" || this.type === "pdf";
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: true }
);
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
    submissions: {
      type: [StudentSubmissionSchema],
      default: [],
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
    contentItems: {
      type: [ContentItemSchema],
      required: true,
      validate: {
        validator: (val: IContentItem[]) => val.length > 0,
        message: "At least one content item is required",
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
ChapterSchema.index(
  { gradeId: 1, unitId: 1, chapterNumber: 1 },
  { unique: true }
);
ChapterSchema.index({
  gradeId: 1,
  unitId: 1,
  isPublished: 1,
  chapterNumber: 1,
});
ChapterSchema.index({ createdBy: 1, createdAt: -1 });
ChapterSchema.index({
  "studentProgress.studentId": 1,
  "studentProgress.status": 1,
});
ChapterSchema.index({
  "studentProgress.studentId": 1,
  "studentProgress.completedAt": -1,
});
export const Chapter = model<IChapter>("Chapter", ChapterSchema);
