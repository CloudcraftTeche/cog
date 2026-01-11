import { model, Schema, Types } from "mongoose";
import { QuestionSchema, IQuestion } from "../shared/Question.schema";
export interface IAssignment {
  _id: Types.ObjectId;
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  videoUrl?: string;
  gradeId: Types.ObjectId;
  videoPublicId?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  textContent?: string;
  questions: IQuestion[];
  startDate: Date;
  endDate: Date;
  status: "active" | "locked" | "ended";
  createdBy: Types.ObjectId;
  totalMarks?: number;
  passingMarks?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
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
        values: ["video", "text", "pdf"],
        message: "{VALUE} is not a valid content type",
      },
      required: [true, "Content type is required"],
    },
    videoUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "video";
      },
    },
    videoPublicId: String,
    pdfUrl: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "pdf";
      },
    },
    pdfPublicId: String,
    textContent: {
      type: String,
      required: function (this: IAssignment) {
        return this.contentType === "text";
      },
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (val: IQuestion[]) => val.length > 0,
        message: "At least one question is required",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "locked", "ended"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
      index: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade reference is required"],
      index: true,
    },
    totalMarks: {
      type: Number,
      min: [0, "Total marks cannot be negative"],
    },
    passingMarks: {
      type: Number,
      min: [0, "Passing marks cannot be negative"],
      validate: {
        validator: function (this: IAssignment, value: number) {
          return !this.totalMarks || value <= this.totalMarks;
        },
        message: "Passing marks cannot exceed total marks",
      },
    },
  },
  { timestamps: true }
);
AssignmentSchema.index({ status: 1, startDate: -1 });
AssignmentSchema.index({ createdBy: 1, status: 1 });
AssignmentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const assignmentId = this._id;
      const { Submission } = await import("./Submission.schema");
      const { deleteFromCloudinary } = await import(
        "../../config/cloudinary"
      );
      const deletePromises = [];
      if (this.videoPublicId) {
        deletePromises.push(
          deleteFromCloudinary(this.videoPublicId, "video").catch((err) =>
            console.error("Failed to delete assignment video:", err)
          )
        );
      }
      if (this.pdfPublicId) {
        deletePromises.push(
          deleteFromCloudinary(this.pdfPublicId, "raw").catch((err) =>
            console.error("Failed to delete assignment PDF:", err)
          )
        );
      }
      await Promise.allSettled(deletePromises);
      const submissions = await Submission.find({ assignmentId }).lean();
      await Promise.all(
        submissions.map(async (sub) => {
          const deletePromises = [];
          if (sub.videoPublicId) {
            deletePromises.push(
              deleteFromCloudinary(sub.videoPublicId, "video")
            );
          }
          if (sub.pdfPublicId) {
            deletePromises.push(deleteFromCloudinary(sub.pdfPublicId, "raw"));
          }
          return Promise.allSettled(deletePromises);
        })
      );
      await Submission.deleteMany({ assignmentId });
      next();
    } catch (error: any) {
      console.error("Error in Assignment cascading delete:", error);
      next(error);
    }
  }
);
AssignmentSchema.pre("findOneAndDelete", async function (next) {
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
export const Assignment = model<IAssignment>("Assignment", AssignmentSchema);
