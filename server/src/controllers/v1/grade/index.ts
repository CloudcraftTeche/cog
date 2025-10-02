import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Grade } from "../../../models/grade";
import { ApiError } from "../../../utils/ApiError";
import { Student, Teacher } from "../../../models/user";
import { Chapter } from "../../../models/chapter";
import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

export const createGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { grade } = req.body;

    if (!grade || typeof grade !== "string") {
      throw new ApiError(400, "Invalid grade");
    }

    const existing = await Grade.findOne({ grade: grade.trim() });
    if (existing) {
      throw new ApiError(409, "Grade already exists");
    }

    const newGrade = await Grade.create({ grade: grade.trim() });

    res.status(201).json({
      message: "Grade created successfully",
      data: newGrade,
    });
  } catch (err) {
    next(err);
  }
};

export const listGradesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const filter: any = {};
    if (q.trim()) {
      filter.$or = [{ grade: { $regex: q.trim(), $options: "i" } }];
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      Grade.countDocuments(filter),
      Grade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      message: "Grades fetched",
      meta: { total, totalPages, page, limit },
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getGradeByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const grade = await Grade.findById(id).lean();
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }

    res.status(200).json({ message: "Grade fetched", data: grade });
  } catch (err) {
    next(err);
  }
};

export const updateGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { grade } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    if (!grade || typeof grade !== "string") {
      throw new ApiError(400, "Invalid grade value");
    }

    const existing = await Grade.findOne({
      grade: grade.trim(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new ApiError(409, "Another grade with same value already exists");
    }

    const updated = await Grade.findByIdAndUpdate(
      id,
      { grade: grade.trim() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new ApiError(404, "Grade not found");
    }

    res.status(200).json({ message: "Grade updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteGradeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const deleted = await Grade.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new ApiError(404, "Grade not found");
    }

    res.status(200).json({ message: "Grade deleted", data: deleted });
  } catch (err) {
    next(err);
  }
};

export const getAllGradesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, data] = await Promise.all([
      Grade.countDocuments(),
      Grade.find().sort({ createdAt: -1 }).lean(),
    ]);

    res.status(200).json({
      message: "Grades fetched",
      meta: { total },
      data,
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

    const student = await Student.findById(studentId).lean();
    if (!student) throw new ApiError(404, "Student not found");

    const [assignmentCount, submissionStats, submissionTrend, completedChapters] =
      await Promise.all([
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
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 6 },
        ]),
        Student.aggregate([
          { $match: { _id: studentId } },
          { $unwind: "$completedChapters" },
          {
            $lookup: {
              from: "chapters",
              localField: "completedChapters.chapter",
              foreignField: "_id",
              as: "chapter",
            },
          },
          { $unwind: "$chapter" },
          {
            $group: {
              _id: "$chapter.class",
              count: { $sum: 1 },
            },
          },
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
          .map((s) => ({ month: `${s._id.month}-${s._id.year}`, count: s.count })),
        completedChapters: completedChapters.map((c) => ({
          class: c._id,
          count: c.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
