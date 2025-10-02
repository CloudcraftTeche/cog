import express from "express";
import { authenticate } from "../../../middleware/authenticate";
import {
  createOrUpdateAttendance,
  getTodayAttendance,
  getStudentsForTeacher,
  getAttendanceOverview,
  getAttendanceStats,
  getAttendanceHeatmap,
  exportAttendance,
} from "../../../controllers/v1/attendance";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = express.Router();

router.post(
  "/attendance",
  authenticate,
  authorizeRoles("admin", "teacher"),
  createOrUpdateAttendance
);
router.get(
  "/attendance/today",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getTodayAttendance
);
router.get(
  "/students",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getStudentsForTeacher
);

router.get(
  "/admin/attendance/overview",
  authenticate,
  authorizeRoles("admin"),
  getAttendanceOverview
);
router.get(
  "/admin/stats",
  authenticate,
  authorizeRoles("admin"),
  getAttendanceStats
);
router.get(
  "/admin/heatmap",
  authenticate,
  authorizeRoles("admin"),
  getAttendanceHeatmap
);
router.get(
  "/export/attendance",
  authenticate,
  authorizeRoles("admin"),
  exportAttendance
);

export default router;
