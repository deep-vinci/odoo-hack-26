import { Router } from "express";

import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  getTripById,
  listTrips,
} from "../controllers/trip.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /trips"), createTrip);
router.get("/", authenticate, listTrips);
router.get("/:id", authenticate, getTripById);
router.post(
  "/:id/dispatch",
  authenticate,
  requirePermission("POST /trips/:id/dispatch"),
  dispatchTrip,
);
router.post(
  "/:id/complete",
  authenticate,
  requirePermission("POST /trips/:id/complete"),
  completeTrip,
);
router.post(
  "/:id/cancel",
  authenticate,
  requirePermission("POST /trips/:id/cancel"),
  cancelTrip,
);

export default router;
