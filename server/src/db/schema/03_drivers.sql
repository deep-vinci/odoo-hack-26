CREATE TABLE drivers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    license_number      VARCHAR(50) NOT NULL UNIQUE,
    license_category    VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number      VARCHAR(20) NOT NULL,
    safety_score        NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status              driver_status NOT NULL DEFAULT 'available',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry_date);
