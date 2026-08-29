## Current Status

* **Current phase:** Final Handoff & Store Submission Readiness
* **Stable branch:** `main`
* **Finalisation branch:** `release/final-handoff-store-readiness`
* **Previous release:** `v1.7.0`
* **Current release:** `v1.8.0`
* **v1.7.0 baseline:** `092f523427a19b8b55896d2701fe000249221dac`
* **Production Flyway version:** `V9`
* **Store marketing version:** `1.0.0`
* **Clean-clone frontend:** `PASS`
* **Backend Maven clean verify:** `144/144 PASS`
* **Production Docker validation:** `PASS`
* **Android production AAB:** `PASS`
* **iOS Simulator native build:** `PASS`
* **Production Gmail gate:** `PASS / OFF`
* **Production API:** `UP`
* **Production health:** `UP`

ApplyMate feature development is complete. v1.8.0 finalises handoff, store-build validation, compliance documentation and safe public Gmail gating without adding a backend Gmail endpoint or database migration.

Google unrestricted public Gmail access remains externally gated by restricted-scope verification.

# July 2026

## 12 July 2026 — Project Initialisation

### Completed

- Created the ApplyMate React Native project using Expo and TypeScript.
- Added the initial application entry point.
- Added ApplyMate branding and colour theme.
- Created the splash screen.
- Started the authentication navigation flow.
- Created the Git repository and GitHub repository.

### Outcome

ApplyMate had a working React Native foundation with a defined visual identity and navigation structure.

---

## 13 July 2026 — Authentication Interface

### Completed

- Created reusable authentication UI components.
- Added reusable text-input components.
- Built registration and login screens.
- Added client-side form validation.
- Added touched-field validation.
- Connected authentication screens to navigation.

### Outcome

The frontend authentication experience was visually and structurally complete before backend authentication existed.

---

## 14 July 2026 — Application Tracking Screens

### Completed

- Built the applications list screen.
- Built the application-details screen.
- Added the initial application data model.
- Added navigation between application records and detail views.
- Continued developing application-management flows.

### Outcome

Users could navigate through the primary job-application tracking interface.

---

## 16 July 2026 — Frontend MVP Completed

### Completed

- Completed the first frontend MVP.
- Added dashboard functionality.
- Added application creation and editing flows.
- Added profile and settings screens.
- Added reminders and local notifications.
- Added protected and public navigation flows.
- Added local frontend persistence.
- Tagged the completed frontend milestone.

### Outcome

The complete mobile application interface could be demonstrated independently before backend integration.

---

## 17 July 2026 — Backend Foundation

### Completed

- Created the Spring Boot backend under `backend/`.
- Configured Java and Maven.
- Added the API status endpoint.
- Added PostgreSQL 17 through Docker Compose.
- Added persistent local PostgreSQL storage.
- Added a PostgreSQL health check.
- Configured Spring Data JPA.
- Configured Flyway.
- Created the `app_users` table.
- Implemented user registration.
- Added password hashing.
- Implemented login authentication.
- Added JWT access-token generation and validation.
- Added the authenticated current-user endpoint.
- Created the initial job-application database schema.

### Outcome

ApplyMate gained a working backend, persistent PostgreSQL database and stateless JWT authentication.

---

## 18–22 July 2026 — Authentication and Application API Development

### Completed

- Protected backend routes using Spring Security.
- Added authenticated job-application endpoints.
- Connected applications to their owning users.
- Added request and response DTOs.
- Added entity-to-response mapping.
- Added service and repository layers.
- Added application creation and listing.
- Added application detail retrieval.
- Added application updating.
- Added application deletion.
- Added authenticated-user resolution.
- Added ownership checks.

### Outcome

The backend could securely manage application records for individual authenticated users.

---

## 23 July 2026 — Backend MVP Completed

### Completed

- Completed the job-application CRUD API.
- Added application ownership protection.
- Prevented users from accessing another user's records.
- Added application filtering by status.
- Added case-insensitive application search.
- Added dashboard summary counts.
- Added consistent API error responses.
- Added centralised exception handling.
- Added authentication and application smoke testing.
- Completed the backend MVP.
- Merged the backend work into `main`.

### Outcome

The Spring Boot backend provided all server functionality required by the initial mobile MVP.

---

## 24 July 2026 — Frontend API Integration

### Completed

- Migrated job-application data from frontend-only storage to the Spring Boot API.
- Added a central frontend API client.
- Added environment-based API URL configuration.
- Added JWT bearer authentication.
- Added Expo SecureStore token storage.
- Added browser fallback storage.
- Connected registration to the backend.
- Connected login to the backend.
- Connected current-user profile loading.
- Connected application CRUD to the backend.
- Preserved reminders and device preferences locally at this stage.

### Outcome

Application data now flowed end to end:

```text
React Native
    -> Spring Boot
    -> PostgreSQL
```

The backend became the system of record for accounts and job applications.

---

## 25 July 2026 — Dashboard Summary Integration

### Completed

Connected the dashboard to:

```text
GET /api/v1/applications/summary
```

- Replaced locally calculated dashboard totals.
- Verified summary counts were user-scoped.
- Preserved the dashboard design.

### Outcome

Dashboard statistics were generated from authoritative backend data.

---

## 28 July 2026 — MVP Polish Completed

### Frontend

- Added dashboard loading states.
- Added dashboard error states.
- Added pull-to-refresh.
- Added search.
- Added status filtering.
- Added sorting controls.
- Improved API error presentation.

### Backend

- Strengthened application validation.
- Added validation tests.
- Added controller tests.
- Added explicit user-isolation tests.
- Improved test formatting and organisation.

### Repository

- Added project documentation.
- Added roadmap and backlog.
- Merged frontend API integration and MVP polish.
- Created release tag:

```text
v1.1.0-mvp
```

### Outcome

The integrated ApplyMate MVP was complete and ready for deployment-readiness work.

---

## 28 July 2026 — Deployment & Production Readiness

### Documentation

- Reviewed repository documentation.
- Expanded architecture documentation.
- Added the API reference.
- Updated project context and roadmap.
- Added the root README.
- Corrected repository licensing information.

### Continuous Integration

Added GitHub Actions validation for:

```text
Frontend checks
Backend tests/package
Backend Docker image
```

Frontend CI includes:

```text
npm ci
TypeScript validation
Expo web export
```

Backend CI includes:

```text
Java 21
PostgreSQL
Maven tests
Maven packaging
```

Docker CI verifies the production container.

### Production Configuration

- Added the production Spring profile.
- Added environment-based PostgreSQL configuration.
- Added environment-based JWT configuration.
- Added platform-provided server-port support.
- Added production CORS configuration.
- Restricted Actuator exposure.
- Disabled destructive Flyway cleaning in production.
- Added connection-pool configuration.

### Containerisation

- Added a multi-stage Java Dockerfile.
- Added a non-root `applymate` runtime user.
- Added `/actuator/health` Docker health checking.
- Added `.dockerignore`.
- Prevented local secrets and unnecessary files entering the image.
- Verified Docker startup locally.

### Outcome

ApplyMate gained repeatable CI and a production-ready backend image.

---

## 29 July 2026 — Neon Production Database

### Completed

- Created the Neon production PostgreSQL project.
- Created the `applymate` database.
- Used PostgreSQL 17.
- Selected a European region.
- Required SSL.
- Kept database credentials outside source control.
- Preserved standard PostgreSQL/JDBC portability.

### Outcome

ApplyMate gained a hosted production database.

---

## 29 July 2026 — Render Production Backend

### Completed

- Created the Render Docker web service.
- Connected Render to the ApplyMate GitHub repository.
- Configured deployment from `main`.
- Configured `backend/Dockerfile`.
- Added production environment variables.
- Configured:

