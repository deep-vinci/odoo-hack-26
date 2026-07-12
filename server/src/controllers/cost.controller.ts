import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { asQueryDate } from "../validators/shared";
import { getVehicleCosts as getVehicleCostsService } from "../services/cost.service";

export const getVehicleCosts = asyncHandler(async (req: Request, res: Response) => {
  const from = asQueryDate(req.query.from_date) ?? null;
  const to = asQueryDate(req.query.to_date) ?? null;
  const result = await getVehicleCostsService(String(req.params.id), from, to);
  sendSuccess(res, 200, result);
});
