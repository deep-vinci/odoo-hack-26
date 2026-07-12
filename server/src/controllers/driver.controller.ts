import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import {
  parseDriverListQuery,
  parseExpiringDays,
  validateCreateDriver,
  validateSafetyScore,
  validateStatusChange,
  validateUpdateDriver,
} from "../validators/driver.validator";
import {
  changeDriverStatus,
  createDriver as createDriverService,
  getDriverById as getDriverByIdService,
  listDrivers as listDriversService,
  listExpiringLicenses,
  updateDriver as updateDriverService,
  updateSafetyScore as updateSafetyScoreService,
} from "../services/driver.service";

export const createDriver = asyncHandler(async (req: Request, res: Response) => {
  const input = validateCreateDriver(req.body);
  const driver = await createDriverService(input);
  sendSuccess(res, 201, { driver });
});

export const listDrivers = asyncHandler(async (req: Request, res: Response) => {
  const query = parseDriverListQuery(req.query as Record<string, unknown>);
  const result = await listDriversService(query);
  sendSuccess(res, 200, result);
});

export const getExpiringLicenses = asyncHandler(
  async (req: Request, res: Response) => {
    const days = parseExpiringDays(req.query as Record<string, unknown>);
    const result = await listExpiringLicenses(days);
    sendSuccess(res, 200, result);
  },
);

export const getDriverById = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDriverByIdService(String(req.params.id));
  sendSuccess(res, 200, result);
});

export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
  const input = validateUpdateDriver(req.body);
  const driver = await updateDriverService(String(req.params.id), input);
  sendSuccess(res, 200, { driver });
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = validateStatusChange(req.body);
  const driver = await changeDriverStatus(String(req.params.id), status);
  sendSuccess(res, 200, { driver });
});

export const updateSafetyScore = asyncHandler(
  async (req: Request, res: Response) => {
    const { safety_score } = validateSafetyScore(req.body);
    const driver = await updateSafetyScoreService(String(req.params.id), safety_score);
    sendSuccess(res, 200, { driver });
  },
);