```text
/actuator/health
```

as the Render health endpoint.

- Connected Render to Neon.
- Confirmed Flyway startup.
- Confirmed the HTTPS service became live.

Production API:

```text
https://applymate-api-bami.onrender.com
```

### Outcome

ApplyMate's Spring Boot backend became publicly accessible over HTTPS.

---

## 29 July 2026 — Production Backend Smoke Testing

Verified:

- Registration
- Duplicate-registration rejection
- Login
- Invalid-password rejection
- JWT authentication
- Current-user profile
- Validation
- Application creation
- Application listing
- Application details
- Application editing
- Search
- Status filtering
- Dashboard summary
- Application deletion
- Unauthenticated-request rejection
- Cross-user isolation
- Test-data cleanup

Public endpoints returned:

```text
/api/v1/status   -> UP
/actuator/health -> UP
```

### Outcome

The Render + Neon backend passed the production workflow.

---

## 29 July 2026 — Mobile Production Integration

Configured:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

Verified from the mobile application:

- Production registration
- Login
- JWT storage
- User-profile loading
- Application creation
- Dashboard updates
- Application editing
- Search
- Filtering
- Logout
- Login after restart
- Neon persistence
- Application deletion

### Outcome

The complete production path worked:

```text
Expo mobile application
    -> Render
    -> Neon PostgreSQL
```

---

# August 2026

## 29 July–8 August 2026 — Mobile Distribution & Release Readiness

### Expo Application Services

- Connected ApplyMate to Expo Application Services.
- Configured `eas.json`.
- Added development, preview and production profiles.
- Configured environment separation.
- Enabled remote native versioning.
- Configured production build behaviour.

### Permanent Identifiers

```text
Android:
com.zaib367.applymate

iOS:
com.zaib367.applymate
```

### Production API

Preview and production environments use:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

### Android

- Created Android internal-distribution builds.
- Installed standalone builds.
- Tested against the Render production API.
- Confirmed production functionality outside Expo Go.

### iOS

- Configured the permanent bundle identifier.
- Continued development testing through Expo Go.
- Deferred TestFlight/App Store distribution pending paid Apple Developer Program enrolment.

### Expo Doctor

Final result:

```text
18/18 checks passed
```

### Outcome

ApplyMate gained a repeatable Android distribution pipeline.

---

## Backend Reminder Synchronisation

### Completed

- Migrated reminder records from local persistence to Spring Boot.
- Added PostgreSQL reminder persistence.
- Added Flyway migration V3.
- Added authenticated reminder CRUD.
- Scoped reminders to users.
- Preserved local notification scheduling.
- Associated local notification identifiers with users.
- Verified reminder isolation using two separate accounts.

Architecture:

```text
Reminder data
    -> Spring Boot
    -> PostgreSQL

Notification delivery
    -> Expo Notifications
    -> Device OS
```

### Outcome

Reminder data now follows the authenticated account while notification scheduling remains device-side.

---

## 3–7 August 2026 — Persistent Session Authentication

### Problem

The original implementation depended only on short-lived JWT access tokens.

Users would eventually need to authenticate again.

### Backend

Added:

- Refresh-token persistence
- Flyway V4
- Flyway V5
- Opaque random refresh tokens
- SHA-256 refresh-token hashes
- Session expiry
- Session revocation
- Refresh-token families
- Token rotation
- Reuse handling
- Pessimistic locking
- Backend logout revocation

Production configuration:

```text
Access token:    1 hour
Refresh session: 30 days
```

Added:

```text
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Mobile

- Extended SecureStore token storage.
- Added refresh-token handling.
- Added automatic refresh after authenticated `401`.
- Added protected-request retry.
- Added shared refresh coordination.
- Added session restoration.
- Improved network/server-failure handling.
- Updated logout to revoke backend sessions.

### Controlled Expiry Test

Temporarily reduced the local access-token lifetime to:

```text
1 minute
```

Verified:

- User remained signed in.
- Access token expired naturally.
- Refresh occurred automatically.
- New access token was issued.
- Refresh token rotated.
- Protected request retried successfully.
- No unnecessary login prompt appeared.

### Production Verification

Verified against Render and Neon:

```text
Login                    PASS
Access token             PASS
Refresh token            PASS
Refresh endpoint         PASS
Token rotation           PASS
Logout                   PASS
Session revocation       PASS
```

### Outcome

ApplyMate gained persistent authenticated mobile sessions.

---

## 7–8 August 2026 — Account Deletion

### Backend

Added:

```text
DELETE /api/v1/users/me
```

The account ID is derived from the JWT rather than client input.

Deletion removes user-owned backend data.

### Mobile

Added:

```text
Profile -> Delete Account
```

with two confirmation prompts.

Successful deletion:

- Cancels local notifications.
- Clears reminder notification identifiers.
- Clears local account settings.
- Removes authentication tokens.
- Clears authenticated user state.
- Returns to Welcome.

### Production Verification

Verified:

```text
Account deleted                 PASS
Applications/reminders deleted  PASS
Refresh sessions removed        PASS
Local tokens removed            PASS
Returned to Welcome             PASS
Old credentials rejected        PASS
```

### Outcome

ApplyMate gained permanent self-service account deletion.

---

## 8 August 2026 — Privacy & Account-Deletion Pages

Created public support contact:

```text
support.applymate@gmail.com
```

Added GitHub Pages:

```text
docs/index.html
docs/privacy-policy.html
docs/delete-account.html
```

Public site:

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

Privacy Policy:

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

Account-deletion information:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

The Profile screen links to the public Privacy Policy.

### Outcome

ApplyMate gained public privacy and deletion information for future store-readiness.

---

## 8 August 2026 — Android Release Candidate Verification

The Android internal-distribution build was tested against production.

Verified:

- Application launch
- Login
- Dashboard
- Existing application data
- Application create/edit/delete
- Reminder creation
- Reminder persistence
- Persistent authentication
- Privacy Policy access
- Delete Account UI
- Logout
- Logged-out state after reopening

### Outcome

Mobile Distribution & Release Readiness was completed.

The release was closed as:

```text
v1.3.0
```

---

# Email Verification Feature

## 8–10 August 2026 — Email Verification Backend Development

A new feature branch was created for production email verification.

### Database

Added Flyway:

```text
V6__add_email_verification.sql
```

V6 introduced:

```text
app_users.email_verified_at
email_verification_codes
```

Existing users were backfilled as verified.

This prevented accounts created before the feature existed from being locked out.

New registrations remain unverified.

### Verification Challenge Storage

The challenge table stores:

- User ID
- Verification-code hash
- Expiry
- Failed-attempt count
- Last issue time
- Rate-limit window
- Issue count
- Creation/update timestamps

Only one current verification challenge exists per user.

### Verification-Code Security

Implemented:

```text
6 numeric digits
SecureRandom
HMAC-SHA-256
server-side pepper
```

Raw codes are never stored.

The HMAC input includes:

```text
userId + ":" + code
```

The production pepper is separate from JWT configuration.

### Verification Rules

```text
Code TTL:                 10 minutes
Maximum failed attempts:  5
Resend cooldown:          60 seconds
Issue window:             1 hour
Maximum issues/window:    5
```

Resend generates a replacement challenge.

The previous code becomes invalid.

### API

Added:

```text
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
```

Registration was changed to return verification metadata rather than authentication tokens.

### Login Protection

Login behaviour became:

```text
Correct password
    |
    v
Check email verification
    |
    ├── unverified
    │      -> 403 EMAIL_VERIFICATION_REQUIRED
    │      -> no tokens
    │
    └── verified
           -> normal login
