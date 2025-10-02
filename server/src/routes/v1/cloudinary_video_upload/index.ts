import { cloudinaryVideoUploadSignature } from "../../../controllers/v1/cloudinary_video_upload";
import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = Router();

router.get("/",authenticate,authorizeRoles("admin","teacher","student"), cloudinaryVideoUploadSignature);

export default router;
