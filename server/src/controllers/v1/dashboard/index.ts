import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middleware/authenticate";
import { ApiError } from "../../../utils/ApiError";
import { Student } from "../../../models/user/Student.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { Grade } from "../../../models/academic/Grade.model";
import { Chapter } from "../../../models/academic/Chapter.model";
import { Announcement } from "../../../models/announcement";
import { Query } from "../../../models/query/Query.model";
import mongoose from "mongoose";
import { Attendance } from "../../../models/attendance/Attendance.schema";
import { Assignment } from "../../../models/assignment/Assignment.schema";
import { Submission } from "../../../models/assignment/Submission.schema";
export const getSuperAdminDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalGrades,
      totalChapters,
      totalAnnouncements,
      totalQueries,
    ] = await Promise.all([
      Student.countDocuments({ role: "student" }),
      Teacher.countDocuments({ role: "teacher" }),
      Grade.countDocuments(),
      Chapter.countDocuments(),
      Announcement.countDocuments(),
      Query.countDocuments(),
    ]);
    const studentGrowth = await Student.aggregate([
      {
        $match: {
          role: "student",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          students: "$count",
        },
      },
    ]);
    const teacherGrowth = await Teacher.aggregate([
      {
        $match: {
          role: "teacher",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          teachers: "$count",
        },
      },
    ]);
    const grades = await Grade.find().select("_id grade").lean();
    const gradeDistribution = await Promise.all(
      grades.map(async (grade) => {
        const [studentCount, teacherCount, assignmentCount] = await Promise.all(
          [
            Student.countDocuments({ gradeId: grade._id }),
            Teacher.countDocuments({ gradeId: grade._id }),
            Assignment.countDocuments({ gradeId: grade._id }),
          ]
        );
        return {
          grade: grade.grade,
          studentCount,
          teacherCount,
          assignmentCount,
        };
      })
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          present: 1,
          absent: 1,
          late: 1,
          excused: 1,
          total: { $add: ["$present", "$absent", "$late", "$excused"] },
          attendanceRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$present",
                      { $add: ["$present", "$absent", "$late", "$excused"] },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);
    const queryStats = await Query.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    const queryPriorityStats = await Query.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: "$_id",
          count: 1,
        },
      },
    ]);
    const allChapters = await Chapter.find().select("studentProgress");
    let totalCompletions = 0;
    let totalInProgress = 0;
    for (const chapter of allChapters) {
      if (chapter.studentProgress) {
        totalCompletions += chapter.studentProgress.filter(
          (p) => p.status === "completed"
        ).length;
        totalInProgress += chapter.studentProgress.filter(
          (p) => p.status === "in_progress"
        ).length;
      }
    }
    const completionRate =
      totalStudents > 0 && totalChapters > 0
        ? Math.round((totalCompletions / (totalStudents * totalChapters)) * 100)
        : 0;
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");
    const recentQueries = await Query.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("from", "name")
      .select("subject status createdAt from");
    const topStudents = await Chapter.aggregate([
      { $unwind: "$studentProgress" },
      {
        $match: { "studentProgress.status": "completed" },
      },
      {
        $group: {
          _id: "$studentProgress.studentId",
          completedChapters: { $sum: 1 },
          averageScore: { $avg: "$studentProgress.score" },
        },
      },
      { $sort: { completedChapters: -1, averageScore: -1 } },
      { $limit: 10 },
    ]);
    const topStudentsWithDetails = await Student.find({
      _id: { $in: topStudents.map((s) => s._id) },
    }).select("name email rollNumber profilePictureUrl");
    const topPerformers = topStudents.map((student) => {
      const details = topStudentsWithDetails.find(
        (s) => s._id.toString() === student._id.toString()
      );
      return {
        studentId: student._id,
        name: details?.name,
        email: details?.email,
        rollNumber: details?.rollNumber,
        profilePictureUrl: details?.profilePictureUrl,
        completedChapters: student.completedChapters,
        averageScore: Math.round(student.averageScore || 0),
      };
    });
    const assignmentStats = await Assignment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalGrades,
          totalChapters,
          totalAnnouncements,
          totalQueries,
          completionRate,
        },
        charts: {
          studentGrowth,
          teacherGrowth,
          gradeDistribution,
          attendanceTrend,
          queryStats,
          queryPriorityStats,
          assignmentStats,
        },
        insights: {
          topPerformers,
          recentAnnouncements,
          recentQueries,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getAdminDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalGrades,
      totalChapters,
      totalAnnouncements,
      totalQueries,
    ] = await Promise.all([
      Student.countDocuments({ role: "student" }),
      Teacher.countDocuments({ role: "teacher" }),
      Grade.countDocuments(),
      Chapter.countDocuments(),
      Announcement.countDocuments(),
      Query.countDocuments(),
    ]);
    const studentGrowth = await Student.aggregate([
      {
        $match: {
          role: "student",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          students: "$count",
        },
      },
    ]);
    const teacherGrowth = await Teacher.aggregate([
      {
        $match: {
          role: "teacher",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          teachers: "$count",
        },
      },
    ]);
    const grades = await Grade.find().select("_id grade").lean();
    const gradeDistribution = await Promise.all(
      grades.map(async (grade) => {
        const [studentCount, teacherCount, assignmentCount] = await Promise.all(
          [
            Student.countDocuments({ gradeId: grade._id }),
            Teacher.countDocuments({ gradeId: grade._id }),
            Assignment.countDocuments({ gradeId: grade._id }),
          ]
        );
        return {
          grade: grade.grade,
          studentCount,
          teacherCount,
          assignmentCount,
        };
      })
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          present: 1,
          absent: 1,
          late: 1,
          excused: 1,
          total: { $add: ["$present", "$absent", "$late", "$excused"] },
          attendanceRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$present",
                      { $add: ["$present", "$absent", "$late", "$excused"] },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);
    const queryStats = await Query.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    const queryPriorityStats = await Query.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: "$_id",
          count: 1,
        },
      },
    ]);
    const allChapters = await Chapter.find().select("studentProgress");
    let totalCompletions = 0;
    let totalInProgress = 0;
    for (const chapter of allChapters) {
      if (chapter.studentProgress) {
        totalCompletions += chapter.studentProgress.filter(
          (p) => p.status === "completed"
        ).length;
        totalInProgress += chapter.studentProgress.filter(
          (p) => p.status === "in_progress"
        ).length;
      }
    }
    const completionRate =
      totalStudents > 0 && totalChapters > 0
        ? Math.round((totalCompletions / (totalStudents * totalChapters)) * 100)
        : 0;
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");
    const recentQueries = await Query.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("from", "name")
      .select("subject status createdAt from");
    const topStudents = await Chapter.aggregate([
      { $unwind: "$studentProgress" },
      {
        $match: { "studentProgress.status": "completed" },
      },
      {
        $group: {
          _id: "$studentProgress.studentId",
          completedChapters: { $sum: 1 },
          averageScore: { $avg: "$studentProgress.score" },
        },
      },
      { $sort: { completedChapters: -1, averageScore: -1 } },
      { $limit: 10 },
    ]);
    const topStudentsWithDetails = await Student.find({
      _id: { $in: topStudents.map((s) => s._id) },
    }).select("name email rollNumber profilePictureUrl");
    const topPerformers = topStudents.map((student) => {
      const details = topStudentsWithDetails.find(
        (s) => s._id.toString() === student._id.toString()
      );
      return {
        studentId: student._id,
        name: details?.name,
        email: details?.email,
        rollNumber: details?.rollNumber,
        profilePictureUrl: details?.profilePictureUrl,
        completedChapters: student.completedChapters,
        averageScore: Math.round(student.averageScore || 0),
      };
    });
    const assignmentStats = await Assignment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalGrades,
          totalChapters,
          totalAnnouncements,
          totalQueries,
          completionRate,
        },
        charts: {
          studentGrowth,
          teacherGrowth,
          gradeDistribution,
          attendanceTrend,
          queryStats,
          queryPriorityStats,
          assignmentStats,
        },
        insights: {
          topPerformers,
          recentAnnouncements,
          recentQueries,
        },
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
): Promise<void> => {
  try {
    const studentId = req.userId;
    const student = await Student.findById(studentId).select("name gradeId");
    if (!student || !student.gradeId) {
      throw new ApiError(404, "Student not found or no grade assigned");
    }
    const gradeId = student.gradeId;
    const grade = await Grade.findById(gradeId).select("grade units");
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const totalChapters = await Chapter.countDocuments({
      gradeId: grade._id,
    });
    const completedChapters = await Chapter.countDocuments({
      gradeId: grade._id,
      "studentProgress.studentId": new mongoose.Types.ObjectId(
        String(studentId)
      ),
      "studentProgress.status": "completed",
    });
    const inProgressChapters = await Chapter.countDocuments({
      gradeId: grade._id,
      "studentProgress.studentId": new mongoose.Types.ObjectId(
        String(studentId)
      ),
      "studentProgress.status": "in_progress",
    });
    const lockedChapters =
      totalChapters - completedChapters - inProgressChapters;
    const completionRate =
      totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;
    const chapterProgressByUnit = await Promise.all(
      grade.units.map(async (unit) => {
        const unitChapters = await Chapter.find({
          gradeId: grade._id,
          unitId: unit._id,
        }).select("_id title chapterNumber studentProgress");
        let completed = 0;
        let inProgress = 0;
        let locked = 0;
        for (const chapter of unitChapters) {
          const progress = chapter.studentProgress?.find(
            (p) => p.studentId.toString() === studentId
          );
          if (progress) {
            if (progress.status === "completed") {
              completed++;
            } else if (progress.status === "in_progress") {
              inProgress++;
            } else {
              locked++;
            }
          } else {
            locked++;
          }
        }
        return {
          unitId: unit._id,
          unitName: unit.name,
          total: unitChapters.length,
          completed,
          inProgress,
          locked,
          completionRate:
            unitChapters.length > 0
              ? Math.round((completed / unitChapters.length) * 100)
              : 0,
        };
      })
    );
    const recentPerformance = await Chapter.aggregate([
      {
        $match: {
          gradeId: new mongoose.Types.ObjectId(String(gradeId)),
          "studentProgress.studentId": new mongoose.Types.ObjectId(
            String(studentId)
          ),
          "studentProgress.status": "completed",
        },
      },
      { $unwind: "$studentProgress" },
      {
        $match: {
          "studentProgress.studentId": new mongoose.Types.ObjectId(
            String(studentId)
          ),
          "studentProgress.status": "completed",
        },
      },
      { $sort: { "studentProgress.completedAt": -1 } },
      { $limit: 10 },
      {
        $project: {
          title: 1,
          chapterNumber: 1,
          score: "$studentProgress.score",
          completedAt: "$studentProgress.completedAt",
        },
      },
    ]);
    const performanceData = recentPerformance
      .map((chapter) => ({
        chapterName: chapter.title,
        chapterNumber: chapter.chapterNumber,
        score: chapter.score ?? 0,
        completedAt: chapter.completedAt,
      }))
      .reverse();
    const assignments = await Assignment.find({
      gradeId: new mongoose.Types.ObjectId(String(gradeId)),
    }).select("_id title endDate totalMarks status");
    const assignmentStatusData = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: new mongoose.Types.ObjectId(String(studentId)),
        }).select("score");
        return {
          title: assignment.title,
          endDate: assignment.endDate,
          totalMarks: assignment.totalMarks,
          status: assignment.status,
          submitted: !!submission,
          score: submission?.score,
        };
      })
    );
    const assignmentStats = {
      total: assignmentStatusData.length,
      submitted: assignmentStatusData.filter((a) => a.submitted).length,
      pending: assignmentStatusData.filter(
        (a) => !a.submitted && a.status === "active"
      ).length,
      graded: assignmentStatusData.filter(
        (a) => a.score !== null && a.score !== undefined
      ).length,
    };
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const attendanceRecords = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(String(studentId)),
          gradeId: new mongoose.Types.ObjectId(String(gradeId)),
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          status: { $first: "$status" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          status: 1,
        },
      },
    ]);
    const attendanceStats = {
      present: attendanceRecords.filter((r) => r.status === "present").length,
      absent: attendanceRecords.filter((r) => r.status === "absent").length,
      late: attendanceRecords.filter((r) => r.status === "late").length,
      excused: attendanceRecords.filter((r) => r.status === "excused").length,
      total: attendanceRecords.length,
      attendanceRate:
        attendanceRecords.length > 0
          ? Math.round(
              (attendanceRecords.filter((r) => r.status === "present").length /
                attendanceRecords.length) *
                100
            )
          : 0,
    };
    const recentAnnouncements = await Announcement.find({
      $or: [{ targetAudience: "all" }, { targetGrades: grade._id }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title content type createdAt");
    const myQueries = await Query.aggregate([
      { $match: { from: new mongoose.Types.ObjectId(String(studentId)) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    const currentDate = new Date();
    const activeAssignments = await Assignment.find({
      gradeId: new mongoose.Types.ObjectId(String(gradeId)),
      endDate: { $gte: currentDate },
      status: "active",
    })
      .sort({ endDate: 1 })
      .select("_id title endDate totalMarks startDate")
      .lean();
    const studentSubmissions = await Submission.find({
      studentId: new mongoose.Types.ObjectId(String(studentId)),
      assignmentId: { $in: activeAssignments.map((a) => a._id) },
    })
      .select("assignmentId")
      .lean();
    const submittedAssignmentIds = new Set(
      studentSubmissions.map((s) => s.assignmentId.toString())
    );
    const upcomingDeadlines = activeAssignments
      .filter(
        (assignment) => !submittedAssignmentIds.has(assignment._id.toString())
      )
      .slice(0, 5)
      .map((assignment) => ({
        assignmentId: assignment._id,
        title: assignment.title,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        totalMarks: assignment.totalMarks,
        daysRemaining: Math.ceil(
          (assignment.endDate.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalChapters,
          completedChapters,
          inProgressChapters,
          lockedChapters,
          completionRate,
          attendanceRate: attendanceStats.attendanceRate,
        },
        charts: {
          chapterProgressByUnit,
          performanceData,
          attendanceRecords,
          assignmentStats,
          myQueries,
        },
        recentActivity: {
          recentAnnouncements,
          upcomingDeadlines,
        },
      },
    });
  } catch (err) {
    console.error("Error in getStudentDashboard:", err);
    next(err);
  }
};
export const getTeacherDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.userId;
    const teacher = await Teacher.findById(teacherId).select("gradeId");
    if (!teacher || !teacher.gradeId) {
      throw new ApiError(404, "Teacher not found or no grade assigned");
    }
    const gradeId = teacher.gradeId;
    const grade = await Grade.findById(gradeId).select("grade");
    if (!grade) {
      throw new ApiError(404, "Grade not found for this teacher");
    }
    const [totalStudents, totalChapters, totalAssignments, pendingQueries] =
      await Promise.all([
        Student.countDocuments({ gradeId: gradeId }),
        Chapter.countDocuments({ gradeId: gradeId }),
        Assignment.countDocuments({
          gradeId: gradeId,
          createdBy: teacherId,
        }),
        Query.countDocuments({ to: teacherId, status: "open" }),
      ]);
    const students = await Student.find({ gradeId: gradeId }).select(
      "_id name email"
    );
    const gradeChapters = await Chapter.find({ gradeId: gradeId }).select(
      "studentProgress title"
    );
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    for (const chapter of gradeChapters) {
      for (const student of students) {
        const progress = chapter.studentProgress?.find(
          (p) => p.studentId.toString() === student._id.toString()
        );
        if (progress?.status === "completed") completed++;
        else if (progress?.status === "in_progress") inProgress++;
        else notStarted++;
      }
    }
    const studentPerformanceByGrade = [
      {
        grade: grade.grade,
        students: students.length,
        completed,
        inProgress,
        notStarted,
        completionRate:
          students.length > 0 && completed + inProgress + notStarted > 0
            ? Math.round(
                (completed / (completed + inProgress + notStarted)) * 100
              )
            : 0,
      },
    ];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const attendanceByDay = await Attendance.aggregate([
      {
        $match: {
          gradeId: new mongoose.Types.ObjectId(String(gradeId)),
          teacherId: new mongoose.Types.ObjectId(String(teacherId)),
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
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          present: 1,
          absent: 1,
          late: 1,
        },
      },
    ]);
    const assignments = await Assignment.find({
      gradeId: gradeId,
      createdBy: teacherId,
    }).select("_id title status");
    const assignmentSubmissions = await Promise.all(
      assignments.map(async (assignment) => {
        const [submissionStats] = await Submission.aggregate([
          { $match: { assignmentId: assignment._id } },
          {
            $group: {
              _id: null,
              submitted: { $sum: 1 },
              graded: {
                $sum: {
                  $cond: [{ $ne: ["$score", null] }, 1, 0],
                },
              },
            },
          },
        ]);
        const submitted = submissionStats?.submitted || 0;
        const graded = submissionStats?.graded || 0;
        return {
          title: assignment.title,
          status: assignment.status,
          totalStudents: totalStudents,
          submitted,
          graded,
          pending: totalStudents - submitted,
          pendingGrading: submitted - graded,
        };
      })
    );
    const queryStatusDistribution = await Query.aggregate([
      { $match: { to: new mongoose.Types.ObjectId(String(teacherId)) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    const recentQueries = await Query.find({ to: teacherId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "from",
        select: "name email profilePictureUrl",
      })
      .select("subject status priority createdAt from");
    const chapterProgress = await Chapter.aggregate([
      { $match: { gradeId: new mongoose.Types.ObjectId(String(gradeId)) } },
      {
        $unwind: { path: "$studentProgress", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$studentProgress.status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    const upcomingAssignments = await Assignment.find({
      gradeId: gradeId,
      createdBy: teacherId,
      endDate: { $gte: new Date() },
      status: "active",
    })
      .sort({ endDate: 1 })
      .limit(5)
      .select("title endDate totalMarks startDate")
      .lean();
    const currentDate = new Date();
    const formattedUpcomingAssignments = upcomingAssignments.map(
      (assignment) => ({
        title: assignment.title,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        grade: grade.grade,
        totalMarks: assignment.totalMarks,
        daysRemaining: Math.ceil(
          (assignment.endDate.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      })
    );
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalChapters,
          totalAssignments,
          pendingQueries,
        },
        charts: {
          studentPerformanceByGrade,
          attendanceByDay,
          assignmentSubmissions,
          queryStatusDistribution,
          chapterProgress,
        },
        recentActivity: {
          recentQueries,
          upcomingAssignments: formattedUpcomingAssignments,
        },
      },
    });
  } catch (err) {
    console.error("Error in getTeacherDashboard:", err);
    next(err);
  }
};