```

Incorrect passwords remain generic `401` responses.

### Refresh Protection

Refresh-token access was also hardened.

An unverified account cannot use an existing/synthetic refresh session to bypass email verification.

The refresh session is revoked and authenticated access is refused.

### Structured Verification Errors

Added machine-readable errors including:

```text
EMAIL_VERIFICATION_REQUIRED
VERIFICATION_CODE_INCORRECT
VERIFICATION_CODE_EXPIRED
VERIFICATION_ATTEMPTS_EXCEEDED
VERIFICATION_RESEND_COOLDOWN
VERIFICATION_RATE_LIMITED
VERIFICATION_EMAIL_UNAVAILABLE
```

`ApiErrorResponse` was expanded with:

```text
code
retryAfterSeconds
```

Applicable `429` responses also return the HTTP `Retry-After` header.

---

## Resend Transactional Email Integration

Added backend abstraction:

```text
VerificationEmailSender
```

Implemented:

```text
ResendVerificationEmailSender
UnavailableVerificationEmailSender
```

Production configuration uses:

```text
EMAIL_PROVIDER=resend
```

Email delivery uses Spring `RestClient`.

Email content includes:

- Six-digit verification code
- Verification expiry information
- Plain-text body
- HTML body

No verification code, API key or provider response body is intentionally logged.

---

## Production Email Domain

Purchased:

```text
applymate.website
```

The domain was configured in Resend.

DNS configuration included:

- DKIM
- SPF
- DMARC
- Resend mail-routing records

Resend reported the domain as:

```text
Verified
```

Production sender:

```text
ApplyMate <verify@applymate.website>
```

Real delivery from the custom domain was tested successfully before production rollout.

---

## Frontend Email Verification

Added:

```text
src/screens/VerifyEmailScreen.tsx
src/services/pendingVerificationStorage.ts
```

### Registration Flow

```text
Register
   |
   v
Backend creates unverified account
   |
   v
Mobile stores pending verification state
   |
   v
Verify Email screen
```

### Pending State

Stored locally:

```text
email
verificationExpiresAt
resendAvailableAt
```

Not stored:

```text
password
verification code
JWT
refresh token
```

### Verify Email Screen

Implemented:

- Six-digit numeric input
- Verify action
- Resend action
- Countdown
- API retry timing
- Generic failure handling
- Return-to-login flow

### Restart Recovery

If the user closes the application before verification completes:

```text
App restart
    |
    v
Load pending verification
    |
    v
Return directly to Verify Email
```

### Unverified Login Recovery

If the user attempts normal login before verification:

```text
EMAIL_VERIFICATION_REQUIRED
       |
       v
Verify Email screen
```

### Manual Device Testing

Verified locally:

- Registration
- Real verification email
- Code verification
- Login after verification
- App-restart recovery
- Incorrect code handling
- Resend countdown
- Resent email delivery
- Old-code invalidation
- New-code acceptance
- Unverified-login redirect

---

## Email Verification Automated Testing

Backend coverage was expanded substantially.

Tests covered:

- HMAC code security
- Verification expiry
- Incorrect attempts
- Maximum-attempt enforcement
- Resend cooldown
- Issuance rate limiting
- Replacement-code invalidation
- Verification transaction behaviour
- Registration delivery failure
- Resend provider integration
- Unverified login
- Unverified refresh protection
- Migration compatibility
- Controller/API behaviour

Before the later production hotfix, the suite reached:

```text
86 tests
0 failures
0 errors
```

Frontend TypeScript validation also passed.

GitHub CI passed:

```text
Frontend checks
Backend tests/package
Backend Docker image
```

---

# Production Email Verification Rollout

## 10 August 2026 — PR #6 and Controlled Production Deployment

Feature commit:

```text
0b1996b feat: add email verification
```

Merged through PR:

```text
#6
```

Resulting `main` commit:

```text
47b86c7
```

Render auto-deployment was deliberately disabled so production migration timing remained controlled.

Production environment variables were prepared for:

```text
EMAIL_PROVIDER
EMAIL_FROM
RESEND_API_KEY
EMAIL_VERIFICATION_PEPPER
```

Secret values were kept out of Git and documentation.

A Neon backup/snapshot was taken before database migration.

---

## Flyway V6 and V7 Production Migration

The production deployment started from:

```text
Current schema: V5
```

Flyway successfully applied:

```text
V6 - add email verification
V7 - preserve legacy registration during email verification rollout
```

Result:

```text
Schema version: V7
```

### Why V7 Existed

During a zero-downtime deployment, an older backend instance could temporarily continue receiving registrations after V6 had changed the schema.

V7 temporarily configured:

```text
email_verified_at DEFAULT CURRENT_TIMESTAMP
```

so registrations performed by an old application version remained usable.

The new backend explicitly persisted:

```text
NULL
```

so registrations handled by the new code still required verification.

---

## Existing-User Compatibility Verification

After V6/V7:

```text
total users:    7
verified users: 7
```

Existing accounts successfully logged in.

This proved the V6 backfill prevented legacy-account lockout.

Production status remained:

```text
/api/v1/status   -> UP
/actuator/health -> UP
```

---

# Production Email Delivery Incident

## 11 August 2026 — Initial Production Registration Failure

The first brand-new production registration created:

```text
app_users row                  PASS
email_verified_at = NULL      PASS
verification challenge        PASS
verification email delivery   FAIL
```

The mobile client displayed an unexpected error.

Retrying registration correctly returned that the account already existed because the account transaction had already committed.

Neon showed:

```text
email_verified_at = NULL
verification challenge exists
failed_attempts = 0
issue_count = 1
```

No email appeared in Resend.

---

## Root Cause

A controlled resend request returned:

```text
500 Internal Server Error
```

Render logs identified:

```text
IllegalArgumentException:
Illegal character(s) in message header value
```

The production `RESEND_API_KEY` contained an invalid hidden character.

Java rejected the malformed Authorization header before the request reached Resend.

### Security Observation

The underlying Java exception included the malformed Authorization value.

This caused the old production API key to appear in the Render exception log.

### Immediate Response

- The affected Resend API key was treated as compromised.
- The key was revoked.
- A new production key was generated.
- The new value was saved securely in Render.
- No replacement key was placed in source control or chat/documentation.

After deployment with the corrected credential:

```text
POST /api/v1/auth/resend-verification
-> 202 Accepted
```

Resend successfully delivered the email.

The existing unverified production account was recovered through the normal verification flow.

Verified:

```text
Unverified login rejected       PASS
Verify Email screen             PASS
Resend                          PASS
New email delivered             PASS
Verification                   PASS
Login                          PASS
JWT storage                    PASS
Dashboard                      PASS
```

---

# Resend Secret-Safety Hotfix

## 11 August 2026 — Security Hardening

Created branch:

```text
fix/resend-secret-safety
```

Hotfix commit:

```text
2647a71
fix: harden resend secret handling
```

### Changes

- Normalised leading/trailing API-key whitespace.
- Rejected embedded whitespace/control characters.
- Prevented invalid API-key errors from echoing the secret.
- Converted request-construction failures into the safe email-delivery error path.
- Avoided retaining sensitive HTTP-header exceptions in the resulting exception chain.
- Preserved the existing safe:

```text
503 VERIFICATION_EMAIL_UNAVAILABLE
```

behaviour.

### Regression Tests

Added tests for:

- Outer API-key whitespace normalisation
- Embedded invalid-character rejection
- Safe error messages
- Simulated header-construction exceptions
- Ensuring the sensitive value is not retained in the safe exception

Sender test result:

```text
Tests run: 8
Failures: 0
Errors: 0
```

Full backend suite became:

```text
Tests run: 89
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

GitHub CI passed all three jobs.

---

## PR #7 — Hotfix Merge

Merged:

```text
PR #7
```

Resulting `main` commit:

