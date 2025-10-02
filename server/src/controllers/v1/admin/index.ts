import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../utils/ApiError";
import { Admin, IAdmin, Student, Teacher } from "../../../models/user";
import { Grade } from "../../../models/grade";
import { Chapter } from "../../../models/chapter";
import { Unit } from "../../../models/unit";
import { Assignment } from "../../../models/assignment";
import { Submission } from "../../../models/submission";

export const createAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, gender } = req.body as IAdmin;

    const existing = await Admin.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
      gender,
      role: "admin",
    });

    if (!admin) {
      throw new ApiError(400, "Failed to create admin");
    }

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        gender: admin.gender,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<IAdmin>;

    const updated = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ApiError(404, "Admin not found");
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        gender: updated.gender,
        role: updated.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Admin.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError(404, "Admin not found");
    }

    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAdminByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id).select("-password");
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

export const getAllAdminsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      Admin.find().skip(skip).limit(limit).select("-password"),
      Admin.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pageSize: admins.length,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};


function fmtMonth({ year, month }: { year: number; month: number }) {
  return `${month.toString().padStart(2, "0")}-${year}`;
}


export const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totals,
      studentsByGrade,
      classDistribution,
      recentStudents,
      assignmentTrendAgg,
      submissionTrendAgg,
      submissionStatsAgg,
      chapterTrendAgg,
    ] = await Promise.all([
      Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Grade.countDocuments(),
        Chapter.countDocuments(),
        Unit.countDocuments(),
        Assignment.countDocuments(),
        Submission.countDocuments(),
      ]),

      Student.aggregate([
        { $group: { _id: "$class", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Chapter.aggregate([
        { $group: { _id: "$class", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email class createdAt")
        .lean(),

      Assignment.aggregate([
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
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Chapter.aggregate([
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

    const [
      totalStudents,
      totalTeachers,
      totalGrades,
      totalChapters,
      totalUnits,
      totalAssignments,
      totalSubmissions,
    ] = totals;

    res.json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          teachers: totalTeachers,
          grades: totalGrades,
          chapters: totalChapters,
          units: totalUnits,
          assignments: totalAssignments,
          submissions: totalSubmissions,
        },

        studentsByGrade: studentsByGrade.map((s) => ({
          grade: s._id,
          count: s.count,
        })),
        classDistribution: classDistribution.map((c) => ({
          class: c._id,
          count: c.count,
        })),
        submissionStats: submissionStatsAgg.map((s) => ({
          status: s._id,
          count: s.count,
        })),

        assignmentTrend: assignmentTrendAgg
          .reverse()
          .map((a) => ({ month: fmtMonth(a._id), count: a.count })),
        submissionTrend: submissionTrendAgg
          .reverse()
          .map((s) => ({ month: fmtMonth(s._id), count: s.count })),
        chapterTrend: chapterTrendAgg
          .reverse()
          .map((c) => ({ month: fmtMonth(c._id), count: c.count })),

        recentStudents,
      },
    });
  } catch (err) {
    next(err);
  }
};

