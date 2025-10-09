import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createQuery,
  getAllQueries,
  getQueryById,
  addResponse,
  updateQueryStatus,
  deleteQuery,
  getStudentQueries,
  getTeacherQueries,
  getAdminMyQueries,
  getAdminDepartmentQueries,
  assignQueryToMe,
  getTeachers,
} from "../../../controllers/v1/query";
import { authenticate } from "../../../middleware/authenticate";
import { validateRequest } from "../../../middleware/validate";

const router = Router();

const createQueryValidation = [
  body("to").isMongoId().withMessage("Invalid recipient ID"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("queryType")
    .optional()
    .isIn(["general", "academic", "disciplinary", "doctrinal", "technical"])
    .withMessage("Invalid query type"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),
  body("isSensitive").optional().isBoolean(),
  body("attachments").optional().isArray(),
  body("tags").optional().isArray(),
];

const addResponseValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("content").trim().notEmpty().withMessage("Response content is required"),
  body("from").optional(),
  body("responseType")
    .optional()
    .isIn(["reply", "broadcast", "escalation"])
    .withMessage("Invalid response type"),
  body("attachments").optional().isArray(),
];

const updateStatusValidation = [
  param("id").isMongoId().withMessage("Invalid query ID"),
  body("status")
    .isIn(["open", "in_progress", "resolved", "escalated", "closed"])
    .withMessage("Invalid status"),
  body("assignedTo").optional().isMongoId().withMessage("Invalid assignee ID"),
  body("escalationReason").optional().trim(),
];

const queryParamValidation = [
  query("status")
    .optional()
    .isIn(["open", "in_progress", "resolved", "escalated", "closed"]),
  query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  query("queryType")
    .optional()
    .isIn(["general", "academic", "disciplinary", "doctrinal", "technical"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

router.post(
  "/",
  authenticate,
  createQueryValidation,
  validateRequest,
  createQuery
);

router.get(
  "/student",
  authenticate,
  queryParamValidation,
  validateRequest,
  getStudentQueries
);

router.get(
  "/teacher",
  authenticate,
  queryParamValidation,
  validateRequest,
  getTeacherQueries
);

router.get("/teachers", authenticate, getTeachers);

router.get(
  "/admin/my",
  authenticate,
  queryParamValidation,
  validateRequest,
  getAdminMyQueries
);

router.get(
  "/admin/department",
  authenticate,
  queryParamValidation,
  validateRequest,
  getAdminDepartmentQueries
);

router.post(
  "/:id/assign",
  authenticate,
  param("id").isMongoId().withMessage("Invalid query ID"),
  validateRequest,
  assignQueryToMe
);

router.get(
  "/all",
  authenticate,
  queryParamValidation,
  validateRequest,
  getAllQueries
);

router.get(
  "/:id",
  authenticate,
  param("id").isMongoId().withMessage("Invalid query ID"),
  validateRequest,
  getQueryById
);

router.post(
  "/:id/responses",
  authenticate,
  addResponseValidation,
  validateRequest,
  addResponse
);

router.patch(
  "/:id/status",
  authenticate,
  updateStatusValidation,
  validateRequest,
  updateQueryStatus
);

router.delete(
  "/:id",
  authenticate,
  param("id").isMongoId().withMessage("Invalid query ID"),
  validateRequest,
  deleteQuery
);

export { router as queryRoutes };
