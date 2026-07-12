import { Router } from "express";

import {
  createFuelLog,
  deleteFuelLog,
  listFuelLogs,
} from "../controllers/fuel.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /fuel-logs"), createFuelLog);
router.get("/", authenticate, listFuelLogs);
router.delete("/:id", authenticate, requirePermission("DELETE /fuel-logs/:id"), deleteFuelLog);

export default router;
