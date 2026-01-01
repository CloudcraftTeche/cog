import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Grade } from "../../../models/academic/Grade.model";
import { Chapter } from "../../../models/academic/Chapter.model";
import { Student } from "../../../models/user/Student.model";
import { createEmailTransporter } from "../../../utils/email/transporter";
import { Teacher } from "../../../models/user/Teacher.model";
import { User } from "../../../models/user/User.model";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../../config/cloudinary";
const transporter = createEmailTransporter();
const processContentItems = async (files: any, body: any) => {
  const contentItems = [];
  const contentItemsData = JSON.parse(body.contentItems || "[]");
  for (let i = 0; i < contentItemsData.length; i++) {
    const item = contentItemsData[i];
    const contentItem: any = {
      type: item.type,
      order: item.order || i,
      title: item.title,
    };
    if (item.type === "text") {
      contentItem.textContent = item.textContent;
      contentItem.url = null;
      contentItem.publicId = null;
    } else if (item.type === "video") {
      if (
        item.videoUrl &&
        (item.videoUrl.includes("youtube.com") ||
          item.videoUrl.includes("youtu.be"))
      ) {
        contentItem.url = item.videoUrl;
        contentItem.publicId = null;
      } else if (files && files[`content_${i}`]) {
        const file = files[`content_${i}`][0];
        const result = await uploadToCloudinary(
          file.buffer,
          "chapters/videos",
          "video",
          file.originalname
        );
        contentItem.url = result.secure_url;
        contentItem.publicId = result.public_id;
      } else {
        contentItem.url = null;
        contentItem.publicId = null;
      }
    } else if (item.type === "pdf") {
      if (files && files[`content_${i}`]) {
        const file = files[`content_${i}`][0];
        const result = await uploadToCloudinary(
          file.buffer,
          "chapters/pdfs",
          "raw",
          file.originalname
        );
        contentItem.url = result.secure_url;
        contentItem.publicId = result.public_id;
      } else {
        contentItem.url = null;
        contentItem.publicId = null;
      }
    } else if (item.type === "mixed") {
      contentItem.url = null;
      contentItem.publicId = null;
      if (
        item.videoUrl &&
        (item.videoUrl.includes("youtube.com") ||
          item.videoUrl.includes("youtu.be"))
      ) {
        contentItem.url = item.videoUrl;
        contentItem.publicId = null;
      } else if (files && files[`content_${i}`]) {
        const file = files[`content_${i}`][0];
        const result = await uploadToCloudinary(
          file.buffer,
          "chapters/videos",
          "video",
          file.originalname
        );
        contentItem.url = result.secure_url;
        contentItem.publicId = result.public_id;
      }
      if (item.textContent) {
        contentItem.textContent = item.textContent;
      }
      if (!contentItem.url && !contentItem.textContent) {
        throw new ApiError(
          400,
          `Mixed content item ${i + 1} requires either video or text content`
        );
      }
    }
    contentItems.push(contentItem);
  }
  return contentItems;
};
export const createChapterHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, chapterNumber, questions, unitId } = req.body;
    let gradeIds = req.body.gradeIds;
    if (typeof gradeIds === "string") {
      try {
        gradeIds = JSON.parse(gradeIds);
      } catch (error) {
        throw new ApiError(400, "Invalid gradeIds format");
      }
    }
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
    const contentItems = await processContentItems(req.files, req.body);
    if (contentItems.length === 0) {
      throw new ApiError(400, "At least one content item is required");
    }
    const parsedQuestions = Array.isArray(questions)
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
    const existingChapters = await Chapter.find({
      gradeId: { $in: gradeIds },
      unitId,
      chapterNumber,
    }).populate("gradeId", "grade");
    if (existingChapters.length > 0) {
      const conflicts = existingChapters.map((ch) => {
        const gradeName =
          typeof ch.gradeId === "object" && "grade" in ch.gradeId
            ? ch.gradeId.grade
            : ch.gradeId.toString();
        return `Grade ${gradeName}`;
      });
      throw new ApiError(
        409,
        `Chapter number ${chapterNumber} already exists in ${conflicts.join(
          ", "
        )} for this unit`
      );
    }
    const createdChapters = [];
    for (const gradeId of gradeIds) {
      const chapterData = {
        title: title.trim(),
        description: description.trim(),
        contentItems,
        chapterNumber,
        gradeId: new mongoose.Types.ObjectId(gradeId),
        unitId: new mongoose.Types.ObjectId(unitId),
        createdBy: new mongoose.Types.ObjectId(req.userId),
        questions: parsedQuestions.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedAnswer: null,
        })),
      };
      const createdChapter = await Chapter.create(chapterData);
      createdChapters.push({
        id: createdChapter._id,
        gradeId: createdChapter.gradeId,
        title: createdChapter.title,
      });
    }
    res.status(201).json({
      success: true,
      message: `Chapter created successfully for ${createdChapters.length} grade(s)`,
      data: {
        title,
        chapterNumber,
        unitId,
        unitName,
        contentItemsCount: contentItems.length,
        questionsCount: parsedQuestions.length,
        createdForGrades: createdChapters.length,
        chapters: createdChapters,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const createChapterForSingleGradeHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    req.body.gradeIds = [gradeId];
    await createChapterHandler(req, res, next);
  } catch (err) {
    next(err);
  }
};
export const updateChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { gradeId, chapterId } = req.params;
    const { title, description, questions, chapterNumber, unitId } = req.body;
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    if (unitId) {
      const grade = await Grade.findById(gradeId);
      const unit = grade?.units.find((u) => u._id?.toString() === unitId);
      if (!unit) {
        throw new ApiError(404, "Unit not found in this grade");
      }
    }
    let contentItems = chapter.contentItems;
    if (req.body.contentItems) {
      for (const item of chapter.contentItems) {
        if (item.publicId && (item.type === "video" || item.type === "pdf")) {
          await deleteFromCloudinary(
            item.publicId,
            item.type === "video" ? "video" : "raw"
          );
        }
      }
      contentItems = await processContentItems(req.files, req.body);
    }
    let parsedQuestions = chapter.questions;
    if (questions) {
      parsedQuestions = Array.isArray(questions)
        ? questions
        : JSON.parse(questions);
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
    const updated = await Chapter.findByIdAndUpdate(
      chapterId,
      {
        title: title?.trim(),
        description: description?.trim(),
        contentItems,
        chapterNumber,
        unitId: unitId ? new mongoose.Types.ObjectId(unitId) : chapter.unitId,
        questions: parsedQuestions,
      },
      { new: true, runValidators: true }
    ).populate("gradeId", "grade");
    const grade = await Grade.findById(gradeId).select("units");
    const unit = grade?.units.find(
      (u) => u._id?.toString() === updated?.unitId.toString()
    );
    res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: {
        ...updated?.toObject(),
        unitName: unit?.name || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getGradeChaptersHandler = async (
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
    const student = await Student.findById(userId).select("gradeId");
    const teacher = await Teacher.findById(userId).select("gradeId role");
    const admin = await User.findById(userId).select("role");
    let gradeId: string | null | undefined = null;
    if (student) {
      gradeId = student.gradeId?.toString();
    } else if (teacher) {
      if (!teacher.gradeId)
        throw new ApiError(400, "Teacher has no assigned grade");
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
      Chapter.find(filter)
        .sort({ unitId: 1, chapterNumber: 1 })
        .skip(skip)
        .limit(limit)
        .populate("gradeId", "grade")
        .lean(),
      Chapter.countDocuments(filter),
    ]);
    const chaptersWithUnitNames = grade
      ? chapters.map((chapter) => {
          const unit = grade.units.find(
            (u) => u._id?.toString() === chapter.unitId.toString()
          );
          return {
            ...chapter,
            unitName: unit?.name || null,
            unitDescription: unit?.description || null,
          };
        })
      : chapters;
    if (student) {
      const studentObjectId = new mongoose.Types.ObjectId(userId);
      const allChapters = await Chapter.find({ gradeId: student.gradeId })
        .sort({ unitId: 1, chapterNumber: 1 })
        .select("_id unitId studentProgress")
        .lean();
      const completionMap = new Map<string, any>();
      allChapters.forEach((ch) => {
        const progress = ch.studentProgress?.find(
          (p) => p.studentId.toString() === studentObjectId.toString()
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
          const prevProgress = completionMap.get(
            previousChapter._id.toString()
          );
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
export const getChaptersByUnitHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, unitId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const unit = grade.units.find((u) => u._id?.toString() === unitId);
    if (!unit) {
      throw new ApiError(404, "Unit not found");
    }
    const chapters = await Chapter.find({
      gradeId,
      unitId: new mongoose.Types.ObjectId(unitId),
    })
      .sort({ chapterNumber: 1 })
      .populate("createdBy", "name email")
      .lean();
    const chaptersWithUnit = chapters.map((chapter) => ({
      ...chapter,
      unitName: unit.name,
      unitDescription: unit.description,
    }));
    res.status(200).json({
      success: true,
      message: "Unit chapters fetched successfully",
      data: chaptersWithUnit,
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findOne({
      _id: chapterId,
    })
      .lean()
      .populate("createdBy", "name email")
      .populate("gradeId", "grade")
      .populate({
        path: "studentProgress.studentId",
        select: "name email rollNumber gradeId parentContact",
        model: "student",
      });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const grade = await Grade.findById(chapter.gradeId).select("units");
    const unit = grade?.units.find(
      (u) => u._id?.toString() === chapter.unitId.toString()
    );
    res.status(200).json({
      success: true,
      data: {
        ...chapter,
        unitName: unit?.name || null,
        unitDescription: unit?.description || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const deleteChapterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findOne({ _id: chapterId });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    for (const item of chapter.contentItems) {
      if (item.publicId && (item.type === "video" || item.type === "pdf")) {
        await deleteFromCloudinary(
          item.publicId,
          item.type === "video" ? "video" : "raw"
        );
      }
    }
    if (chapter.studentProgress) {
      for (const progress of chapter.studentProgress) {
        if (progress.submissions) {
          for (const submission of progress.submissions) {
            if (
              submission.filePublicId &&
              (submission.type === "video" || submission.type === "pdf")
            ) {
              await deleteFromCloudinary(
                submission.filePublicId,
                submission.type === "video" ? "video" : "raw"
              );
            }
          }
        }
      }
    }
    await chapter.deleteOne();
    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterCountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const totalChapters = await Chapter.countDocuments({ gradeId });
    res.status(200).json({ success: true, totalChapters });
  } catch (err) {
    next(err);
  }
};
export const markChapterInProgressHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, chapterId } = req.params;
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const studentId = new mongoose.Types.ObjectId(req.userId);
    const existingProgress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === studentId.toString()
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
      if (!chapter.studentProgress) {
        chapter.studentProgress = [];
      }
      chapter.studentProgress.push({
        studentId,
        status: "in_progress",
        startedAt: new Date(),
      } as any);
      await chapter.save();
    }
    res.status(200).json({
      success: true,
      message: "Chapter marked as in progress",
      data: {
        chapterId: chapter._id,
        studentId,
        status: "in_progress",
      },
    });
  } catch (err) {
    next(err);
  }
};
export const submitChapterHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, chapterId } = req.params;
    const {
      submissionType,
      score: providedScore,
      studentId: targetStudentId,
    } = req.body;

    const studentId = new mongoose.Types.ObjectId(
      targetStudentId || req.userId
    );
    let answers: any[] = [];
    if (req.body.answers) {
      if (typeof req.body.answers === "string") {
        try {
          answers = JSON.parse(req.body.answers);
        } catch (parseError) {
          console.error("Failed to parse answers JSON:", parseError);
          throw new ApiError(
            400,
            "Invalid answers format - could not parse JSON"
          );
        }
      } else if (
        typeof req.body.answers === "object" &&
        !Array.isArray(req.body.answers)
      ) {
        const answersObj = req.body.answers;
        answers = Object.keys(answersObj)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((key) => answersObj[key]);
      } else if (Array.isArray(req.body.answers)) {
        answers = req.body.answers;
      }
    }

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    let finalScore: number;
    let correctCount = 0;
    let totalQuestions = chapter.questions.length;
    if (answers && answers.length > 0) {
      answers.forEach((answer, index) => {
        if (!answer || typeof answer !== "object") {
          throw new ApiError(400, `Answer ${index + 1}: Invalid answer format`);
        }
        if (!answer.questionText || typeof answer.questionText !== "string") {
          throw new ApiError(
            400,
            `Answer ${index + 1}: questionText is required`
          );
        }
        if (
          !answer.selectedAnswer ||
          typeof answer.selectedAnswer !== "string"
        ) {
          throw new ApiError(
            400,
            `Answer ${index + 1}: selectedAnswer is required`
          );
        }
      });
      chapter.questions.forEach((question) => {
        const studentAnswer = answers.find(
          (ans: any) => ans.questionText === question.questionText
        );
        if (
          studentAnswer &&
          studentAnswer.selectedAnswer === question.correctAnswer
        ) {
          correctCount++;
        }
      });
      finalScore = Math.round((correctCount / totalQuestions) * 100);
    } else if (providedScore !== undefined) {
      finalScore = providedScore;
    } else {
      throw new ApiError(400, "Either answers or score must be provided");
    }
    let submission: any = null;
    if (submissionType) {
      submission = {
        type: submissionType,
        submittedAt: new Date(),
      };
      if (submissionType === "text") {
        if (!req.body.submissionContent) {
          throw new ApiError(
            400,
            "Submission content is required for text submissions"
          );
        }
        submission.content = req.body.submissionContent;
      } else if (submissionType === "video" || submissionType === "pdf") {
        if (!req.file) {
          throw new ApiError(400, `${submissionType} file is required`);
        }
        const result = await uploadToCloudinary(
          req.file.buffer,
          `chapter/submissions/${submissionType}s`,
          submissionType === "video" ? "video" : "raw",
          req.file.originalname
        );
        submission.fileUrl = result.secure_url;
        submission.filePublicId = result.public_id;
      }
    }
    const existingProgress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === studentId.toString()
    );
    if (existingProgress) {
      existingProgress.status = "completed";
      existingProgress.completedAt = new Date();
      existingProgress.score = finalScore;
      if (submission) {
        if (!existingProgress.submissions) {
          existingProgress.submissions = [];
        }
        existingProgress.submissions.push(submission);
      }
    } else {
      if (!chapter.studentProgress) {
        chapter.studentProgress = [];
      }
      const newProgress: any = {
        studentId,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        score: finalScore,
      };
      if (submission) {
        newProgress.submissions = [submission];
      }
      chapter.studentProgress.push(newProgress);
    }
    await chapter.save({ validateModifiedOnly: true });
    const responseData: any = {
      chapterId: chapter._id,
      studentId,
      status: "completed",
      score: finalScore,
      completedAt: existingProgress?.completedAt || new Date(),
    };
    if (answers && answers.length > 0) {
      responseData.correctAnswers = correctCount;
      responseData.totalQuestions = totalQuestions;
    }
    if (submission) {
      responseData.submission = submission;
    }
    res.status(200).json({
      success: true,
      message: "Chapter completed successfully",
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};
export const getCompletedChaptersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, studentId } = req.params;
    const grade = await Grade.findById(gradeId).select("units");
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapters = await Chapter.find({
      gradeId,
      "studentProgress.studentId": new mongoose.Types.ObjectId(studentId),
      "studentProgress.status": "completed",
    })
      .select("title chapterNumber unitId description studentProgress")
      .lean();
    const completedChapters = chapters.map((chapter) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === studentId
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
      message: "Completed chapters fetched successfully",
      data: completedChapters,
    });
  } catch (err) {
    next(err);
  }
};
export const isChapterCompletedHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, chapterId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId })
      .select("studentProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const progress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === req.userId
    );
    res.status(200).json({
      success: true,
      message: "Chapter completion status fetched",
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
export const markChapterCompleteHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, chapterId } = req.params;
    const { score, studentId } = req.body;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId });
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const targetStudentId = new mongoose.Types.ObjectId(
      studentId || req.userId
    );
    const existingProgress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === targetStudentId.toString()
    );
    if (existingProgress) {
      existingProgress.status = "completed";
      existingProgress.completedAt = new Date();
      if (score !== undefined) {
        existingProgress.score = score;
      }
    } else {
      if (!chapter.studentProgress) {
        chapter.studentProgress = [];
      }
      chapter.studentProgress.push({
        studentId: targetStudentId,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        score: score !== undefined ? score : undefined,
      } as any);
    }
    await chapter.save();
    res.status(200).json({
      success: true,
      message: existingProgress
        ? "Chapter completion updated"
        : "Chapter marked as completed",
      data: {
        chapterId: chapter._id,
        studentId: targetStudentId,
        status: "completed",
        completedAt: existingProgress?.completedAt || new Date(),
        score: score,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterCompletedStudentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "completedAt",
      order = "desc",
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const chapter = await Chapter.findOne({ _id: chapterId })
      .select("title chapterNumber studentProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found in this grade");
    }
    const completedProgress =
      chapter.studentProgress?.filter(
        (progress) => progress.status === "completed"
      ) || [];
    if (completedProgress.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students have completed this chapter yet",
        total: 0,
        page: pageNum,
        pageSize: 0,
        totalPages: 0,
        data: [],
      });
    }
    const completedStudentIds = completedProgress.map((p) => p.studentId);
    const progressMap = new Map(
      completedProgress.map((p) => [p.studentId.toString(), p])
    );
    const students = await Student.find({
      _id: { $in: completedStudentIds },
      role: "student",
    })
      .select("name email rollNumber gradeId profilePictureUrl gradeId")
      .populate("gradeId", "grade")
      .lean();
    const studentsWithCompletion = students.map((student) => {
      const progress = progressMap.get(student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        gradeId: student.gradeId,
        email: student.email,
        rollNumber: student.rollNumber,
        profilePictureUrl: student.profilePictureUrl,
        completedAt: progress?.completedAt,
        startedAt: progress?.startedAt,
        score: progress?.score,
        status: progress?.status,
      };
    });
    studentsWithCompletion.sort((a, b) => {
      const orderMultiplier = order === "asc" ? 1 : -1;
      switch (sortBy) {
        case "score":
          return ((b.score || 0) - (a.score || 0)) * orderMultiplier;
        case "completedAt":
          return (
            (new Date(b.completedAt!).getTime() -
              new Date(a.completedAt!).getTime()) *
            orderMultiplier
          );
        case "name":
          return a.name.localeCompare(b.name) * orderMultiplier;
        default:
          return (
            (new Date(b.completedAt!).getTime() -
              new Date(a.completedAt!).getTime()) *
            orderMultiplier
          );
      }
    });
    const paginatedStudents = studentsWithCompletion.slice(
      skip,
      skip + limitNum
    );
    const total = studentsWithCompletion.length;
    const scores = studentsWithCompletion
      .map((s) => s.score)
      .filter((score): score is number => score !== undefined);
    const stats = {
      totalCompleted: total,
      averageScore:
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
            ) / 100
          : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    };
    res.status(200).json({
      success: true,
      message: "Completed students fetched successfully",
      total,
      page: pageNum,
      pageSize: paginatedStudents.length,
      totalPages: Math.ceil(total / limitNum),
      stats,
      data: paginatedStudents,
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterCompletionStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId, chapterId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      throw new ApiError(404, "Grade not found");
    }
    const chapter = await Chapter.findOne({ _id: chapterId, gradeId })
      .select("title chapterNumber studentProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found in this grade");
    }
    const totalStudents = await Student.countDocuments({
      gradeId,
      role: "student",
    });
    const statusCounts = {
      completed: 0,
      in_progress: 0,
      accessible: 0,
      locked: 0,
      not_started: totalStudents,
    };
    const completedScores: number[] = [];
    chapter.studentProgress?.forEach((progress) => {
      statusCounts[progress.status]++;
      statusCounts.not_started--;
      if (progress.status === "completed" && progress.score !== undefined) {
        completedScores.push(progress.score);
      }
    });
    const scoreStats =
      completedScores.length > 0
        ? {
            average:
              Math.round(
                (completedScores.reduce((a, b) => a + b, 0) /
                  completedScores.length) *
                  100
              ) / 100,
            highest: Math.max(...completedScores),
            lowest: Math.min(...completedScores),
            median: completedScores.sort((a, b) => a - b)[
              Math.floor(completedScores.length / 2)
            ],
          }
        : null;
    const completionRate =
      totalStudents > 0
        ? Math.round((statusCounts.completed / totalStudents) * 100 * 100) / 100
        : 0;
    res.status(200).json({
      success: true,
      message: "Chapter completion statistics fetched successfully",
      data: {
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        chapterNumber: chapter.chapterNumber,
        totalStudents,
        statusCounts,
        completionRate,
        scoreStats,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterTopPerformersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId } = req.params;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);
    const chapter = await Chapter.findOne({ _id: chapterId })
      .select("title chapterNumber studentProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found in this grade");
    }
    const completedWithScores =
      chapter.studentProgress
        ?.filter((p) => p.status === "completed" && p.score !== undefined)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limitNum) || [];
    if (completedWithScores.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed students with scores found",
        data: [],
      });
    }
    const studentIds = completedWithScores.map((p) => p.studentId);
    const students = await Student.find({
      _id: { $in: studentIds },
      role: "student",
    })
      .select("name email rollNumber profilePictureUrl")
      .lean();
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
    const topPerformers = completedWithScores
      .map((progress, index) => {
        const student = studentMap.get(progress.studentId.toString());
        return student
          ? {
              rank: index + 1,
              studentId: student._id,
              name: student.name,
              email: student.email,
              rollNumber: student.rollNumber,
              profilePictureUrl: student.profilePictureUrl,
              score: progress.score,
              completedAt: progress.completedAt,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    res.status(200).json({
      success: true,
      message: "Top performers fetched successfully",
      data: topPerformers,
    });
  } catch (err) {
    next(err);
  }
};
export const getChapterPendingStudentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const chapter = await Chapter.findOne({ _id: chapterId })
      .select("studentProgress")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found in this grade");
    }
    const completedStudentIds =
      chapter.studentProgress
        ?.filter((p) => p.status === "completed")
        .map((p) => p.studentId) || [];
    const [pendingStudents, total] = await Promise.all([
      Student.find({
        role: "student",
        _id: { $nin: completedStudentIds },
      })
        .select("name email rollNumber gradeId profilePictureUrl")
        .populate("gradeId", "grade")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Student.countDocuments({
        role: "student",
        _id: { $nin: completedStudentIds },
      }),
    ]);
    const pendingWithStatus = pendingStudents.map((student) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === student._id.toString()
      );
      return {
        studentId: student._id,
        name: student.name,
        gradeId: student?.gradeId,
        email: student.email,
        rollNumber: student.rollNumber,
        profilePictureUrl: student.profilePictureUrl,
        status: progress?.status || "not_started",
        startedAt: progress?.startedAt,
      };
    });
    res.status(200).json({
      success: true,
      message: "Pending students fetched successfully",
      total,
      page: pageNum,
      pageSize: pendingWithStatus.length,
      totalPages: Math.ceil(total / limitNum),
      data: pendingWithStatus,
    });
  } catch (err) {
    next(err);
  }
};
export const sendChapterReminderHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId, studentId } = req.params;
    if (!mongoose.isValidObjectId(chapterId)) {
      throw new ApiError(400, "Invalid chapter ID");
    }
    if (!mongoose.isValidObjectId(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }
    const chapter = await Chapter.findById(chapterId)
      .populate("gradeId", "grade")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const student = await Student.findById(studentId)
      .select("name email gradeId")
      .lean();
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    if (student.gradeId?.toString() !== chapter.gradeId._id.toString()) {
      throw new ApiError(
        400,
        "Student is not enrolled in this chapter's grade"
      );
    }
    const progress = chapter.studentProgress?.find(
      (p) => p.studentId.toString() === studentId
    );
    if (progress?.status === "completed") {
      throw new ApiError(400, "Student has already completed this chapter");
    }
    const contentTypeSummary = chapter.contentItems
      .map((item) => {
        if (item.type === "video") return "📹 Video";
        if (item.type === "text") return "📚 Text";
        if (item.type === "pdf") return "📄 PDF";
        return item.type;
      })
      .join(", ");
    const emailSubject = `Reminder: Complete Chapter ${chapter.chapterNumber} - ${chapter.title}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Chapter Reminder</h2>
        <p>Dear ${student.name},</p>
        <p>This is a friendly reminder to complete the following chapter:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">Chapter ${
            chapter.chapterNumber
          }: ${chapter.title}</h3>
          <p style="color: #6B7280;">${chapter.description || ""}</p>
          <p><strong>Content Includes:</strong> ${contentTypeSummary}</p>
          <p><strong>Content Items:</strong> ${
            chapter.contentItems.length
          } item${chapter.contentItems.length !== 1 ? "s" : ""}</p>
          <p><strong>Questions:</strong> ${
            chapter.questions.length
          } questions</p>
        </div>
        ${
          progress?.status === "in_progress"
            ? `<p>We noticed you started this chapter on ${new Date(
                progress.startedAt!
              ).toLocaleDateString()}. Don't give up - you're almost there!</p>`
            : `<p>You haven't started this chapter yet. It's a great time to begin!</p>`
        }
        <p>Complete this chapter to unlock the next one and continue your learning journey.</p>
        <div style="margin: 30px 0;">
          <a href="${
            process.env.FRONTEND_URL
          }/dashboard/student/chapters/${chapterId}" 
             style="background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Go to Chapter
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">Best regards,<br/>Your Learning Platform Team</p>
      </div>
    `;
    await transporter?.sendMail({
      from: `${process.env.EMAIL_USER}`,
      to: student.email,
      subject: emailSubject,
      html: emailBody,
    });
    res.status(200).json({
      success: true,
      message: "Reminder sent successfully",
      data: {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        sentAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const sendBulkChapterRemindersHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId } = req.params;
    if (!mongoose.isValidObjectId(chapterId)) {
      throw new ApiError(400, "Invalid chapter ID");
    }
    const chapter = await Chapter.findById(chapterId)
      .populate("gradeId", "grade")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const completedStudentIds =
      chapter.studentProgress
        ?.filter((p) => p.status === "completed")
        .map((p) => p.studentId) || [];
    const pendingStudents = await Student.find({
      gradeId: chapter.gradeId._id,
      role: "student",
      _id: { $nin: completedStudentIds },
    })
      .select("name email _id")
      .lean();
    if (pendingStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending students found",
        data: {
          remindersSent: 0,
          students: [],
        },
      });
    }
    const contentTypeSummary = chapter.contentItems
      .map((item) => {
        if (item.type === "video") return "📹 Video";
        if (item.type === "text") return "📚 Text";
        if (item.type === "pdf") return "📄 PDF";
        return item.type;
      })
      .join(", ");
    const emailPromises = pendingStudents.map(async (student) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === student._id.toString()
      );
      const emailSubject = `Reminder: Complete Chapter ${chapter.chapterNumber} - ${chapter.title}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Chapter Reminder</h2>
          <p>Dear ${student.name},</p>
          <p>This is a friendly reminder to complete the following chapter:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">Chapter ${
              chapter.chapterNumber
            }: ${chapter.title}</h3>
            <p style="color: #6B7280;">${chapter.description || ""}</p>
            <p><strong>Content Includes:</strong> ${contentTypeSummary}</p>
            <p><strong>Content Items:</strong> ${
              chapter.contentItems.length
            } item${chapter.contentItems.length !== 1 ? "s" : ""}</p>
            <p><strong>Questions:</strong> ${
              chapter.questions.length
            } questions</p>
          </div>
          ${
            progress?.status === "in_progress"
              ? `<p>We noticed you started this chapter on ${new Date(
                  progress.startedAt!
                ).toLocaleDateString()}. Don't give up - you're almost there!</p>`
              : `<p>You haven't started this chapter yet. It's a great time to begin!</p>`
          }
          <p>Complete this chapter to unlock the next one and continue your learning journey.</p>
          <div style="margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL
            }/dashboard/student/chapters/${chapterId}" 
               style="background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Go to Chapter
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Best regards,<br/>Your Learning Platform Team</p>
        </div>
      `;
      try {
        await transporter.sendEmail(student.email, emailSubject, emailBody);
        return {
          success: true,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
        };
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
        return {
          success: false,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          error: "Email send failed",
        };
      }
    });
    const results = await Promise.all(emailPromises);
    const successfulReminders = results.filter((r) => r.success);
    const failedReminders = results.filter((r) => !r.success);
    res.status(200).json({
      success: true,
      message: `Reminders sent to ${successfulReminders.length} out of ${pendingStudents.length} students`,
      data: {
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        totalPending: pendingStudents.length,
        remindersSent: successfulReminders.length,
        remindersFailed: failedReminders.length,
        successfulStudents: successfulReminders,
        failedStudents: failedReminders,
        sentAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const sendInProgressRemindersHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chapterId } = req.params;
    if (!mongoose.isValidObjectId(chapterId)) {
      throw new ApiError(400, "Invalid chapter ID");
    }
    const chapter = await Chapter.findById(chapterId)
      .populate("gradeId", "grade")
      .lean();
    if (!chapter) {
      throw new ApiError(404, "Chapter not found");
    }
    const inProgressStudentIds =
      chapter.studentProgress
        ?.filter((p) => p.status === "in_progress")
        .map((p) => p.studentId) || [];
    if (inProgressStudentIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students with in-progress status found",
        data: {
          remindersSent: 0,
          students: [],
        },
      });
    }
    const students = await Student.find({
      _id: { $in: inProgressStudentIds },
      role: "student",
    })
      .select("name email _id")
      .lean();
    const contentTypeSummary = chapter.contentItems
      .map((item) => {
        if (item.type === "video") return "📹 Video";
        if (item.type === "text") return "📚 Text";
        if (item.type === "pdf") return "📄 PDF";
        return item.type;
      })
      .join(", ");
    const emailPromises = students.map(async (student) => {
      const progress = chapter.studentProgress?.find(
        (p) => p.studentId.toString() === student._id.toString()
      );
      const emailSubject = `Don't Give Up! Complete Chapter ${chapter.chapterNumber} - ${chapter.title}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🚀 You're Almost There!</h2>
          <p>Hi ${student.name},</p>
          <p>We noticed you started this chapter but haven't finished it yet:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">Chapter ${
              chapter.chapterNumber
            }: ${chapter.title}</h3>
            <p style="color: #6B7280;">${chapter.description || ""}</p>
            <p><strong>Content Includes:</strong> ${contentTypeSummary}</p>
            <p><strong>Started on:</strong> ${new Date(
              progress?.startedAt!
            ).toLocaleDateString()}</p>
          </div>
          <p style="font-size: 18px; color: #1F2937;">Don't let your progress go to waste! 💪</p>
          <p>Completing this chapter will help you:</p>
          <ul style="color: #6B7280;">
            <li>Unlock the next chapter</li>
            <li>Build your knowledge systematically</li>
            <li>Track your learning progress</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL
            }/dashboard/student/chapters/${chapterId}" 
               style="background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Continue Learning
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Keep up the great work!<br/>Your Learning Platform Team</p>
        </div>
      `;
      try {
        await transporter.sendEmail(student.email, emailSubject, emailBody);
        return {
          success: true,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
        };
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
        return {
          success: false,
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          error: "Email send failed",
        };
      }
    });
    const results = await Promise.all(emailPromises);
    const successfulReminders = results.filter((r) => r.success);
    const failedReminders = results.filter((r) => !r.success);
    res.status(200).json({
      success: true,
      message: `Reminders sent to ${successfulReminders.length} students with in-progress status`,
      data: {
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        totalInProgress: students.length,
        remindersSent: successfulReminders.length,
        remindersFailed: failedReminders.length,
        successfulStudents: successfulReminders,
        failedStudents: failedReminders,
        sentAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const gradeWiseChapterCountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gradeId } = req.params;
    if (!mongoose.isValidObjectId(gradeId)) {
      throw new ApiError(400, "Invalid grade ID");
    }
    const chapterCounts = await Chapter.countDocuments({ gradeId }).exec();
    res.status(200).json({
      success: true,
      message: "Chapter counts by grade fetched successfully",
      data: chapterCounts,
    });
  } catch (err) {
    next(err);
  }
};
