import type { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import { ApiError } from "../utils/ApiError";

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    const body: ErrorBody = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    res.status(err.statusCode).json({ success: false, error: body });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
    return;
  }

  logger.error("Unhandled error", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
