import { 
  createOrUpdateAttendance, 
  deleteAttendance, 
  exportAttendance, 
  getAttendanceByGrade, 
  getAttendanceHeatmap, 
  getAttendanceStats, 
  getStudentAttendance, 
  getTodayAttendance,
  getTeacherStats,
  getTeacherHeatmap,
  getAttendanceByDate
} from "../../../controllers/v1/attendance";
import { authenticate } from "../../../middleware/authenticate";
import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

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

router.post(
  "/",
  [
    body("studentId").isMongoId().withMessage("Invalid studentId"),
    body("gradeId").optional().isMongoId().withMessage("Invalid gradeId"),
    body("status")
      .isIn(["present", "absent", "late", "excused"])
      .withMessage("Invalid status"),
    body("remarks").optional().isString().trim(),
    body("date").optional().isISO8601().withMessage("Invalid date")
  ],
  handleValidationErrors,
  createOrUpdateAttendance
);

router.get("/today", getTodayAttendance);

router.get(
  "/by-date",
  [query("date").optional().isISO8601().withMessage("Invalid date")],
  handleValidationErrors,
  getAttendanceByDate
);

router.get("/stats", getAttendanceStats);

router.get(
  "/stats/teacher/:teacherId",
  [oid("teacherId")],
  handleValidationErrors,
  getTeacherStats
);

router.get("/heatmap", getAttendanceHeatmap);

router.get(
  "/heatmap/teacher/:teacherId",
  [oid("teacherId")],
  handleValidationErrors,
  getTeacherHeatmap
);

router.get(
  "/export",
  [
    query("status").optional().isIn(["all", "present", "absent", "late", "excused"]),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  handleValidationErrors,
  exportAttendance
);

router.get(
  "/student/:studentId",
  [
    oid("studentId"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  handleValidationErrors,
  getStudentAttendance
);

router.get(
  "/grade/:gradeId",
  [
    oid("gradeId"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  handleValidationErrors,
  getAttendanceByGrade
);

router.delete(
  "/:attendanceId",
  [oid("attendanceId")],
  handleValidationErrors,
  deleteAttendance
);

export default router;