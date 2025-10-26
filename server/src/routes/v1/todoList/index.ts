import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { getStudentAssignments, getStudentStreak, getStudentTodoOverview } from "@/controllers/v1/todoList";


const router = Router();

router.use(authenticate);

router.get("/overview", getStudentTodoOverview);

router.get("/assignments", getStudentAssignments);

router.get("/streak", getStudentStreak);

export default router;