import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { ApiError } from "../../../utils/ApiError";
import mongoose from "mongoose";
import { Student } from "../../../models/user/Student.model";
import { Chapter } from "../../../models/academic/Chapter.model";
import { Assignment } from "../../../models/assignment/Assignment.schema";
import { Submission } from "../../../models/assignment/Submission.schema";
export const getStudentTodoOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);
    console.log('>>> Starting Todo Overview');
    console.log('>>> Student ID:', studentId.toString());
    const student = await Student.findById(studentId)
      .select("name email gradeId")
      .lean();
    if (!student || !student.gradeId) {
      throw new ApiError(404, "Student not found or not assigned to grade");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allChapters = await Chapter.find({ gradeId: student.gradeId }).lean();
    let completedCount = 0;
    const completedChaptersList = [];
    for (const chapter of allChapters) {
      if (!chapter.studentProgress || chapter.studentProgress.length === 0) {
        continue;
      }
      for (const progress of chapter.studentProgress) {
        const progressStudentId = progress.studentId.toString();
        const targetStudentId = studentId.toString();
        if (progressStudentId === targetStudentId && progress.status === 'completed') {
          completedCount++;
          completedChaptersList.push({
            title: chapter.title,
            studentId: progressStudentId,
            status: progress.status
          });
          break;
        }
      }
    }
    console.log('>>> Completed chapters count:', completedCount);
    console.log('>>> Completed chapters:', JSON.stringify(completedChaptersList, null, 2));
    const totalChapters = allChapters.length;
    const completionPercentage = totalChapters > 0 
      ? Math.round((completedCount / totalChapters) * 100) 
      : 0;
    const allAssignments = await Assignment.find({ gradeId: student.gradeId }).lean();
    const submissions = await Submission.find({ studentId }).lean();
    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignmentId.toString())
    );
    const dueAssignments = allAssignments
      .filter((a) => !submittedAssignmentIds.has(a._id.toString()))
      .map((a) => ({
        ...a,
        isPastDue: new Date(a.endDate) < today,
        daysLeft: Math.ceil(
          (new Date(a.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 5);
    const recentChapters = allChapters
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    const todayChapters = recentChapters
      .map((chapter) => {
        const progress = chapter.studentProgress?.find(
          (p) => p.studentId.toString() === studentId.toString()
        );
        return {
          ...chapter,
          status: progress?.status || "accessible",
          isCompleted: progress?.status === "completed",
        };
      })
      .filter((c) => c.status !== "completed")
      .slice(0, 3);
    const completedDatesMap = new Map();
    for (const chapter of allChapters) {
      if (!chapter.studentProgress) continue;
      for (const progress of chapter.studentProgress) {
        if (
          progress.studentId.toString() === studentId.toString() &&
          progress.status === 'completed' &&
          progress.completedAt
        ) {
          const dateKey = new Date(progress.completedAt).toISOString().split('T')[0];
          completedDatesMap.set(dateKey, true);
        }
      }
    }
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (completedDatesMap.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    const recentSubmissions = await Submission.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const enrichedSubmissions = await Promise.all(
      recentSubmissions.map(async (s) => {
        const assignment = await Assignment.findById(s.assignmentId)
          .select("title")
          .lean();
        return {
          ...s,
          assignment: assignment?.title || "Unknown Assignment",
        };
      })
    );
    res.json({
      success: true,
      data: {
        streak,
        stats: {
          totalChapters,
          completedChapters: completedCount,
          completionPercentage,
          pendingAssignments: dueAssignments.length,
          totalAssignments: allAssignments.length,
          submittedAssignments: submissions.length,
        },
        dueAssignments,
        todayChapters,
        recentActivity: enrichedSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getStudentAssignments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);
    const { status = "all", page = 1, limit = 10 } = req.query;
    const student = await Student.findById(studentId).select("gradeId").lean();
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    if (!student.gradeId) {
      throw new ApiError(404, "Student not assigned to any grade");
    }
    const skip = (Number(page) - 1) * Number(limit);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignments = await Assignment.find({
      gradeId: student.gradeId,
    }).lean();
    const submissions = await Submission.find({
      studentId: studentId,
    }).lean();
    const submissionMap = new Map(
      submissions.map((s) => [s.assignmentId.toString(), s])
    );
    let filteredAssignments = assignments.map((a) => {
      const submission = submissionMap.get(a._id.toString());
      const endDate = new Date(a.endDate);
      const isPastDue = endDate < today;
      const isSubmitted = !!submission;
      return {
        ...a,
        isSubmitted,
        isPastDue: isPastDue && !isSubmitted,
        score: submission?.score || null,
        submittedAt: submission?.createdAt || null,
        feedback: submission?.feedback || null,
        daysLeft: Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });
    if (status === "pending") {
      filteredAssignments = filteredAssignments.filter((a) => !a.isSubmitted);
    } else if (status === "submitted") {
      filteredAssignments = filteredAssignments.filter((a) => a.isSubmitted);
    } else if (status === "overdue") {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.isPastDue && !a.isSubmitted
      );
    }
    filteredAssignments.sort((a, b) => {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      return dateA - dateB;
    });
    const total = filteredAssignments.length;
    const paginatedAssignments = filteredAssignments.slice(
      skip,
      skip + Number(limit)
    );
    res.json({
      success: true,
      data: paginatedAssignments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getStudentStreak = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);
    const student = await Student.findById(studentId).select("gradeId").lean();
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const completedChapters = await Chapter.find({
      "studentProgress.studentId": studentId,
      "studentProgress.status": "completed",
    })
      .select("studentProgress")
      .lean();
    const completedDates = completedChapters
      .flatMap((chapter) =>
        chapter.studentProgress
          ?.filter(
            (p) =>
              p.studentId.toString() === studentId.toString() &&
              p.status === "completed" &&
              p.completedAt
          )
          .map((p) => new Date(p.completedAt!))
      )
      .filter((date): date is Date => date !== undefined);
    const completionMap = new Map<string, number>();
    completedDates.forEach((date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      if (normalizedDate >= thirtyDaysAgo && normalizedDate <= today) {
        const dateKey = normalizedDate.toISOString().split("T")[0];
        completionMap.set(dateKey, (completionMap.get(dateKey) || 0) + 1);
      }
    });
    let currentStreak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dateKey = checkDate.toISOString().split("T")[0];
      if (completionMap.has(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    const sortedDates = Array.from(completionMap.keys())
      .sort()
      .map((dateStr) => new Date(dateStr));
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;
    sortedDates.forEach((date) => {
      if (previousDate) {
        const diffDays = Math.round(
          (date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      previousDate = date;
    });
    longestStreak = Math.max(longestStreak, tempStreak);
    const calendar = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      calendar.push({
        date: dateKey,
        count: completionMap.get(dateKey) || 0,
        hasActivity: completionMap.has(dateKey),
      });
    }
    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalCompletions: completedDates.length,
        last30DaysCompletions: Array.from(completionMap.values()).reduce(
          (sum, count) => sum + count,
          0
        ),
        calendar,
        streakMessage: getStreakMessage(currentStreak),
      },
    });
  } catch (err) {
    next(err);
  }
};
function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your learning journey today! 🚀";
  if (streak < 3) return "Great start! Keep it going! 💪";
  if (streak < 7) return "Amazing progress! You're on fire! 🔥";
  if (streak < 14) return "Incredible dedication! Keep crushing it! 🌟";
  if (streak < 30) return "Unstoppable! You're a learning machine! 🎯";
  return "Legend status! Your dedication is inspiring! 👑";
}
