import { Router } from "express";
import { param, query } from "express-validator";
import {
  listLessonsHandler,
  getLessonByIdHandler,
  getLessonForChapterHandler,
} from "../../../controllers/v1/lesson";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
import { validate } from "../../../middleware/validate";
const router = Router();
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  [query("gradeId").optional().isMongoId().withMessage("Invalid grade ID")],
  validate,
  listLessonsHandler
);
router.get(
  "/chapter/:chapterId",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  validate,
  getLessonForChapterHandler
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  [param("id").isMongoId().withMessage("Invalid lesson ID")],
  validate,
  getLessonByIdHandler
);
export default router;
