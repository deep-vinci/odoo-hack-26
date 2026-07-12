import { Router } from "express";

import authRoutes from "./auth.routes";
import vehicleRoutes from "./vehicle.routes";
import driverRoutes from "./driver.routes";
import tripRoutes from "./trip.routes";
import maintenanceRoutes from "./maintenance.routes";
import fuelRoutes from "./fuel.routes";
import expenseRoutes from "./expense.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/fuel-logs", fuelRoutes);
router.use("/expenses", expenseRoutes);

export default router;
