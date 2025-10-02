import express from "express";
import {
  submitAssignment,
  fetchSubmissions,
  fetchSubmissionById,
  modifySubmission,
  removeSubmission,
  gradeSubmission
} from "../../../controllers/v1/submission";
import { authenticate } from "../../../middleware/authenticate";

const router = express.Router();

router.post("/",authenticate, submitAssignment as any);

router.get("/",authenticate, fetchSubmissions as any);

router.get("/:id",authenticate, fetchSubmissionById as any);

router.put("/:id",authenticate, modifySubmission as any);

router.delete("/:id", authenticate,removeSubmission as any);

router.put("/:id/score",authenticate, gradeSubmission as any);

export default router;
