import express from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  registerStudent,
  modifyStudent,
  removeStudent,
  fetchStudentById,
  fetchStudents,
  fetchStudentProgress,
  markChapterCompleted,
  createStudentByTeacher,
  fetchTeacherStudents,
  fetchTeacherStudentById,
  updateStudentByTeacher,
  deleteStudentByTeacher,
  fetchTeacherStudentProgress,
  fetchStudentsByGrade, 
} from "../../../controllers/v1/students";
import { upload } from "../../../middleware/upload";
import { authenticate } from "../../../middleware/authenticate";
import { Request, Response, NextFunction } from "express";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
const router = express.Router();
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg,
      })),
    });
  }
  next();
};
const registerStudentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("rollNumber")
    .trim()
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),
  body("gradeId")
    .trim()
    .notEmpty()
    .withMessage("Grade is required")
    .isMongoId()
    .withMessage("Invalid grade ID format"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const date = new Date(value);
      if (date >= new Date()) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),
  body("parentContact")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.country").optional().trim(),
  body("address.postalCode").optional().trim(),
];
const modifyStudentValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid student ID format"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("rollNumber")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),
  body("gradeId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid grade ID format"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const date = new Date(value);
      if (date >= new Date()) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),
  body("parentContact")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.country").optional().trim(),
  body("address.postalCode").optional().trim(),
];
const idParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid student ID format"),
];
const gradeIdParamValidation = [
  param("gradeId")
    .isMongoId()
    .withMessage("Invalid grade ID format"),
];
const fetchStudentsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("query")
    .optional()
    .trim(),
  query("grade")
    .optional()
    .isMongoId()
    .withMessage("Invalid grade ID format"),
];
const fetchStudentsByGradeValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("query")
    .optional()
    .trim(),
];
const markChapterCompletedValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid student ID format"),
  body("chapterId")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID format"),
];
const createStudentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("rollNumber")
    .trim()
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const date = new Date(value);
      if (date >= new Date()) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),
  body("parentContact")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.country").optional().trim(),
  body("address.postalCode").optional().trim(),
];
const updateStudentValidation = [
  param("id").isMongoId().withMessage("Invalid student ID format"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("rollNumber")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const date = new Date(value);
      if (date >= new Date()) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),
  body("parentContact")
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage("Please provide a valid phone number"),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.country").optional().trim(),
  body("address.postalCode").optional().trim(),
];
router.post(
  "/",
  authenticate,
  upload.single("profilePicture"),
  registerStudentValidation,
  handleValidationErrors,
  registerStudent
);
router.get(
  "/",
  authenticate,
  fetchStudentsValidation,
  handleValidationErrors,
  fetchStudents
);
router.get(
  "/grade/:gradeId",
  authenticate,
  gradeIdParamValidation,
  fetchStudentsByGradeValidation,
  handleValidationErrors,
  fetchStudentsByGrade
);
router.get(
  "/:id",
  authenticate,
  idParamValidation,
  handleValidationErrors,
  fetchStudentById
);
router.put(
  "/:id",
  authenticate,
  upload.single("profilePicture"),
  modifyStudentValidation,
  handleValidationErrors,
  modifyStudent
);
router.delete(
  "/:id",
  authenticate,
  idParamValidation,
  handleValidationErrors,
  removeStudent
);
router.post(
  "/:id/complete-chapter",
  authenticate,
  markChapterCompletedValidation,
  handleValidationErrors,
  markChapterCompleted
);
router.get(
  "/:id/progress",
  authenticate,
  idParamValidation,
  handleValidationErrors,
  fetchStudentProgress
);
router.use(authenticate, authorizeRoles("teacher"));
router.post(
  "/teacher/students",
  upload.single("profilePicture"),
  createStudentValidation,
  handleValidationErrors,
  createStudentByTeacher
);
router.get(
  "/teacher/students",
  fetchStudentsValidation,
  handleValidationErrors,
  fetchTeacherStudents
);
router.get(
  "/teacher/students/:id",
  idParamValidation,
  handleValidationErrors,
  fetchTeacherStudentById
);
router.put(
  "/teacher/students/:id",
  upload.single("profilePicture"),
  updateStudentValidation,
  handleValidationErrors,
  updateStudentByTeacher
);
router.delete(
  "/teacher/students/:id",
  idParamValidation,
  handleValidationErrors,
  deleteStudentByTeacher
);
router.get(
  "/teacher/students/:id/progress",
  idParamValidation,
  handleValidationErrors,
  fetchTeacherStudentProgress
);
export default router;