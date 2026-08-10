-- Temporary compatibility default for the email-verification rollout.
--
-- During a zero-downtime deployment, an older ApplyMate instance may
-- briefly continue accepting registrations after V6 has been applied.
-- The old application does not know about email_verified_at, so this
-- default keeps those registrations usable.
--
-- The new backend explicitly persists NULL for newly registered users,
-- so those users still require email verification.

ALTER TABLE app_users
ALTER COLUMN email_verified_at
SET DEFAULT CURRENT_TIMESTAMP;