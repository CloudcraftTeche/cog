import { model, Schema, Types } from "mongoose";
import { IQuestion, QuestionSchema } from "../shared/Question.schema";
interface IAnswer {
  question: IQuestion;
  answer: string;
  isCorrect?: boolean;
}
export interface ISubmission {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  submissionType: "video" | "text" | "pdf";
  textContent?: string;
  videoUrl?: string;
  videoPublicId?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  answers: IAnswer[];
  score?: number;
  feedback?: string;
  submittedAt?: Date;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
const AnswerSchema = new Schema<IAnswer>(
  {
    question: {
      type: QuestionSchema,
      required: [true, "Question is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    isCorrect: Boolean,
  },
  { _id: false }
);
export const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: [true, "Assignment reference is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true,
    },
    submissionType: {
      type: String,
      enum: {
        values: ["video", "text", "pdf"],
        message: "{VALUE} is not a valid submission type",
      },
      required: [true, "Submission type is required"],
    },
    textContent: {
      type: String,
      required: function (this: ISubmission) {
        return this.submissionType === "text";
      },
    },
    videoUrl: {
      type: String,
      required: function (this: ISubmission) {
        return this.submissionType === "video";
      },
    },
    videoPublicId: String,
    pdfUrl: {
      type: String,
      required: function (this: ISubmission) {
        return this.submissionType === "pdf";
      },
    },
    pdfPublicId: String,
    answers: {
      type: [AnswerSchema],
      required: [true, "Answers are required"],
    },
    score: {
      type: Number,
      min: [0, "Score cannot be negative"],
      validate: {
        validator: async function (this: ISubmission, value: number) {
          if (!value) return true;
          const Assignment = model("Assignment");
          const assignment = await Assignment.findById(this.assignmentId);
          return !assignment?.totalMarks || value <= assignment.totalMarks;
        },
        message: "Score cannot exceed total marks",
      },
    },
    feedback: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    gradedAt: Date,
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
SubmissionSchema.index({ studentId: 1, submittedAt: -1 });
SubmissionSchema.index({ assignmentId: 1, score: -1 });
export const Submission = model<ISubmission>("Submission", SubmissionSchema);
