import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import multer from "multer";
import {
  createChapterHandler,
  deleteChapterHandler,
  getGradeChaptersHandler,
  getChaptersByUnitHandler,
  getChapterHandler,
  updateChapterHandler,
  getChapterCountHandler,
  markChapterInProgressHandler,
  submitChapterHandler,
  getCompletedChaptersHandler,
  isChapterCompletedHandler,
  getChapterPendingStudentsHandler,
  getChapterTopPerformersHandler,
  getChapterCompletionStatsHandler,
  getChapterCompletedStudentsHandler,
  createChapterForSingleGradeHandler,
  sendChapterReminderHandler,
  sendBulkChapterRemindersHandler,
  sendInProgressRemindersHandler,
} from "../../../controllers/v1/chapter";
import { authenticate } from "../../../middleware/authenticate";
import { ApiError } from "../../../utils/ApiError";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "application/pdf",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only videos and PDFs are allowed."));
    }
  },
});
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed");
  }
  next();
};
const chapterValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1-200 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("contentItems")
    .custom((value) => {
      const items = JSON.parse(value || "[]");
      if (items.length === 0) {
        throw new Error("At least one content item is required");
      }
      items.forEach((item: any, index: number) => {
        if (!["video", "text", "pdf"].includes(item.type)) {
          throw new Error(
            `Content item ${index + 1}: type must be video, text, or pdf`
          );
        }
        if (item.type === "text" && !item.textContent) {
          throw new Error(
            `Content item ${index + 1}: textContent is required for text type`
          );
        }
        if (item.type === "video" && !item.videoUrl) {
        }
      });
      return true;
    })
    .withMessage("Invalid content items format"),
  body("unitId").isMongoId().withMessage("Invalid unit ID"),
  body("chapterNumber")
    .isInt({ min: 1 })
    .withMessage("Chapter number must be a positive integer"),
  body("questions")
    .custom((value) => {
      const questions = Array.isArray(value)
        ? value
        : JSON.parse(value || "[]");
      if (questions.length === 0) {
        throw new Error("At least one question is required");
      }
      questions.forEach((q: any, index: number) => {
        if (!q.questionText || typeof q.questionText !== "string") {
          throw new Error(
            `Question ${
              index + 1
            }: questionText is required and must be a string`
          );
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1}: must have exactly 4 options`);
        }
        if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
          throw new Error(
            `Question ${
              index + 1
            }: correctAnswer is required and must be a string`
          );
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(
            `Question ${index + 1}: correctAnswer must be one of the options`
          );
        }
      });
      return true;
    })
    .withMessage("Invalid questions format"),
];
const router = Router();
router.post(
  "/bulk",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  upload.fields([
    { name: "content_0", maxCount: 1 },
    { name: "content_1", maxCount: 1 },
    { name: "content_2", maxCount: 1 },
    { name: "content_3", maxCount: 1 },
    { name: "content_4", maxCount: 1 },
    { name: "content_5", maxCount: 1 },
    { name: "content_6", maxCount: 1 },
    { name: "content_7", maxCount: 1 },
    { name: "content_8", maxCount: 1 },
    { name: "content_9", maxCount: 1 },
  ]),
  [
    body("gradeIds")
      .isArray({ min: 1 })
      .withMessage("At least one grade ID is required"),
    body("gradeIds.*")
      .isMongoId()
      .withMessage("Each grade ID must be a valid MongoDB ObjectId"),
    ...chapterValidation,
  ],
  handleValidationErrors,
  createChapterHandler
);
router.post(
  "/:gradeId/chapters",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  upload.fields([
    { name: "content_0", maxCount: 1 },
    { name: "content_1", maxCount: 1 },
    { name: "content_2", maxCount: 1 },
    { name: "content_3", maxCount: 1 },
    { name: "content_4", maxCount: 1 },
    { name: "content_5", maxCount: 1 },
    { name: "content_6", maxCount: 1 },
    { name: "content_7", maxCount: 1 },
    { name: "content_8", maxCount: 1 },
    { name: "content_9", maxCount: 1 },
  ]),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    ...chapterValidation,
  ],
  handleValidationErrors,
  createChapterForSingleGradeHandler
);
router.put(
  "/:gradeId/chapters/:chapterId",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  upload.fields([
    { name: "content_0", maxCount: 1 },
    { name: "content_1", maxCount: 1 },
    { name: "content_2", maxCount: 1 },
    { name: "content_3", maxCount: 1 },
    { name: "content_4", maxCount: 1 },
    { name: "content_5", maxCount: 1 },
    { name: "content_6", maxCount: 1 },
    { name: "content_7", maxCount: 1 },
    { name: "content_8", maxCount: 1 },
    { name: "content_9", maxCount: 1 },
  ]),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1-200 characters"),
    body("unitId").optional().isMongoId().withMessage("Invalid unit ID"),
    body("chapterNumber")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Chapter number must be positive"),
    body("questions")
      .optional()
      .custom((value) => {
        const questions = Array.isArray(value)
          ? value
          : JSON.parse(value || "[]");
        questions.forEach((q: any, index: number) => {
          if (!q.questionText || typeof q.questionText !== "string") {
            throw new Error(`Question ${index + 1}: questionText is required`);
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(
              `Question ${index + 1}: must have exactly 4 options`
            );
          }
          if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
            throw new Error(`Question ${index + 1}: correctAnswer is required`);
          }
          if (!q.options.includes(q.correctAnswer)) {
            throw new Error(
              `Question ${index + 1}: correctAnswer must be one of the options`
            );
          }
        });
        return true;
      })
      .withMessage("Invalid questions format"),
  ],
  handleValidationErrors,
  updateChapterHandler
);
router.post(
  "/:gradeId/chapters/:chapterId/submit",
  authenticate,
  authorizeRoles("student", "admin", "teacher", "superAdmin"),
  upload.single("submissionFile"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
    body("submissionType")
      .optional()
      .isIn(["text", "video", "pdf"])
      .withMessage("Submission type must be text, video, or pdf"),
  ],
  handleValidationErrors,
  submitChapterHandler
);
router.get(
  "/:gradeId/chapters",
  authenticate,
  [
    param("gradeId").optional().isMongoId().withMessage("Invalid grade ID"),
    query("search").optional().trim(),
    query("unitId").optional().isMongoId().withMessage("Invalid unit ID"),
    query("chapterNumber")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Chapter number must be positive"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1-100"),
  ],
  handleValidationErrors,
  getGradeChaptersHandler
);
router.get(
  "/chapters",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    query("search").optional().trim(),
    query("unitId").optional().isMongoId().withMessage("Invalid unit ID"),
    query("chapterNumber")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Chapter number must be positive"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1-100"),
  ],
  handleValidationErrors,
  getGradeChaptersHandler
);
router.get(
  "/:gradeId/chapters/count",
  authenticate,
  [param("gradeId").isMongoId().withMessage("Invalid grade ID")],
  handleValidationErrors,
  getChapterCountHandler
);
router.get(
  "/:gradeId/units/:unitId/chapters",
  authenticate,
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("unitId").isMongoId().withMessage("Invalid unit ID"),
  ],
  handleValidationErrors,
  getChaptersByUnitHandler
);
router.get(
  "/:chapterId",
  authenticate,
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  handleValidationErrors,
  getChapterHandler
);
router.delete(
  "/:gradeId/chapters/:chapterId",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
  ],
  handleValidationErrors,
  deleteChapterHandler
);
router.post(
  "/:gradeId/chapters/:chapterId/start",
  authenticate,
  authorizeRoles("student"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
  ],
  handleValidationErrors,
  markChapterInProgressHandler
);
router.get(
  "/:gradeId/students/:studentId/completed-chapters",
  authenticate,
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("studentId").isMongoId().withMessage("Invalid student ID"),
  ],
  handleValidationErrors,
  getCompletedChaptersHandler
);
router.get(
  "/:gradeId/chapters/:chapterId/status",
  authenticate,
  authorizeRoles("student"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
  ],
  handleValidationErrors,
  isChapterCompletedHandler
);
router.get(
  "/:chapterId/completed-students",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    param("chapterId").isMongoId().withMessage("Invalid chapter ID format"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn(["completedAt", "score", "name"])
      .withMessage("Sort by must be completedAt, score, or name"),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Order must be asc or desc"),
  ],
  handleValidationErrors,
  getChapterCompletedStudentsHandler
);
router.get(
  "/:gradeId/chapters/:chapterId/completion-stats",
  authenticate,
  authorizeRoles("admin", "teacher"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID format"),
    param("chapterId").isMongoId().withMessage("Invalid chapter ID format"),
  ],
  handleValidationErrors,
  getChapterCompletionStatsHandler
);
router.get(
  "/:chapterId/top-performers",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    param("chapterId").isMongoId().withMessage("Invalid chapter ID format"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  handleValidationErrors,
  getChapterTopPerformersHandler
);
router.get(
  "/:chapterId/pending-students",
  authenticate,
  authorizeRoles("admin", "teacher"),
  [
    param("chapterId").isMongoId().withMessage("Invalid chapter ID format"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  handleValidationErrors,
  getChapterPendingStudentsHandler
);
router.post(
  "/:chapterId/remind/:studentId",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
    param("studentId").isMongoId().withMessage("Invalid student ID"),
  ],
  handleValidationErrors,
  sendChapterReminderHandler
);
router.post(
  "/:chapterId/remind-all",
  authenticate,
  authorizeRoles("admin", "teacher"),
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  handleValidationErrors,
  sendBulkChapterRemindersHandler
);
router.post(
  "/:chapterId/remind-in-progress",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  handleValidationErrors,
  sendInProgressRemindersHandler
);
router.get(
  "/:gradeId/chapters/count",
  authenticate,
  authorizeRoles("admin", "teacher", "superAdmin"),
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
  ],
  handleValidationErrors,
  getChapterCountHandler
);
export default router;
