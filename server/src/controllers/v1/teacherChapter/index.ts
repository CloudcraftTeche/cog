import { Request, Response, NextFunction } from "express";
import { TeacherChapter } from "../../../models/teacherChapter";
import { Unit } from "../../../models/unit";
import { ApiError } from "../../../utils/ApiError";
import { Teacher } from "../../../models/user";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import mongoose from "mongoose";

export const createTeacherChapter = async (
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
      grades,
      chapterNumber,
      questions,
      unit,
      videoUrl,
    } = req.body;

    const gradesArray = Array.isArray(grades) ? grades : [grades];

    const chaptersData = gradesArray.map((grade) => ({
      title,
      description,
      contentType,
      videoUrl,
      textContent,
      grade,
      createdBy: req.userId,
      unit,
      chapterNumber,
      questions: questions && Array.isArray(questions)
        ? questions
        : questions ? JSON.parse(questions) : [],
    }));

    const createdChapters = await TeacherChapter.insertMany(chaptersData);

    const chapterIds = createdChapters.map((c) => c._id);
    await Unit.updateOne(
      { unit: unit },
      { $addToSet: { teacherChapters: { $each: chapterIds } } }
    );

    res.status(201).json({
      success: true,
      message: "Teacher chapter(s) created successfully",
      data: createdChapters.map((c) => ({
        id: c._id,
        title: c.title,
        videoUrl: c.videoUrl,
        chapterNumber: c.chapterNumber,
        grade: c.grade,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const updateTeacherChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      contentType,
      textContent,
      grade,
      questions,
      chapterNumber,
      unit,
      videoUrl,
    } = req.body;

    const chapter = await TeacherChapter.findById(id);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }

    const updated = await TeacherChapter.findByIdAndUpdate(
      id,
      {
        title,
        description,
        contentType,
        videoUrl,
        textContent,
        chapterNumber,
        grade,
        unit,
        questions: questions && Array.isArray(questions) ? questions : questions ? JSON.parse(questions) : [],
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Teacher chapter updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTeacherChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await TeacherChapter.findById(id);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }

    await Promise.all([
      chapter.deleteOne(),
      Teacher.updateMany(
        { completedChapters: { $elemMatch: { chapter: chapter._id } } },
        { $pull: { completedChapters: { chapter: chapter._id } } }
      ),
      Unit.updateMany(
        { teacherChapters: chapter._id },
        { $pull: { teacherChapters: chapter._id } }
      ),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Teacher chapter deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getTeacherChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await TeacherChapter.findById(id).lean().populate("unit");

    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }

    res.status(200).json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
};

export const getAllTeacherChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search = "", unit, grade, chapter } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (search) query.title = { $regex: new RegExp(search as string, "i") };
    if (unit) query.unit = unit;
    if (grade) query.grade = grade;
    if (chapter) query.chapterNumber = chapter;

    const [chapters, total] = await Promise.all([
      TeacherChapter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherChapter.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: chapters,
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherChaptersByGrade = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const teacherId = req.params.teacherId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const query = (req.query.query as string)?.trim() || "";
    const unit = (req.query.unit as string)?.trim() || "";
    const chapter = (req.query.chapter as any)?.trim();

    const teacher = await Teacher.findById(teacherId).populate(
      "completedChapters.chapter"
    );
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    const filter: any = { grade: teacher.classTeacherFor };
    if (query) filter.title = { $regex: query, $options: "i" };
    if (unit) filter.unit = unit;
    if (chapter) filter.chapterNumber = chapter;

    const totalChapters = await TeacherChapter.countDocuments(filter);
    const totalPages = Math.ceil(totalChapters / limit);
    const skip = (page - 1) * limit;

    const allChapters = await TeacherChapter.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const completedChapterIds =
      teacher.completedChapters?.map((c) => c?.chapter?._id.toString()) || [];

    const chaptersWithAccess = allChapters.map((chapter, index) => {
      const globalIndex = skip + index;
      const isCompleted = completedChapterIds.includes(chapter._id.toString());
      const isAccessible =
        globalIndex === 0 || completedChapterIds.length >= globalIndex;

      return {
        ...chapter.toObject(),
        isCompleted,
        isAccessible,
        isInProgress: !isCompleted && isAccessible,
        isLocked: !isCompleted && !isAccessible,
      };
    });

    res.json({
      success: true,
      data: chaptersWithAccess,
      totalChapters,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherChapterByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id: chapterId, teacherId } = req.params;

    const chapter = await TeacherChapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }

    const teacher = await Teacher.findById(teacherId).populate(
      "completedChapters.chapter"
    );
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    if (chapter.grade !== teacher.classTeacherFor) {
      throw new ApiError(403, "This chapter is not assigned to your grade");
    }

    const completedChapterIds = teacher.completedChapters?.map((completed) =>
      completed?.chapter?._id.toString()
    ) || [];
    const isCompleted = completedChapterIds.includes(chapterId);
    let quizScore = 0;

    if (isCompleted) {
      quizScore =
        teacher.completedChapters?.find(
          (completed) => completed.chapter?._id.toString() === chapterId
        )?.quizScore || 0;
    }

    const allChapters = await TeacherChapter.find({ grade: teacher.classTeacherFor }).sort({
      createdAt: 1,
    });
    const chapterIndex = allChapters.findIndex(
      (ch) => ch?._id.toString() === chapterId
    );

    if (chapterIndex === -1) {
      throw new ApiError(400, "Chapter not assigned to this grade");
    }

    const canAccess =
      chapterIndex === 0 || completedChapterIds.length >= chapterIndex;

    if (!canAccess && !isCompleted) {
      throw new ApiError(
        403,
        "You must complete previous chapters to access this chapter"
      );
    }

    res.json({
      success: true,
      data: {
        ...chapter.toObject(),
        isCompleted,
        canAccess,
        chapterIndex: chapterIndex + 1,
        totalChapters: allChapters.length,
        quizScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherChapterWithCompletedTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await TeacherChapter.findById(id)
      .populate([
        {
          path: "completedTeachers",
          select: "name email employeeId completedChapters profilePictureUrl grade",
        },
      ])
      .lean();

    if (!chapter) {
      throw new ApiError(404, "Teacher chapter not found");
    }

    const teachersWithScores =
      chapter.completedTeachers?.map((teacher: any) => {
        const chapterCompletion = teacher.completedChapters?.find(
          (completion: any) => completion.chapter.toString() === id
        );

        return {
          teacherId: teacher._id,
          name: teacher.name,
          email: teacher.email,
          employeeId: teacher.employeeId,
          grade: teacher.grade,
          profilePictureUrl: teacher.profilePictureUrl,
          completedAt: chapterCompletion?.completedAt || null,
          quizScore: chapterCompletion?.quizScore || 0,
        };
      }) || [];

    const totalCompletedTeachers = teachersWithScores.length;
    const averageScore =
      totalCompletedTeachers > 0
        ? teachersWithScores.reduce(
            (sum, teacher) => sum + teacher.quizScore,
            0
          ) / totalCompletedTeachers
        : 0;

    const scores = teachersWithScores.map((teacher) => teacher.quizScore);
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const sortedTeachers = teachersWithScores.sort(
      (a, b) => b.quizScore - a.quizScore
    );

    const allTeachersInGrade = await Teacher.find({ grade: chapter.grade })
      .select("name email employeeId profilePictureUrl grade")
      .lean();

    const completedTeacherIds = new Set(
      chapter.completedTeachers?.map((t: any) => t._id.toString()) || []
    );

    const notCompletedTeachers = allTeachersInGrade.filter(
      (teacher: any) => !completedTeacherIds.has(teacher._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        chapter: {
          _id: chapter._id,
          title: chapter.title,
          description: chapter.description,
          contentType: chapter.contentType,
          grade: chapter.grade,
          questionsCount: chapter.questions?.length || 0,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        },
        completedTeachers: sortedTeachers,
        notCompletedTeachers,
        statistics: {
          totalCompletedTeachers,
          averageScore: Math.round(averageScore * 100) / 100,
          highestScore,
          lowestScore,
          passRate:
            totalCompletedTeachers > 0
              ? Math.round(
                  (teachersWithScores.filter((s) => s.quizScore >= 60).length /
                    totalCompletedTeachers) *
                    100
                )
              : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherChapterStructure = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const teacherId = req.userId as string;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid teacher ID" });
    }

    const teacher = await Teacher.findById(teacherId).select("grade completedChapters").lean();
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const chapters = await TeacherChapter.find({ grade: teacher.classTeacherFor })
      .sort({ unit: 1, chapterNumber: 1 })
      .lean();

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
    const chaptersWithProgress = chapters.map((chapter, index) => {
      const isCompleted =
        chapter.completedTeachers?.includes(teacherObjectId) || false;
      const isAccessible =
        index === 0 ||
        chapters[index - 1]?.completedTeachers?.includes(teacherObjectId);
      const isInProgress = isAccessible && !isCompleted;

      return {
        ...chapter,
        isCompleted,
        isAccessible,
        isInProgress,
        isLocked: !isAccessible,
      };
    });

    return res.json({ success: true, data: chaptersWithProgress });
  } catch (error) {
    console.error("Error fetching teacher course structure:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const completeTeacherChapter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
   try {
      const { chapterId, quizScore } = req.body;
      const teacherID  = req.userId;
  
      const [teacher, chapter] = await Promise.all([
        Teacher.findById(teacherID),
        TeacherChapter.findById(chapterId),
      ]);
  
      if (!teacher) throw new ApiError(404, "Teacher not found");
      if (!chapter) throw new ApiError(404, "Chapter not found");
  
      const allChapters = await TeacherChapter.find({ class: teacher.classTeacherFor })
        .sort({ createdAt: 1 })
        .select("_id")
        .lean();
  
      const chapterIndex = allChapters.findIndex(
        (ch) => ch._id.toString() === chapterId
      );
      const completedCount = teacher.completedChapters.length;
  
      if (chapterIndex > completedCount) {
        throw new ApiError(403, "You must complete previous chapters first");
      }
  
      const now = new Date();
      const existing = teacher.completedChapters.find(
        (item) => item.chapter.toString() === chapterId
      );
  
      if (existing) {
        existing.quizScore = quizScore || 0;
        existing.completedAt = now;
      } else {
        teacher.completedChapters.push({
          chapter: new mongoose.Types.ObjectId(chapterId),
          quizScore: quizScore || 0,
          completedAt: now,
        });
      }
  
      if (!chapter.completedTeachers?.some((id) => id.toString() === teacherID)) {
        chapter.completedTeachers?.push(teacher._id);
      }
  
      await Promise.all([teacher.save(), chapter.save()]);
  
      return res.json({
        success: true,
        message: existing
          ? "Chapter retake recorded"
          : "Chapter marked as completed",
        data: {
          teacher: teacher._id,
          completedChapters: teacher.completedChapters,
        },
      });
    } catch (err) {
      next(err);
    }
};