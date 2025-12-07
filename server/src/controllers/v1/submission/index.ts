import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Assignment } from "../../../models/assignment/Assignment.schema";
import { Submission } from "../../../models/assignment/Submission.schema";
import { Student } from "../../../models/user/Student.model";
import { Teacher } from "../../../models/user/Teacher.model";
export const submitAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      assignmentId,
      submissionType,
      videoUrl,
      pdfUrl,
      textContent,
      answers,
    } = req.body;
    const studentId = req.userId;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (assignment.status !== "active") {
      throw new ApiError(400, "Assignment is not active");
    }
    const now = new Date();
    if (now < new Date(assignment.startDate)) {
      throw new ApiError(400, "Assignment has not started yet");
    }
    if (now > new Date(assignment.endDate)) {
      throw new ApiError(400, "Assignment deadline has passed");
    }
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId,
    });
    if (existingSubmission) {
      throw new ApiError(409, "You have already submitted this assignment");
    }
    if (assignment.questions && assignment.questions.length > 0) {
      if (!answers || answers.length === 0) {
        throw new ApiError(400, "Answers are required for this assignment");
      }
    }
    const newSubmission = await Submission.create({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      studentId: new mongoose.Types.ObjectId(studentId!),
      submissionType,
      videoUrl: submissionType === "video" ? videoUrl : undefined,
      pdfUrl: submissionType === "pdf" ? pdfUrl : undefined,
      textContent: submissionType === "text" ? textContent : undefined,
      answers: Array.isArray(answers) ? answers : [],
      submittedAt: new Date(),
    });
    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: newSubmission,
    });
  } catch (err) {
    next(err);
  }
};
export const fetchSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId, studentId, gradeId, gradeStatus } = req.query;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const query: any = {};
    if (assignmentId) {
      query.assignmentId = assignmentId;
    }
    if (studentId) {
      query.studentId = studentId;
    }
    if (gradeId) {
      const assignmentIds = await Assignment.find({ gradeId })
        .select("_id")
        .lean();
      if (assignmentIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          filters: { assignmentId, studentId, gradeId, gradeStatus },
        });
      }
      query.assignmentId = { 
        $in: assignmentIds.map((a) => a._id) 
      };
    }
    if (gradeStatus === "graded") {
      query.score = { $ne: null };
    } else if (gradeStatus === "pending") {
      query.score = null;
    }
    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const student = await Student.findById(sub.studentId).select(
          "name email profilePictureUrl"
        );
        const assignment = await Assignment.findById(sub.assignmentId).select(
          "title totalMarks passingMarks"
        );
        return {
          ...sub,
          student: student || null,
          assignment: assignment || null,
        };
      })
    );
    res.json({
      success: true,
      data: enrichedSubmissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: { assignmentId, studentId, gradeId, gradeStatus },
    });
  } catch (err) {
    next(err);
  }
};
export const fetchSubmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: submissionId } = req.params;
    const submission = await Submission.findById(submissionId).lean();
    if (!submission) throw new ApiError(404, "Submission not found");
    const student = await Student.findById(submission.studentId).select(
      "name email profilePictureUrl"
    );
    const assignment = await Assignment.findById(submission.assignmentId).select(
      "title totalMarks passingMarks questions"
    );
    res.json({
      success: true,
      data: {
        ...submission,
        student: student || null,
        assignment: assignment || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const modifySubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: submissionId } = req.params;
    const {
      submissionType,
      videoUrl,
      pdfUrl,
      textContent,
      answers,
    } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    if (submission.score !== null && submission.score !== undefined) {
      throw new ApiError(400, "Cannot modify graded submission");
    }
    if (submissionType) submission.submissionType = submissionType;
    if (submissionType === "video" && videoUrl) submission.videoUrl = videoUrl;
    if (submissionType === "pdf" && pdfUrl) submission.pdfUrl = pdfUrl;
    if (submissionType === "text" && textContent)
      submission.textContent = textContent;
    if (Array.isArray(answers)) submission.answers = answers;
    await submission.save();
    res.json({
      success: true,
      message: "Submission updated successfully",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};
export const removeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: submissionId } = req.params;
    const submission = await Submission.findByIdAndDelete(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    res.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const gradeSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: submissionId } = req.params;
    const { score, feedback } = req.body;
    const teacherId = req.userId;
    if (score !== undefined && (score < 0 || score > 100)) {
      throw new ApiError(400, "Score must be between 0 and 100");
    }
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (assignment.createdBy.toString() !== teacherId) {
      throw new ApiError(403, "Unauthorized to grade this submission");
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = new mongoose.Types.ObjectId(teacherId!);
    await submission.save();
    res.json({
      success: true,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};
export const fetchTeacherDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const teacherId = req.userId;
    if (!teacherId) throw new ApiError(403, "Unauthorized: Teacher not found");
    const { assignmentId, studentId, status } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const teacher = await Teacher.findById(teacherId).select("gradeId").lean();
    if (!teacher) throw new ApiError(404, "Teacher not found");
    const teacherAssignments = await Assignment.find({
      createdBy: teacherId,
      gradeId: teacher.gradeId,
    })
      .select("_id")
      .lean();
    const assignmentIds = teacherAssignments.map((a) => a._id.toString());
    if (assignmentIds.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          totalPages: 0,
          page,
          limit,
          submissions: [],
        },
      });
    }
    const query: any = {
      assignmentId: { $in: assignmentIds },
    };
    if (assignmentId) {
      query.assignmentId = assignmentId;
    }
    if (studentId) {
      query.studentId = studentId;
    }
    if (status === "graded") {
      query.score = { $ne: null };
    }
    if (status === "pending") {
      query.score = null;
    }
    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const student = await Student.findById(sub.studentId).select(
          "name email profilePictureUrl"
        );
        const assignment = await Assignment.findById(sub.assignmentId).select(
          "title endDate totalMarks"
        );
        return {
          ...sub,
          student: student || null,
          assignment: assignment || null,
        };
      })
    );
    res.json({
      success: true,
      data: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        submissions: enrichedSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
};