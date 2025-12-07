import { Router } from "express";
import {
  getSuperAdminDashboard,
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} from "../../../controllers/v1/dashboard";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

router.get("/super-admin",authenticate, getSuperAdminDashboard);
router.get("/admin", authenticate, getAdminDashboard);
router.get("/teacher", authenticate, getTeacherDashboard);
router.get("/student", authenticate, getStudentDashboard);

export default router;