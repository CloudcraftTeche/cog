import express from "express";
import {
registerStudent,
modifyStudent,
removeStudent,
fetchStudentById,
fetchStudents,
fetchStudentProgress,
fetchStudentsCount,
fetchStudentsByClass,
markChapterCompleted,
getStudentDashboard
} from "../../../controllers/v1/students";
import { upload } from "../../../middleware/upload";
import { authenticate } from "../../../middleware/authenticate";

const router = express.Router();

router.post("/",authenticate, upload.single("profilePicture"), registerStudent);
router.get("/",authenticate, fetchStudents);
router.get("/dashboard",authenticate,getStudentDashboard)
router.get("/class/:classId",authenticate, fetchStudentsByClass);
router.get("/count",authenticate, fetchStudentsCount);
router.get("/:id",authenticate, fetchStudentById);
router.put("/:id", authenticate,upload.single("profilePicture"), modifyStudent);
router.delete("/:id",authenticate, removeStudent);
router.post("/:id/complete-chapter",authenticate, markChapterCompleted);
router.get("/:id/progress", authenticate,fetchStudentProgress);


export default router;
