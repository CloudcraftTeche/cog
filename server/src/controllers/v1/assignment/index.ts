import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../../config/cloudinary";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Grade } from "../../../models/academic/Grade.model";
import { Assignment } from "../../../models/assignment/Assignment.schema";
import { Submission } from "../../../models/assignment/Submission.schema";
import { Student } from "../../../models/user/Student.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { User } from "../../../models/user/User.model";
import { ApiError } from "../../../utils/ApiError";
import { Response, NextFunction } from "express";
const getUserRole = async (userId: string) => {
  const user = await User.findById(userId).select("role");
  return user?.role || null;
};
const getGradeNameFromId = async (gradeId: any) => {
  if (!gradeId) return null;
  const grade = await Grade.findById(gradeId).select("grade");
  return grade?.grade || null;
};
export const createAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await getUserRole(req.userId);
    let gradeId: any;
    if (role === "admin") {
      gradeId = req.params.gradeId;
    } else if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      gradeId = teacher.gradeId;
    } else {
      throw new ApiError(403, "Only admin and teacher can create assignments");
    }
    const grade = await Grade.findById(gradeId);
    if (!grade) throw new ApiError(404, "Grade not found");
    const {
      title,
      description,
      contentType,
      textContent,
      questions,
      startDate,
      endDate,
      totalMarks,
      passingMarks,
    } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, "End date must be after start date");
    }
    let videoUrl: string | undefined;
    let videoPublicId: string | undefined;
    let pdfUrl: string | undefined;
    let pdfPublicId: string | undefined;
    if (req.file) {
      const resourceType = contentType === "video" ? "video" : "raw";
      const filename = req.file.originalname;
      const uploadResult: any = await uploadToCloudinary(
        req.file.buffer,
        "assignments",
        resourceType,
        filename
      );
      if (contentType === "video") {
        videoUrl = uploadResult.secure_url;
        videoPublicId = uploadResult.public_id;
      } else if (contentType === "pdf") {
        pdfUrl = uploadResult.secure_url;
        pdfPublicId = uploadResult.public_id;
      }
    }
    const assignment = await Assignment.create({
      title,
      description,
      contentType,
      videoUrl,
      videoPublicId,
      pdfUrl,
      pdfPublicId,
      textContent: contentType === "text" ? textContent : undefined,
      questions: Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]"),
      startDate,
      endDate,
      totalMarks: totalMarks || 100,
      passingMarks: passingMarks || 40,
      createdBy: req.userId,
      status: "active",
      gradeId: grade._id,
    });
    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};
