import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import {
  parseMaintenanceListQuery,
  validateCloseMaintenance,
  validateCreateMaintenance,
  validateUpdateMaintenance,
} from "../validators/maintenance.validator";
import {
  closeMaintenance as closeMaintenanceService,
  createMaintenance as createMaintenanceService,
  getMaintenanceById,
  getVehicleMaintenanceHistory,
  listMaintenance as listMaintenanceService,
  updateMaintenance as updateMaintenanceService,
} from "../services/maintenance.service";

export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateCreateMaintenance(req.body);
  const result = await createMaintenanceService(input, req.user.user_id);
  sendSuccess(res, 201, result);
});

export const listMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const query = parseMaintenanceListQuery(req.query as Record<string, unknown>);
  const result = await listMaintenanceService(query);
  sendSuccess(res, 200, result);
});

export const getMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const maintenance = await getMaintenanceById(String(req.params.id));
  sendSuccess(res, 200, { maintenance });
});

export const updateMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const input = validateUpdateMaintenance(req.body);
  const maintenance = await updateMaintenanceService(String(req.params.id), input);
  sendSuccess(res, 200, { maintenance });
});

export const closeMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const input = validateCloseMaintenance(req.body);
  const result = await closeMaintenanceService(String(req.params.id), input);
  sendSuccess(res, 200, result);
});

export const getVehicleMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const query = parseMaintenanceListQuery(req.query as Record<string, unknown>);
  const result = await getVehicleMaintenanceHistory(String(req.params.id), query);
  sendSuccess(res, 200, result);
});
