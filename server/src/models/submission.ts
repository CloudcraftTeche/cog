import mongoose, { Document, Schema, Types } from "mongoose";

interface ISubmission extends Document {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  submissionType: "video" | "text" | "pdf";
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
  answers: IAnswer[];
  score?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

interface IQuestion {
  questionText: string;
  options: IOption[];
  correctAnswer: "A" | "B" | "C" | "D";
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

const answerSchema = new mongoose.Schema<IAnswer>(
  {
    question: { type: QuestionSchema, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

interface IAnswer {
  question: IQuestion;
  answer: string;
}

const submissionSchema = new mongoose.Schema<ISubmission>(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionType: {
      type: String,
      enum: ["video", "text", "pdf"],
      required: true,
    },
    textContent: {
      type: String,
      required: function (this: any) {
        return this.submissionType === "text";
      },
    },
    videoUrl: {
      type: String,
      required: function (this: any) {
        return this.submissionType === "video";
      },
    },
    pdfUrl: {
      type: String,
      required: function (this: any) {
        return this.submissionType === "pdf";
      },
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
 
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);
