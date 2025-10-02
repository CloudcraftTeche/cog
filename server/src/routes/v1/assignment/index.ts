import express from "express";
import {
  createAssignmentController,
  getAllAssignmentsController,
  getAssignmentByIdController,
  updateAssignmentController,
  deleteAssignmentController,
  getAssignmentsByGradeController,
  getSubmittedStudentsByGradeController,
  getAssignmentSubmissionsController,
} from "../../../controllers/v1/assignment";
import { videoUpload } from "../../../middleware/upload";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "teacher"),
  videoUpload.single("file"),
  createAssignmentController
);

router.get(
  "/grade/:grade",
  authorizeRoles("admin", "teacher", "student"),
  authenticate,
  getAssignmentsByGradeController
);
router.get(
  "/submissions/grade/:grade",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getSubmittedStudentsByGradeController
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getAllAssignmentsController
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "teacher", "student"),
  getAssignmentByIdController
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  videoUpload.single("file"),
  updateAssignmentController
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "teacher"),
  deleteAssignmentController
);
router.get(
  "/:id/submissions",
  authenticate,
  authorizeRoles("admin", "teacher"),
  getAssignmentSubmissionsController
);
export default router;
