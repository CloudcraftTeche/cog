import mongoose, { Document, Schema, Types, Model } from "mongoose";


export interface IAssignment extends Document {
  title: string;
  description: string;
  grade: string;
  contentType: "video" | "text" | "pdf";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  questions: {
    questionText: string;
    options: { label: string; text: string }[];
    correctAnswer: string;
  }[];
  submittedStudents: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  status: "active" | "locked" | "ended";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  calculatedStatus: "active" | "locked" | "ended";
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    grade: { type: String, required: true, index: true },

    contentType: {
      type: String,
      enum: ["video", "text", "pdf"],
      required: true,
    },
    videoUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "video";
      },
    },
    pdfUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "pdf";
      },
    },
    textContent: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "text";
      },
    },

    questions: [
      {
        questionText: { type: String, required: true },
        options: [
          {
            label: { type: String, required: true },
            text: { type: String, required: true },
          },
        ],
        correctAnswer: { type: String, required: true },
      },
    ],

    submittedStudents: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IAssignment, value: Date) {
          return value >= this.startDate;
        },
        message: "End date must be greater than or equal to start date",
      },
    },

    status: {
      type: String,
      enum: ["active", "locked", "ended"],
      default: "active",
      index: true,
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

assignmentSchema.virtual("calculatedStatus").get(function (this: IAssignment) {
  const now = new Date();
  if (now < this.startDate) return "locked";
  if (now > this.endDate) return "ended";
  return "active";
});


assignmentSchema.index({ endDate: 1 });
assignmentSchema.index({ grade: 1, status: 1 });


export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", assignmentSchema);
