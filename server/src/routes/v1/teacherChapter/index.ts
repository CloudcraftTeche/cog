import express from "express";
import {
  createTeacherChapter,
  updateTeacherChapter,
  deleteTeacherChapter,
  getTeacherChapter,
  getAllTeacherChapters,
  getTeacherChaptersByGrade,
  getTeacherChapterByIdHandler,
  getTeacherChapterWithCompletedTeachers,
  getTeacherChapterStructure,
  completeTeacherChapter,
} from "../../../controllers/v1/teacherChapter";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createTeacherChapter
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getAllTeacherChapters
);

router.get(
  "/chapter/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getTeacherChapter
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateTeacherChapter
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteTeacherChapter
);

router.get(
  "/:id/completed-teachers",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getTeacherChapterWithCompletedTeachers
);

router.get(
  "/:id/teacher/:teacherId",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getTeacherChapterByIdHandler
);

router.get(
  "/teacher/chapter-structure",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getTeacherChapterStructure
);

router.get(
  "/teacher/:teacherId",
  authenticate,
  authorizeRoles("teacher"),
  getTeacherChaptersByGrade
);

router.post(
  "/:teacherId/complete-chapter",
  authenticate,
  authorizeRoles("teacher"),
  completeTeacherChapter
);


export default router;