import cloudinary, { uploadToCloudinary } from "../../../config/cloudinary";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendStudentCredentialsEmail } from "../../../lib/mail/sendStudentCredentialsEmail";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Student } from "../../../models/user/Student.model";
import { Grade } from "../../../models/academic/Grade.model";
import { Chapter } from "../../../models/academic/Chapter.model";
import { Teacher } from "../../../models/user/Teacher.model";
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
      gradeId: gradeIdName,
      gender,
      dateOfBirth,
      parentContact,
      address,
    } = req.body;
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }
    const existingRollInGrade = await Student.findOne({ 
      rollNumber, 
      gradeId: gradeIdName 
    });
    if (existingRollInGrade) {
      throw new ApiError(409, "Roll number already exists in this grade");
    }
    let profilePictureUrl = "";
    let profilePicturePublicId = "";
      if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, "student/profiles");
      profilePictureUrl = result.secure_url ;
      profilePicturePublicId = result.public_id;
    }
    const rawPassword = crypto.randomBytes(6).toString("base64");
    await sendStudentCredentialsEmail(email, name, email, rawPassword);
    const student = await Student.create({
      name,
      email,
      password: rawPassword,
      rollNumber,
      gradeId: gradeIdName,
      gender,
      dateOfBirth,
      parentContact,
      address,
      profilePictureUrl,
      profilePicturePublicId,
      role: "student",
    });
    await Grade.updateMany(
      { grade: gradeIdName },
      { $addToSet: { students: student._id } }
    );
    res.status(201).json({
      success: true,
      message: "Student successfully created",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        gradeId: student.gradeId,
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
    const student = await Student.findOne({ _id: id, role: "student" });
    if (!student) throw new ApiError(404, "Student not found");
    if (updates.email && updates.email !== student.email) {
      const existingEmail = await Student.findOne({ 
        email: updates.email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        throw new ApiError(409, "Email already exists");
      }
    }
    if (updates.rollNumber || updates.gradeId) {
      const targetGradeId = updates.gradeId || student.gradeId;
      const targetRollNumber = updates.rollNumber || student.rollNumber;
      if (targetRollNumber) {
        const existingRollInGrade = await Student.findOne({
          rollNumber: targetRollNumber,
          gradeId: targetGradeId,
          _id: { $ne: id }
        });
        if (existingRollInGrade) {
          throw new ApiError(409, "Roll number already exists in this grade");
        }
      }
    }
    const oldgradeId = student.gradeId;
    if (req.file) {
      if (student.profilePicturePublicId) {
        await cloudinary.uploader.destroy(student.profilePicturePublicId);
      }
      const result:any = await uploadToCloudinary(req.file.buffer, "student/profiles");
      updates.profilePictureUrl = result.secure_url;
      updates.profilePicturePublicId = result.public_id;
    }
    const updated = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (updates.gradeId && updates.gradeId !== oldgradeId) {
      await Promise.all([
        Grade.updateMany(
          { grade: oldgradeId },
          { $pull: { students: student._id } }
        ),
        Grade.updateMany(
          { grade: updates.gradeId },
          { $addToSet: { students: student._id } }
        ),
      ]);
    }
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
    const student = await Student.findOne({ _id: id, role: "student" });
    if (!student) throw new ApiError(404, "Student not found");
    const studentObjectId = new mongoose.Types.ObjectId(id);
    await Promise.all([
      student.profilePicturePublicId
        ? cloudinary.uploader.destroy(student.profilePicturePublicId)
        : Promise.resolve(),
      Grade.updateMany(
        { students: student._id },
        { $pull: { students: student._id } }
      ),
      Chapter.updateMany(
        { "studentProgress.studentId": studentObjectId },
        { $pull: { studentProgress: { studentId: studentObjectId } } }
      ),
      student.deleteOne(),
    ]);
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const createStudentByTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const teacherId = req.user?._id;
    const {
      name,
      email,
      rollNumber,
      gender,
      dateOfBirth,
      parentContact,
      address,
    } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const teacherGradeId = teacher.gradeId;
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }
    if (rollNumber) {
      const existingRollInGrade = await Student.findOne({ 
        rollNumber, 
        gradeId: teacherGradeId 
      });
      if (existingRollInGrade) {
        throw new ApiError(409, "Roll number already exists in your grade");
      }
    }
    let profilePictureUrl = "";
    let profilePicturePublicId = "";
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, "student/profiles");
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
      gradeId: teacherGradeId,
      gender,
      dateOfBirth,
      parentContact,
      address,
      profilePictureUrl,
      profilePicturePublicId,
      role: "student",
    });
    await Grade.findByIdAndUpdate(
      teacherGradeId,
      { $addToSet: { students: student._id } }
    );
    res.status(201).json({
      success: true,
      message: "Student successfully created",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        gradeId: student.gradeId,
        profilePictureUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const updateStudentByTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?._id;
    const updates = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const student = await Student.findOne({ 
      _id: id, 
      role: "student",
      gradeId: teacher.gradeId 
    });
    if (!student) {
      throw new ApiError(404, "Student not found in your grade");
    }
    if (updates.gradeId && updates.gradeId !== teacher.gradeId.toString()) {
      throw new ApiError(403, "You cannot change student's grade");
    }
    if (updates.email && updates.email !== student.email) {
      const existingEmail = await Student.findOne({ 
        email: updates.email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        throw new ApiError(409, "Email already exists");
      }
    }
    if (updates.rollNumber && updates.rollNumber !== student.rollNumber) {
      const existingRollInGrade = await Student.findOne({
        rollNumber: updates.rollNumber,
        gradeId: teacher.gradeId,
        _id: { $ne: id }
      });
      if (existingRollInGrade) {
        throw new ApiError(409, "Roll number already exists in your grade");
      }
    }
    if (req.file) {
      if (student.profilePicturePublicId) {
        await cloudinary.uploader.destroy(student.profilePicturePublicId);
      }
      const result: any = await uploadToCloudinary(req.file.buffer, "student/profiles");
      updates.profilePictureUrl = result.secure_url;
      updates.profilePicturePublicId = result.public_id;
    }
    const updated = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteStudentByTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?._id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const student = await Student.findOne({ 
      _id: id, 
      role: "student",
      gradeId: teacher.gradeId 
    });
    if (!student) {
      throw new ApiError(404, "Student not found in your grade");
    }
    const studentObjectId = new mongoose.Types.ObjectId(id);
    await Promise.all([
      student.profilePicturePublicId
        ? cloudinary.uploader.destroy(student.profilePicturePublicId)
        : Promise.resolve(),
      Grade.findByIdAndUpdate(
        teacher.gradeId,
        { $pull: { students: student._id } }
      ),
      Chapter.updateMany(
        { "studentProgress.studentId": studentObjectId },
        { $pull: { studentProgress: { studentId: studentObjectId } } }
      ),
      student.deleteOne(),
    ]);
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const fetchTeacherStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user?._id;
    const { page = 1, limit = 10, query = "" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const searchRegex = new RegExp(query as string, "i");
    const filter: any = { 
      role: "student",
      gradeId: teacher.gradeId 
    };
    if (query) {
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
      ];
    }
    const [students, total] = await Promise.all([
      Student.find(filter).select("-password").skip(skip).limit(limitNum),
      Student.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: students.length,
      totalPages: Math.ceil(total / limitNum),
      data: students,
    });
  } catch (err) {
    next(err);
  }
};
export const fetchTeacherStudentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?._id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const student = await Student.findOne({ 
      _id: id, 
      role: "student",
      gradeId: teacher.gradeId 
    }).select("-password");
    if (!student) {
      throw new ApiError(404, "Student not found in your grade");
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};
export const fetchTeacherStudentProgress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?._id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const student = await Student.findOne({ 
      _id: id, 
      role: "student",
      gradeId: teacher.gradeId 
    });
    if (!student) {
      throw new ApiError(404, "Student not found in your grade");
    }
    const studentObjectId = new mongoose.Types.ObjectId(id);
    const totalChapters = await Chapter.countDocuments({
      gradeId: teacher.gradeId,
    });
    const completedChaptersData = await Chapter.find({
      gradeId: teacher.gradeId,
      "studentProgress.studentId": studentObjectId,
      "studentProgress.status": "completed",
    })
      .select("title chapterNumber gradeId unitId studentProgress")
      .lean();
    const completedCount = completedChaptersData.length;
    const completionPercentage =
      totalChapters > 0
        ? Math.round((completedCount / totalChapters) * 100)
        : 0;
    const completedChapters = completedChaptersData.map((chapter) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === studentObjectId.toString()
      );
      return {
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        chapterNumber: chapter.chapterNumber,
        completedAt: progress?.completedAt,
        score: progress?.score,
      };
    });
    res.json({
      success: true,
      data: {
        studentId: student._id,
        studentName: student.name,
        gradeId: student.gradeId,
        totalChapters,
        completedCount,
        notCompletedChapters: totalChapters - completedCount,
        completionPercentage,
        completedChapters,
      },
    });
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
    const student = await Student.findOne({ _id: id, role: "student" }).select(
      "-password"
    );
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
    if (query) {
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
      ];
    }
    if (grade) {
      filter.gradeId = grade;
    }
    const [students, total] = await Promise.all([
      Student.find(filter).select("-password").skip(skip).limit(limitNum),
      Student.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize: students.length,
      totalPages: Math.ceil(total / limitNum),
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
    const student = await Student.findOne({ _id: id, role: "student" });
    if (!student) throw new ApiError(404, "Student not found");
    const studentObjectId = new mongoose.Types.ObjectId(id);
    const totalChapters = await Chapter.countDocuments({
      gradeId: student.gradeId,
    });
    const completedChaptersData = await Chapter.find({
      gradeId: student.gradeId,
      "studentProgress.studentId": studentObjectId,
      "studentProgress.status": "completed",
    })
      .select("title chapterNumber gradeId unitId studentProgress")
      .lean();
    const completedCount = completedChaptersData.length;
    const completionPercentage =
      totalChapters > 0
        ? Math.round((completedCount / totalChapters) * 100)
        : 0;
    const completedChapters = completedChaptersData.map((chapter) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === studentObjectId.toString()
      );
      return {
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        chapterNumber: chapter.chapterNumber,
        completedAt: progress?.completedAt,
        score: progress?.score,
      };
    });
    res.json({
      success: true,
      data: {
        studentId: student._id,
        studentName: student.name,
        gradeId: student.gradeId,
        totalChapters,
        completedCount,
        notCompletedChapters: totalChapters - completedCount,
        completionPercentage,
        completedChapters,
      },
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
      Student.findOne({ _id: studentId, role: "student" }),
      Chapter.findOne({ _id: chapterId }),
    ]);
    if (!student) throw new ApiError(404, "Student not found");
    if (!chapter) throw new ApiError(404, "Chapter not found");
    if (
      !student.gradeId ||
      chapter.gradeId.toString() !== student.gradeId.toString()
    ) {
      throw new ApiError(403, "Chapter does not belong to your grade");
    }
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const allChapters = await Chapter.find({
      gradeId: student.gradeId,
      unitId: chapter.unitId,
    })
      .sort({ chapterNumber: 1 })
      .select("_id chapterNumber studentProgress")
      .lean();
    const chapterIndex = allChapters.findIndex(
      (ch) => ch._id.toString() === chapterId
    );
    if (chapterIndex === -1) {
      throw new ApiError(404, "Chapter not found in sequence");
    }
    if (chapterIndex > 0 && chapter.requiresPreviousChapter) {
      const previousChapter = allChapters[chapterIndex - 1];
      const prevProgress = previousChapter.studentProgress?.find(
        (p) => p.studentId.toString() === studentObjectId.toString()
      );
      if (prevProgress?.status !== "completed") {
        throw new ApiError(403, "You must complete previous chapters first");
      }
    }
    const existingProgress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === studentObjectId.toString()
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
      if (!chapter.studentProgress) {
        chapter.studentProgress = [];
      }
      chapter.studentProgress.push({
        studentId: studentObjectId,
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
        studentId: studentObjectId,
        chapterId: chapter._id,
        completedAt: existingProgress?.completedAt || new Date(),
        score: validatedScore,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const fetchStudentsByGrade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    const { page = 1, limit = 10, query = "" } = req.query;
    if (!mongoose.isValidObjectId(gradeId)) {
      throw new ApiError(400, "Invalid grade ID format");
    }
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;
    const grade = await Grade.findById(gradeId).select("grade").lean();
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const searchRegex = new RegExp(query as string, "i");
    const filter: any = {
      role: "student",
      gradeId: gradeId,
    };
    if (query) {
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
      ];
    }
    const [students, total] = await Promise.all([
      Student.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limitNum)
        .sort({ name: 1 })
        .lean(),
      Student.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limitNum) || 1;
    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      meta: {
        total,
        totalPages,
        page: pageNum,
        limit: limitNum,
        gradeName: grade.grade,
        gradeId: gradeId,
      },
      data: students,
    });
  } catch (err) {
    next(err);
  }
};