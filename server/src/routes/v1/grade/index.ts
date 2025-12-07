import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  createGradeHandler,
  listGradesHandler,
  getAllGradesHandler,
  getGradeByIdHandler,
  updateGradeHandler,
  deleteGradeHandler,
  addUnitToGradeHandler,
  updateUnitHandler,
  deleteUnitHandler,
  getGradeBasicInfoHandler,
  getTeacherUnitsHandler,
  addTeacherUnitHandler,
  updateTeacherUnitHandler,
  deleteTeacherUnitHandler,
  reorderTeacherUnitsHandler,
  getGradesByTeacherHandler,
  getGradeStudentsHandler,
} from "../../../controllers/v1/grade";
import { authenticate } from "../../../middleware/authenticate";
const router = Router();
router.post(
  "/",
  authenticate,
  [
    body("grade")
      .trim()
      .notEmpty()
      .withMessage("Grade is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Grade must be between 1-50 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
    body("academicYear")
      .optional()
      .trim()
      .matches(/^\d{4}-\d{4}$/)
      .withMessage("Academic year must be in format YYYY-YYYY"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    body("units").optional().isArray().withMessage("Units must be an array"),
    body("units.*.name")
      .if(body("units").exists())
      .trim()
      .notEmpty()
      .withMessage("Unit name is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("units.*.description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  createGradeHandler
);
router.get(
  "/",
  authenticate,
  [
    query("q").optional().trim(),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1-100"),
  ],
  listGradesHandler
);
router.get("/all", authenticate, getAllGradesHandler);
router.get(
  "/teacher/:teacherId",
  authenticate,
  [param("teacherId").isMongoId().withMessage("Invalid teacher ID")],
  getGradesByTeacherHandler
);
router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid grade ID")],
  getGradeByIdHandler
);
router.get(
  "/:gradeId/students",
  authenticate,
  [
    param("gradeId").isMongoId().withMessage("Invalid grade ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1-100"),
    query("query").optional().trim(),
  ],
  getGradeStudentsHandler
);
router.put(
  "/:id",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid grade ID"),
    body("grade")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Grade cannot be empty")
      .isLength({ min: 1, max: 50 })
      .withMessage("Grade must be between 1-50 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
    body("academicYear")
      .optional()
      .trim()
      .matches(/^\d{4}-\d{4}$/)
      .withMessage("Academic year must be in format YYYY-YYYY"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    body("units").optional().isArray().withMessage("Units must be an array"),
    body("units.*.name")
      .if(body("units").exists())
      .trim()
      .notEmpty()
      .withMessage("Unit name is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("units.*.description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  updateGradeHandler
);
router.delete(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid grade ID")],
  deleteGradeHandler
);
router.post(
  "/:id/units",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid grade ID"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Unit name is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  addUnitToGradeHandler
);
router.put(
  "/:id/units/:unitId",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid grade ID"),
    param("unitId").isMongoId().withMessage("Invalid unit ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Unit name cannot be empty")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  updateUnitHandler
);
router.delete(
  "/:id/units/:unitId",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid grade ID"),
    param("unitId").isMongoId().withMessage("Invalid unit ID"),
  ],
  deleteUnitHandler
);
router.get(
  "/:id/basic",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid grade ID")],
  getGradeBasicInfoHandler
);
router.get("/teacher/unit/all", authenticate, getTeacherUnitsHandler);
router.post(
  "/teacher/unit",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Unit name is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  authenticate,
  addTeacherUnitHandler
);
router.put(
  "/teacher/unit/:unitId",
  [
    param("unitId").isMongoId().withMessage("Invalid unit ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Unit name cannot be empty")
      .isLength({ min: 1, max: 100 })
      .withMessage("Unit name must be between 1-100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Unit description must not exceed 500 characters"),
  ],
  authenticate,
  updateTeacherUnitHandler
);
router.delete(
  "/teacher/unit/:unitId",
  [param("unitId").isMongoId().withMessage("Invalid unit ID")],
  authenticate,
  deleteTeacherUnitHandler
);
router.patch(
  "/teacher/unit/reorder",
  [
    body("unitIds")
      .isArray({ min: 1 })
      .withMessage("Unit IDs array is required"),
    body("unitIds.*").isMongoId().withMessage("Each unit ID must be valid"),
  ],
  authenticate,
  reorderTeacherUnitsHandler
);
export default router;
