-- The zero-downtime email-verification rollout is complete.
-- Remove the temporary V7 compatibility default so future inserts
-- do not implicitly mark users as email verified.

ALTER TABLE app_users
ALTER COLUMN email_verified_at
DROP DEFAULT;