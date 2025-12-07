import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../../../middleware/authenticate";
import { validate } from "../../../middleware/validate";
import {
  createAssignment,
  createAssignmentForMultipleGrades,
  deleteAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentsByGrade,
  getAssignmentSubmissions,
  updateAssignment,
  getSubmissionsForMyAssignments,
} from "../../../controllers/v1/assignment";
import { upload } from "../../../middleware/upload";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
const router = Router();
const oid = (field: string) =>
  param(field).isMongoId().withMessage(`Invalid ${field}`);
const createAssignmentValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3-200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("contentType")
    .isIn(["video", "text", "pdf"])
    .withMessage("Content type must be video, text, or pdf"),
  body("textContent")
    .if(body("contentType").equals("text"))
    .notEmpty()
    .withMessage("Text content is required for text content"),
  body("questions")
    .optional()
    .isString()
    .withMessage("Questions must be a JSON string"),
  body("startDate").isISO8601().withMessage("Invalid start date format"),
  body("endDate").isISO8601().withMessage("Invalid end date format"),
  body("totalMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total marks must be >= 0"),
  body("passingMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Passing marks must be >= 0"),
];
const updateAssignmentValidators = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3-200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("contentType")
    .optional()
    .isIn(["video", "text", "pdf"])
    .withMessage("Invalid content type"),
  body("startDate").optional().isISO8601().withMessage("Invalid start date"),
  body("endDate").optional().isISO8601().withMessage("Invalid end date"),
  body("status")
    .optional()
    .isIn(["active", "locked", "ended"])
    .withMessage("Invalid status"),
  body("totalMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total marks must be >= 0"),
  body("passingMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Passing marks must be >= 0"),
];
router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
    query("search").optional().trim(),
    query("grade").optional().isMongoId().withMessage("Invalid grade ID"),
    query("status")
      .optional()
      .isIn(["active", "locked", "ended"])
      .withMessage("Invalid status"),
  ],
  validate,
  getAllAssignments
);
router.get(
  "/grade/:gradeId",
  authenticate,
  authorizeRoles("admin"),
  [
    oid("gradeId"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
    query("search").optional().trim(),
    query("status")
      .optional()
      .isIn(["active", "locked", "ended"])
      .withMessage("Invalid status"),
  ],
  validate,
  getAssignmentsByGrade
);
router.get(
  "/:assignmentId",
  authenticate,
  [oid("assignmentId")],
  validate,
  getAssignmentById
);
router.get(
  "/:assignmentId/submissions",
  authenticate,
  authorizeRoles("admin", "teacher"),
  [
    oid("assignmentId"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
    query("search").optional().trim(),
    query("gradeStatus")
      .optional()
      .isIn(["graded", "pending"])
      .withMessage("Invalid grade status"),
  ],
  validate,
  getAssignmentSubmissions
);
router.get(
  "/my/submissions/all",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
    query("search").optional().trim(),
    query("gradeStatus")
      .optional()
      .isIn(["graded", "pending"])
      .withMessage("Invalid grade status"),
  ],
  validate,
  getSubmissionsForMyAssignments
);
router.post(
  "/grade/:gradeId",
  authenticate,
  authorizeRoles("admin"),
  upload.single("file"),
  [oid("gradeId"), ...createAssignmentValidators],
  validate,
  createAssignment
);
router.post(
  "/multiple",
  authenticate,
  authorizeRoles("admin"),
  upload.single("file"),
  [
    body("gradeIds")
      .isArray({ min: 1 })
      .withMessage("Please provide at least one grade ID"),
    body("gradeIds.*").isMongoId().withMessage("Invalid grade ID"),
    ...createAssignmentValidators,
  ],
  validate,
  createAssignmentForMultipleGrades
);
router.post(
  "/",
  authenticate,
  authorizeRoles("teacher"),
  upload.single("file"),
  createAssignmentValidators,
  validate,
  createAssignment
);
router.put(
  "/:assignmentId",
  authenticate,
  upload.single("file"),
  [oid("assignmentId"), ...updateAssignmentValidators],
  validate,
  updateAssignment
);
router.delete(
  "/:assignmentId",
  authenticate,
  [oid("assignmentId")],
  validate,
  deleteAssignment
);
export default router;