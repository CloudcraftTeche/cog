import cloudinary from "../../../config/cloudinary";
import { Request, Response, NextFunction } from "express";
import { Student } from "../../../models/user"; 
import { uploadImage } from "../../../utils/uploadImage";
import mongoose, { Schema } from "mongoose";
import { Chapter } from "../../../models/chapter";
import crypto from "crypto";
import { sendStudentCredentialsEmail } from "../../../lib/mail/sendStudentCredentialsEmail";
import { Grade } from "../../../models/grade";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";
import { Announcement } from "../../../models/Announcement";




export const registerStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      name,
      email,
      rollNumber,
      class: className,
      gender,
      dateOfBirth,
      parentContact,
      address,
    } = req.body;

    if (await Student.exists({ email })) {
      throw new ApiError(409, "Email already exists");
    }

    if (await Student.exists({ rollNumber })) {
      throw new ApiError(409, "Roll Number already exists");
    }

    let profilePictureUrl = "";
    let profilePicturePublicId = "";
    if (req.file) {
      const result = await uploadImage(req.file.buffer, "student_profiles");
      profilePictureUrl = result.secure_url;
      profilePicturePublicId = result.public_id;
    }

    const rawPassword = crypto.randomBytes(6).toString("base64");

    await sendStudentCredentialsEmail(email, name, email, rawPassword);

    const student = await Student.create({
      name,
      email,
      password: rawPassword,
      rollNumber,
      class: className,
      gender,
      dateOfBirth,
      parentContact,
      address,
      profilePictureUrl,
      profilePicturePublicId,
      role: "student",
    });

    await Grade.updateMany(
      { grade: className },
      { $addToSet: { students: student._id } }
    );

    res.status(201).json({
      success: true,
      message: "Student successfully created",
      data: {
        id: student._id,
        name: student.name,
        profilePictureUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const modifyStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) throw new ApiError(404, "Student not found");

    if (req.file) {
      if (student.profilePicturePublicId) {
        await cloudinary.uploader.destroy(student.profilePicturePublicId);
      }

      const result = await uploadImage(req.file.buffer, "student_profiles");
      updates.profilePictureUrl = result.secure_url;
      updates.profilePicturePublicId = result.public_id;
    }

    const updated = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};


export const removeStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) throw new ApiError(404, "Student not found");

    await Promise.all([
      student.profilePicturePublicId
        ? cloudinary.uploader.destroy(student.profilePicturePublicId)
        : Promise.resolve(),
      student.deleteOne(),
      Grade.updateMany(
        { students: student._id },
        { $pull: { students: student._id } }
      ),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
};


export const fetchStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) throw new ApiError(404, "Student not found");

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};


