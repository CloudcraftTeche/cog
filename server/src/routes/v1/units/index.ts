import {
  createUnit,
  deleteUnit,
  getAllUnits,
  getUnitById,
  getUnits,
  updateUnit,
} from "../../../controllers/v1/unit";
import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

router.post("/", authenticate, createUnit);
router.put("/:id", authenticate, updateUnit);
router.delete("/:id", authenticate, deleteUnit);
router.get("/", authenticate, getUnits);
router.get("/all", authenticate, getAllUnits);
router.get("/:id", authenticate, getUnitById);

export default router;
