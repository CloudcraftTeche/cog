import { model, Schema, Types } from "mongoose";
import { IQuestion, QuestionSchema } from "../shared/Question.schema";
export interface ITeacherChapter {
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
  teacherProgress?: {
    teacherId: Types.ObjectId;
    status: "locked" | "accessible" | "in_progress" | "completed";
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
export interface ITeacherChapterWithStatus extends ITeacherChapter {
  status: "locked" | "accessible" | "in_progress" | "completed";
  isCompleted: boolean;
  isAccessible: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}
const TeacherProgressSchema = new Schema(
  {
    teacherId: {
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
const TeacherChapterSchema = new Schema<ITeacherChapter>(
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
      required: function (this: ITeacherChapter) {
        return this.contentType === "video";
      },
    },
    videoPublicId: String,
    textContent: {
      type: String,
      required: function (this: ITeacherChapter) {
        return this.contentType === "text";
      },
    },
    questions: {
      type: [QuestionSchema],
      default: [],
      required: false,
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
    teacherProgress: {
      type: [TeacherProgressSchema],
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
TeacherChapterSchema.index(
  { gradeId: 1, unitId: 1, chapterNumber: 1 },
  { unique: true }
);
TeacherChapterSchema.index({
  gradeId: 1,
  unitId: 1,
  isPublished: 1,
  chapterNumber: 1,
});
TeacherChapterSchema.index({ createdBy: 1, createdAt: -1 });
TeacherChapterSchema.index({
  "teacherProgress.teacherId": 1,
  "teacherProgress.status": 1,
});
TeacherChapterSchema.index({
  "teacherProgress.teacherId": 1,
  "teacherProgress.completedAt": -1,
});
TeacherChapterSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      next();
    } catch (error: any) {
      console.error("Error in TeacherChapter cascading delete:", error);
      next(error);
    }
  }
);
TeacherChapterSchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDelete = await this.model.findOne(this.getFilter());
    if (docToDelete) {
      await docToDelete.deleteOne();
    }
    next();
  } catch (error: any) {
    next(error);
  }
});
export const TeacherChapter = model<ITeacherChapter>(
  "TeacherChapter",
  TeacherChapterSchema
);