export const createAssignmentForMultipleGrades = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await getUserRole(req.userId);
    if (role !== "admin") {
      throw new ApiError(
        403,
        "Only admin can create assignments for multiple grades"
      );
    }
    const {
      gradeIds,
      title,
      description,
      contentType,
      textContent,
      questions,
      startDate,
      endDate,
      totalMarks,
      passingMarks,
    } = req.body;
    if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
      throw new ApiError(400, "Please provide at least one grade ID");
    }
    if (new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, "End date must be after start date");
    }
    const grades = await Grade.find({ _id: { $in: gradeIds } });
    if (grades.length !== gradeIds.length) {
      throw new ApiError(404, "One or more grades not found");
    }
    let videoUrl: string | undefined;
    let videoPublicId: string | undefined;
    let pdfUrl: string | undefined;
    let pdfPublicId: string | undefined;
    if (req.file) {
      const resourceType = contentType === "video" ? "video" : "raw";
      const filename = req.file.originalname;
      const uploadResult: any = await uploadToCloudinary(
        req.file.buffer,
        "assignments",
        resourceType,
        filename
      );
      if (contentType === "video") {
        videoUrl = uploadResult.secure_url;
        videoPublicId = uploadResult.public_id;
      } else if (contentType === "pdf") {
        pdfUrl = uploadResult.secure_url;
        pdfPublicId = uploadResult.public_id;
      }
    }
    const parsedQuestions = Array.isArray(questions)
      ? questions
      : JSON.parse(questions || "[]");
    const createdAssignments = await Promise.all(
      grades.map(async (grade) => {
        const assignment = await Assignment.create({
          title,
          description,
          contentType,
          videoUrl,
          videoPublicId,
          pdfUrl,
          pdfPublicId,
          textContent: contentType === "text" ? textContent : undefined,
          questions: parsedQuestions,
          startDate,
          endDate,
          totalMarks: totalMarks || 100,
          passingMarks: passingMarks || 40,
          createdBy: req.userId,
          status: "active",
          gradeId: grade._id,
        });
        return {
          gradeId: grade._id,
          gradeName: grade.grade,
          assignment,
        };
      })
    );
    res.status(201).json({
      success: true,
      message: `Assignment created for ${grades.length} grade(s)`,
      data: createdAssignments,
    });
  } catch (err) {
    next(err);
  }
};
export const getAllAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await getUserRole(req.userId);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const status = req.query.status as string;
    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const grade = await Grade.findById(teacher.gradeId).select("_id");
      if (!grade) throw new ApiError(404, "Grade not found");
      filter.gradeId = grade._id;
    } else if (role === "student") {
      const student = await Student.findById(req.userId).select("gradeId");
      if (!student) throw new ApiError(404, "Student not found");
      if (student.gradeId) {
        filter.gradeId = student.gradeId;
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          filters: { search, status },
        });
      }
    }
    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
      .populate("gradeId", "_id grade")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment: any) => {
        let submittedStudents: any = [];
        if (role === "admin" || role === "teacher") {
          const submissions = await Submission.find({
            assignmentId: assignment._id,
          }).select("studentId");
          submittedStudents = submissions.map((s) => s.studentId);
        }
        return {
          ...assignment,
          submittedStudents,
        };
      })
    );
    res.json({
      success: true,
      data: enrichedAssignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: { search, status },
    });
  } catch (err) {
    next(err);
  }
};
export const getAssignmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId } = req.params;
    const role = await getUserRole(req.userId);
    const assignment = await Assignment.findById(assignmentId).populate(
      "gradeId",
      "_id grade"
    );
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (
        !teacher ||
        teacher.gradeId.toString() !== assignment.gradeId._id.toString()
      ) {
        throw new ApiError(403, "You can only view assignments for your grade");
      }
    } else if (role === "student") {
      const student = await Student.findById(req.userId).select("gradeId");
      if (
        !student ||
        student.gradeId?.toString() !== assignment.gradeId._id.toString()
      ) {
        throw new ApiError(403, "You can only view assignments for your grade");
      }
    }
    res.json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};
export const getAssignmentsByGrade = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gradeId } = req.params;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const status = req.query.status as string;
    const grade = await Grade.findById(gradeId);
    if (!grade) throw new ApiError(404, "Grade not found");
    const filter: any = { gradeId };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
      .populate("gradeId", "_id grade")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.json({
      success: true,
      data: assignments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: { search, gradeId, status },
    });
  } catch (err) {
    next(err);
  }
};
export const updateAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId } = req.params;
    const role = await getUserRole(req.userId);
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const assignmentGradeName = await getGradeNameFromId(assignment.gradeId);
      const teacherGradeName = await getGradeNameFromId(teacher.gradeId);
      if (assignmentGradeName !== teacherGradeName) {
        throw new ApiError(
          403,
          "You can only update assignments for your assigned grade"
        );
      }
    } else if (role !== "admin") {
      throw new ApiError(403, "Only admin and teacher can update assignments");
    }
    const {
      title,
      description,
      contentType,
      textContent,
      startDate,
      endDate,
      questions,
      status,
      totalMarks,
      passingMarks,
    } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (contentType) updateData.contentType = contentType;
    if (contentType === "text" && textContent)
      updateData.textContent = textContent;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (status) updateData.status = status;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
    if (questions) {
      updateData.questions = Array.isArray(questions)
        ? questions
        : JSON.parse(questions);
    }
    if (req.file) {
      const resourceType = contentType === "video" ? "video" : "raw";
      const filename = req.file.originalname;
      const uploadResult: any = await uploadToCloudinary(
        req.file.buffer,
        "assignments",
        resourceType,
        filename
      );
      if (contentType === "video") {
        if (assignment.videoPublicId) {
          await deleteFromCloudinary(assignment.videoPublicId);
        }
        updateData.videoUrl = uploadResult.secure_url;
        updateData.videoPublicId = uploadResult.public_id;
        updateData.pdfUrl = undefined;
        updateData.pdfPublicId = undefined;
      } else if (contentType === "pdf") {
        if (assignment.pdfPublicId) {
          await deleteFromCloudinary(assignment.pdfPublicId);
        }
        updateData.pdfUrl = uploadResult.secure_url;
        updateData.pdfPublicId = uploadResult.public_id;
        updateData.videoUrl = undefined;
        updateData.videoPublicId = undefined;
      }
    }
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate("gradeId", "_id grade");
    res.json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId } = req.params;
    const role = await getUserRole(req.userId);
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const assignment_grade = await Grade.findById(assignment.gradeId).select(
        "grade"
      );
      const teacher_grade = await Grade.findById(teacher.gradeId).select(
        "grade"
      );
      if (assignment_grade?.grade !== teacher_grade?.grade) {
        throw new ApiError(
          403,
          "You can only delete assignments for your assigned grade"
        );
      }
    } else if (role !== "admin") {
      throw new ApiError(403, "Only admin and teacher can delete assignments");
    }
    if (assignment.videoPublicId) {
      await deleteFromCloudinary(assignment.videoPublicId);
    }
    if (assignment.pdfPublicId) {
      await deleteFromCloudinary(assignment.pdfPublicId);
    }
    await Submission.deleteMany({ assignmentId: assignment._id });
    await Assignment.findByIdAndDelete(assignmentId);
    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
