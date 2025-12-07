import { Router } from "express";
import { query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { getStudentAssignments, getStudentStreak, getStudentTodoOverview } from "../../../controllers/v1/todo";
import { ApiError } from "../../../utils/ApiError";
const router = Router();
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed");
  }
  next();
};
router.use(authenticate);
router.get("/overview", getStudentTodoOverview);
router.get(
  "/assignments",
  [
    query("status")
      .optional()
      .isIn(["all", "pending", "submitted", "overdue"])
      .withMessage("Status must be one of: all, pending, submitted, overdue"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
    handleValidationErrors,
  ],
  getStudentAssignments
);
router.get("/streak", getStudentStreak);
export default router;