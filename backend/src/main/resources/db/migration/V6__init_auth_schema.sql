-- ============================================================================
-- Flyway Migration V6: Authentication, Authorization & Multi-Tenancy (SaaS)
-- CNDP Loi 09-08 Audit & Traceability Compliant
-- ============================================================================

-- 1. Clinics (Multi-Tenant Practices) Table
CREATE TABLE IF NOT EXISTS clinics (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150) NOT NULL,
    ice                 VARCHAR(15)  NOT NULL UNIQUE,
    subscription_status VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'SUSPENDED')),

    -- CNDP (Loi 09-08) Audit Columns
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clinics_ice ON clinics (ice);
CREATE INDEX IF NOT EXISTS idx_clinics_subscription_status ON clinics (subscription_status);
CREATE INDEX IF NOT EXISTS idx_clinics_deleted_at ON clinics (deleted_at);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id     UUID REFERENCES clinics(id) ON DELETE RESTRICT,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL CHECK (role IN ('SUPER_ADMIN', 'DOCTOR', 'SECRETARY')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,

    -- CNDP (Loi 09-08) Audit Columns
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by    VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users (clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

-- 3. Seed Default Clinic & Users for Development & Testing
INSERT INTO clinics (id, name, ice, subscription_status, created_by)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Clinique Ibn Sina Agadir',
    '001234567890123',
    'ACTIVE',
    'SYSTEM'
) ON CONFLICT (id) DO NOTHING;

-- Seed default users with BCrypt password for 'Dossia2026!'
INSERT INTO users (id, clinic_id, first_name, last_name, email, password_hash, role, is_active, created_by)
VALUES
    ('22222222-2222-2222-2222-222222222222', NULL, 'Admin', 'Dossia', 'admin@dossia.ma', '$2a$10$5/brK66MuMVQM95Qvf8X1.KOrHPXBZXs4fH8nxPwVP7iWcFmoWBXK', 'SUPER_ADMIN', TRUE, 'SYSTEM'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Rachid', 'Amrani', 'dr.amrani@dossia.ma', '$2a$10$5/brK66MuMVQM95Qvf8X1.KOrHPXBZXs4fH8nxPwVP7iWcFmoWBXK', 'DOCTOR', TRUE, 'SYSTEM'),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Amina', 'Benali', 'secretaire.amina@dossia.ma', '$2a$10$5/brK66MuMVQM95Qvf8X1.KOrHPXBZXs4fH8nxPwVP7iWcFmoWBXK', 'SECRETARY', TRUE, 'SYSTEM')
ON CONFLICT (email) DO NOTHING;

-- 4. Multi-Tenancy Scoping: Add clinic_id to existing tables
-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id UUID;
UPDATE patients SET clinic_id = '11111111-1111-1111-1111-111111111111' WHERE clinic_id IS NULL;
ALTER TABLE patients ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE patients ADD CONSTRAINT fk_patients_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients (clinic_id);

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id UUID;
UPDATE appointments SET clinic_id = '11111111-1111-1111-1111-111111111111' WHERE clinic_id IS NULL;
ALTER TABLE appointments ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments (clinic_id);

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS clinic_id UUID;
UPDATE invoices SET clinic_id = '11111111-1111-1111-1111-111111111111' WHERE clinic_id IS NULL;
ALTER TABLE invoices ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON invoices (clinic_id);

-- Consultations
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS clinic_id UUID;
UPDATE consultations SET clinic_id = '11111111-1111-1111-1111-111111111111' WHERE clinic_id IS NULL;
ALTER TABLE consultations ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE consultations ADD CONSTRAINT fk_consultations_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_consultations_clinic_id ON consultations (clinic_id);

-- Feuilles de Soins (CNSS)
ALTER TABLE feuilles_de_soins ADD COLUMN IF NOT EXISTS clinic_id UUID;
UPDATE feuilles_de_soins SET clinic_id = '11111111-1111-1111-1111-111111111111' WHERE clinic_id IS NULL;
ALTER TABLE feuilles_de_soins ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE feuilles_de_soins ADD CONSTRAINT fk_feuilles_de_soins_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_feuilles_de_soins_clinic_id ON feuilles_de_soins (clinic_id);
