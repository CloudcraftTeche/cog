import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
} from "../../../controllers/v1/announcement";
import { upload } from "../../../middleware/upload";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = express.Router();

router.get("/",authenticate,authorizeRoles("admin","teacher","student"), getAnnouncements);

router.post("/",authenticate, authorizeRoles("admin"),upload.single("file"),createAnnouncement);

router.put("/:id",authenticate,authorizeRoles("admin"), upload.single("file"),updateAnnouncement);

router.delete("/:id", authenticate,authorizeRoles("admin"),deleteAnnouncement);

router.patch("/:id/pin",authenticate,authorizeRoles("admin"), togglePin);

export default router;
