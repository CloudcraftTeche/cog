import {Router} from "express";

import { authenticate } from "../../../middleware/authenticate";
import { exportAttendance, getAttendanceHeatmap, getAttendanceStats } from "../../../controllers/v1/attendance";
import { createSuperAdminController, deleteSuperAdminController, getAllSuperAdminsController, updateSuperAdminController } from "@/controllers/v1/superAdmin";
const router = Router();
router.post("/", createSuperAdminController);
router.get("/",authenticate, getAllSuperAdminsController);
router.put("/:id", authenticate,updateSuperAdminController);
router.delete("/:id", authenticate, deleteSuperAdminController);
router.get("/stats", authenticate, getAttendanceStats);
router.get("/heatmap", authenticate, getAttendanceHeatmap);
router.get("/export/attendance", authenticate, exportAttendance);
export default router;
