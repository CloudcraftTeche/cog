import { Schema } from "mongoose";

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;  
  selectedAnswer?: string;  
}

export const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
    },
    options: {
      type: [String],
      validate: {
        validator: (val: string[]) => val.length === 4,
        message: "Each question must have exactly 4 options",
      },
      required: [true, "Options are required"],
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    selectedAnswer: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);