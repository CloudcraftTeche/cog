import { Response, NextFunction } from "express";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Lesson } from "../../../models/academic/Lesson.model";
import { Teacher } from "../../../models/user/Teacher.model";

// Lesson text is copyrighted textbook content: never cache it on the device or in proxies.
const noStore = (res: Response) => res.set("Cache-Control", "no-store");

// Teachers may only read their own grade's lessons; admins and super admins any grade.
const resolveGradeScope = async (
  req: AuthenticatedRequest,
  requestedGradeId?: string
): Promise<string | undefined> => {
  if (req.userRole !== "teacher") return requestedGradeId;
  const teacher = await Teacher.findById(req.userId).select("gradeId");
  if (!teacher?.gradeId) throw new ApiError(400, "Teacher has no assigned grade");
  const ownGradeId = teacher.gradeId.toString();
  if (requestedGradeId && requestedGradeId !== ownGradeId) {
    throw new ApiError(403, "You can only view lessons for your own grade");
  }
  return ownGradeId;
};

export const listLessonsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gradeId = await resolveGradeScope(req, req.query.gradeId as string | undefined);
    const filter = gradeId ? { gradeId } : {};
    const lessons = await Lesson.find(filter)
      .select("gradeId lessonNumber title readingPortion memoryVerse")
      .sort({ gradeId: 1, lessonNumber: 1 })
      .lean();
    noStore(res);
    res.status(200).json({
      success: true,
      message: "Lessons fetched",
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

export const getLessonByIdHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) throw new ApiError(404, "Lesson not found");
    const gradeId = await resolveGradeScope(req);
    if (gradeId && lesson.gradeId.toString() !== gradeId) {
      throw new ApiError(404, "Lesson not found");
    }
    noStore(res);
    res.status(200).json({
      success: true,
      message: "Lesson fetched",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};
