import { Request, Response, NextFunction } from "express";
import { Chapter } from "../../../models/chapter";
import { Unit } from "../../../models/unit";
import { sendChapterReminderEmail } from "../../../lib/mail/chapterReminder";
import { ApiError } from "../../../utils/ApiError";
import { Student, User } from "../../../models/user";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import mongoose from "mongoose";

export const createChapter = async (
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
      class: classes,
      chapterNumber,
      questions,
      unit,
      videoUrl,
    } = req.body;

    const gradesArray = Array.isArray(classes) ? classes : [classes];

    const chaptersData = gradesArray.map((grade) => ({
      title,
      description,
      contentType,
      videoUrl,
      textContent,
      class: grade,
      createdBy: req.userId,
      unit,
      chapterNumber,
      questions: Array.isArray(questions)
        ? questions
        : JSON.parse(questions || "[]"),
    }));

    const createdChapters = await Chapter.insertMany(chaptersData);

    const chapterIds = createdChapters.map((c) => c._id);
    await Unit.updateOne(
      { unit: unit },
      { $addToSet: { chapters: { $each: chapterIds } } }
    );

    res.status(201).json({
      success: true,
      message: "Chapter(s) created successfully",
      data: createdChapters.map((c) => ({
        id: c._id,
        title: c.title,
        videoUrl: c.videoUrl,
        chapterNumber: c.chapterNumber,
        class: c.class,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const updateChapter = async (
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
      class: className,
      questions,
      chapterNumber,
      unit,
      videoUrl,
    } = req.body;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    const updated = await Chapter.findByIdAndUpdate(
      id,
      {
        title,
        description,
        contentType,
        videoUrl,
        textContent,
        chapterNumber,
        class: className,
        unit,
        questions: Array.isArray(questions) ? questions : JSON.parse(questions),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    await Promise.all([
      chapter.deleteOne(),
      Student.deleteMany({
        completedChapters: { $elemMatch: { chapter: chapter._id } },
      }),
      Unit.updateMany(
        { chapters: chapter._id },
        { $pull: { chapters: chapter._id } }
      ),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Chapter deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).lean().populate("unit");

    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    res.status(200).json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
};

export const getAllChapters = async (
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
    if (grade) query.class = grade;
    if (chapter) query.chapterNumber = chapter;

    const [chapters, total] = await Promise.all([
      Chapter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Chapter.countDocuments(query),
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

export const getChapterCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalChapters = await Chapter.countDocuments();
    res.status(200).json({ success: true, totalChapters });
  } catch (err) {
    next(err);
  }
};

export const getChaptersByClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { class: className } = req.params;
    if (!className) {
      throw new ApiError(400, "Class name is required");
    }

    const unit = (req.query.unit as string)?.trim() || "";
    const chapter = (req.query.chapter as any)?.trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter: any = { class: className };
    if (search) filter.title = { $regex: new RegExp(search as string, "i") };
    if (unit) filter.unit = unit;
    if (chapter) filter.chapterNumber = chapter;

    const [chapters, total] = await Promise.all([
      Chapter.find(filter).skip(skip).limit(limit).lean(),
      Chapter.countDocuments(filter),
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

export const getChaptersByStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const studentId = req.params.studentId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const query = (req.query.query as string)?.trim() || "";
    const unit = (req.query.unit as string)?.trim() || "";
    const chapter = (req.query.chapter as any)?.trim();

    const student = await Student.findById(studentId).populate(
      "completedChapters.chapter"
    );
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const filter: any = { class: student.class };
    if (query) filter.title = { $regex: query, $options: "i" };
    if (unit) filter.unit = unit;
    if (chapter) filter.chapterNumber = chapter;

    const totalChapters = await Chapter.countDocuments(filter);
    const totalPages = Math.ceil(totalChapters / limit);
    const skip = (page - 1) * limit;

    const allChapters = await Chapter.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const completedChapterIds =
      student.completedChapters.map((c) => c?.chapter?._id.toString()) || [];

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

export const getChaptersByStudentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id: chapterId, studentId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    const student = await Student.findById(studentId).populate(
      "completedChapters.chapter"
    );
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const completedChapterIds = student.completedChapters.map((completed) =>
      completed?.chapter?._id.toString()
    );
    const isCompleted = completedChapterIds.includes(chapterId);
    let quizScore = 0;

    if (isCompleted) {
      quizScore =
        student.completedChapters.find(
          (completed) => completed.chapter?._id.toString() === chapterId
        )?.quizScore || 0;
    }

    const allChapters = await Chapter.find({ class: student.class }).sort({
      createdAt: 1,
    });
    const chapterIndex = allChapters.findIndex(
      (ch) => ch?._id.toString() === chapterId
    );

    if (chapterIndex === -1) {
      throw new ApiError(400, "Chapter not part of the student's class");
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

export const getChapterWithCompletedStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id)
      .populate([
        {
          path: "completedStudents",
          select: "name email rollNumber completedChapters profilePictureUrl",
        },
      ])
      .lean();

    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }

    const studentsWithScores =
      chapter.completedStudents?.map((student: any) => {
        const chapterCompletion = student.completedChapters?.find(
          (completion: any) => completion.chapter.toString() === id
        );

        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          profilePictureUrl: student.profilePictureUrl,
          completedAt: chapterCompletion?.completedAt || null,
          quizScore: chapterCompletion?.quizScore || 0,
        };
      }) || [];

    const totalCompletedStudents = studentsWithScores.length;
    const averageScore =
      totalCompletedStudents > 0
        ? studentsWithScores.reduce(
            (sum, student) => sum + student.quizScore,
            0
          ) / totalCompletedStudents
        : 0;

    const scores = studentsWithScores.map((student) => student.quizScore);
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const sortedStudents = studentsWithScores.sort(
      (a, b) => b.quizScore - a.quizScore
    );

    const allStudentsInClass = await Student.find({ class: chapter.class })
      .select("name email rollNumber profilePictureUrl")
      .lean();

    const completedStudentIds = new Set(
      chapter.completedStudents?.map((s: any) => s._id.toString()) || []
    );

    const notCompletedStudents = allStudentsInClass.filter(
      (student: any) => !completedStudentIds.has(student._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        chapter: {
          _id: chapter._id,
          title: chapter.title,
          description: chapter.description,
          contentType: chapter.contentType,
          class: chapter.class,
          questionsCount: chapter.questions?.length || 0,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        },
        completedStudents: sortedStudents,
        notCompletedStudents,
        statistics: {
          totalCompletedStudents,
          averageScore: Math.round(averageScore * 100) / 100,
          highestScore,
          lowestScore,
          passRate:
            totalCompletedStudents > 0
              ? Math.round(
                  (studentsWithScores.filter((s) => s.quizScore >= 60).length /
                    totalCompletedStudents) *
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

export const sendChapterReminder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { studentId, chapterId } = req.params;

    const student = await Student.findById(studentId).lean();
    const chapter = await Chapter.findById(chapterId).lean();

    if (!student || !chapter) {
      throw new ApiError(404, "Student or Chapter not found");
    }

    await sendChapterReminderEmail(student.email, student.name, chapter.title);

    res.status(200).json({
      success: true,
      message: `Reminder email sent to ${student.email}`,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentChapterDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);

    const student = await Student.findById(studentId)
      .select("class completedChapters")
      .populate("completedChapters.chapter", "createdAt")
      .lean();
    if (!student) throw new ApiError(404, "Student not found");

    const [totalChapters, completedCount] = await Promise.all([
      Chapter.countDocuments({ class: student.class }),
      student.completedChapters.length,
    ]);

    const completionTrend = student.completedChapters
      .filter((c) => c.completedAt)
      .map((c) => ({
        month: `${new Date(c.completedAt).getMonth() + 1}-${new Date(
          c.completedAt
        ).getFullYear()}`,
        completedAt: c.completedAt,
      }))
      .reduce((acc, curr) => {
        acc[curr.month] = (acc[curr.month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalChapters,
        completed: completedCount,
        notCompleted: totalChapters - completedCount,
        completionTrend: Object.entries(completionTrend).map(
          ([month, count]) => ({
            month,
            count,
          })
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getChapterStucture = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const studentId = req.userId as string;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid student ID" });
    }

    const student = await Student.findById(studentId).select("class").lean();
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const chapters = await Chapter.find({ class: student.class })
      .sort({ unit: 1, chapterNumber: 1 })
      .lean();

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const chaptersWithProgress = chapters.map((chapter, index) => {
      const isCompleted =
        chapter.completedStudents?.includes(studentObjectId) || false;
      const isAccessible =
        index === 0 ||
        chapters[index - 1]?.completedStudents?.includes(studentObjectId);
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
    console.error("Error fetching course structure:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
