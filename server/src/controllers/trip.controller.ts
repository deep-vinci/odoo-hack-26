import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import {
  parseTripListQuery,
  validateCancelTrip,
  validateCompleteTrip,
  validateCreateTrip,
  validateDispatchTrip,
} from "../validators/trip.validator";
import {
  cancelTrip as cancelTripService,
  completeTrip as completeTripService,
  createTrip as createTripService,
  dispatchTrip as dispatchTripService,
  getTripById as getTripByIdService,
  listTrips as listTripsService,
} from "../services/trip.service";

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateCreateTrip(req.body);
  const trip = await createTripService(input, req.user.user_id);
  sendSuccess(res, 201, { trip });
});

export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  const query = parseTripListQuery(req.query as Record<string, unknown>);
  const result = await listTripsService(query);
  sendSuccess(res, 200, result);
});

export const getTripById = asyncHandler(async (req: Request, res: Response) => {
  const result = await getTripByIdService(String(req.params.id));
  sendSuccess(res, 200, result);
});

export const dispatchTrip = asyncHandler(async (req: Request, res: Response) => {
  const input = validateDispatchTrip(req.body);
  const result = await dispatchTripService(String(req.params.id), input);
  sendSuccess(res, 200, result);
});

export const completeTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateCompleteTrip(req.body);
  const result = await completeTripService(
    String(req.params.id),
    input,
    req.user.user_id,
  );
  sendSuccess(res, 200, result);
});

export const cancelTrip = asyncHandler(async (req: Request, res: Response) => {
  validateCancelTrip(req.body);
  const result = await cancelTripService(String(req.params.id));
  sendSuccess(res, 200, result);
});
