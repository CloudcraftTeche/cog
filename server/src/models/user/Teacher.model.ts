import { Schema, Types } from "mongoose";
import { User, IUser } from "./User.model";
export interface ITeacher extends IUser {
  qualifications?: string;
  gradeId: Types.ObjectId;
  createdBy: Types.ObjectId;
  specializations?: string[];
}
const TeacherSchema = new Schema<ITeacher>({
  qualifications: {
    type: String,
    trim: true,
  },
  specializations: [
    {
      type: String,
      trim: true,
    },
  ],
  gradeId: {
    type: Schema.Types.ObjectId,
    ref: "Grade",
    required: [true, "GradeId assignment is required"],
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Creator reference is required"],
  },
});
TeacherSchema.index({ gradeId: 1, createdBy: 1 });
TeacherSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const teacherId = this._id;
      const { Assignment } = await import("../assignment/Assignment.schema");
      const { Submission } = await import("../assignment/Submission.schema");
      const { Attendance } = await import("../attendance/Attendance.schema");
      const { TeacherAttendance } = await import(
        "../attendance/TeacherAttendance.schema"
      );
      const { Chapter } = await import("../academic/Chapter.model");
      const { TeacherChapter } = await import(
        "../academic/TeacherChapter.model"
      );
      const { Grade } = await import("../academic/Grade.model");
      const { deleteFromCloudinary } = await import(
        "../../config/cloudinary"
      );
      if (this.profilePicturePublicId) {
        await deleteFromCloudinary(this.profilePicturePublicId, "raw").catch((err) =>
          console.error("Failed to delete profile picture:", err)
        );
      }
      const assignments = await Assignment.find({
        createdBy: teacherId,
      }).lean();
      const assignmentIds = assignments.map((a) => a._id);
      await Promise.all(
        assignments.map(async (assignment) => {
          const deletePromises = [];
          if (assignment.videoPublicId) {
            deletePromises.push(
              deleteFromCloudinary(assignment.videoPublicId, "video")
            );
          }
          if (assignment.pdfPublicId) {
            deletePromises.push(
              deleteFromCloudinary(assignment.pdfPublicId, "raw")
            );
          }
          return Promise.allSettled(deletePromises);
        })
      );
      const submissions = await Submission.find({
        assignmentId: { $in: assignmentIds },
      }).lean();
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
      await Promise.all([
        Submission.deleteMany({ assignmentId: { $in: assignmentIds } }),
        Assignment.deleteMany({ createdBy: teacherId }),
      ]);
      await Promise.all([
        Attendance.deleteMany({ teacherId }),
        TeacherAttendance.deleteMany({ teacherId }),
        TeacherAttendance.deleteMany({ studentId: teacherId }),
      ]);
      const chapters = await Chapter.find({ createdBy: teacherId }).lean();
      await Promise.all(
        chapters.map(async (chapter) => {
          const deletePromises = [];
          for (const item of chapter.contentItems) {
            if (item.publicId) {
              const resourceType = item.type === "video" ? "video" : "raw";
              deletePromises.push(
                deleteFromCloudinary(item.publicId, resourceType)
              );
            }
          }
          if (chapter.studentProgress) {
            for (const progress of chapter.studentProgress) {
              if (progress.submissions) {
                for (const submission of progress.submissions) {
                  if (submission.filePublicId) {
                    const resourceType =
                      submission.type === "video" ? "video" : "raw";
                    deletePromises.push(
                      deleteFromCloudinary(
                        submission.filePublicId,
                        resourceType
                      )
                    );
                  }
                }
              }
            }
          }
          return Promise.allSettled(deletePromises);
        })
      );
      await Chapter.deleteMany({ createdBy: teacherId });
      await TeacherChapter.updateMany(
        { "teacherProgress.teacherId": teacherId },
        { $pull: { teacherProgress: { teacherId } } }
      );
      const teacherChapters = await TeacherChapter.find({
        createdBy: teacherId,
      }).lean();
      await TeacherChapter.deleteMany({ createdBy: teacherId });
      if (this.gradeId) {
        await Grade.updateMany(
          { teachers: teacherId },
          { $pull: { teachers: teacherId } }
        );
      }
      next();
    } catch (error: any) {
      console.error("Error in Teacher cascading delete:", error);
      next(error);
    }
  }
);
TeacherSchema.pre("findOneAndDelete", async function (next) {
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
export const Teacher = User.discriminator<ITeacher>("teacher", TeacherSchema);
