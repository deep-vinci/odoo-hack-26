CREATE TABLE vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    name                VARCHAR(100) NOT NULL,
    type                vehicle_type NOT NULL,
    max_load_capacity_kg NUMERIC(10,2) NOT NULL CHECK (max_load_capacity_kg > 0),
    odometer_km         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
    acquisition_cost    NUMERIC(14,2) NOT NULL CHECK (acquisition_cost >= 0),
    region              VARCHAR(100),
    status              vehicle_status NOT NULL DEFAULT 'available',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type   ON vehicles(type);
