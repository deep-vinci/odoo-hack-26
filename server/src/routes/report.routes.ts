import { Router } from "express";

import {
  costTrend,
  exportReport,
  fuelEfficiency,
  operationalCosts,
  utilizationTrend,
  vehicleRoi,
} from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/fuel-efficiency", authenticate, fuelEfficiency);
router.get("/operational-costs", authenticate, operationalCosts);
router.get("/vehicle-roi", authenticate, vehicleRoi);
router.get("/utilization-trend", authenticate, utilizationTrend);
router.get("/cost-trend", authenticate, costTrend);
router.get("/export", authenticate, exportReport);

export default router;
