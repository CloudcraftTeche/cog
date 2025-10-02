import forgetPassword from "../../../controllers/v1/auth/forget-password";
import { handleRefreshAccessToken } from "../../../controllers/v1/auth/refresh_token";
import resetPassword from "../../../controllers/v1/auth/reset-password";
import verify from "../../../controllers/v1/auth/verify";
import { authenticate } from "../../../middleware/authenticate";
import login from "../../../controllers/v1/auth/login";
import logout from "../../../controllers/v1/auth/logout";
import { Router } from "express";
import { getProfile } from "../../../controllers/v1/auth/profile";

const router = Router();
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.get("/logout", authenticate, logout);
router.get("/refresh", handleRefreshAccessToken);
router.get("/verify",verify);
router.get("/profile", authenticate, getProfile);

export default router;
