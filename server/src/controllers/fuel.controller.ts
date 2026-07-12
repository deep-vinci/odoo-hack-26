import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import {
  parseFuelLogListQuery,
  validateCreateFuelLog,
} from "../validators/fuel.validator";
import {
  createFuelLog as createFuelLogService,
  deleteFuelLog as deleteFuelLogService,
  listFuelLogs as listFuelLogsService,
} from "../services/fuel.service";

export const createFuelLog = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateCreateFuelLog(req.body);
  const fuel_log = await createFuelLogService(input, req.user.user_id);
  sendSuccess(res, 201, { fuel_log });
});

export const listFuelLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseFuelLogListQuery(req.query as Record<string, unknown>);
  const result = await listFuelLogsService(query);
  sendSuccess(res, 200, result);
});

export const deleteFuelLog = asyncHandler(async (req: Request, res: Response) => {
  await deleteFuelLogService(String(req.params.id));
  sendSuccess(res, 200, { message: "Fuel log deleted successfully" });
});
