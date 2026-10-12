-- ============================================================================
-- Flyway Migration V3: Consultation & Prescriptions (Ordonnances) Schema
-- CNDP Loi 09-08 Audit & Traceability Compliant
-- ============================================================================

-- 1. Consultations Table
CREATE TABLE consultations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL,
    appointment_id    UUID,
    motif             VARCHAR(255) NOT NULL,
    clinical_notes    TEXT,
    diagnosis         VARCHAR(255),
    blood_pressure    VARCHAR(50),
    weight_kg         NUMERIC(5, 2),
    heart_rate_bpm    INTEGER,
    version           BIGINT NOT NULL DEFAULT 0,

    -- CNDP (Loi 09-08) Audit Columns
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by        VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_consultations_patient_id ON consultations (patient_id);
CREATE INDEX idx_consultations_appointment_id ON consultations (appointment_id);
CREATE INDEX idx_consultations_created_at ON consultations (created_at);
CREATE INDEX idx_consultations_deleted_at ON consultations (deleted_at);

-- 2. Prescriptions (Ordonnances) Table
CREATE TABLE prescriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id   UUID NOT NULL,
    notes             TEXT,
    version           BIGINT NOT NULL DEFAULT 0,

    -- CNDP Audit Columns
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by        VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at        TIMESTAMPTZ,

    CONSTRAINT fk_prescriptions_consultation FOREIGN KEY (consultation_id)
        REFERENCES consultations (id) ON DELETE CASCADE
);

CREATE INDEX idx_prescriptions_consultation_id ON prescriptions (consultation_id);
CREATE INDEX idx_prescriptions_deleted_at ON prescriptions (deleted_at);

-- 3. Prescription Items (Lignes de Médicaments) Table
CREATE TABLE prescription_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id   UUID NOT NULL,
    medication_name   VARCHAR(255) NOT NULL,
    dosage            VARCHAR(100) NOT NULL,
    duration          VARCHAR(100) NOT NULL,
    instructions      VARCHAR(255),

    CONSTRAINT fk_prescription_items_prescription FOREIGN KEY (prescription_id)
        REFERENCES prescriptions (id) ON DELETE CASCADE
);

CREATE INDEX idx_prescription_items_prescription_id ON prescription_items (prescription_id);
