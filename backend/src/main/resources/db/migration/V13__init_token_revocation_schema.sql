-- ============================================================================
-- Flyway Migration V13: JWT Token Revocation & Session Blacklist Schema
-- SEC-06: CWE-613 Insufficient Session Expiration Mitigation
-- Granular JTI Revocation + User-Level Instant Revocation Barrier
-- ============================================================================

CREATE TABLE IF NOT EXISTS revoked_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jti                 VARCHAR(64) NOT NULL UNIQUE,
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    reason              VARCHAR(100) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    revoked_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens (jti);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens (expires_at);

-- Add user-level revocation barrier timestamp to invalidate all prior tokens on password reset or account suspension
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_revoked_before TIMESTAMPTZ;
