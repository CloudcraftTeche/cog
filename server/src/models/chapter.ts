import { Schema, model, Document, Types, Model } from "mongoose";


interface IOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

interface IQuestion {
  questionText: string;
  options: IOption[];
  correctAnswer: "A" | "B" | "C" | "D";
}

export interface IChapter extends Document {
  _id: Types.ObjectId;
  title: string;
  unit: string;
  chapterNumber: number;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  class: string;
  createdBy: Types.ObjectId;
  questions: IQuestion[];
  completedStudents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}


const OptionSchema = new Schema<IOption>(
  {
    label: {
      type: String,
      required: [true, "Option label is required"],
      enum: ["A", "B", "C", "D"],
    },
    text: {
      type: String,
      required: [true, "Option text is required"],
    },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
    },
    options: {
      type: [OptionSchema],
      validate: {
        validator: (val: IOption[]) => val.length === 4,
        message: "Each question must have exactly 4 options",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      enum: ["A", "B", "C", "D"],
    },
  },
  { _id: false }
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
      index: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },

    contentType: {
      type: String,
      enum: ["video", "text"],
      required: [true, "Content type is required"],
    },
    videoUrl: {
      type: String,
      required: function (this: IChapter) {
        return this.contentType === "video";
      },
    },
    textContent: {
      type: String,
      required: function (this: IChapter) {
        return this.contentType === "text";
      },
    },
    class: {
      type: String,
      required: [true, "class is required"],
    },
    completedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: [true, "Creator user ID is required"],
    },
    questions: [QuestionSchema],
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


ChapterSchema.index({ unit: 1, chapterNumber: 1 });
ChapterSchema.index({ class: 1, createdAt: -1 });



export const Chapter: Model<IChapter> = model<IChapter>(
  "Chapter",
  ChapterSchema
);