```text
310cfd3
```

The exact commit was manually deployed to Render.

Production remained healthy:

```text
/api/v1/status   -> UP
/actuator/health -> UP
```

A fresh real production registration then verified:

```text
Registration email
    -> verify@applymate.website
    -> real inbox
    -> verification
    -> login
    -> dashboard
```

The hotfix therefore passed production smoke testing.

---

# Flyway Rollout Cleanup

## 11 August 2026 — V8

Once the old backend rollout window was fully closed, V7's temporary default was no longer required.

Created migration:

```text
V8__remove_email_verification_rollout_default.sql
```

V8 performs:

```sql
ALTER TABLE app_users
ALTER COLUMN email_verified_at
DROP DEFAULT;
```

### Updated Migration Testing

The migration integration test now verifies:

- `email_verified_at` has no database default.
- A direct insert omitting `email_verified_at` remains unverified.
- Normal ApplyMate registration remains unverified.
- A verification challenge is created.

Migration test:

```text
Tests run: 1
Failures: 0
Errors: 0
```

Full backend suite:

```text
Tests run: 89
Failures: 0
Errors: 0
BUILD SUCCESS
```

---

## PR #8 — V8 Merge

V8 commit:

```text
8de66b5
chore: remove email verification rollout default
```

Merged through:

```text
PR #8
```

Resulting `main` commit:

```text
beca795
```

All GitHub CI jobs passed.

---

## V8 Production Deployment

Production began at:

```text
Schema V7
```

Flyway reported:

```text
Successfully validated 8 migrations
Current version: 7

Migrating:
8 - remove email verification rollout default

Successfully applied 1 migration
Current version: V8
```

Spring Boot started successfully and Render marked the service live.

### Final Neon Verification

Production schema:

```text
email_verified_at
column_default = NULL
is_nullable    = YES
```

Flyway history:

```text
version:     8
description: remove email verification rollout default
success:     true
```

### Final Production Health

```text
GET /api/v1/status
-> UP

GET /actuator/health
-> UP
```

---

# Email Verification Final Outcome

The final production flow is:

```text
User registers
      |
      v
app_users
email_verified_at = NULL
      |
      v
Verification challenge created
      |
      v
HMAC-protected code stored
      |
      v
Resend
      |
      v
verify@applymate.website
      |
      v
User inbox
      |
      v
POST /verify-email
      |
      v
email_verified_at = timestamp
      |
      v
Normal login
      |
      v
JWT + refresh session
      |
      v
ApplyMate dashboard
```

Existing pre-feature users remained usable.

New users must verify their email.

Unverified users cannot bypass verification through either login or refresh-token access.

---

# Password Reset Feature

## 11–13 August 2026 — Password Reset Architecture & Backend

Password Reset was selected as the next authentication feature after the `v1.4.0` Email Verification release.

Development branch:

```text
feat/password-reset
```

### Architecture Decisions

The implementation deliberately reused existing authentication infrastructure instead of creating a parallel authentication system.

Key decisions:

* Keep the existing JWT and rotating refresh-token architecture.
* Align the production access-token default to 15 minutes.
* Keep refresh sessions at 30 days.
* Revoke every active refresh-token session after a successful password reset.
* Do not introduce a JWT blacklist or token-version system.
* Reuse the existing password encoder.
* Use a separate `PASSWORD_RESET_PEPPER`.
* Reuse the hardened Resend transport rather than implementing a second independent email client.
* Keep reset-code failures generic to avoid exposing internal challenge state.
* Allow unverified users to reset their password without marking the account verified.
* Keep password confirmation frontend-only.
* Avoid unnecessary class/file proliferation.

Production session configuration became:

```text
Access token:    15 minutes
Refresh session: 30 days
```

### Flyway V9

Added:

```text
V9__create_password_reset_challenges.sql
```

V9 introduced:

```text
password_reset_challenges
```

The table stores:

* User ID
* Reset-code HMAC
* Expiry
* Failed-attempt count
* Last-issued time
* Issue-window start
* Issue count
* Creation/update timestamps

Only one active reset challenge exists per user.

The user relationship uses cascade deletion.

Raw reset codes are never persisted.

### Reset-Code Security

Implemented:

```text
6 numeric digits
SecureRandom
HMAC-SHA-256
separate password-reset pepper
```

The HMAC input is domain-separated and user-bound:

```text
password-reset:<userId>:<rawCode>
```

The production password-reset pepper:

* Is separate from `EMAIL_VERIFICATION_PEPPER`
* Is separate from the JWT signing secret
* Is Base64 encoded
* Must decode to at least 32 bytes
* Exists only in backend environment configuration

Hash comparison uses constant-time byte comparison.

### Reset Rules

```text
Code TTL:                  10 minutes
Maximum failed attempts:   5
Resend cooldown:           60 seconds
Issue window:              1 hour
Maximum issues/window:     5
Minimum forgot response:   1 second
```

Resending replaces the current challenge and invalidates the previous code.

Successful reset deletes the challenge, making codes single-use.

### Account-Enumeration Protection

Added:

```text
POST /api/v1/auth/forgot-password
```

For syntactically valid email addresses, the public result remains:

```text
202 Accepted
```

regardless of:

* Whether an account exists
* Cooldown state
* Hourly issuance limit
* Email-provider failure

A minimum response-duration strategy reduces obvious timing differences between request paths.

### Password Reset API

Added:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Reset request:

```text
email
code
newPassword
```

Password confirmation remains mobile-only.

Invalid reset challenges use one public error:

```text
PASSWORD_RESET_CODE_INVALID_OR_EXPIRED
```

This covers missing, incorrect, expired, exhausted, consumed and otherwise unusable challenges without exposing the exact internal reason.

### Email-Delivery Transaction Behaviour

Reset-code delivery occurs inside the challenge-issuance transaction.

If delivery fails:

```text
Email provider failure
        |
        v
Transaction rollback
        |
        v
Challenge/cooldown/rate-limit mutation not committed
        |
        v
Public response remains 202
```

This prevents an email outage from consuming a reset attempt the user never received.

### Successful Reset Behaviour

A successful reset:

```text
Validate reset code
        |
        v
Encode new password
        |
        v
Update password
        |
        v
Revoke all refresh sessions
        |
        v
Delete reset challenge
        |
        v
Commit
        |
        v
Send password-changed notification
```

Password-changed notification failure does not roll back the successful password change.

Already-issued JWT access tokens are not blacklisted and expire normally within the production 15-minute lifetime.

### Unverified Accounts

Password reset is allowed for unverified accounts.

Resetting the password does not call:

```text
markEmailVerified
```

Therefore:

```text
Unverified account
      |
      v
Password reset
      |
      v
Still unverified
      |
      v
EMAIL_VERIFICATION_REQUIRED on login
```

---

## Shared Resend Transport

The existing production-tested Resend implementation was consolidated.

Added:

```text
ResendEmailClient
```

Responsibilities centralised there include:

* Resend HTTP configuration
* API-key validation
* Authorization header construction
* Connection/read timeouts
* Provider request execution
* Safe provider error conversion
* Secret-safe exception handling

Email-verification formatting remains in:

```text
ResendVerificationEmailSender
```

Password-reset formatting is handled by:

```text
PasswordResetEmailSender
```

The password-reset sender supports:

```text
Reset-code email
Password-changed notification
```

Both delegate provider transport to the same hardened client.

---

## Password Reset Mobile Flow

Added:

```text
src/screens/ForgotPasswordScreen.tsx
src/screens/ResetPasswordScreen.tsx
```

Updated:

```text
RootNavigator.tsx
navigation/types.ts
LoginScreen.tsx
authService.ts
types/api.ts
```

### Mobile Flow

