import { Response } from "express";
import { FilterQuery } from "mongoose";
import { Attendance, IAttendance } from "../../../models/attendance";
import { ITeacher, User } from "../../../models/user";
import { AuthenticatedRequest } from "../../../middleware/authenticate";

export const createOrUpdateAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { studentId, status, class: attendanceClass } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      studentId,
      teacherId: req.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    const attendance = new Attendance({
      studentId,
      teacherId: req.userId,
      date: new Date(),
      status,
      class: attendanceClass,
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTodayAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      teacherId: req.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("studentId", "name email class");

    res.json(attendance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStudentsForTeacher = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const teacher: ITeacher | null = await User.findById(req.userId);
    const students = await User.find({
      role: "student",
      class: teacher?.classTeacherFor || (req.query.class as string),
    });
    res.json(students);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAttendanceOverview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate("studentId teacherId", "name email class subject");

    res.json(attendance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAttendanceStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });

    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const presentToday = todayAttendance.filter((a) => a.status === "present")
      .length;
    const absentToday = todayAttendance.filter((a) => a.status === "absent")
      .length;
    const lateToday = todayAttendance.filter((a) => a.status === "late").length;

    res.json({
      totalStudents,
      totalTeachers,
      todayAttendance: {
        present: presentToday,
        absent: absentToday,
        late: lateToday,
        total: todayAttendance.length,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAttendanceHeatmap = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const heatmapData = await Attendance.aggregate([
      {
        $match: { date: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          present: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "present"] }, "$count", 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "absent"] }, "$count", 0],
            },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$_id.status", "late"] }, "$count", 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(heatmapData);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const exportAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query: FilterQuery<IAttendance> = {};

    if (status && status !== "all") {
      query.status = status as "present" | "absent" | "late";
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("studentId", "name email class")
      .populate("teacherId", "name ");

    res.json(attendance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
