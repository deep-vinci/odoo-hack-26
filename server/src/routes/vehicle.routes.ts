import { Router } from "express";

import {
  changeStatus,
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from "../controllers/vehicle.controller";
import { getVehicleMaintenance } from "../controllers/maintenance.controller";
import { getVehicleCosts } from "../controllers/cost.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /vehicles"), createVehicle);
router.get("/", authenticate, listVehicles);
router.get("/:id", authenticate, getVehicle);
router.get("/:id/maintenance", authenticate, getVehicleMaintenance);
router.get("/:id/costs", authenticate, getVehicleCosts);
router.patch("/:id", authenticate, requirePermission("PATCH /vehicles/:id"), updateVehicle);
router.patch(
  "/:id/status",
  authenticate,
  requirePermission("PATCH /vehicles/:id/status"),
  changeStatus,
);
router.delete("/:id", authenticate, requirePermission("DELETE /vehicles/:id"), deleteVehicle);

export default router;
