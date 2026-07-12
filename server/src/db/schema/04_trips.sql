CREATE TABLE trips (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_number       VARCHAR(20) NOT NULL UNIQUE,
    source            VARCHAR(255) NOT NULL,
    destination       VARCHAR(255) NOT NULL,
    vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
    driver_id         UUID NOT NULL REFERENCES drivers(id),
    cargo_weight_kg   NUMERIC(10,2) NOT NULL CHECK (cargo_weight_kg > 0),
    planned_distance_km NUMERIC(10,2) NOT NULL CHECK (planned_distance_km > 0),
    revenue           NUMERIC(14,2) DEFAULT 0,
    status            trip_status NOT NULL DEFAULT 'draft',
    start_odometer_km NUMERIC(12,2),
    end_odometer_km   NUMERIC(12,2),
    dispatched_at     TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    cancelled_at      TIMESTAMPTZ,
    created_by        UUID NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_odometer_km IS NULL OR start_odometer_km IS NULL OR end_odometer_km >= start_odometer_km)
);


CREATE UNIQUE INDEX uq_trips_active_vehicle ON trips(vehicle_id) WHERE status = 'dispatched';
CREATE UNIQUE INDEX uq_trips_active_driver  ON trips(driver_id)  WHERE status = 'dispatched';
CREATE INDEX idx_trips_status ON trips(status);
