import { model, Schema, Types } from "mongoose";
// Textbook lesson text. Copyrighted source material: readable only through the
// lesson routes (admins, super admins, and teachers for their own grade) and
// never embedded in chapter or student responses.
export interface ILesson {
  _id: Types.ObjectId;
  gradeId: Types.ObjectId;
  lessonNumber: number;
  title: string;
  readingPortion?: string;
  objectives: string[];
  introduction?: string;
  story: string;
  questions: string[];
  memoryVerse: {
    text: string;
    reference: string;
  };
  source: {
    book: string;
    edition?: string;
    pages: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}
const LessonSchema = new Schema<ILesson>(
  {
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
      index: true,
    },
    lessonNumber: {
      type: Number,
      required: [true, "Lesson number is required"],
      min: [1, "Lesson number must be at least 1"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    readingPortion: { type: String, trim: true },
    objectives: { type: [String], default: [] },
    introduction: { type: String, trim: true },
    story: {
      type: String,
      required: [true, "Lesson story is required"],
    },
    questions: { type: [String], default: [] },
    memoryVerse: {
      text: {
        type: String,
        required: [true, "Memory verse text is required"],
        trim: true,
      },
      reference: {
        type: String,
        required: [true, "Memory verse reference is required"],
        trim: true,
      },
    },
    source: {
      book: {
        type: String,
        required: [true, "Source book is required"],
        trim: true,
      },
      edition: { type: String, trim: true },
      pages: { type: [Number], default: [] },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);
LessonSchema.index({ gradeId: 1, lessonNumber: 1 }, { unique: true });
export const Lesson = model<ILesson>("Lesson", LessonSchema);
