import { Router } from "express";

import authRoutes from "./auth.routes";
import vehicleRoutes from "./vehicle.routes";
import driverRoutes from "./driver.routes";
import tripRoutes from "./trip.routes";
import maintenanceRoutes from "./maintenance.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/maintenance", maintenanceRoutes);

export default router;
