-- ============================================================================
-- Flyway Migration V9: Patient Document Vault & Medical Imaging (MinIO)
-- CNDP Loi 09-08 Medical Privacy & Audit Trail Compliant
-- Multi-Tenancy Scoped & Role-Based Visibility
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id     UUID REFERENCES consultations(id) ON DELETE SET NULL,
    original_filename   VARCHAR(255) NOT NULL,
    content_type        VARCHAR(100) NOT NULL CHECK (
        content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
    ),
    file_size_bytes     BIGINT NOT NULL,
    object_key          VARCHAR(500) UNIQUE NOT NULL,
    category            VARCHAR(50) NOT NULL CHECK (
        category IN ('BIOLOGIE', 'RADIOLOGIE_IMAGERIE', 'COMPTE_RENDU', 'ADMINISTRATIF_CNSS')
    ),
    visibility_level    VARCHAR(50) NOT NULL CHECK (
        visibility_level IN ('DOCTOR_ONLY', 'SHARED_SECRETARY')
    ),
    description         TEXT,

    -- CNDP (Loi 09-08) Audit Columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at          TIMESTAMPTZ
);

-- High-performance query indexes
CREATE INDEX IF NOT EXISTS idx_patient_documents_clinic_id ON patient_documents (clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_consultation_id ON patient_documents (consultation_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_category ON patient_documents (category);
CREATE INDEX IF NOT EXISTS idx_patient_documents_visibility ON patient_documents (visibility_level);
CREATE INDEX IF NOT EXISTS idx_patient_documents_deleted_at ON patient_documents (deleted_at);
