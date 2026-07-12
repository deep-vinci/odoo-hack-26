import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import {
  parseVehicleListQuery,
  validateCreateVehicle,
  validateStatusChange,
  validateUpdateVehicle,
} from "../validators/vehicle.validator";
import {
  changeVehicleStatus,
  createVehicle as createVehicleService,
  deleteVehicle as deleteVehicleService,
  getVehicleById,
  listVehicles as listVehiclesService,
  updateVehicle as updateVehicleService,
} from "../services/vehicle.service";

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const input = validateCreateVehicle(req.body);
  const vehicle = await createVehicleService(input);
  sendSuccess(res, 201, { vehicle });
});

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const query = parseVehicleListQuery(req.query as Record<string, unknown>);
  const result = await listVehiclesService(query);
  sendSuccess(res, 200, result);
});

export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
  const result = await getVehicleById(String(req.params.id));
  sendSuccess(res, 200, result);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const input = validateUpdateVehicle(req.body);
  const vehicle = await updateVehicleService(String(req.params.id), input);
  sendSuccess(res, 200, { vehicle });
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = validateStatusChange(req.body);
  const vehicle = await changeVehicleStatus(String(req.params.id), status);
  sendSuccess(res, 200, { vehicle });
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  await deleteVehicleService(String(req.params.id));
  sendSuccess(res, 200, { message: "Vehicle deleted successfully" });
});
