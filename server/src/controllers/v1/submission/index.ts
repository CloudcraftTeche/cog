import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Assignment } from "../../../models/assignment/Assignment.schema";
import { Submission } from "../../../models/assignment/Submission.schema";
import { Student } from "../../../models/user/Student.model";
import { Teacher } from "../../../models/user/Teacher.model";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../../config/cloudinary";
import { User } from "../../../models/user/User.model";
export const submitAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignmentId, submissionType, textContent, answers } = req.body;
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
    let videoUrl: string | undefined;
    let videoPublicId: string | undefined;
    let pdfUrl: string | undefined;
    let pdfPublicId: string | undefined;
    if (req.file) {
      const filename = req.file.originalname;
      const maxRetries = 2;
      let lastError: any;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (submissionType === "video") {
            
            const uploadResult: any = await uploadToCloudinary(
              req.file.buffer,
              "submissions/videos",
              "video",
              filename
            );
            videoUrl = uploadResult.secure_url;
            videoPublicId = uploadResult.public_id;
            console.log("Video upload successful:", videoUrl);
            break;
          } else if (submissionType === "pdf") {
           
            const uploadResult: any = await uploadToCloudinary(
              req.file.buffer,
              "submissions/pdfs",
              "raw",
              filename
            );
            pdfUrl = uploadResult.secure_url;
            pdfPublicId = uploadResult.public_id;
            console.log("PDF upload successful:", pdfUrl);
            break;
          }
        } catch (uploadError: any) {
          lastError = uploadError;
         
          if (uploadError.name === "TimeoutError" && attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          if (attempt === maxRetries) {
            throw new ApiError(
              500,
              `File upload failed: ${
                uploadError.message || "Cloudinary timeout"
              }. Please try with a smaller file or try again later.`
            );
          }
        }
      }
    }
    const parsedAnswers =
      typeof answers === "string"
        ? JSON.parse(answers)
        : Array.isArray(answers)
        ? answers
        : [];
    const newSubmission = await Submission.create({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      studentId: new mongoose.Types.ObjectId(studentId!),
      submissionType,
      videoUrl: submissionType === "video" ? videoUrl : undefined,
      videoPublicId: submissionType === "video" ? videoPublicId : undefined,
      pdfUrl: submissionType === "pdf" ? pdfUrl : undefined,
      pdfPublicId: submissionType === "pdf" ? pdfPublicId : undefined,
      textContent: submissionType === "text" ? textContent : undefined,
      answers: parsedAnswers,
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
    const page = Math.max(Number.parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(Number.parseInt(req.query.limit as string) || 10, 1);
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
        $in: assignmentIds.map((a) => a._id),
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
    const assignment = await Assignment.findById(
      submission.assignmentId
    ).select("title totalMarks passingMarks questions");
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: submissionId } = req.params;
    const { submissionType, textContent, answers } = req.body;
    const studentId = req.userId;
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    console.log(
      "Submission modification request received",
      submission.studentId,
      studentId
    );
    if (submission.studentId.toString() !== studentId.toString()) {
      throw new ApiError(403, "You can only edit your own submissions");
    }
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    const now = new Date();
    if (now > new Date(assignment.endDate)) {
      throw new ApiError(
        400,
        "Assignment deadline has passed. Cannot edit submission."
      );
    }
    if (assignment.status !== "active") {
      throw new ApiError(
        400,
        "Assignment is no longer active. Cannot edit submission."
      );
    }
    if (req.file) {
      const filename = req.file.originalname;
      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (submissionType === "video") {
            if (submission.videoPublicId) {
              await deleteFromCloudinary(submission.videoPublicId);
            }
            console.log(
              `Uploading video (attempt ${attempt + 1}/${
                maxRetries + 1
              }): ${filename}`
            );
            const uploadResult: any = await uploadToCloudinary(
              req.file.buffer,
              "submissions/videos",
              "video",
              filename
            );
            submission.videoUrl = uploadResult.secure_url;
            submission.videoPublicId = uploadResult.public_id;
            submission.pdfUrl = undefined;
            submission.pdfPublicId = undefined;
            submission.textContent = undefined;
            console.log("Video upload successful:", submission.videoUrl);
            break;
          } else if (submissionType === "pdf") {
            if (submission.pdfPublicId) {
              await deleteFromCloudinary(submission.pdfPublicId);
            }
            console.log(
              `Uploading PDF (attempt ${attempt + 1}/${
                maxRetries + 1
              }): ${filename}`
            );
            const uploadResult: any = await uploadToCloudinary(
              req.file.buffer,
              "submissions/pdfs",
              "raw",
              filename
            );
            submission.pdfUrl = uploadResult.secure_url;
            submission.pdfPublicId = uploadResult.public_id;
            submission.videoUrl = undefined;
            submission.videoPublicId = undefined;
            submission.textContent = undefined;
            console.log("PDF upload successful:", submission.pdfUrl);
            break;
          }
        } catch (uploadError: any) {
          console.error(
            `Upload attempt ${attempt + 1} failed:`,
            uploadError.message
          );
          if (uploadError.name === "TimeoutError" && attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          if (attempt === maxRetries) {
            throw new ApiError(
              500,
              `File upload failed: ${
                uploadError.message || "Cloudinary timeout"
              }. Please try with a smaller file or try again later.`
            );
          }
        }
      }
    }
    if (submissionType) {
      submission.submissionType = submissionType;
    }
    if (submissionType === "text" && textContent !== undefined) {
      submission.textContent = textContent;
      if (submission.videoPublicId) {
        await deleteFromCloudinary(submission.videoPublicId);
      }
      if (submission.pdfPublicId) {
        await deleteFromCloudinary(submission.pdfPublicId);
      }
      submission.videoUrl = undefined;
      submission.videoPublicId = undefined;
      submission.pdfUrl = undefined;
      submission.pdfPublicId = undefined;
    }
    if (answers) {
      const parsedAnswers =
        typeof answers === "string"
          ? JSON.parse(answers)
          : Array.isArray(answers)
          ? answers
          : [];
      submission.answers = parsedAnswers;
    }
    submission.submittedAt = new Date();
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
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    if (submission.videoPublicId) {
      await deleteFromCloudinary(submission.videoPublicId);
    }
    if (submission.pdfPublicId) {
      await deleteFromCloudinary(submission.pdfPublicId);
    }
    await Submission.findByIdAndDelete(submissionId);
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
    const userId = req.userId;
    if (score !== undefined && (score < 0 || score > 100)) {
      throw new ApiError(400, "Score must be between 0 and 100");
    }
    const user = await User.findById(userId).select("role");
    if (!user) throw new ApiError(404, "User not found");
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new ApiError(404, "Submission not found");
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (user.role === "admin") {
    } else if (user.role === "teacher") {
      const teacher = await Teacher.findById(userId).select("gradeId");
      if (!teacher) throw new ApiError(404, "Teacher not found");
      const assignmentGradeId =
        typeof assignment.gradeId === "object"
          ? assignment.gradeId._id
          : assignment.gradeId;
      const teacherGradeId =
        typeof teacher.gradeId === "object"
          ? teacher.gradeId._id
          : teacher.gradeId;
      if (assignmentGradeId.toString() !== teacherGradeId.toString()) {
        throw new ApiError(
          403,
          "You can only grade submissions for your assigned grade"
        );
      }
    } else {
      throw new ApiError(403, "Only teachers and admins can grade submissions");
    }
    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = new mongoose.Types.ObjectId(userId!);
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
