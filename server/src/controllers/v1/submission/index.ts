import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";
import { Request, Response, NextFunction } from "express";
import mongoose, { Schema } from "mongoose";
import {ApiError} from "../../../utils/ApiError";
import { Student, Teacher } from "../../../models/user";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Grade } from "../../../models/grade";
import { Chapter } from "../../../models/chapter";

export const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      assignment,
      student,
      submissionType,
      videoUrl,
      pdfUrl,
      textContent,
      answers,
    } = req.body;

    const existing = await Submission.findOne({ assignment, student });
    if (existing) {
      throw new ApiError(409, "You have already submitted this assignment");
    }

    const submission = await Submission.create({
      assignment,
      student,
      submissionType,
      videoUrl: submissionType === "video" ? videoUrl : undefined,
      pdfUrl: submissionType === "pdf" ? pdfUrl : undefined,
      textContent: submissionType === "text" ? textContent : undefined,
      answers: Array.isArray(answers) ? answers : [],
    });

    await Promise.all([
      Student.findByIdAndUpdate(student, {
        $addToSet: { assignmentsCompleted: submission._id },
      }),
      Assignment.findByIdAndUpdate(assignment, {
        $addToSet: { submittedStudents: submission._id },
        $set: { submitted: true },
      }),
    ]);

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const fetchSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.assignment) filter.assignment = req.query.assignment;
    if (req.query.student) filter.student = req.query.student;

    const submissions = await Submission.find(filter)
      .populate("assignment", "title")
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

export const fetchSubmissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate("assignment", "title")
      .populate("student", "name email")
      .lean();

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const modifySubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      submissionType,
      videoUrl,
      pdfUrl,
      textContent,
      answers,
      score,
      feedback,
      submitted,
    } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        submissionType,
        videoUrl: submissionType === "video" ? videoUrl : undefined,
        pdfUrl: submissionType === "pdf" ? pdfUrl : undefined,
        textContent: submissionType === "text" ? textContent : undefined,
        answers: Array.isArray(answers) ? answers : [],
        score,
        feedback,
        submitted: submitted || false,
      },
      { new: true }
    );

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const removeSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await Submission.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new ApiError(404, "Submission not found");
    }

    await Promise.all([
      Student.findByIdAndUpdate(deleted.student, {
        $pull: { assignmentsCompleted: deleted._id },
      }),
      Assignment.findByIdAndUpdate(deleted.assignment, {
        $pull: { submittedStudents: deleted._id },
      }),
    ]);

    res.json({ success: true, message: "Submission deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { score, feedback },
      { new: true }
    );

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};



export const fetchTeacherDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.userId;
    if (!teacherId) {
      throw new ApiError(403, "Unauthorized: Teacher not found");
    }

    const { assignmentId, studentId, status } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const teacherAssignments = await Assignment.find({ createdBy: teacherId })
      .select("_id")
      .lean();

    const assignmentIds = teacherAssignments.map((a) => a._id);

    const filter: any = { assignment: { $in: assignmentIds } };
    if (assignmentId) filter.assignment = assignmentId;
    if (studentId) filter.student = studentId;
    if (status === "graded") filter.score = { $ne: null };
    if (status === "pending") filter.score = null;

    const [total, submissions] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .populate("assignment", "title dueDate")
        .populate("student", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const response = {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      submissions,
    };

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  } 
};





const fmtMonth = (id: any) => `${id.month}-${id.year}`;






export const getTeacherDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const teacherId = req.userId;
    if (!teacherId) throw new ApiError(403, "Unauthorized");

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const teacherAssignments = await Assignment.find({ createdBy: teacherObjectId })
      .select("_id")
      .lean();
    const assignmentIds = teacherAssignments.map((a) => a._id);

    const [assignmentsCreatedCount, submissionStatusAgg, submissionsTrendAgg, topStudentsAgg] =
      await Promise.all([
        Assignment.countDocuments({ createdBy: teacherObjectId }),
        Submission.aggregate([
          { $match: { assignment: { $in: assignmentIds } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Submission.aggregate([
          { $match: { assignment: { $in: assignmentIds } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 6 },
        ]),
        Submission.aggregate([
          { $match: { assignment: { $in: assignmentIds }, score: { $ne: null } } },
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

    const submissionStatus = submissionStatusAgg.map((s: any) => ({
      status: s._id,
      count: s.count,
    }));

    const submissionsTrend = submissionsTrendAgg.reverse().map((r: any) => ({
      month: fmtMonth(r._id),
      count: r.count,
    }));

    const topStudents = topStudentsAgg.map((s: any) => ({
      studentId: s.studentId,
      name: s.name || "Unknown",
      avgScore: s.avgScore,
      submissionsCount: s.submissionsCount,
    }));

    res.json({
      success: true,
      data: {
        assignmentsCreated: assignmentsCreatedCount,
        submissionStatus,
        submissionsTrend,
        topStudents,
      },
    });
  } catch (err) {
    next(err);
  }
};


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
      submissionStatusAgg,
      submissionTrendAgg,
      assignmentsForGradeCount,
    ] = await Promise.all([
      Chapter.countDocuments({ class: student.class }),
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
      Assignment.countDocuments({ grade: student.class }),
    ]);

    const completedCount = (student.completedChapters || []).length;
    const completionPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

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
          name: (student as any).name,
          class: student.class,
        },
        totals: {
          totalChapters,
          completedCount,
          completionPercentage,
          assignmentsAvailable: assignmentsForGradeCount,
        },
        submissionStatus,
        submissionTrend,
        chapterWiseProgress, 
      },
    });
  } catch (err) {
    next(err);
  }
};

