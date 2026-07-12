import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { parseReportFilters } from "../validators/report.validator";
import { getDashboard as getDashboardService } from "../services/dashboard.service";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req.query as Record<string, unknown>);
  const result = await getDashboardService(filters);
  sendSuccess(res, 200, result);
});
