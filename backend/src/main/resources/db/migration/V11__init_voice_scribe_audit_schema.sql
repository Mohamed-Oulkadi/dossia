-- ============================================================================
-- Flyway Migration V11: Medical Voice Scribe Audit & Latency Log Schema
-- CNDP Loi 09-08 Medical Privacy & Audit Trail Compliant (Zero-PII Audio)
-- Multi-Tenancy Scoped to Clinics
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_scribe_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id               UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    consultation_id         UUID REFERENCES consultations(id) ON DELETE SET NULL,
    language_code           VARCHAR(10) NOT NULL DEFAULT 'fr-FR',
    audio_duration_seconds  INTEGER,
    raw_transcript          TEXT,
    extracted_json          JSONB,
    processing_time_ms      BIGINT NOT NULL,

    -- CNDP (Loi 09-08) Audit Columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_scribe_logs_clinic_id ON ai_scribe_logs (clinic_id);
CREATE INDEX IF NOT EXISTS idx_ai_scribe_logs_consultation_id ON ai_scribe_logs (consultation_id);
CREATE INDEX IF NOT EXISTS idx_ai_scribe_logs_created_at ON ai_scribe_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_scribe_logs_deleted_at ON ai_scribe_logs (deleted_at);
