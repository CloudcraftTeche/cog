import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Grade } from "../../../models/academic/Grade.model";
import { TeacherChapter } from "../../../models/academic/TeacherChapter.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { User } from "../../../models/user/User.model";
export const createTeacherChapterHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      contentType,
      textContent,
      chapterNumber,
      questions,
      unitId,
      videoUrl,
      gradeIds,
    } = req.body;
    if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
      throw new ApiError(400, "At least one grade ID is required");
    }
    const invalidGradeIds = gradeIds.filter(
      (id) => !mongoose.isValidObjectId(id)
    );
    if (invalidGradeIds.length > 0) {
      throw new ApiError(
        400,
        `Invalid grade IDs: ${invalidGradeIds.join(", ")}`
      );
    }
    if (!unitId || !mongoose.isValidObjectId(unitId)) {
      throw new ApiError(400, "Valid unit ID is required");
    }
    let parsedQuestions: any[] = [];
    if (questions) {
      parsedQuestions = Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]");
      parsedQuestions.forEach((q: any, index: number) => {
        if (!q.questionText || typeof q.questionText !== "string") {
          throw new ApiError(
            400,
            `Question ${index + 1}: questionText is required`
          );
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new ApiError(
            400,
            `Question ${index + 1}: must have exactly 4 options`
          );
        }
        if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
          throw new ApiError(
            400,
            `Question ${index + 1}: correctAnswer is required`
          );
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new ApiError(
            400,
            `Question ${index + 1}: correctAnswer must be one of the options`
          );
        }
      });
    }
    const grades = await Grade.find({ _id: { $in: gradeIds } });
    if (grades.length !== gradeIds.length) {
      const foundIds = grades.map((g) => g._id.toString());
      const missingIds = gradeIds.filter((id) => !foundIds.includes(id));
      throw new ApiError(404, `Grades not found: ${missingIds.join(", ")}`);
    }
    const gradesWithoutUnit: string[] = [];
    let unitName = "";
    for (const grade of grades) {
      const unit = grade.units.find((u) => u._id?.toString() === unitId);
      if (!unit) {
        gradesWithoutUnit.push(`Grade ${grade.grade}`);
      } else if (!unitName) {
        unitName = unit.name;
      }
    }
    if (gradesWithoutUnit.length > 0) {
      throw new ApiError(
        404,
        `Unit not found in: ${gradesWithoutUnit.join(", ")}`
      );
    }
    const createdChapters = [];
    for (const gradeId of gradeIds) {
      const chapterData = {
        title: title.trim(),
        description: description.trim(),
        contentType,
        videoUrl,
        textContent,
        gradeId: new mongoose.Types.ObjectId(gradeId),
        unitId: new mongoose.Types.ObjectId(unitId),
        createdBy: new mongoose.Types.ObjectId(req.userId),
        chapterNumber,
        questions: parsedQuestions.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedAnswer: null,
        })),
      };
      const createdChapter = await TeacherChapter.create(chapterData);
      createdChapters.push({
        id: createdChapter._id,
        gradeId: createdChapter.gradeId,
        title: createdChapter.title,
      });
    }
    res.status(201).json({
      success: true,
      message: `Teacher chapter created successfully for ${createdChapters.length} grade(s)`,
      data: {
        title,
        chapterNumber,
        unitId,
        unitName,
        contentType,
        questionsCount: parsedQuestions.length,
        createdForGrades: createdChapters.length,
        chapters: createdChapters,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getTeacherChaptersHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { search = "", unitId, chapterNumber } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const userId = req.userId;
    const teacher = await Teacher.findById(userId).select("gradeId role");
    const admin = await User.findById(userId).select("role");
    let gradeId: string | null | undefined = null;
    if (teacher) {
      if (!teacher.gradeId) throw new ApiError(400, "Teacher has no assigned grade");
      gradeId = teacher.gradeId.toString();
    }
    const filter: any = {};
    if (admin) {
    } else if (gradeId) {
      filter.gradeId = gradeId;
    } else {
      throw new ApiError(403, "Unauthorized access");
    }
    if (search) filter.title = { $regex: new RegExp(search as string, "i") };
    if (unitId) filter.unitId = unitId;
    if (chapterNumber) filter.chapterNumber = chapterNumber;
    const grade = gradeId
      ? await Grade.findById(gradeId).select("units grade")
      : null;
    const [chapters, total] = await Promise.all([
      TeacherChapter.find(filter)
        .sort({ unitId: 1, chapterNumber: 1 })
        .skip(skip)
        .limit(limit)
        .populate("gradeId", "grade")
        .lean(),
      TeacherChapter.countDocuments(filter),
    ]);
    const chaptersWithUnitNames = grade
      ? chapters.map((chapter) => {
          const unit = grade.units.find(
            (u) => u._id?.toString() === chapter.unitId.toString()
          );
          return {
            ...chapter,
            unit: unit?.name || null,
            unitName: unit?.name || null,
            unitDescription: unit?.description || null,
          };
        })
      : chapters.map((chapter) => ({
          ...chapter,
          unit: "Unknown",
          unitName: "Unknown",
        }));
    if (teacher) {
      const teacherObjectId = new mongoose.Types.ObjectId(userId);
      const allChapters = await TeacherChapter.find({ gradeId: teacher.gradeId })
        .sort({ unitId: 1, chapterNumber: 1 })
        .select("_id unitId teacherProgress")
        .lean();
      const completionMap = new Map<string, any>();
      allChapters.forEach((ch) => {
        const progress = ch.teacherProgress?.find(
          (p) => p.teacherId.toString() === teacherObjectId.toString()
        );
        completionMap.set(ch._id.toString(), progress);
      });
      const chaptersWithStatus = chaptersWithUnitNames.map((chapter) => {
        const chapterIdStr = chapter._id.toString();
        const progress = completionMap.get(chapterIdStr);
        const globalIndex = allChapters.findIndex(
          (c) => c._id.toString() === chapterIdStr
        );
        let isAccessible = globalIndex === 0;
        if (globalIndex > 0) {
          const previousChapter = allChapters[globalIndex - 1];
          const prevProgress = completionMap.get(previousChapter._id.toString());
          isAccessible = prevProgress?.status === "completed";
        }
        const isCompleted = progress?.status === "completed";
        const isInProgress = progress?.status === "in_progress";
        const isLocked = !isAccessible && !isCompleted;
        const status = isCompleted
          ? "completed"
          : isInProgress
          ? "in_progress"
          : isAccessible
          ? "accessible"
          : "locked";
        return {
          ...chapter,
          status,
          isCompleted,
          isAccessible,
          isInProgress,
          isLocked,
          startedAt: progress?.startedAt,
          completedAt: progress?.completedAt,
          score: progress?.score,
        };
      });
      return res.status(200).json({
        success: true,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: chaptersWithStatus,
      });
    }
    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: chaptersWithUnitNames,
    });
  } catch (err) {
    next(err);
  }
};
export const getTeacherChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await TeacherChapter.findOne({
      _id: chapterId,
    })
      .lean()
      .populate("createdBy", "name email")
      .populate("gradeId", "grade");
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    const grade = await Grade.findById(chapter.gradeId).select("units");
    const unit = grade?.units.find(
      (u) => u._id?.toString() === chapter.unitId.toString()
    );
    res.status(200).json({
      success: true,
      data: {
        ...chapter,
        unit: unit?.name || null,
        unitName: unit?.name || null,
        unitDescription: unit?.description || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const updateTeacherChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const {
      title,
      description,
      contentType,
      textContent,
      questions,
      chapterNumber,
      unitId,
      videoUrl,
      gradeId,
    } = req.body;
    const chapter = await TeacherChapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    if (unitId) {
      const grade = await Grade.findById(gradeId || chapter.gradeId);
      const unit = grade?.units.find((u) => u._id?.toString() === unitId);
      if (!unit) {
        throw new ApiError(404, "Unit not found in this grade");
      }
    }
    let parsedQuestions = chapter.questions;
    if (questions !== undefined) {
      parsedQuestions = Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]");
      if (parsedQuestions.length > 0) {
        parsedQuestions.forEach((q: any, index: number) => {
          if (!q.questionText || typeof q.questionText !== "string") {
            throw new ApiError(
              400,
              `Question ${index + 1}: questionText is required`
            );
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new ApiError(
              400,
              `Question ${index + 1}: must have exactly 4 options`
            );
          }
          if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
            throw new ApiError(
              400,
              `Question ${index + 1}: correctAnswer is required`
            );
          }
          if (!q.options.includes(q.correctAnswer)) {
            throw new ApiError(
              400,
              `Question ${index + 1}: correctAnswer must be one of the options`
            );
          }
        });
      }
    }
    const updated = await TeacherChapter.findByIdAndUpdate(
      chapterId,
      {
        title: title?.trim(),
        description: description?.trim(),
        contentType,
        videoUrl,
        textContent,
        chapterNumber,
        unitId: unitId ? new mongoose.Types.ObjectId(unitId) : chapter.unitId,
        gradeId: gradeId ? new mongoose.Types.ObjectId(gradeId) : chapter.gradeId,
        questions: parsedQuestions,
      },
      { new: true, runValidators: true }
    ).populate("gradeId", "grade");
    const grade = await Grade.findById(updated?.gradeId).select("units");
    const unit = grade?.units.find(
      (u) => u._id?.toString() === updated?.unitId.toString()
    );
    res.status(200).json({
      success: true,
      message: "Teacher chapter updated successfully",
      data: {
        ...updated?.toObject(),
        unitName: unit?.name || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const deleteTeacherChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await TeacherChapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    await chapter.deleteOne();
    res.status(200).json({
      success: true,
      message: "Teacher chapter deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const markTeacherChapterInProgressHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await TeacherChapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    const teacherId = new mongoose.Types.ObjectId(req.userId);
    const existingProgress = chapter.teacherProgress?.find(
      (p) => p.teacherId.toString() === teacherId.toString()
    );
    if (existingProgress) {
      if (
        existingProgress.status === "accessible" ||
        existingProgress.status === "locked"
      ) {
        existingProgress.status = "in_progress";
        existingProgress.startedAt = existingProgress.startedAt || new Date();
        await chapter.save();
      }
    } else {
      if (!chapter.teacherProgress) {
        chapter.teacherProgress = [];
      }
      chapter.teacherProgress.push({
        teacherId,
        status: "in_progress",
        startedAt: new Date(),
      } as any);
      await chapter.save();
    }
    res.status(200).json({
      success: true,
      message: "Teacher chapter marked as in progress",
      data: {
        chapterId: chapter._id,
        teacherId,
        status: "in_progress",
      },
    });
  } catch (err) {
    next(err);
  }
};
export const submitTeacherChapterHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId } = req.params;
    const { answers } = req.body;
    const chapter = await TeacherChapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    const teacherId = new mongoose.Types.ObjectId(req.userId);
    if (!chapter.questions || chapter.questions.length === 0) {
      const existingProgress = chapter.teacherProgress?.find(
        (p) => p.teacherId.toString() === teacherId.toString()
      );
      if (existingProgress) {
        existingProgress.status = "completed";
        existingProgress.completedAt = new Date();
      } else {
        if (!chapter.teacherProgress) {
          chapter.teacherProgress = [];
        }
        chapter.teacherProgress.push({
          teacherId,
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
        } as any);
      }
      await chapter.save();
      return res.status(200).json({
        success: true,
        message: "Teacher chapter completed successfully",
        data: {
          chapterId: chapter._id,
          teacherId,
          status: "completed",
          completedAt: existingProgress?.completedAt || new Date(),
        },
      });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new ApiError(400, "Answers array is required for chapters with questions");
    }
    let correctCount = 0;
    const totalQuestions = chapter.questions.length;
    chapter.questions.forEach((question) => {
      const teacherAnswer = answers.find(
        (ans: any) => ans.questionText === question.questionText
      );
      if (
        teacherAnswer &&
        teacherAnswer.selectedAnswer === question.correctAnswer
      ) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / totalQuestions) * 100);
    const existingProgress = chapter.teacherProgress?.find(
      (p) => p.teacherId.toString() === teacherId.toString()
    );
    if (existingProgress) {
      existingProgress.status = "completed";
      existingProgress.completedAt = new Date();
      existingProgress.score = score;
    } else {
      if (!chapter.teacherProgress) {
        chapter.teacherProgress = [];
      }
      chapter.teacherProgress.push({
        teacherId,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        score,
      } as any);
    }
    await chapter.save();
    res.status(200).json({
      success: true,
      message: "Teacher chapter completed successfully",
      data: {
        chapterId: chapter._id,
        teacherId,
        status: "completed",
        score,
        correctAnswers: correctCount,
        totalQuestions,
        completedAt: existingProgress?.completedAt || new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const isTeacherChapterCompletedHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await TeacherChapter.findById(chapterId)
      .select("teacherProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }
    const progress = chapter.teacherProgress?.find(
      (p) => p.teacherId.toString() === req.userId
    );
    res.status(200).json({
      success: true,
      message: "Teacher chapter completion status fetched",
      data: {
        isCompleted: progress?.status === "completed",
        status: progress?.status || "locked",
        completedAt: progress?.completedAt || null,
        startedAt: progress?.startedAt || null,
        score: progress?.score || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getCompletedTeacherChaptersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId).select("gradeId");
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const grade = await Grade.findById(teacher.gradeId).select("units");
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapters = await TeacherChapter.find({
      gradeId: teacher.gradeId,
      "teacherProgress.teacherId": new mongoose.Types.ObjectId(teacherId),
      "teacherProgress.status": "completed",
    })
      .select("title chapterNumber unitId description teacherProgress")
      .lean();
    const completedChapters = chapters.map((chapter) => {
      const progress = chapter.teacherProgress?.find(
        (p) => p.teacherId.toString() === teacherId
      );
      const unit = grade.units.find(
        (u) => u._id?.toString() === chapter.unitId.toString()
      );
      return {
        chapterId: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        unitId: chapter.unitId,
        unitName: unit?.name || null,
        description: chapter.description,
        completedAt: progress?.completedAt,
        score: progress?.score,
      };
    });
    res.status(200).json({
      success: true,
      message: "Completed teacher chapters fetched successfully",
      data: completedChapters,
    });
  } catch (err) {
    next(err);
  }
};