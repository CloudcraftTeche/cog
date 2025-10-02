import { Request, Response, NextFunction } from "express";
import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";
import { ApiError } from "../../../utils/ApiError";
import { Student, Teacher } from "../../../models/user";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

export const createAssignmentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      grade,
      contentType,
      textContent,
      videoUrl,
      pdfUrl,
      questions,
      startDate,
      endDate,
    } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      grade,
      contentType,
      videoUrl: contentType === "video" ? videoUrl : undefined,
      pdfUrl: contentType === "pdf" ? pdfUrl : undefined,
      textContent: contentType === "text" ? textContent : undefined,
      questions: Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]"),
      startDate,
      endDate,
      createdBy: req.userId,
    });

    if (!assignment) throw new ApiError(400, "Failed to create assignment");

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

export const getAllAssignmentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const unit = req.query.unit as string;
    const grade = req.query.grade as string;

    const filter: any = {};
    if (search) filter.title = { $regex: search, $options: "i" };
    if (unit) filter.unit = unit;
    if (grade) filter.grade = grade;

    const [data, total] = await Promise.all([
      Assignment.find(filter)
        .populate({ path: "submittedStudents", select: "score" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: { search, unit, grade },
    });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id).lean();
    if (!assignment) throw new ApiError(404, "Assignment not found");

    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

export const updateAssignmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      grade,
      contentType,
      textContent,
      startDate,
      endDate,
      questions,
      videoUrl,
      pdfUrl,
    } = req.body;

    const updateData: any = {
      title,
      description,
      grade,
      contentType,
      textContent,
      startDate,
      endDate,
      questions: Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]"),
    };

    if (contentType === "video") {
      updateData.videoUrl = videoUrl;
      updateData.pdfUrl = undefined;
    } else if (contentType === "pdf") {
      updateData.pdfUrl = pdfUrl;
      updateData.videoUrl = undefined;
    } else {
      updateData.videoUrl = undefined;
      updateData.pdfUrl = undefined;
    }

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        lean: true,
      }
    );

    if (!assignment) throw new ApiError(404, "Assignment not found");

    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, "Assignment not found");

    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentsByGradeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { grade } = req.params;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const unit = req.query.unit as string;

    const filter: any = { grade };
    if (search) filter.title = { $regex: search, $options: "i" };
    if (unit) filter.unit = unit;

    const [data, total] = await Promise.all([
      Assignment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: { search, grade, unit },
    });
  } catch (err) {
    next(err);
  }
};

export const getSubmittedStudentsByGradeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { grade } = req.params;
    const submissions = await Submission.find({ grade })
      .populate("student", "name email")
      .populate("assignment", "title")
      .lean();

    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentSubmissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ assignment: id })
      .populate("student", "name email profilePictureUrl")
      .populate("assignment", "title")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Submission.countDocuments({ assignment: id });

    res.json({
      success: true,
      data: submissions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
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
    const studentId = new mongoose.Types.ObjectId(req.userId);

    const student = await Student.findById(studentId).select("class").lean();
    if (!student) throw new ApiError(404, "Student not found");

    const [assignmentCount, submissionStats, submissionTrend] = await Promise.all([
      Assignment.countDocuments({ grade: student.class }),
      Submission.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Submission.aggregate([
        { $match: { student: studentId } },
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
    ]);

    res.json({
      success: true,
      data: {
        totalAssignments: assignmentCount,
        submissionStats: submissionStats.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        submissionTrend: submissionTrend
          .reverse()
          .map((s) => ({
            month: `${s._id.month}-${s._id.year}`,
            count: s.count,
          })),
      },
    });
  } catch (err) {
    next(err);
  }
};