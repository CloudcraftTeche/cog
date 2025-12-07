import { Router } from "express";
import adminRoutes from "./admin";
import authRoutes from "./auth";
import teachersRoutes from "./teachers";
import studentsRoutes from "./students";
import chaptersRoutes from "./chapter";
import gradesRoutes from "./grade";
import submissionRoutes from "./submission";
import announcementRoutes from "./announcement";
import assignmentRoutes from "./assignment";
import attendanceRoutes from "./attendance";
import chatRoutes from "./chat";
import chatroomRoutes from "./chat/chatRoom"
import { queryRoutes } from "./query/index";
import teacherChaptersRoutes from "./teacherChapter";
import todoListRoutes from "./todo";
import dashboard from "./dashboard";
const router = Router();
router.get("/", (_, res) => {
  res.json({
    message: "Welcome to the API",
    status: "ok",
    version: "1.0.0",
    description: "This is the v1 API endpoint",
    documentation: "/api/v1/docs",
    endpoints: {
      auth: "/api/v1/auth",
      dashboard: "/api/v1/dashboard",
      admin: "/api/v1/admin",
      teachers: "/api/v1/teachers",
      students: "/api/v1/students",
      grades: "/api/v1/grades",
      chapters: "/api/v1/chapters",
      assignments: "/api/v1/assignments",
      submissions: "/api/v1/submissions",
      announcements: "/api/v1/announcements",
      attendance: "/api/v1/attendance",
      chats: "/api/v1/chats",
      queries: "/api/v1/queries",
      teacherChapters: "/api/v1/teacher-chapters",
      todoList: "/api/v1/todo-list",
    },
    contact: {
      name: "Support Team",
      email: "codewithdarshan45@gmail.com",
    },
  });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/teachers", teachersRoutes);
router.use("/students", studentsRoutes);
router.use("/dashboard", dashboard);
router.use("/grades", gradesRoutes);
router.use("/chapters", chaptersRoutes);
router.use("/teacher-chapters", teacherChaptersRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/submissions", submissionRoutes);
router.use("/announcements", announcementRoutes);
router.use("/chat", chatRoutes);
router.use("/chatrooms", chatroomRoutes);
router.use("/queries", queryRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/todo", todoListRoutes);
export default router;