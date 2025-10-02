import { Schema, model, Document, Types, Model } from "mongoose";


export interface IChapterProgress extends Document {
  studentId: Types.ObjectId;
  chapterId: Types.ObjectId;
  videoWatched: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
  isCompleted: boolean;
  completedAt?: Date;
  updatedAt: Date;
  createdAt: Date;

  progressPercentage: number;
}

const ChapterProgressSchema = new Schema<IChapterProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true,
    },

    videoWatched: {
      type: Boolean,
      default: false,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
      min: 0,
    },
    questionsCorrect: {
      type: Number,
      default: 0,
      min: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
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


ChapterProgressSchema.index({ studentId: 1, chapterId: 1 }, { unique: true });
ChapterProgressSchema.index({ isCompleted: 1, updatedAt: -1 });

ChapterProgressSchema.virtual("progressPercentage").get(function (this: IChapterProgress) {
  if (this.questionsAnswered === 0) return this.videoWatched ? 50 : 0;
  const questionScore = (this.questionsCorrect / this.questionsAnswered) * 50;
  return (this.videoWatched ? 50 : 0) + questionScore;
});


export const ChapterProgress: Model<IChapterProgress> =
  model<IChapterProgress>("ChapterProgress", ChapterProgressSchema);