```text
Login
  |
  v
Forgot Password
  |
  v
Send Code
  |
  v
Reset Password
  |
  v
Password changed
  |
  v
Login
```

The email address can be prefilled from the Login screen.

The reset screen provides:

* Six-digit numeric-code input
* New-password input
* Confirm-password input
* Password validation
* Resend action
* Local resend countdown
* Generic invalid/expired-code messaging

Sensitive reset data is not persisted.

The frontend does not store:

```text
reset code
new password
confirm password
```

### Local Device Testing

The initial Expo test still pointed to the existing production backend, so `/forgot-password` returned:

```text
Authentication is required
```

The development mobile app was then pointed to the local Spring Boot backend through the development laptop's LAN address.

Local API verification returned:

```text
POST /api/v1/auth/forgot-password
-> 202 Accepted
```

The mobile forgot/reset flow then worked successfully against the new backend.

Real reset and password-changed emails were also received during testing.

---

## Automated Password Reset Validation

Two focused test classes were added:

```text
PasswordResetServiceTest
PasswordResetTransactionIntegrationTest
```

Focused result:

```text
Tests run: 14
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Coverage includes:

* Existing-account reset issuance
* Unknown-email generic behaviour
* Six-digit reset-code generation
* HMAC code protection
* Incorrect reset code
* Expired reset code
* Maximum-attempt enforcement
* Resend cooldown
* Hourly issue limit
* Cross-user code isolation
* Successful password change
* Refresh-session revocation
* Replacement-code invalidation
* Single-use reset challenges
* Reset-email failure rollback
* Unverified-account state preservation
* Password-changed notification failure behaviour
* Old-password rejection
* New-password authentication

Complete backend suite:

```text
Tests run: 106
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Frontend validation:

```text
npm run typecheck
tsc --noEmit
PASS
```

---

## Password Reset Commits

Backend implementation:

```text
6c8cf63 feat: add secure password reset backend
```

Mobile implementation:

```text
74d3458 feat: add password reset mobile flow
```

Security/integration tests:

```text
a1a1aa1 test: cover password reset security flows
```

Feature branch was pushed and merged through:

```text
PR #10
```

Resulting production/main commit:

```text
d1e4d37
```

---

# Password Reset Production Deployment

## 13 August 2026 — Render & Flyway V9

Before production startup:

* A dedicated `PASSWORD_RESET_PEPPER` was generated.
* The secret was stored only in Render.
* No `JWT_ACCESS_TOKEN_TTL` override existed in Render.
* The new production configuration therefore used the `PT15M` access-token default.

### Initial Deployment Configuration Failure

The first production startup failed while constructing:

```text
PasswordResetService
```

with:

```text
PASSWORD_RESET_PEPPER must be valid Base64
```

Root cause:

```text
The Render PASSWORD_RESET_PEPPER value was malformed Base64.
```

The backend correctly failed closed rather than accepting invalid cryptographic configuration.

A new valid 32-byte Base64 secret was generated and stored in Render.

No source-code change was required.

### Successful Deployment

The following startup then succeeded:

```text
Java 21
Spring profile: prod
PostgreSQL 17 / Neon
Tomcat port: 10000
```

Flyway reported:

```text
Successfully validated 9 migrations
Current version of schema "public": 9
Schema "public" is up to date
```

The schema had already reached V9 during the earlier startup attempt before application bean construction failed.

Spring then completed startup and Render reported:

```text
Your service is live
```

### Production Health Verification

Verified:

```text
GET /api/v1/status
-> HTTP 200 / UP

GET /actuator/health
-> HTTP 200 / UP
```

The new unauthenticated route was verified using a nonexistent syntactically valid account:

```text
POST /api/v1/auth/forgot-password
-> HTTP 202 Accepted
```

This confirmed that the production password-reset route was public and enumeration-safe.

---

## Production Password Reset End-to-End Verification

A real production ApplyMate account was tested through the mobile application against Render, Neon and Resend.

Verified:

```text
Reset email received             PASS
Six-digit reset code             PASS
Password reset                   PASS
Old password rejected            PASS
New password accepted            PASS
Password-changed email received  PASS
```

Production path:

```text
Expo mobile application
        |
        v
Render Spring Boot API
        |
        +----> Neon PostgreSQL V9
        |
        +----> Resend
                 |
                 v
        Real recipient inbox
```

The password-reset feature therefore passed real production end-to-end verification.

---

# Password Reset Final Outcome

The final production flow is:

```text
User selects Forgot Password
        |
        v
POST /forgot-password
        |
        v
Password-reset challenge
        |
        v
HMAC-protected code stored
        |
        v
Resend reset email
        |
        v
User enters code + new password
        |
        v
POST /reset-password
        |
        v
Password changed
        |
        v
All refresh sessions revoked
        |
        v
Reset challenge deleted
        |
        v
Password-changed email
        |
        v
Normal login with new password
```

Production now provides both secure email verification and secure password recovery.

---

# Job Link Import Feature

## 14 August 2026 — Job Link Import Architecture Approval

Job Link Import was selected as the next product feature after the `v1.5.0` password-reset release.

Development branch:

```text
feat/job-link-import
```

The feature goal was:

```text
User pastes public job URL
        |
        v
Backend safely fetches page
        |
        v
Extract job details
        |
        v
Return editable preview
        |
        v
User reviews/corrects everything
        |
        v
Existing Save Application flow persists it
```

### Architecture Decisions

The approved MVP intentionally avoided unnecessary complexity.

Key decisions:

* No AI extraction.
* No Flyway migration.
* No separate preview screen.
* Reuse the existing Add Application form.
* The import endpoint must never persist an application automatically.
* JSON-LD Schema.org `JobPosting` extraction is attempted first.
* Deterministic HTML extraction is the fallback.
* LinkedIn and Indeed are intentionally unsupported.
* The user must review and explicitly save imported data.
* Status and notes remain user-controlled.
* Existing application save limits remain authoritative.

Additional safety requirements were agreed before implementation:

1. Normalise and truncate imported fields to existing application DTO/model limits.
2. Strip HTML and return safe plain text.
3. Require a minimum extraction-success threshold.
4. Canonicalise hostnames before SSRF/domain checks.
5. Never log full user-submitted URLs or query strings.
6. Enforce a 2 MiB response limit while streaming, including compressed content.
7. Keep the in-memory rate limiter bounded by removing expired entries.

### Development Workflow Reset

An initial patch-based implementation attempt proved brittle against the actual repository state.

The feature branch was therefore reset to the known-good `v1.5.0` baseline.

Verified baseline:

```text
Tests run: 106
Failures: 0
Errors: 0
BUILD SUCCESS
```

From that point, development proceeded only from the exact current files in the repository, with grouped checkpoints, validation commands and explicit stop conditions.

---

## 15–16 August 2026 — Secure Backend Job Import

### Stage A — API Contract

Added the initial import-preview contract:

```text
JobImportRequest
JobImportPreview
JobImportException
```

No existing production behaviour changed at this stage.

Baseline validation remained:

```text
106/106 tests passing
```

### Stage B1 — URL Canonicalisation and SSRF Validation

Implemented safe destination validation including:

* HTTP/HTTPS scheme enforcement
* URL parsing
* Hostname canonicalisation
* Lowercase host handling
* IDN/punycode handling
* Trailing-dot handling
* Domain/subdomain comparison
* Private-address rejection
* Loopback rejection
* Link-local rejection
* Unsafe destination rejection

Focused result:

```text
10/10 tests passing
```

Full backend result:

```text
116/116 tests passing
```

### Stage B2 — HTTP Fetching

Expanded `SafeJobPageFetcher` with actual HTTP behaviour.

Implemented:

