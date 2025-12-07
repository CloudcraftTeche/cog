import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createTeacherChapterHandler,
  updateTeacherChapterHandler,
  deleteTeacherChapterHandler,
  getTeacherChapterHandler,
  getTeacherChaptersHandler,
  markTeacherChapterInProgressHandler,
  submitTeacherChapterHandler,
  isTeacherChapterCompletedHandler,
  getCompletedTeacherChaptersHandler,
} from "../../../controllers/v1/teacherChapter";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
import { validate } from "../../../middleware/validate";
const router = Router();
const createTeacherChapterValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("contentType")
    .notEmpty()
    .withMessage("Content type is required")
    .isIn(["video", "text"])
    .withMessage("Content type must be either 'video' or 'text'"),
  body("videoUrl")
    .if(body("contentType").equals("video"))
    .notEmpty()
    .withMessage("Video URL is required for video content")
    .isURL()
    .withMessage("Invalid video URL format"),
  body("textContent")
    .if(body("contentType").equals("text"))
    .notEmpty()
    .withMessage("Text content is required for text content"),
  body("gradeIds")
    .notEmpty()
    .withMessage("At least one grade is required")
    .isArray({ min: 1 })
    .withMessage("Grade IDs must be a non-empty array"),
  body("gradeIds.*").isMongoId().withMessage("Each grade ID must be valid"),
  body("unitId")
    .notEmpty()
    .withMessage("Unit ID is required")
    .isMongoId()
    .withMessage("Invalid unit ID format"),
  body("chapterNumber")
    .notEmpty()
    .withMessage("Chapter number is required")
    .isInt({ min: 1 })
    .withMessage("Chapter number must be at least 1"),
  body("questions")
    .optional()
    .isArray()
    .withMessage("Questions must be an array"),
  body("questions.*.questionText")
    .if(body("questions").exists())
    .notEmpty()
    .withMessage("Question text is required"),
  body("questions.*.options")
    .if(body("questions").exists())
    .isArray({ min: 4, max: 4 })
    .withMessage("Each question must have exactly 4 options"),
  body("questions.*.correctAnswer")
    .if(body("questions").exists())
    .notEmpty()
    .withMessage("Correct answer is required"),
];
const updateTeacherChapterValidation = [
  param("chapterId")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID format"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("contentType")
    .optional()
    .isIn(["video", "text"])
    .withMessage("Content type must be either 'video' or 'text'"),
  body("videoUrl").optional().isURL().withMessage("Invalid video URL format"),
  body("chapterNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Chapter number must be at least 1"),
  body("gradeId").optional().isMongoId().withMessage("Invalid grade ID format"),
  body("unitId").optional().isMongoId().withMessage("Invalid unit ID format"),
  body("questions")
    .optional()
    .isArray()
    .withMessage("Questions must be an array"),
];
const chapterIdValidation = [
  param("chapterId")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID format"),
];
const teacherIdValidation = [
  param("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
];
const getAllTeacherChaptersValidation = [
  query("search").optional().trim(),
  query("unitId").optional().isMongoId().withMessage("Invalid unit ID format"),
  query("chapterNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Chapter number must be at least 1"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];
const submitTeacherChapterValidation = [
  param("chapterId")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID format"),
  body("answers")
    .optional()
    .isArray()
    .withMessage("Answers must be an array"),
  body("answers.*.questionText")
    .if(body("answers").exists())
    .notEmpty()
    .withMessage("Question text is required in answer"),
  body("answers.*.selectedAnswer")
    .if(body("answers").exists())
    .notEmpty()
    .withMessage("Selected answer is required"),
];
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  createTeacherChapterValidation,
  validate,
  createTeacherChapterHandler
);
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  getAllTeacherChaptersValidation,
  validate,
  getTeacherChaptersHandler
);
router.get(
  "/teacher/:gradeId",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  getAllTeacherChaptersValidation,
  validate,
  getTeacherChaptersHandler
);
router.get(
  "/:chapterId",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  chapterIdValidation,
  validate,
  getTeacherChapterHandler
);
router.put(
  "/:chapterId",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  updateTeacherChapterValidation,
  validate,
  updateTeacherChapterHandler
);
router.delete(
  "/:chapterId",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  chapterIdValidation,
  validate,
  deleteTeacherChapterHandler
);
router.post(
  "/:chapterId/start",
  authenticate,
  authorizeRoles("teacher"),
  chapterIdValidation,
  validate,
  markTeacherChapterInProgressHandler
);
router.post(
  "/:chapterId/submit",
  authenticate,
  authorizeRoles("teacher"),
  submitTeacherChapterValidation,
  validate,
  submitTeacherChapterHandler
);
router.get(
  "/:chapterId/status",
  authenticate,
  authorizeRoles("teacher"),
  chapterIdValidation,
  validate,
  isTeacherChapterCompletedHandler
);
router.get(
  "/teacher/:teacherId/completed",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  teacherIdValidation,
  validate,
  getCompletedTeacherChaptersHandler
);
export default router;