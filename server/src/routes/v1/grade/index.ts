import {
  createGradeHandler,
  deleteGradeHandler,
  getAllGradesHandler,
  getGradeByIdHandler,
  listGradesHandler,
  updateGradeHandler
} from "../../../controllers/v1/grade";
import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

router.post("/",authenticate, createGradeHandler);
router.put("/:id",authenticate, updateGradeHandler);
router.delete("/:id",authenticate, deleteGradeHandler);
router.get("/", authenticate,listGradesHandler);
router.get("/all",authenticate, getAllGradesHandler);
router.get("/:id",authenticate, getGradeByIdHandler);

export default router;
