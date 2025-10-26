import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { ApiError } from "../../../utils/ApiError";
import { Student } from "../../../models/user";
import { Assignment } from "../../../models/assignment";
import { Chapter } from "../../../models/chapter";
import { Submission } from "../../../models/submission";
import mongoose from "mongoose";

export const getStudentTodoOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);

    const student = await Student.findById(studentId)
      .select("class completedChapters assignmentsCompleted")
      .lean();

    if (!student) throw new ApiError(404, "Student not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allAssignments = await Assignment.find({ grade: student.class })
      .select("title description endDate startDate createdAt")
      .lean();

    const submissions = await Submission.find({ student: studentId })
      .select("assignment createdAt score")
      .lean();

    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignment.toString())
    );

    const dueAssignments = allAssignments
      .filter((a) => {
        const notSubmitted = !submittedAssignmentIds.has(a._id.toString());
        const isPastDue = new Date(a.endDate) < today;
        const isUpcoming = new Date(a.endDate) >= today;
        return notSubmitted && (isPastDue || isUpcoming);
      })
      .map((a) => ({
        ...a,
        isPastDue: new Date(a.endDate) < today,
        daysLeft: Math.ceil(
          (new Date(a.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    const allChapters = await Chapter.find({ class: student.class })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const completedChapterIds = new Set(
      student.completedChapters.map((c) => c.chapter.toString())
    );

    const todayChapters = allChapters
      .filter((c) => !completedChapterIds.has(c._id.toString()))
      .slice(0, 3);

    const completedDates = student.completedChapters
      .map((c) => new Date(c.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < completedDates.length; i++) {
      const completedDate = new Date(completedDates[i]);
      completedDate.setHours(0, 0, 0, 0);

      if (completedDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (completedDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    const totalChapters = await Chapter.countDocuments({ class: student.class });
    const completedChapters = student.completedChapters.length;
    const completionPercentage = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100) 
      : 0;

    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        streak,
        stats: {
          totalChapters,
          completedChapters,
          completionPercentage,
          pendingAssignments: dueAssignments.length,
          totalAssignments: allAssignments.length,
          submittedAssignments: submissions.length,
        },
        dueAssignments: dueAssignments.slice(0, 5),
        todayChapters,
        recentActivity: recentSubmissions,
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

    const student = await Student.findById(studentId).select("class").lean();
    if (!student) throw new ApiError(404, "Student not found");

    const skip = (Number(page) - 1) * Number(limit);

    const assignments = await Assignment.find({ grade: student.class })
      .sort({ endDate: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const submissions = await Submission.find({ student: studentId })
      .select("assignment score createdAt")
      .lean();

    const submissionMap = new Map(
      submissions.map((s) => [s.assignment.toString(), s])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredAssignments = assignments.map((a) => {
      const submission = submissionMap.get(a._id.toString());
      const endDate = new Date(a.endDate);
      const isPastDue = endDate < today;
      const isSubmitted = !!submission;

      return {
        ...a,
        isSubmitted,
        isPastDue,
        score: submission?.score || null,
        submittedAt: submission?.createdAt || null,
        daysLeft: Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      };
    });

    if (status === "pending") {
      filteredAssignments = filteredAssignments.filter((a) => !a.isSubmitted);
    } else if (status === "submitted") {
      filteredAssignments = filteredAssignments.filter((a) => a.isSubmitted);
    } else if (status === "overdue") {
      filteredAssignments = filteredAssignments.filter((a) => a.isPastDue && !a.isSubmitted);
    }

    const total = await Assignment.countDocuments({ grade: student.class });

    res.json({
      success: true,
      data: filteredAssignments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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

    const student = await Student.findById(studentId)
      .select("completedChapters")
      .lean();

    if (!student) throw new ApiError(404, "Student not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completionMap = new Map<string, number>();

    student.completedChapters.forEach((c) => {
      const date = new Date(c.completedAt);
      date.setHours(0, 0, 0, 0);
      if (date >= thirtyDaysAgo) {
        const dateKey = date.toISOString().split("T")[0];
        completionMap.set(dateKey, (completionMap.get(dateKey) || 0) + 1);
      }
    });

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateKey = checkDate.toISOString().split("T")[0];
      if (completionMap.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const sortedDates = Array.from(completionMap.keys()).sort();
    let longestStreak = 0;
    let currentLongestStreak = 0;
    let previousDate: Date | null = null;

    sortedDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (previousDate) {
        const diffDays = Math.round(
          (date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          currentLongestStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentLongestStreak);
          currentLongestStreak = 1;
        }
      } else {
        currentLongestStreak = 1;
      }
      previousDate = date;
    });
    longestStreak = Math.max(longestStreak, currentLongestStreak);

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
        currentStreak: streak,
        longestStreak,
        totalCompletions: student.completedChapters.length,
        calendar,
        streakMessage: getStreakMessage(streak),
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