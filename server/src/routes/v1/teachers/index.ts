import express from "express";
import {
  createNewTeacher,
  updateTeacherDetails,
  removeTeacher,
  getTeachersList,
  getTeachersTotalCount,
  getTeacherById,
  getTeacherDashboard,
} from "../../../controllers/v1/teachers";
import { upload } from "../../../middleware/upload";
import { authenticate } from "../../../middleware/authenticate";

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.single("profilePicture"),
  createNewTeacher
);

router.get("/", authenticate, getTeachersList);

router.get("/dashboard", authenticate, getTeacherDashboard);
router.get("/count", authenticate, getTeachersTotalCount);

router.get("/:id", authenticate, getTeacherById);
router.put(
  "/:id",
  authenticate,
  upload.single("profilePicture"),
  updateTeacherDetails
);
router.delete("/:id", authenticate, removeTeacher);

export default router;
