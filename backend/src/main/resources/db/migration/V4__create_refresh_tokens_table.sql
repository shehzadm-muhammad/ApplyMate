CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    family_id UUID NOT NULL,

    token_hash CHAR(64) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_refresh_tokens_token_hash
        UNIQUE (token_hash),

    CONSTRAINT chk_refresh_tokens_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT chk_refresh_tokens_revoked_at
        CHECK (
            revoked_at IS NULL
            OR revoked_at >= created_at
        )
);

CREATE INDEX idx_refresh_tokens_user
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_family_active
    ON refresh_tokens(family_id)
    WHERE revoked_at IS NULL;

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);
