import express from "express";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  getChapter,
  getAllChapters,
  getChaptersByClass,
  getChapterCount,
  getChaptersByStudent,
  getChaptersByStudentHandler,
  getChapterWithCompletedStudents,
  sendChapterReminder,
  getChapterStucture,
} from "../../../controllers/v1/chapter";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "teacher"),
  createChapter
);
router.get("/", authenticate, authorizeRoles("admin"), getAllChapters);
router.get("/count", authenticate, authorizeRoles("admin"), getChapterCount);
router.get(
  "/chapter/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getChapter
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  updateChapter
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  deleteChapter
);
router.get(
  "/class/:class",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getChaptersByClass
);
router.get(
  "/:id/completed-students",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getChapterWithCompletedStudents
);
router.get(
  "/:id/student/:studentId",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getChaptersByStudentHandler
);
router.post(
  "/:chapterId/remind/:studentId",
  authorizeRoles("admin", "teacher"),
  authenticate,
  sendChapterReminder
);
router.get(
  "/student/chapter-structure",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getChapterStucture
);
router.get(
  "/student/:studentId",
  authenticate,
  authorizeRoles("student"),
  getChaptersByStudent
);

export default router;