export const getAssignmentSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId } = req.params;
    const role = await getUserRole(req.userId);
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const assignment_grade = await Grade.findById(assignment.gradeId).select(
        "grade"
      );
      const teacher_grade = await Grade.findById(teacher.gradeId).select(
        "grade"
      );
      if (assignment_grade?.grade !== teacher_grade?.grade) {
        throw new ApiError(403, "You can only view submissions for your grade");
      }
    } else if (role === "student") {
      throw new ApiError(403, "Students cannot view submissions");
    }
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const gradeStatus = req.query.gradeStatus as string;
    const filter: any = { assignmentId };
    if (gradeStatus === "graded") {
      filter.score = { $ne: null };
    } else if (gradeStatus === "pending") {
      filter.score = null;
    }
    if (search) {
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const studentIds = students.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const populatedSubs = await Promise.all(
      submissions.map(async (s) => {
        const student = await Student.findById(s.studentId)
          .select("name email profilePictureUrl")
          .lean();
        return {
          ...s,
          student,
          assignment: {
            _id: assignment._id,
            title: assignment.title,
            questions: assignment.questions,
          },
        };
      })
    );
    res.json({
      success: true,
      data: populatedSubs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: { gradeStatus, search },
    });
  } catch (err) {
    next(err);
  }
};
export const getSubmissionsForMyAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await getUserRole(req.userId);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const gradeStatus = req.query.gradeStatus as string;
    const filter: any = {};
    if (role === "student") {
      filter.studentId = req.userId;
    } else if (role === "teacher") {
      const teacher = await Teacher.findById(req.userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const grade = await Grade.findById(teacher.gradeId).select("_id");
      if (!grade) throw new ApiError(404, "Grade not found");
      const assignments = await Assignment.find({ gradeId: grade._id }).select(
        "_id"
      );
      const assignmentIds = assignments.map((a) => a._id);
      filter.assignmentId = { $in: assignmentIds };
      const students = await Student.find({ gradeId: teacher.gradeId }).select(
        "_id"
      );
      const studentIds = students.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    } else {
      throw new ApiError(
        403,
        "Only students and teachers can view submissions"
      );
    }
    if (gradeStatus === "graded") {
      filter.score = { $ne: null };
    } else if (gradeStatus === "pending") {
      filter.score = null;
    }
    if (search) {
      if (role === "student") {
        const assignments = await Assignment.find({
          title: { $regex: search, $options: "i" },
        }).select("_id");
        const assignmentIds = assignments.map((a) => a._id);
        filter.assignmentId = { $in: assignmentIds };
      } else if (role === "teacher") {
        const students = await Student.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id");
        const studentIds = students.map((s) => s._id);
        filter.studentId = { $in: studentIds };
      }
    }
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const populatedSubs = await Promise.all(
      submissions.map(async (s) => {
        const student = await Student.findById(s.studentId)
          .select("name email profilePictureUrl")
          .lean();
        const assignment = await Assignment.findById(s.assignmentId)
          .select("_id title questions")
          .lean();
        return {
          ...s,
          student,
          assignment,
        };
      })
    );
    res.json({
      success: true,
      data: populatedSubs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: { gradeStatus, search },
    });
  } catch (err) {
    next(err);
  }
};
