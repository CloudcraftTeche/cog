import cloudinary from "../../../config/cloudinary";
import { Request, Response, NextFunction } from "express";
import { Teacher } from "../../../models/user";
import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import { uploadImage } from "../../../utils/uploadImage";
import { sendTeacherCredentialsEmail } from "../../../lib/mail/sendTeacherCredentialsEmail";
import { Grade } from "../../../models/grade";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";
import { Chapter } from "../../../models/chapter";


export const createNewTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req?.userId as any;
    const {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      classTeacherFor,
      qualifications,
      address,
    } = req.body;

    if (await Teacher.exists({ email })) {
      throw new ApiError(409, "Email already exists");
    }

    let profilePictureUrl = "";
    let profilePicturePublicId = "";
    if (req.file) {
      const result = await uploadImage(req.file.buffer, "teacher_profiles");
      profilePictureUrl = result.secure_url;
      profilePicturePublicId = result.public_id;
    }

    const rawPassword = crypto.randomBytes(6).toString("base64");
    await sendTeacherCredentialsEmail(email, name, email, rawPassword);

    const teacher = await Teacher.create({
      name,
      email,
      password: rawPassword,
      phone,
      gender,
      dateOfBirth,
      classTeacherFor,
      qualifications,
      address,
      createdBy: userId,
      profilePictureUrl,
      profilePicturePublicId,
      role: "teacher",
    });

    await Grade.updateMany(
      { grade: teacher.classTeacherFor },
      { $addToSet: { teachers: teacher._id } }
    );

    res.status(201).json({
      success: true,
      message: "Teacher successfully created",
      data: {
        id: teacher._id,
        name: teacher.name,
        profilePictureUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const updateTeacherDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) throw new ApiError(404, "Teacher not found");

    if (req.file) {
      if (teacher.profilePicturePublicId) {
        await cloudinary.uploader.destroy(teacher.profilePicturePublicId);
      }
      const result = await uploadImage(req.file.buffer, "teacher_profiles");
      updates.profilePictureUrl = result.secure_url;
      updates.profilePicturePublicId = result.public_id;
    }

    const updated = await Teacher.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const removeTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) throw new ApiError(404, "Teacher not found");

    await Promise.all([
      teacher.profilePicturePublicId
        ? cloudinary.uploader.destroy(teacher.profilePicturePublicId)
        : Promise.resolve(),
      teacher.deleteOne(),
      Grade.updateMany(
        { grade: teacher.classTeacherFor },
        { $pull: { teachers: teacher._id } }
      ),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getTeacherById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id).select("-password");
    if (!teacher) throw new ApiError(404, "Teacher not found");

    res.status(200).json({ success: true, data: teacher });
  } catch (err) {
    next(err);
  }
};


export const getTeachersList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const searchRegex = new RegExp(query as string, "i");
    const filter: any = { role: "teacher" };
    if (query) {
      filter.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ];
    }

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Teacher.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: teachers.length,
      totalPages: Math.ceil(total / limitNum),
      data: teachers,
    });
  } catch (err) {
    next(err);
  }
};


export const getTeachersTotalCount = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalTeachers = await Teacher.countDocuments({ role: "teacher" });
    res.status(200).json({ success: true, totalTeachers });
  } catch (err) {
    next(err);
  }
};

function fmtMonth({ year, month }: { year: number; month: number }) {
  return `${month.toString().padStart(2, "0")}-${year}`;
}


export const getTeacherDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const teacherObjectId = new mongoose.Types.ObjectId(req.userId);

    const teacherAssignments = await Assignment.find({
      createdBy: teacherObjectId,
    })
      .select("_id")
      .lean();

    const assignmentIds = teacherAssignments.map((a) => a._id);

    let assignmentCount = 0;
    let submissionStats: any[] = [];
    let submissionTrend: any[] = [];
    let topStudents: any[] = [];

    if (assignmentIds.length) {
      const [
        assignmentCountRes,
        submissionStatsAgg,
        submissionTrendAgg,
        topStudentsAgg,
      ] = await Promise.all([
        Assignment.countDocuments({ createdBy: teacherObjectId }),

        Submission.aggregate([
          { $match: { assignment: { $in: assignmentIds } } },
          {
            $group: {
              _id: {
                $cond: [{ $ifNull: ["$score", false] }, "graded", "pending"],
              },
              count: { $sum: 1 },
            },
          },
        ]),

        Submission.aggregate([
          { $match: { assignment: { $in: assignmentIds } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 6 },
        ]),

        Submission.aggregate([
          {
            $match: {
              assignment: { $in: assignmentIds },
              score: { $ne: null },
            },
          },
          {
            $group: {
              _id: "$student",
              avgScore: { $avg: "$score" },
              submissionsCount: { $sum: 1 },
            },
          },
          { $sort: { avgScore: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "student",
            },
          },
          { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              studentId: "$_id",
              name: "$student.name",
              avgScore: { $round: ["$avgScore", 2] },
              submissionsCount: 1,
            },
          },
        ]),
      ]);

      assignmentCount = assignmentCountRes;
      submissionStats = submissionStatsAgg.map((s: any) => ({
        status: s._id,
        count: s.count,
      }));

      submissionTrend = submissionTrendAgg.reverse().map((r: any) => ({
        month: fmtMonth(r._id),
        count: r.count,
      }));

      topStudents = topStudentsAgg.map((s: any) => ({
        studentId: s.studentId,
        name: s.name || "Unknown",
        avgScore: s.avgScore,
        submissionsCount: s.submissionsCount,
      }));
    }

    const [chapterCount, completionStats, avgScores] = await Promise.all([
      Chapter.countDocuments({ createdBy: teacherObjectId }),

      Chapter.aggregate([
        { $match: { createdBy: teacherObjectId } },
        {
          $project: {
            title: 1,
            totalCompleted: { $size: "$completedStudents" },
          },
        },
      ]),

      Chapter.aggregate([
        { $match: { createdBy: teacherObjectId } },
        {
          $lookup: {
            from: "users",
            localField: "completedStudents",
            foreignField: "_id",
            as: "students",
          },
        },
        { $unwind: { path: "$students", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$students.completedChapters",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: { "students.completedChapters.chapter": { $exists: true } },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            avgScore: { $avg: "$students.completedChapters.quizScore" },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          assignments: assignmentCount,
          chapters: chapterCount,
        },
        submissionStats,
        submissionTrend,
        topStudents,
        completionStats,
        avgScores: avgScores.map((a) => ({
          chapterId: a._id,
          title: a.title,
          avgScore: Math.round((a.avgScore || 0) * 100) / 100,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
