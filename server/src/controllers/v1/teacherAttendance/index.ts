import { TeacherAttendance } from "../../../models/attendance/TeacherAttendance.schema";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { User } from "../../../models/user/User.model";
import { Response } from "express";
import { Types } from "mongoose";

export const createOrUpdateTeacherAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { teacherId, status, gradeId, remarks, date } = req.body;

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate.getTime() + 86400000);

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const existingAttendance = await TeacherAttendance.findOne({
      studentId: teacherId,
      date: { $gte: attendanceDate, $lt: nextDay },
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      if (remarks) existingAttendance.remarks = remarks;
      await existingAttendance.save();
      const populated = await existingAttendance.populate([
        { path: "studentId", select: "name email" },
        { path: "teacherId", select: "name email" },
        { path: "gradeId", select: "grade" },
      ]);
      return res.json(populated);
    }

    const attendance = await TeacherAttendance.create({
      studentId: new Types.ObjectId(teacherId),
      teacherId: req.userId!,
      gradeId: gradeId ? new Types.ObjectId(gradeId) : undefined,
      date: attendanceDate,
      status,
      remarks,
    });

    const populated = await attendance.populate([
      { path: "studentId", select: "name email" },
      { path: "teacherId", select: "name email" },
      { path: "gradeId", select: "grade" },
    ]);
    res.status(201).json(populated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getTeacherAttendanceByDate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { date } = req.query;

    const queryDate = date ? new Date(date as string) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate.getTime() + 86400000);

    const records = await TeacherAttendance.find({
      date: { $gte: queryDate, $lt: nextDay },
    })
      .populate({
        path: "studentId",
        match: { role: "teacher" },
        select: "name email",
      })
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });

    const filteredRecords = records.filter((r) => r.studentId !== null);

    res.json(filteredRecords);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getTodayTeacherAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const records = await TeacherAttendance.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .populate({
        path: "studentId",
        match: { role: "teacher" },
        select: "name email",
      })
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });

    const filteredRecords = records.filter((r) => r.studentId !== null);

    res.json(filteredRecords);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getTeacherAttendanceByGrade = async (
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

    const records = await TeacherAttendance.find(query)
      .populate({
        path: "studentId",
        match: { role: "teacher" },
        select: "name email",
      })
      .populate("teacherId", "name email")
      .sort({ date: -1 });

    const filteredRecords = records.filter((r) => r.studentId !== null);

    res.json(filteredRecords);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getTeacherAttendanceStats = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const totalTeachers = await User.countDocuments({ role: "teacher" });

    const todayRecords = await TeacherAttendance.find({
      date: { $gte: today, $lt: tomorrow },
    }).populate({
      path: "studentId",
      match: { role: "teacher" },
      select: "_id",
    });

    const filteredRecords = todayRecords.filter((r) => r.studentId !== null);

    const todayAttendance = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    };

    filteredRecords.forEach((record) => {
      todayAttendance[record.status as keyof typeof todayAttendance]++;
      todayAttendance.total++;
    });

    res.json({
      totalTeachers,
      todayAttendance,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getTeacherAttendanceHeatmap = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const records = await TeacherAttendance.find({
      date: { $gte: sevenDaysAgo },
    }).populate({
      path: "studentId",
      match: { role: "teacher" },
      select: "_id",
    });

    const filteredRecords = records.filter((r) => r.studentId !== null);

    const heatmapMap = new Map();

    filteredRecords.forEach((record) => {
      const dateStr = record.date.toISOString().split("T")[0];
      if (!heatmapMap.has(dateStr)) {
        heatmapMap.set(dateStr, {
          _id: dateStr,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }
      const data = heatmapMap.get(dateStr);
      data[record.status]++;
    });

    const heatmapData = Array.from(heatmapMap.values()).sort((a, b) =>
      a._id.localeCompare(b._id)
    );

    res.json(heatmapData);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const exportTeacherAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const status = req.query["status"];
    const startDate = req.query["startDate"];
    const endDate = req.query["endDate"];
    const gradeId = req.query["gradeId"];
    
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

    if (gradeId) {
      query.gradeId = gradeId;
    }

    const records = await TeacherAttendance.find(query)
      .populate({
        path: "studentId",
        match: { role: "teacher" },
        select: "name email",
      })
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 })
      .lean();

    const filteredRecords = records.filter((r) => r.studentId !== null);

    res.json(filteredRecords);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getSpecificTeacherAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { teacherId } = req.params;
    const { startDate, endDate } = req.query;

    const query: any = { studentId: teacherId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const records = await TeacherAttendance.find(query)
      .populate({
        path: "studentId",
        match: { role: "teacher" },
        select: "name email",
      })
      .populate("teacherId", "name email")
      .populate("gradeId", "grade")
      .sort({ date: -1 });

    const filteredRecords = records.filter((r) => r.studentId !== null);

    const stats = {
      total: filteredRecords.length,
      present: filteredRecords.filter((r) => r.status === "present").length,
      absent: filteredRecords.filter((r) => r.status === "absent").length,
      late: filteredRecords.filter((r) => r.status === "late").length,
      excused: filteredRecords.filter((r) => r.status === "excused").length,
      attendanceRate: 0,
    };

    if (stats.total > 0) {
      stats.attendanceRate = ((stats.present + stats.late) / stats.total) * 100;
    }

    res.json({ records: filteredRecords, stats });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteTeacherAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await TeacherAttendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    await attendance.deleteOne();
    res.json({ message: "Teacher attendance record deleted successfully" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};