* Explicit direct connections
* No inherited proxy use
* No user cookies
* No forwarded Authorization header
* Manual redirect handling
* Redirect target revalidation
* 4-second connection timeout
* 8-second read timeout
* 2 MiB streaming response limit
* Safe gzip/deflate handling
* Decompressed-size enforcement
* Supported content-type validation

Focused result:

```text
21/21 fetcher tests passing
```

Full backend result:

```text
127/127 tests passing
```

### Stage C — Structured Extraction

Added:

```text
jsoup 1.23.1
JobPageExtractor
```

Extraction priority:

```text
1. Schema.org JobPosting JSON-LD
2. HTML fallback
```

The extractor:

* Converts imported content to plain text
* Normalises fields
* Truncates fields to existing save limits
* Parses supported deadline formats
* Applies confidence thresholds
* Rejects arbitrary webpages that do not look sufficiently like job adverts
* Returns warnings for incomplete previews

A test exposed an ISO-date parsing issue for:

```text
2026-09-15T23:59:59Z
```

The date regex was corrected without broad parser changes.

Validation after the fix:

```text
8/8 extractor tests passing
29/29 fetcher + extractor tests passing
135/135 full backend tests passing
```

### Stage D — Service, Controller and Error Handling

Added:

```text
JobImportService
JobImportController
```

and integrated safe import errors into the existing global API error handler.

The endpoint became:

```text
POST /api/v1/applications/import-preview
```

The endpoint is protected automatically by the existing global Spring Security rules.

No `SecurityConfig` change was required.

The service added:

* Authenticated-user scoped import attempts
* 10 attempts per user per 10 minutes
* Bounded expired-entry cleanup
* Safe fetch/extraction orchestration
* Non-persistent preview generation

An ApplicationContext test failure identified that Spring could not choose the intended `JobImportService` constructor.

The public production constructor was explicitly marked for dependency injection while the package-private `Clock` constructor remained available for deterministic tests.

Final backend validation:

```text
Focused Job Link Import:
38/38 passing

Complete backend:
144/144 passing

Failures: 0
Errors:   0
```

No Flyway migration was added.

No `SecurityConfig` change was added.

No AI dependency was introduced.

### Backend Commit

Committed as:

```text
7c32417 feat: add secure job link import preview
```

---

## 17 August 2026 — Mobile Job Import Integration

The existing mobile application structure was preserved.

The React Native frontend lives at repository root under:

```text
src/
```

rather than a separate `frontend/` directory.

### Application Service

Added the import-preview client contract to:

```text
src/services/applicationService.ts
```

The existing central `apiRequest` client remained responsible for:

* Bearer authentication
* Access-token refresh
* Structured `ApiError`
* Retry behaviour
* Network error handling

No duplicate HTTP client was introduced.

### Add Application Form

Updated:

```text
src/components/ApplicationForm.tsx
src/screens/AddApplicationScreen.tsx
```

The existing form now supports:

```text
Paste public job URL
        |
        v
Import job details
        |
        v
POST /api/v1/applications/import-preview
        |
        v
Populate existing editable fields
        |
        v
User reviews/edits
        |
        v
Existing Save Application flow
```

Imported fields remain editable.

The importer deliberately does not overwrite:

```text
status
notes
```

Import warnings and safe backend errors are displayed in the form.

Failed imports still allow manual entry.

### Edit Application Boundary

`EditApplicationScreen.tsx` remained unchanged.

Job importing is opt-in from Add Application only.

This prevents the shared form from accidentally turning the Edit screen into a re-import workflow.

### Add Form Reset Behaviour

Manual testing identified that a successfully saved application left the Add Application form populated when the user returned to it.

The intended behaviour was:

```text
Navigate away without saving
-> keep draft

Successful save
-> reset form
```

The Add screen now remounts the form only after a successful save.

If save fails, the form is preserved.

### Frontend Validation

```text
npm run typecheck
tsc --noEmit
PASS
```

Frontend commit:

```text
fab622b feat: integrate job link import into application form
```

---

## 17 August 2026 — Merge and Production Deployment

The complete feature was merged to `main`.

Merge commit:

```text
5be432d merge: complete job link import
```

Final local validation before/after merge:

```text
Frontend typecheck: PASS

Backend:
Tests run: 144
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS

SecurityConfig diff: none
Flyway diff:         none
```

`main` was pushed successfully:

```text
619ee57..5be432d  main -> main
```

Final Git state:

```text
main = origin/main = 5be432d
```

The completed local feature branch was deleted after merge.

---

# Job Link Import Production Verification

## 17 August 2026 — Render & Mobile End-to-End Testing

Render deployed:

```text
5be432d
```

Production health was revalidated:

```text
GET /api/v1/status
-> HTTP 200 / UP

GET /actuator/health
-> HTTP 200 / UP
```

The mobile application was then tested against the production Render backend.

### Production Verification

Verified:

```text
Supported public job import          PASS
Imported fields remain editable      PASS
Save through existing application API PASS
Add form reset after save            PASS
LinkedIn/Indeed rejection            PASS
Unsafe URL rejection                 PASS
Existing application edit            PASS
Existing application delete          PASS
```

The unsafe-URL test confirmed the mobile error path did not echo sensitive query-string content.

### Final Production Flow

```text
Expo mobile application
        |
        v
POST /api/v1/applications/import-preview
        |
        v
Render Spring Boot API
        |
        v
Safe public-page fetch
        |
        v
JSON-LD / HTML extraction
        |
        v
Editable preview returned
        |
        v
User reviews/edits
        |
        v
POST /api/v1/applications
        |
        v
Neon PostgreSQL
```

The import endpoint itself remains non-persistent.

No production database migration was required.

### Outcome

Job Link Import passed:

* Secure backend validation
* Full automated backend testing
* Frontend TypeScript validation
* Local mobile end-to-end testing
* Merge validation
* Render deployment
* Production health verification
* Production mobile end-to-end verification
* Existing CRUD regression checks

The feature is functionally complete and ready for `v1.6.0` release closeout.

---

# Recruitment Email Integration Feature

## 17–28 August 2026 — Architecture and Native Gmail Foundation

Recruitment Email Integration was selected as the next product feature after the `v1.6.0` Job Link Import release.

Development branch:

```text
feat/email-integration
```

### Scope decisions

The implementation was deliberately constrained to one provider and one explicit workflow.

Approved v1 scope:

```text
Gmail only
manual sync only
gmail.readonly only
deterministic rules only
local-first processing
user confirmation before application mutation
```

Explicitly excluded:

```text
Outlook
Yahoo
IMAP
Apple Mail
background workers
Gmail Pub/Sub
AI classification
automatic application updates
backend Gmail ingestion
database/Flyway changes
```

### Native Google authorization

The first architecture review rejected an Expo AuthSession/custom-URI Android approach for this restricted Gmail feature.

The implementation instead added:

```text
react-native-nitro-google-signin
react-native-nitro-modules
```

with native Google Identity Services.

Configuration uses:

```text
offlineAccess: false
```

and requests exactly:

```text
https://www.googleapis.com/auth/gmail.readonly
```

No Google server auth code or backend refresh token is requested.

### Native build validation

An EAS Android development build compiled, installed and launched successfully with Expo SDK 54 / React Native 0.81.5.

Expo Doctor reported one React Native Directory metadata warning:

```text
Untested on New Architecture:
react-native-nitro-google-signin
```

The warning remained visible rather than being suppressed.

Expo Go is not supported because the native Nitro module must be present in the binary.

### Account isolation

Gmail connection state was namespaced by ApplyMate user.

A device-local ownership registry was added so one Gmail account cannot be silently connected to two ApplyMate accounts on the same device.

Verified:

