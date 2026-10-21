import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Attendance } from "../../../models/attendance/Attendance.schema";
import { User } from "../../../models/user/User.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { Grade } from "../../../models/academic/Grade.model";
export const createOrUpdateAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { studentId, status, gradeId, remarks, date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate.getTime() + 86400000);
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ error: "Student not found" });
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: attendanceDate, $lt: nextDay },
    });
    if (existingAttendance) {
      existingAttendance.status = status;
      if (remarks) existingAttendance.remarks = remarks;
      await existingAttendance.save();
      const populated = await existingAttendance.populate([
        { path: "studentId", select: "name email rollNumber" },
        { path: "teacherId", select: "name email" },
        { path: "gradeId", select: "grade" },
      ]);
      return res.json(populated);
    }
    const attendance = await Attendance.create({
      studentId: new Types.ObjectId(studentId),
      teacherId: req.userId!,
      gradeId: gradeId ? new Types.ObjectId(gradeId) : undefined,
      date: attendanceDate,
      status,
      remarks,
    });
    const populated = await attendance.populate([
      { path: "studentId", select: "name email rollNumber" },
      { path: "teacherId", select: "name email" },
      { path: "gradeId", select: "grade" },
    ]);
    res.status(201).json(populated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getAttendanceByDate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date as string) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate.getTime() + 86400000);
    const records = await Attendance.find({
      teacherId: req.userId,
      date: { $gte: queryDate, $lt: nextDay },
    })
      .populate("studentId", "name email rollNumber")
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });
    res.json(records);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getTodayAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const records = await Attendance.find({
      teacherId: req.userId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("studentId", "name email rollNumber")
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });
    res.json(records);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getAttendanceByGrade = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { startDate, endDate } = req.query;
    const { gradeId } = req.params;
    const query: any = { gradeId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    const records = await Attendance.find(query)
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .sort({ date: -1 });
    res.json(records);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getAttendanceStats = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const [totalStudents, totalTeachers, todayStats] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Attendance.aggregate([
        {
          $match: {
            date: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    const todayAttendance = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    };
    todayStats.forEach((stat) => {
      todayAttendance[stat._id as keyof typeof todayAttendance] = stat.count;
      todayAttendance.total += stat.count;
    });
    res.json({
      totalStudents,
      totalTeachers,
      todayAttendance,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getTeacherStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const totalStudents = await User.countDocuments({
      role: "student",
      gradeId: teacher.gradeId,
    });
    const todayStats = await Attendance.aggregate([
      {
        $match: {
          teacherId: new Types.ObjectId(teacherId),
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const todayAttendance = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    };
    todayStats.forEach((stat) => {
      todayAttendance[stat._id as keyof typeof todayAttendance] = stat.count;
      todayAttendance.total += stat.count;
    });
    res.json({
      totalStudents,
      totalTeachers: 1,
      todayAttendance,
    });
  } catch (e: any) {
    if (e instanceof ApiError) {
      res.status(e.statusCode).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};
export const getAttendanceHeatmap = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const heatmapData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
          },
          excused: {
            $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json(heatmapData);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getTeacherHeatmap = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const heatmapData = await Attendance.aggregate([
      {
        $match: {
          teacherId: new Types.ObjectId(teacherId),
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
          },
          excused: {
            $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json(heatmapData);
  } catch (e: any) {
    if (e instanceof ApiError) {
      res.status(e.statusCode).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
};
export const exportAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const status = req.query["status[status]"];
    const teacherId = req.query["status[teacherId]"];
    const startDate = req.query["status[startDate]"];
    const endDate = req.query["status[endDate]"];
    const query: any = {};
    if (status && status !== "all") {
      query.status = { $regex: `^${status}$`, $options: "i" };
    }
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    const records = await Attendance.find(query)
      .populate("studentId", "name email rollNumber gradeId")
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 })
      .lean();
    
    res.json(records);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const getStudentAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    const query: any = { studentId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    const records = await Attendance.find(query)
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });
    const stats = {
      total: records.length,
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      excused: records.filter((r) => r.status === "excused").length,
      attendanceRate: 0,
    };
    if (stats.total > 0) {
      stats.attendanceRate = ((stats.present + stats.late) / stats.total) * 100;
    }
    res.json({ records, stats });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
export const deleteAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    await attendance.deleteOne();
    res.json({ message: "Attendance record deleted successfully" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
const REPORT_DEFAULT_LIMIT = 25;
const REPORT_MAX_LIMIT = 100;
// Per-student attendance totals for the admin attendance overview. Students are paginated before the
// attendance lookup, so each page only aggregates the records of the students it returns.
// `all=true` skips pagination and is used for the CSV export.
export const getStudentAttendanceReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, gradeId } = req.query;
    const all = req.query["all"] === "true";
    const page = Math.max(Number(req.query["page"]) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query["limit"]) || REPORT_DEFAULT_LIMIT, 1),
      REPORT_MAX_LIMIT
    );

    const studentMatch: Record<string, unknown> = { role: "student" };
    if (gradeId) {
      studentMatch["gradeId"] = new Types.ObjectId(gradeId as string);
    }
    const attendanceMatch: Record<string, unknown> = {
      $expr: { $eq: ["$studentId", "$$studentId"] },
    };
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (start > end) throw new ApiError(400, "startDate must be before endDate");
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      attendanceMatch["date"] = { $gte: start, $lte: end };
    }
    const countStatus = (status: string) => ({
      $sum: { $cond: [{ $eq: ["$status", status] }, 1, 0] },
    });

    const rowStages = [
      {
        $lookup: {
          from: Attendance.collection.name,
          let: { studentId: "$_id" },
          pipeline: [
            { $match: attendanceMatch },
            {
              $group: {
                _id: null,
                present: countStatus("present"),
                absent: countStatus("absent"),
                late: countStatus("late"),
                excused: countStatus("excused"),
                total: { $sum: 1 },
                lastMarked: { $max: "$date" },
              },
            },
          ],
          as: "attendance",
        },
      },
      {
        $lookup: {
          from: Grade.collection.name,
          localField: "gradeId",
          foreignField: "_id",
          as: "grade",
        },
      },
      {
        $addFields: {
          attendance: { $first: "$attendance" },
          grade: { $first: "$grade" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          grade: "$grade.grade",
          present: { $ifNull: ["$attendance.present", 0] },
          absent: { $ifNull: ["$attendance.absent", 0] },
          late: { $ifNull: ["$attendance.late", 0] },
          excused: { $ifNull: ["$attendance.excused", 0] },
          total: { $ifNull: ["$attendance.total", 0] },
          lastMarked: "$attendance.lastMarked",
        },
      },
      {
        $addFields: {
          attendanceRate: {
            $cond: [
              { $gt: ["$total", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $add: ["$present", "$late"] }, "$total"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
    ];

    const [result] = await User.aggregate([
      { $match: studentMatch },
      { $sort: { name: 1, _id: 1 } },
      {
        $facet: {
          rows: all
            ? rowStages
            : [{ $skip: (page - 1) * limit }, { $limit: limit }, ...rowStages],
          total: [{ $count: "count" }],
        },
      },
    ]);
    const total: number = result?.total[0]?.count ?? 0;

    res.json({
      success: true,
      message: "Student attendance report fetched successfully",
      data: {
        rows: result?.rows ?? [],
        pagination: all
          ? { page: 1, limit: total, total, totalPages: 1 }
          : { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      },
    });
  } catch (error) {
    next(error);
  }
};
