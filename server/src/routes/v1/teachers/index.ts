import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createNewTeacher,
  updateTeacherDetails,
  removeTeacher,
  getTeacherById,
  getTeachersList,
  getTeachersTotalCount,
  markChapterCompleted,
} from "../../../controllers/v1/teachers";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
import { upload } from "../../../middleware/upload";
const router = Router();
const createTeacherValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .toLowerCase(),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format")
    .trim(),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18 || age > 100) {
        throw new Error("Teacher must be between 18 and 100 years old");
      }
      return true;
    }),
  body("gradeId")
    .notEmpty()
    .withMessage("Grade is required")
    .isString()
    .withMessage("Grade must be a string")
    .trim(),
  body("qualifications")
    .optional()
    .isString()
    .withMessage("Qualifications must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Qualifications must not exceed 500 characters"),
  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object"),
  body("address.street")
    .optional()
    .isString()
    .withMessage("Street must be a string")
    .trim(),
  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .trim(),
  body("address.state")
    .optional()
    .isString()
    .withMessage("State must be a string")
    .trim(),
  body("address.country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .trim(),
  body("address.postalCode")
    .optional()
    .isString()
    .withMessage("Postal code must be a string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Postal code must be between 3 and 10 characters"),
];
const updateTeacherValidation = [
  param("id")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .toLowerCase(),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format")
    .trim(),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18 || age > 100) {
        throw new Error("Teacher must be between 18 and 100 years old");
      }
      return true;
    }),
  body("qualifications")
    .optional()
    .isString()
    .withMessage("Qualifications must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Qualifications must not exceed 500 characters"),
  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object"),
  body("address.street")
    .optional()
    .isString()
    .withMessage("Street must be a string")
    .trim(),
  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .trim(),
  body("address.state")
    .optional()
    .isString()
    .withMessage("State must be a string")
    .trim(),
  body("address.country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .trim(),
  body("address.postalCode")
    .optional()
    .isString()
    .withMessage("Postal code must be a string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Postal code must be between 3 and 10 characters"),
];
const teacherIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
];
const getTeachersListValidation = [
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
  query("query")
    .optional()
    .isString()
    .withMessage("Query must be a string")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Query must not exceed 200 characters"),
];
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  upload.single("profilePicture"),
  createTeacherValidation,
  createNewTeacher
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  upload.single("profilePicture"),
  updateTeacherValidation,
  updateTeacherDetails
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  teacherIdValidation,
  removeTeacher
);
router.get(
  "/count",
  authenticate,
  authorizeRoles("admin", "superAdmin"),
  getTeachersTotalCount
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("teacher", "admin", "superAdmin"),
  teacherIdValidation,
  getTeacherById
);
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "superAdmin","student"),
  getTeachersListValidation,
  getTeachersList
);
router.post(
  "/:id/complete-chapter",
  authenticate,
  markChapterCompleted
);
export default router;