```text
Account A -> Gmail X              PASS
Account B cannot claim Gmail X    PASS
Disconnect A releases Gmail X     PASS
Account B can then connect X      PASS
```

Disconnect revokes Google access when possible and clears local Gmail integration state without deleting saved applications.

---

## 20–27 August 2026 — Gmail Sync Engine

### Staged retrieval

The Gmail engine was implemented as:

```text
candidate message IDs
    -> metadata
    -> deterministic detection
    -> conditional bounded textual body
    -> deterministic application match
    -> local suggestion
```

The client never requests raw MIME or Gmail attachments.

Full textual body content is fetched only when metadata is plausibly recruitment-related but insufficient to classify, then discarded after processing.

No Gmail body or snippet is persisted.

### Deterministic detector and matcher

Added:

```text
recruitmentEmailDetector.ts
recruitmentEmailMatcher.ts
emailIntegrationLogicCheck.ts
```

Detection categories:

```text
APPLICATION_RECEIVED
ASSESSMENT
INTERVIEW
OFFER
REJECTION
FOLLOW_UP
UNKNOWN
```

Matching uses company/title/domain/date evidence.

No AI dependency was introduced.

### Runtime Gmail API hardening

Real Gmail testing exposed several provider/runtime cases and the implementation was hardened against each one.

#### Gmail API not enabled

Initial request:

```text
403 accessNotConfigured
```

The Gmail API was enabled in the correct Google Cloud project.

#### Successful empty response

A no-results Gmail call returned an empty successful response.

The API wrapper was updated to safely handle explicit empty/204 list-response fallbacks rather than always parsing JSON.

#### Cached access token

A later real sync returned:

```text
401 authError
```

The Android stale-token recovery path was implemented:

```text
clearCachedAccessToken(stale token)
    -> getTokens()
    -> retry exactly once
```

After this fix the real inbox sync succeeded.

### Real first sync

Successful real Gmail run:

```text
60 candidate emails found
60 new emails checked
20 suggestions created
```

A follow-up run confirmed processed-message deduplication: old suggestions were not duplicated.

---

## 27–28 August 2026 — Review, Confirm and Real-World Safety

### Email Updates screen

Added an authenticated review screen with:

```text
email category/confidence
subject/sender/date
matched application
current status
email-derived target status
Choose/Change application
Create application
Ignore
Confirm
```

Suggestions never mutate an application on their own.

### Real-world workflow issue

Initial review testing showed that technically correct email detection was not sufficient for a useful product.

Examples included:

* An old application-received email being shown against an application already at Interview.
* An unmatched recruitment email leaving the user stuck with only an existing-application picker.
* An old rejection email potentially conflicting with newer progress.

The workflow was hardened before release.

### Central action resolver

Added:

```text
emailSuggestionResolver.ts
```

Resolution states:

```text
ACTIONABLE
NO_CHANGE
STALE
NEEDS_APPLICATION
INFORMATIONAL
```

The same deterministic resolver is used to decide what should be surfaced and to re-check the action immediately before confirmation.

### Status regression protection

Normal recruitment progression is treated as:

```text
Saved
 -> Applied
 -> Assessment
 -> Interview
 -> Offer
```

An old email cannot move an application backwards.

The frontend application model was updated to preserve backend:

```text
updatedAt
```

Rejection emails use chronology so an older rejection cannot overwrite newer application progress.

### Create Application from email

Unmatched useful suggestions now offer:

```text
Choose existing
Create application
Ignore
```

Create Application reuses the existing normal form.

Safely derivable:

```text
company
job title
status
```

can be prefilled, but remain editable.

After save, the newly created application is returned to the Email Updates flow.

### Four real-world scenarios

All four release scenarios passed:

```text
1. Current Interview + old Applied email
   -> downgrade blocked                  PASS

2. Newer application progress + old rejection
   -> stale rejection blocked           PASS

3. No saved application
   -> create/prefill/save/return         PASS

4. Current Applied + Interview email
   -> Confirm updates to Interview       PASS
```

Ignore was also verified to leave the application unchanged.

---

## 28 August 2026 — Local Storage Hardening

The initial processing state stored one potentially large JSON value in SecureStore.

That was changed before release.

Final storage split:

```text
SecureStore
    -> Gmail connection/ownership metadata

AsyncStorage
    -> processed message IDs
    -> bounded suggestion metadata/state
```

Google access tokens are not stored in this processing state.

The migration uses:

```text
read legacy SecureStore
    -> validate/prune
    -> write AsyncStorage
    -> only then delete legacy SecureStore
```

State remains namespaced by ApplyMate user + Google account.

Caps:

```text
processed messages: 500
suggestions:         75
retention:           180 days
```

Existing suggestions survived migration and processed IDs remained deduplicated.

Commit:

```text
7bf3314 fix: harden Gmail integration local storage
```

---

## 28 August 2026 — Final Regression and Release Candidate

### Frontend

Verified:

```text
npm ci                               PASS
npm run typecheck                    PASS
emailIntegrationLogicCheck.ts        PASS
npx expo install --check             PASS
Expo web export                      PASS
git diff --check                     PASS
```

Expo Doctor:

```text
17/18
```

Single known warning:

```text
Untested on New Architecture:
react-native-nitro-google-signin
```

The warning was not suppressed.

### Backend and Docker

The first Maven attempt failed because Docker Desktop was not running and Testcontainers could not find a Docker environment.

No source-code change was made.

After Docker Desktop was started:

```text
Maven clean verify        PASS
Docker image build        PASS
Runtime user              applymate
Actuator healthcheck      present
```

There were no backend or Flyway diffs for the Gmail feature.

### Full mobile regression

Verified green:

* Login/dashboard/applications
* Add/edit/delete application
* Job Link Import
* Reminders
* Logout/login
* Gmail connection
* Sync/deduplication
* Suggestion review
* No downgrade
* Stale rejection protection
* Create-from-email
* Forward update after Confirm
* Ignore without mutation
* Account isolation
* Disconnect cleanup
* Application preservation
* Reconnect
* Gmail privacy log check

### Standalone preview

A release-like Android EAS preview build was installed and tested without Metro.

The standalone build passed the same core ApplyMate and Gmail smoke-test flows against the production backend.

### Final production endpoints

Verified on 28 August 2026:

```text
GET /actuator/health
-> HTTP 200
-> status UP

GET /api/v1/status
-> HTTP 200
-> status UP
```

Validated feature implementation commit:

```text
7bf33145f2597a4efc83f722a5c20f3d602e20fa
```

### Google rollout status

The Google OAuth app is External/Testing and the Gmail feature has been validated with authorised test users.

Because `gmail.readonly` is a Restricted scope, unrestricted public Gmail availability remains pending Google's verification process.

### Outcome

Recruitment Email Integration is functionally complete for v1.7.0 release closeout.

# 29 August 2026 — Final Handoff & Store Readiness

## Checkpoint 1 — Full Handoff Audit

* Audited repository, EAS configuration, app identifiers, environment configuration, backend deployment, external dependencies, Gmail integration, public privacy/deletion pages, CI and documentation.
* Confirmed no additional product feature development was required.
* Identified the principal remaining release items as reproducibility proof, operational handoff, store/compliance packaging and Gmail public-release gating.

## Checkpoint 2 — Clean-Clone Reproducibility

A completely separate fresh clone was created at the exact v1.7.0 baseline:

```text
092f523427a19b8b55896d2701fe000249221dac
```

Validated:

```text
npm ci                              PASS
TypeScript                          PASS
Expo dependency check               PASS
Expo Doctor                         17/18 known Nitro metadata warning
Expo web export                     PASS
Gmail deterministic logic           PASS
Backend tests                       144/144 PASS
Backend package                     PASS
Production Docker image             PASS
Docker non-root user/healthcheck     PASS
Git worktree                        CLEAN
```

