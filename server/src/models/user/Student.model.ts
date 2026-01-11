import { Schema, Types } from "mongoose";
import { User, IUser } from "./User.model";
export interface IStudent extends IUser {
  rollNumber?: string;
  parentContact?: string;
  gradeId?: Types.ObjectId;
}
const StudentSchema = new Schema<IStudent>({
  rollNumber: {
    type: String,
    trim: true,
    index: true,
  },
  parentContact: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, "Please provide a valid phone number"],
  },
  gradeId: {
    type: Schema.Types.ObjectId,
    ref: "Grade",
    index: true,
  },
});
StudentSchema.index(
  { rollNumber: 1, gradeId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      rollNumber: { $exists: true, $nin: [null, ""] },
      gradeId: { $exists: true, $ne: null },
    },
    name: "rollNumber_gradeId_unique",
  }
);
StudentSchema.index({ email: 1 }, { unique: true });
StudentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const studentId = this._id;
      const { Submission } = await import("../assignment/Submission.schema");
      const { Attendance } = await import("../attendance/Attendance.schema");
      const { Chapter } = await import("../academic/Chapter.model");
      const { Grade } = await import("../academic/Grade.model");
      const { deleteFromCloudinary } = await import(
        "../../config/cloudinary"
      );
      if (this.profilePicturePublicId) {
        await deleteFromCloudinary(this.profilePicturePublicId).catch((err) =>
          console.error("Failed to delete profile picture:", err)
        );
      }
      const submissions = await Submission.find({ studentId }).lean();
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
      await Submission.deleteMany({ studentId });
      await Attendance.deleteMany({ studentId });
      const chapters = await Chapter.find({
        "studentProgress.studentId": studentId,
      }).lean();
      await Promise.all(
        chapters.map(async (chapter) => {
          const studentProgress = chapter.studentProgress?.find(
            (p) => p.studentId.toString() === studentId.toString()
          );
          if (studentProgress?.submissions) {
            await Promise.all(
              studentProgress.submissions.map(async (submission) => {
                if (submission.filePublicId) {
                  const resourceType =
                    submission.type === "video" ? "video" : "raw";
                  await deleteFromCloudinary(
                    submission.filePublicId,
                    resourceType
                  ).catch((err) =>
                    console.error("Failed to delete submission file:", err)
                  );
                }
              })
            );
          }
        })
      );
      await Chapter.updateMany(
        { "studentProgress.studentId": studentId },
        { $pull: { studentProgress: { studentId } } }
      );
      if (this.gradeId) {
        await Grade.updateMany(
          { students: studentId },
          { $pull: { students: studentId } }
        );
      }
      next();
    } catch (error: any) {
      console.error("Error in Student cascading delete:", error);
      next(error);
    }
  }
);
StudentSchema.pre("findOneAndDelete", async function (next) {
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
export const Student = User.discriminator<IStudent>("student", StudentSchema);
