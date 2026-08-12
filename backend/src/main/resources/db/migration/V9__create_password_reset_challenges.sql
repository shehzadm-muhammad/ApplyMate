CREATE TABLE password_reset_challenges (
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

    CONSTRAINT fk_password_reset_challenges_user
        FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_password_reset_challenges_user
        UNIQUE (user_id),

    CONSTRAINT chk_password_reset_challenges_failed_attempts
        CHECK (failed_attempts >= 0),

    CONSTRAINT chk_password_reset_challenges_issue_count
        CHECK (issue_count >= 1),

    CONSTRAINT chk_password_reset_challenges_expiry
        CHECK (expires_at > created_at)
);


CREATE INDEX idx_password_reset_challenges_expires_at
ON password_reset_challenges(expires_at);