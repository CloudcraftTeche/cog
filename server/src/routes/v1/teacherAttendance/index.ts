import {
  createOrUpdateTeacherAttendance,
  deleteTeacherAttendance,
  exportTeacherAttendance,
  getTeacherAttendanceByGrade,
  getTeacherAttendanceHeatmap,
  getTeacherAttendanceStats,
  getTodayTeacherAttendance,
  getSpecificTeacherAttendance,
  getTeacherAttendanceByDate,
} from "../../../controllers/v1/teacherAttendance";
import { authenticate } from "../../../middleware/authenticate";
import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = Router();

const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg,
      })),
    });
  }
  next();
};

const oid = (field: string) =>
  param(field).isMongoId().withMessage(`Invalid ${field}`);

router.use(authenticate);
router.use(authorizeRoles("admin", "superAdmin", "teacher"));

router.post(
  "/",
  [
    body("teacherId").isMongoId().withMessage("Invalid teacherId"),
    body("gradeId").optional().isMongoId().withMessage("Invalid gradeId"),
    body("status")
      .isIn(["present", "absent", "late", "excused"])
      .withMessage("Invalid status"),
    body("remarks").optional().isString().trim(),
    body("date").optional().isISO8601().withMessage("Invalid date"),
  ],
  handleValidationErrors,
  createOrUpdateTeacherAttendance
);

router.get("/today", getTodayTeacherAttendance);

router.get(
  "/by-date",
  [query("date").optional().isISO8601().withMessage("Invalid date")],
  handleValidationErrors,
  getTeacherAttendanceByDate
);

router.get("/stats", getTeacherAttendanceStats);

router.get("/heatmap", getTeacherAttendanceHeatmap);

router.get(
  "/export",
  [
    query("status")
      .optional()
      .isIn(["all", "present", "absent", "late", "excused"]),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
    query("gradeId").optional().isMongoId().withMessage("Invalid gradeId"),
  ],
  handleValidationErrors,
  exportTeacherAttendance
);

router.get(
  "/teacher/:teacherId",
  [
    oid("teacherId"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  handleValidationErrors,
  getSpecificTeacherAttendance
);

router.get(
  "/grade/:gradeId",
  [
    oid("gradeId"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  handleValidationErrors,
  getTeacherAttendanceByGrade
);

router.delete(
  "/:attendanceId",
  [oid("attendanceId")],
  handleValidationErrors,
  deleteTeacherAttendance
);

export default router;
