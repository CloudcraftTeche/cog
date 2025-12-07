import {Router} from "express";
import {
    createAdminController,
    getAllAdminsController,
    updateAdminController,
    deleteAdminController,
} from "../../../controllers/v1/admin";
import { authenticate } from "../../../middleware/authenticate";
import { exportAttendance, getAttendanceHeatmap, getAttendanceStats } from "../../../controllers/v1/attendance";
const router = Router();
router.post("/", createAdminController);
router.get("/",authenticate, getAllAdminsController);
router.put("/:id", authenticate,updateAdminController);
router.delete("/:id", authenticate, deleteAdminController);
router.get("/stats", authenticate, getAttendanceStats);
router.get("/heatmap", authenticate, getAttendanceHeatmap);
router.get("/export/attendance", authenticate, exportAttendance);
export default router;
