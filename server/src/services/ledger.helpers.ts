import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { isUuid } from "../utils/uuid";

export interface VehicleRef {
  id: string;
  registration_number: string;
  name: string;
}

export interface TripRef {
  id: string;
  trip_number: string;
}

const vehicleNotFound = (): ApiError =>
  ApiError.notFound("VEHICLE_NOT_FOUND", "Vehicle with the given ID does not exist");

const tripNotFound = (): ApiError =>
  ApiError.notFound("TRIP_NOT_FOUND", "Trip with the given ID does not exist");

export const resolveVehicleAndTrip = async (
  vehicleId: string,
  tripId: string | null,
): Promise<{ vehicle: VehicleRef; trip: TripRef | null }> => {
  if (!isUuid(vehicleId)) {
    throw vehicleNotFound();
  }

  const vehicleResult = await pool.query<VehicleRef>(
    "SELECT id, registration_number, name FROM vehicles WHERE id = $1",
    [vehicleId],
  );
  const vehicle = vehicleResult.rows[0];
  if (!vehicle) {
    throw vehicleNotFound();
  }

  if (!tripId) {
    return { vehicle, trip: null };
  }

  if (!isUuid(tripId)) {
    throw tripNotFound();
  }

  const tripResult = await pool.query<{ id: string; trip_number: string; vehicle_id: string }>(
    "SELECT id, trip_number, vehicle_id FROM trips WHERE id = $1",
    [tripId],
  );
  const trip = tripResult.rows[0];
  if (!trip) {
    throw tripNotFound();
  }

  if (trip.vehicle_id !== vehicleId) {
    throw new ApiError(
      422,
      "TRIP_VEHICLE_MISMATCH",
      `Trip ${trip.trip_number} does not belong to vehicle ${vehicle.registration_number}`,
    );
  }

  return { vehicle, trip: { id: trip.id, trip_number: trip.trip_number } };
};
