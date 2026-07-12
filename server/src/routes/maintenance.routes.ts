import { Router } from "express";

import {
  closeMaintenance,
  createMaintenance,
  getMaintenance,
  listMaintenance,
  updateMaintenance,
} from "../controllers/maintenance.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /maintenance"), createMaintenance);
router.get("/", authenticate, listMaintenance);
router.get("/:id", authenticate, getMaintenance);
router.patch("/:id", authenticate, requirePermission("PATCH /maintenance/:id"), updateMaintenance);
router.post(
  "/:id/close",
  authenticate,
  requirePermission("POST /maintenance/:id/close"),
  closeMaintenance,
);

export default router;
