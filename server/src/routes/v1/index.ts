import { Router } from "express";

const router = Router();


import adminRoutes from "./admin";
import authRoutes from "./auth";
import teachersRoutes from "./teachers";
import studentsRoutes from "./students";
import chaptersRoutes from "./chapter";
import gradesRoutes from "./grade";
import unitsRoutes from "./units";
import submissionRoutes from "./submission";
import announcementRoutes from "./announcement";
import assignmentRoutes from "./assignment";
import cloudinaryVideoUpload from "./cloudinary_video_upload";
import attendanceRoutes from "./attendance";
import chatRoutes from "./chat";


router.get("/", (_, res) => {
  res.json({
    message: "Welcome to the API",
    status: "ok",
    version: "1.0.0",
    description: "This is the v1 API endpoint",
    documentation: "",
    contact: {
      name: "Support Team",
      email: "",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/teacher", teachersRoutes);
router.use("/student", studentsRoutes);
router.use("/chapter", chaptersRoutes);
router.use("/grades", gradesRoutes);
router.use("/assignment", assignmentRoutes);
router.use("/units", unitsRoutes);
router.use("/submission", submissionRoutes);
router.use("/cloudinary-signature", cloudinaryVideoUpload);
router.use("/announcements", announcementRoutes);
router.use("/", attendanceRoutes);
router.use("/chats", chatRoutes);

export default router;
