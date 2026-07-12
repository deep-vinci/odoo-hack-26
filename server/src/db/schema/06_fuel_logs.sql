CREATE TABLE fuel_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id   UUID NOT NULL REFERENCES vehicles(id),
    trip_id      UUID REFERENCES trips(id),
    liters       NUMERIC(10,2) NOT NULL CHECK (liters > 0),
    cost         NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
    filled_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer_km  NUMERIC(12,2),
    created_by   UUID NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
