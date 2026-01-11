import { Schema, model, Document, Types } from "mongoose";
import { IUnit, UnitSchema } from "./Unit.schema";
import { ISubmission } from "../assignment/Submission.schema";
import { IAttendance } from "../attendance/Attendance.schema";
export interface IGrade extends Document {
  _id: Types.ObjectId;
  grade: string;
  description?: string;
  units: IUnit[];
  isActive: boolean;
  academicYear?: string;
  createdAt: Date;
  updatedAt: Date;
  addUnit(unitData: Partial<IUnit>): Promise<IUnit>;
  updateUnit(
    unitId: Types.ObjectId,
    updateData: Partial<IUnit>
  ): Promise<IUnit>;
  deleteUnit(unitId: Types.ObjectId): Promise<boolean>;
  getChapters(unitId?: Types.ObjectId): Promise<any[]>;
  addSubmission(submission: Partial<ISubmission>): Promise<ISubmission>;
  addAttendance(attendance: Partial<IAttendance>): Promise<IAttendance>;
  getAttendancePercentage(studentId: Types.ObjectId): number;
  getAssignmentCompletionRate(studentId: Types.ObjectId): number;
  getAverageScore(studentId: Types.ObjectId): number | null;
}
const GradeSchema = new Schema<IGrade>(
  {
    grade: {
      type: String,
      required: [true, "Grade name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    units: {
      type: [UnitSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    academicYear: {
      type: String,
      match: [/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
GradeSchema.index({ grade: 1, isActive: 1 });
GradeSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const gradeId = this._id;
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
      const { Student } = await import("../user/Student.model");
      const { Teacher } = await import("../user/Teacher.model");
      const { Announcement } = await import("../announcement");
      const { ChatRoom } = await import("../chat/Chat.model");
      const { Message } = await import("../chat/Message.model");
      const { deleteFromCloudinary } = await import(
        "../../config/cloudinary"
      );
      const assignments = await Assignment.find({ gradeId }).lean();
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
        Assignment.deleteMany({ gradeId }),
      ]);
      await Promise.all([
        Attendance.deleteMany({ gradeId }),
        TeacherAttendance.deleteMany({ gradeId }),
      ]);
      const chapters = await Chapter.find({ gradeId }).lean();
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
      await Chapter.deleteMany({ gradeId });
      await TeacherChapter.deleteMany({ gradeId });
      await Student.updateMany({ gradeId }, { $unset: { gradeId: "" } });
      await Teacher.updateMany({ gradeId }, { $unset: { gradeId: "" } });
      await ChatRoom.deleteMany({ gradeId });
      await Message.deleteMany({ gradeId });
      await Announcement.updateMany(
        { targetGrades: gradeId },
        { $pull: { targetGrades: gradeId } }
      );
      next();
    } catch (error: any) {
      console.error("Error in Grade cascading delete:", error);
      next(error);
    }
  }
);
GradeSchema.pre("findOneAndDelete", async function (next) {
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
export const Grade = model<IGrade>("Grade", GradeSchema);
