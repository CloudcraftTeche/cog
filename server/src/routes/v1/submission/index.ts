import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../../../middleware/authenticate";
import { validate } from "../../../middleware/validate";
import {
  submitAssignment,
  fetchSubmissions,
  fetchSubmissionById,
  modifySubmission,
  removeSubmission,
  gradeSubmission,
  fetchTeacherDashboard
} from "../../../controllers/v1/submission";
const router = Router();
router.post("/",
  authenticate,
  [
    body("assignmentId").isMongoId().withMessage("Invalid assignment ID"),
    body("gradeId").isMongoId().withMessage("Invalid grade ID"),
    body("submissionType").isIn(["video", "text", "pdf"]).withMessage("Submission type must be video, text, or pdf"),
    body("videoUrl").if(body("submissionType").equals("video"))
      .notEmpty().withMessage("Video URL is required for video submission")
      .isURL().withMessage("Invalid video URL"),
    body("pdfUrl").if(body("submissionType").equals("pdf"))
      .notEmpty().withMessage("PDF URL is required for PDF submission")
      .isURL().withMessage("Invalid PDF URL"),
    body("textContent").if(body("submissionType").equals("text"))
      .notEmpty().withMessage("Text content is required for text submission"),
    body("answers").optional().isArray().withMessage("Answers must be an array")
  ],
  validate,
  submitAssignment
);
router.get("/",
  authenticate,
  [
    query("gradeId").isMongoId().withMessage("Grade ID is required and must be valid"),
    query("assignmentId").optional().isMongoId().withMessage("Invalid assignment ID"),
    query("studentId").optional().isMongoId().withMessage("Invalid student ID"),
    query("gradeStatus").optional().isIn(["graded", "pending"]).withMessage("Grade status must be 'graded' or 'pending'"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100")
  ],
  validate,
  fetchSubmissions
);
router.get("/teacher/dashboard",
  authenticate,
  [
    query("assignmentId").optional().isMongoId().withMessage("Invalid assignment ID"),
    query("studentId").optional().isMongoId().withMessage("Invalid student ID"),
    query("status").optional().isIn(["graded", "pending"]).withMessage("Status must be 'graded' or 'pending'"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50")
  ],
  validate,
  fetchTeacherDashboard
);
router.get("/:id",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid submission ID"),
    query("gradeId").isMongoId().withMessage("Grade ID is required and must be valid")
  ],
  validate,
  fetchSubmissionById
);
router.put("/:id",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid submission ID"),
    body("gradeId").isMongoId().withMessage("Grade ID is required and must be valid"),
    body("submissionType").optional().isIn(["video", "text", "pdf"]).withMessage("Invalid submission type"),
    body("videoUrl").optional().isURL().withMessage("Invalid video URL"),
    body("pdfUrl").optional().isURL().withMessage("Invalid PDF URL"),
    body("textContent").optional().isString().withMessage("Text content must be a string"),
    body("answers").optional().isArray().withMessage("Answers must be an array")
  ],
  validate,
  modifySubmission
);
router.put("/:id/grade",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid submission ID"),
    body("score").isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
    body("feedback").optional().trim().isLength({ max: 1000 }).withMessage("Feedback must not exceed 1000 characters")
  ],
  validate,
  gradeSubmission
);
router.delete("/:id",
  authenticate,
  [
    param("id").isMongoId().withMessage("Invalid submission ID"),
    query("gradeId").isMongoId().withMessage("Grade ID is required and must be valid")
  ],
  validate,
  removeSubmission
);
export default router;