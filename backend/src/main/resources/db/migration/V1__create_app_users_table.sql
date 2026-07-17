CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_app_users_email_not_blank
        CHECK (btrim(email) <> ''),

    CONSTRAINT chk_app_users_first_name_not_blank
        CHECK (btrim(first_name) <> ''),

    CONSTRAINT chk_app_users_last_name_not_blank
        CHECK (btrim(last_name) <> '')
);

CREATE UNIQUE INDEX uq_app_users_email_lower
    ON app_users (LOWER(email));