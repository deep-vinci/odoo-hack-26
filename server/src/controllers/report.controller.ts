import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { asQueryString } from "../validators/shared";
import {
  REPORT_NAMES,
  isReportName,
  parseDays,
  parseMonths,
  parseReportFilters,
} from "../validators/report.validator";
import {
  getCostTrend,
  getFuelEfficiencyReport,
  getOperationalCostsReport,
  getUtilizationTrend,
  getVehicleRoiReport,
} from "../services/report.service";
import { buildExport } from "../services/export.service";

export const fuelEfficiency = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req.query as Record<string, unknown>);
  sendSuccess(res, 200, await getFuelEfficiencyReport(filters));
});

export const operationalCosts = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req.query as Record<string, unknown>);
  sendSuccess(res, 200, await getOperationalCostsReport(filters));
});

export const vehicleRoi = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req.query as Record<string, unknown>);
  sendSuccess(res, 200, await getVehicleRoiReport(filters));
});

export const utilizationTrend = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, await getUtilizationTrend(parseDays(req.query.days)));
});

export const costTrend = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, await getCostTrend(parseMonths(req.query.months)));
});

export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const report = asQueryString(req.query.report);
  if (!isReportName(report)) {
    throw new ApiError(
      422,
      "INVALID_REPORT_NAME",
      `Report must be one of: ${REPORT_NAMES.join(", ")}`,
    );
  }

  const filters = parseReportFilters(req.query as Record<string, unknown>);
  const { filename, csv } = await buildExport(report, filters);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});
