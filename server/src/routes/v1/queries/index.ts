import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createQuery,
  getStudentQueries,
  getReceivedQueries,
  getQueryById,
  addResponse,
  updateQueryStatus,
  assignQuery,
  escalateQuery,
  addSatisfactionRating,
  getQueryStatistics,
  getAvailableRecipients,
} from "../../../controllers/v1/queries";
import multer from "multer";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
import { validate } from "../../../middleware/validate";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const createQueryValidation = [
  body("to")
    .notEmpty()
    .withMessage("Recipient is required")
    .isMongoId()
    .withMessage("Invalid recipient ID"),
  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ max: 200 })
    .withMessage("Subject cannot exceed 200 characters")
    .trim(),
  body("content").notEmpty().withMessage("Content is required").trim(),
  body("queryType")
    .optional()
    .isIn(["general", "academic", "disciplinary", "doctrinal", "technical"])
    .withMessage("Invalid query type"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority level"),
  body("isSensitive")
    .optional()
    .isBoolean()
    .withMessage("isSensitive must be a boolean"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().toLowerCase(),
];
const addResponseValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("content").notEmpty().withMessage("Response content is required").trim(),
  body("responseType")
    .optional()
    .isIn(["reply", "broadcast", "escalation"])
    .withMessage("Invalid response type"),
];
const updateStatusValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["open", "in_progress", "resolved", "escalated", "closed"])
    .withMessage("Invalid status"),
  body("resolvedBy").optional().isMongoId().withMessage("Invalid resolver ID"),
];
const assignQueryValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned user is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
];
const escalateQueryValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("to")
    .notEmpty()
    .withMessage("Escalation recipient is required")
    .isMongoId()
    .withMessage("Invalid recipient ID"),
  body("escalationReason")
    .notEmpty()
    .withMessage("Escalation reason is required")
    .trim(),
];
const addRatingValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];
const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["open", "in_progress", "resolved", "escalated", "closed"])
    .withMessage("Invalid status"),
  query("queryType")
    .optional()
    .isIn(["general", "academic", "disciplinary", "doctrinal", "technical"])
    .withMessage("Invalid query type"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),
];
const queryIdValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
];
router.post(
  "/",
  authenticate,
  authorizeRoles("student"),
  upload.array("attachments", 5),
  createQueryValidation,
  validate,
  createQuery
);
router.get(
  "/my-queries",
  authenticate,
  authorizeRoles("student"),
  paginationValidation,
  validate,
  getStudentQueries
);
router.get(
  "/recipients",
  authenticate,
  authorizeRoles("student"),
  getAvailableRecipients
);
router.get(
  "/received",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  paginationValidation,
  validate,
  getReceivedQueries
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("student", "teacher", "admin", "superAdmin"),
  queryIdValidation,
  validate,
  getQueryById
);
router.post(
  "/:id/response",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  upload.array("attachments", 5),
  addResponseValidation,
  validate,
  addResponse
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  updateStatusValidation,
  validate,
  updateQueryStatus
);
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  assignQueryValidation,
  validate,
  assignQuery
);
router.post(
  "/:id/escalate",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  escalateQueryValidation,
  validate,
  escalateQuery
);
router.post(
  "/:id/rating",
  authenticate,
  authorizeRoles("student"),
  addRatingValidation,
  validate,
  addSatisfactionRating
);
router.get(
  "/statistics/overview",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  getQueryStatistics
);
export default router;
