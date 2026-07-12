import { Router } from "express";

import {
  changeStatus,
  createDriver,
  getDriverById,
  getExpiringLicenses,
  listDrivers,
  updateDriver,
  updateSafetyScore,
} from "../controllers/driver.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /drivers"), createDriver);
router.get("/", authenticate, listDrivers);
router.get("/expiring-licenses", authenticate, getExpiringLicenses);
router.get("/:id", authenticate, getDriverById);
router.patch("/:id", authenticate, requirePermission("PATCH /drivers/:id"), updateDriver);
router.patch(
  "/:id/status",
  authenticate,
  requirePermission("PATCH /drivers/:id/status"),
  changeStatus,
);
router.patch(
  "/:id/safety-score",
  authenticate,
  requirePermission("PATCH /drivers/:id/safety-score"),
  updateSafetyScore,
);

export default router;
