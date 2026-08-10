ALTER TABLE app_users
ADD COLUMN email_verified_at TIMESTAMPTZ;

-- All accounts that existed before email verification was introduced
-- are considered legitimate existing accounts and remain usable.
UPDATE app_users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;


CREATE TABLE email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    code_hash VARCHAR(64) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    failed_attempts INTEGER NOT NULL DEFAULT 0,

    last_issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    issue_window_started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    issue_count INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_verification_codes_user
        FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_email_verification_codes_user
        UNIQUE (user_id),

    CONSTRAINT chk_email_verification_codes_failed_attempts
        CHECK (failed_attempts >= 0),

    CONSTRAINT chk_email_verification_codes_issue_count
        CHECK (issue_count >= 1),

    CONSTRAINT chk_email_verification_codes_expiry
        CHECK (expires_at > created_at)
);


CREATE INDEX idx_email_verification_codes_expires_at
ON email_verification_codes(expires_at);