The initial local Maven failure was diagnosed rather than patched. The root cause was Docker Compose project-name/named-volume collision between parallel ApplyMate clones. Re-running with a unique Compose project and Java 21 produced 144 tests with zero failures/errors.

Operational lessons recorded:

* Use Java 21 as the authoritative backend JDK.
* Use unique Docker Compose project names for parallel clones.
* Treat `docker compose down -v` as destructive local database reset.
* Do not copy undocumented local state into a clean clone.

## Checkpoint 3 — Native Release Builds

Added release configuration:

```text
ios-simulator profile
ios.simulator=true
ITSAppUsesNonExemptEncryption=false
```

Validated EAS project/identifiers/environment, then built:

```text
Android production/store AAB
Build ID: b4f877a4-7120-4af2-b5b1-cb8c0f933675
Result: PASS

iOS Simulator native build
Build ID: 9d9d5aba-6054-4693-bf57-f2647d444ed4
Result: PASS
```

The iOS build required no paid App Store distribution credentials and proved native compilation. Apple production signing/TestFlight/App Store submission remains account-gated.

## Checkpoint 4 — Authoritative Handoff Runbook

Added:

```text
docs/07_FINAL_HANDOFF_RUNBOOK.md
```

The runbook documents architecture, prerequisites, build commands, EAS profiles, Render, Neon/Flyway, Resend, DNS/domain dependencies, Google Cloud/Gmail, environment-variable names, health checks, rollback/recovery, service-account handoff and exact store-build/submission commands.

Secret-pattern verification passed.

## Checkpoint 5 — Store Submission Pack

Added:

```text
docs/08_STORE_SUBMISSION_PACK.md
```

Prepared:

* Apple/Google metadata
* Descriptions/keywords/categories
* Public URLs
* Age-rating guidance
* Release notes
* Screenshot plan
* Reviewer notes and reviewer-account procedure
* Apple App Privacy draft
* Google Play Data Safety draft
* Third-party service/SDK inventory

No Gmail public-marketing claims are included while restricted-scope approval is pending.

## Checkpoint 6 — Gmail Public-Release Hardening

Google `gmail.readonly` remained a Restricted scope, so unrestricted production exposure was not considered safe.

Added:

```text
EXPO_PUBLIC_GMAIL_ENABLED
```

Authoritative EAS state:

```text
production  = false
preview     = true
development = true
```

The committed default is `false`.

Hardening behaviour:

* Gmail UI hidden when disabled.
* `connectGmail` blocked before authorization when disabled.
* Gmail token retrieval/sync blocked before scope request when disabled.
* Gmail authorization refresh blocked when disabled.
* Disconnect/cleanup left available.
* Existing authorised-test Gmail behaviour preserved when enabled.

Validation:

```text
TypeScript                       PASS
Flag false                       PASS
Flag true                        PASS
Existing Gmail logic             PASS
Production-like web export       PASS
Expo dependencies                PASS
Production bundle Gmail UI text  ABSENT
```

No backend/Flyway change was required.

## Final Release Decision

```text
v1.8.0 — Final Handoff & Store Readiness
Store marketing version: 1.0.0
```

Documentation must identify v1.8.0 as the current release before the final annotated tag is created. The tag is created only after final validation, merge to `main` and green CI.

# Current Release Summary

| Area | Current state |
| --- | --- |
| Current phase | Final Handoff & Store Submission Readiness |
| Current release | `v1.8.0` |
| Previous release | `v1.7.0` |
| v1.7.0 baseline | `092f523427a19b8b55896d2701fe000249221dac` |
| Store marketing version | `1.0.0` |
| Production Flyway | `V9` |
| Backend tests | `144/144 PASS` |
| Docker production image | `PASS` |
| Android production AAB | `PASS` |
| iOS Simulator native build | `PASS` |
| Production Gmail availability | `OFF` |
| Preview/development Gmail | `ON for authorised test users` |
| Public Gmail approval | `Pending Google restricted-scope verification` |

The v1.8.0 release adds no product feature beyond the already completed v1.7.0 Gmail implementation. It is a final release-engineering, compliance, reproducibility and handoff release.

# Production Infrastructure

## Mobile

```text
React Native
Expo SDK 54
TypeScript
Expo SecureStore
Expo Notifications
EAS Build
```

## Backend

```text
Spring Boot 4.1
Java 21
Spring Security
Spring Data JPA
Flyway
Spring RestClient
Docker
```

## Database

```text
Neon PostgreSQL 17
Flyway V9
```

## Transactional Email

```text
Resend
applymate.website
verify@applymate.website

Email verification
Password reset
Password-changed notifications
```

## Backend Hosting

```text
Render
https://applymate-api-bami.onrender.com
```

---

# Known Operational Behaviour

The current deployment uses portfolio-tier cloud infrastructure.

Render may experience cold-start delays after inactivity.

During cold start, the first API request may take longer while Spring Boot and database connectivity become ready.

Once ready:

```text
/api/v1/status   -> HTTP 200 / UP
/actuator/health -> HTTP 200 / UP
```

This affects startup latency but not stored data or application architecture.

---

# Security Rules Established During Development

- Never commit `.env`.
- Never commit `.env.local`.
- Never commit PostgreSQL credentials.
- Never commit JWT secrets.
- Never commit Resend API keys.
- Never commit the email-verification pepper.
- Never persist raw refresh tokens.
- Never persist raw verification codes.
- Do not log verification codes.
- Do not log Authorization headers.
- Treat credentials exposed in logs as compromised.
- Rotate compromised credentials immediately.
- Keep the mobile application isolated from backend secrets.
- Use Flyway for all shared database changes.
- Never modify a Flyway migration after production application.
- Run automated tests and CI before production deployment.
- Smoke-test production after deployment.
- Never commit the password-reset pepper.
- Never persist raw password-reset codes.
- Use separate peppers for email verification and password reset.
- Revoke active refresh-token sessions after password reset.
- Password reset must not implicitly verify an email address.
- Forgot-password behaviour must not expose account existence.
- Treat user-submitted job URLs as untrusted input.
- Never log full submitted job URLs or query strings.
- Revalidate every job-import redirect target.
- Reject private, loopback, link-local and otherwise unsafe job-import destinations.
- Keep job-page response and decompression size bounded.
- Do not forward mobile authentication headers or user cookies to job sites.
- Do not persist imported job data until the user explicitly saves it.
- Keep the per-user job-import rate limiter bounded.

---

# Release Closeout

The `v1.8.0` finalisation branch contains the final handoff/store-readiness work.

Remaining release mechanics after documentation update:

1. Run the complete frontend/backend/Docker/EAS validation against the final branch.
2. Commit/push the finalisation branch.
3. Merge to `main`.
4. Confirm GitHub Actions are green.
5. Verify production status/health.
6. Rebuild final Android AAB from the exact final `main` commit.
7. Re-run iOS Simulator validation from the exact final `main` commit.
8. Create annotated `v1.8.0` on that exact commit.
9. Verify `tag == main == origin/main`.
10. Delete completed branches and leave clean `main`.

The documentation names v1.8.0 before tagging by design so the tag points to a commit that already documents itself correctly.

# Development Freeze

After the final `v1.8.0` tag, ApplyMate feature development is frozen.

Permitted future work is limited to:

* Genuine bug fixes
* Apple/Google store compliance
* Google OAuth restricted-scope verification/public Gmail enablement
* Security maintenance
* Provider/API compatibility maintenance
* Operational documentation corrections

External account gates remain:

* Apple Developer Program enrolment
* Google Play developer account/application
* Google restricted-scope approval

Job Link Import and Recruitment Email Integration remain completed implementation milestones. No new feature scope is approved.