export const fetchStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, query = "", grade } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const searchRegex = new RegExp(query as string, "i");
    const filter: any = { role: "student" };
    if (query) filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    if (grade) filter.class = grade;

    const [students, total] = await Promise.all([
      Student.find(filter).select("-password").skip(skip).limit(limitNum),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};


export const fetchStudentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate("completedChapters.chapter");
    if (!student) throw new ApiError(404, "Student not found");

    const totalChapters = await Chapter.countDocuments({
      class: student.class,
    });
    const completedCount = student.completedChapters.length;

    const completionPercentage =
      totalChapters > 0
        ? Math.round((completedCount / totalChapters) * 100)
        : 0;

    const averageScore =
      completedCount > 0
        ? student.completedChapters.reduce(
            (sum, c) => sum + (c.quizScore || 0),
            0
          ) / completedCount
        : 0;

    res.json({
      success: true,
      data: {
        totalChapters,
        completedCount,
        completionPercentage,
        averageScore: Math.round(averageScore),
        completedChapters: student.completedChapters,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const fetchStudentsCount = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments({ role: "student" });
    res.status(200).json({ success: true, totalStudents });
  } catch (err) {
    next(err);
  }
};


export const fetchStudentsByClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const searchRegex = new RegExp(query as string, "i");
    const filter = {
      role: "student",
      class: classId,
      $or: [{ name: searchRegex }, { email: searchRegex }],
    };

    const [students, total] = await Promise.all([
      Student.find(filter).select("-password").skip(skip).limit(limitNum),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};


export const markChapterCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId, quizScore } = req.body;
    const { id: studentId } = req.params;

    const [student, chapter] = await Promise.all([
      Student.findById(studentId),
      Chapter.findById(chapterId),
    ]);

    if (!student) throw new ApiError(404, "Student not found");
    if (!chapter) throw new ApiError(404, "Chapter not found");

    const allChapters = await Chapter.find({ class: student.class })
      .sort({ createdAt: 1 })
      .select("_id")
      .lean();

    const chapterIndex = allChapters.findIndex(
      (ch) => ch._id.toString() === chapterId
    );
    const completedCount = student.completedChapters.length;

    if (chapterIndex > completedCount) {
      throw new ApiError(403, "You must complete previous chapters first");
    }

    const now = new Date();
    const existing = student.completedChapters.find(
      (item) => item.chapter.toString() === chapterId
    );

    if (existing) {
      existing.quizScore = quizScore || 0;
      existing.completedAt = now;
    } else {
      student.completedChapters.push({
        chapter: new mongoose.Types.ObjectId(chapterId),
        quizScore: quizScore || 0,
        completedAt: now,
      });
    }

    if (!chapter.completedStudents?.some((id) => id.toString() === studentId)) {
      chapter.completedStudents?.push(student._id);
    }

    await Promise.all([student.save(), chapter.save()]);

    return res.json({
      success: true,
      message: existing
        ? "Chapter retake recorded"
        : "Chapter marked as completed",
      data: {
        studentId: student._id,
        completedChapters: student.completedChapters,
      },
    });
  } catch (err) {
    next(err);
  }
};


const fmtMonth = (id: { year: number; month: number }) =>
  `${id.month}-${id.year}`;

export const getStudentDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.userId;
    if (!studentId) throw new ApiError(403, "Unauthorized");

    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const student = await Student.findById(studentObjectId)
      .select("class completedChapters name")
      .populate({
        path: "completedChapters.chapter",
        select: "title createdAt class",
      })
      .lean();

    if (!student) throw new ApiError(404, "Student not found");

    const [
      totalChapters,
      assignmentsForGradeCount,
      submissionStatusAgg,
      submissionTrendAgg,
      latestAnnouncements,
    ] = await Promise.all([
      Chapter.countDocuments({ class: student.class }),
      Assignment.countDocuments({ grade: student.class }),
      Submission.aggregate([
        { $match: { student: studentObjectId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $match: { student: studentObjectId } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),
      Announcement.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const completedCount = (student.completedChapters || []).length;
    const completionPercentage =
      totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    const submissionStatus = submissionStatusAgg.map((s: any) => ({
      status: s._id,
      count: s.count,
    }));

    const submissionTrend = submissionTrendAgg.reverse().map((r: any) => ({
      month: fmtMonth(r._id),
      count: r.count,
    }));

    const chapterWiseProgress = (student.completedChapters || []).map((c: any) => ({
      chapterId: c.chapter?._id,
      chapterTitle: c.chapter?.title || "Unknown",
      quizScore: c.quizScore ?? 0,
      completedAt: c.completedAt,
    }));

    res.json({
      success: true,
      data: {
        student: {
          id: studentObjectId,
          name: student.name,
          class: student.class,
        },
        totals: {
          totalChapters,
          completedChapters: completedCount,
          notCompletedChapters: totalChapters - completedCount,
          completionPercentage,
          assignmentsAvailable: assignmentsForGradeCount,
        },
        submissionStatus,
        submissionTrend,
        chapterWiseProgress,
        latestAnnouncements,
      },
    });
  } catch (err) {
    next(err);
  }
};
