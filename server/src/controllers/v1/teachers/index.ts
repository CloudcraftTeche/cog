import cloudinary, { uploadToCloudinary } from "../../../config/cloudinary";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { sendTeacherCredentialsEmail } from "../../../lib/mail/sendTeacherCredentialsEmail";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Teacher } from "../../../models/user/Teacher.model";
import { Grade } from "../../../models/academic/Grade.model";
import { Student } from "../../../models/user/Student.model";
import { TeacherChapter } from "../../../models/academic/TeacherChapter.model";
import mongoose from "mongoose";
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
      gradeId,
      qualifications,
      address,
    } = req.body;
    if (await Teacher.exists({ email })) {
      throw new ApiError(409, "Email already exists");
    }
    let profilePictureUrl = "";
    let profilePicturePublicId = "";
    if (req.file) {
      const result: any = await uploadToCloudinary(
        req.file.buffer,
        "teacher/profiles",
        "image"
      );
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
      qualifications,
      address,
      gradeId,
      createdBy: userId,
      profilePictureUrl,
      profilePicturePublicId,
      role: "teacher",
    });
    await Grade.updateMany(
      { grade: gradeId },
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
      const result: any = await uploadToCloudinary(
        req.file.buffer,
        "teacher/profiles",
        "image"
      );
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
        { teachers: teacher._id },
        { $pull: { teachers: teacher._id } }
      ),
    ]);
    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
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
    const { page = 1, limit = 10, query = "", gradeId } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const searchRegex = new RegExp(query as string, "i");
    const filter: any = { role: "teacher" };
    if (gradeId) {
      filter.gradeId = gradeId;
    }
    if (query) {
      filter.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ];
    }
    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate("gradeId", "grade section")
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
export const getStudentTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await Student.findById(req.user?._id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const teachers = await Teacher.find({ gradeId: student.gradeId }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};
export const markChapterCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId, quizScore } = req.body;
    const { id: teacherId } = req.params;
    const [teacher, chapter] = await Promise.all([
      Teacher.findOne({ _id: teacherId, role: "teacher" }),
      TeacherChapter.findOne({ _id: chapterId }),
    ]);
    if (!teacher) throw new ApiError(404, "teachert not found");
    if (!chapter) throw new ApiError(404, "Chapter not found");
    if (
      !teacher.gradeId ||
      chapter.gradeId.toString() !== teacher.gradeId.toString()
    ) {
      throw new ApiError(403, "Chapter does not belong to your grade");
    }
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
    const allChapters = await TeacherChapter.find({
      gradeId: teacher.gradeId,
      unitId: chapter.unitId,
    })
      .sort({ chapterNumber: 1 })
      .select("_id chapterNumber teacherProgress")
      .lean();
    const chapterIndex = allChapters.findIndex(
      (ch) => ch._id.toString() === chapterId
    );
    if (chapterIndex === -1) {
      throw new ApiError(404, "Chapter not found in sequence");
    }
    if (chapterIndex > 0 && chapter.requiresPreviousChapter) {
      const previousChapter = allChapters[chapterIndex - 1];
      const prevProgress = previousChapter.teacherProgress?.find(
        (p) => p.teacherId.toString() === teacherObjectId.toString()
      );
      if (prevProgress?.status !== "completed") {
        throw new ApiError(403, "You must complete previous chapters first");
      }
    }
    const existingProgress = chapter.teacherProgress?.find(
      (p) => p.teacherId.toString() === teacherObjectId.toString()
    );
    const validatedScore = Math.min(Math.max(quizScore || 0, 0), 100);
    if (existingProgress) {
      existingProgress.status = "completed";
      existingProgress.completedAt = new Date();
      existingProgress.score = validatedScore;
      if (!existingProgress.startedAt) {
        existingProgress.startedAt = new Date();
      }
    } else {
      if (!chapter.teacherProgress) {
        chapter.teacherProgress = [];
      }
      chapter.teacherProgress.push({
        teacherId: teacherObjectId,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        score: validatedScore,
      } as any);
    }
    await chapter.save();
    return res.json({
      success: true,
      message: existingProgress
        ? "Chapter completion updated"
        : "Chapter marked as completed",
      data: {
        teacherId: teacherObjectId,
        chapterId: chapter._id,
        completedAt: existingProgress?.completedAt || new Date(),
        score: validatedScore,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getTeachersByGrade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const teachers = await Teacher.find({
      gradeId,
      role: "teacher",
    })
      .populate("gradeId", "grade section academicYear")
      .select("-password")
      .sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (err) {
    next(err);
  }
};
