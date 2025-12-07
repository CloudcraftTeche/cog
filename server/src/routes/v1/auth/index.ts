import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../../../middleware/authenticate";
import { validate } from "../../../middleware/validate";
import { 
  forgotPassword, 
  getProfile, 
  login, 
  logout, 
  refresh, 
  resetPassword, 
  verify 
} from "../../../controllers/v1/auth";
const router = Router();
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];
const resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refresh);
router.get("/verify", verify);
router.post("/forgot-password", forgotPasswordValidation, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);
router.post("/logout", authenticate, logout as any);
router.get("/profile", authenticate, getProfile as any);
router.get("/me", authenticate, getProfile as any);
export default router;