## Current Status

* **Current phase:** Password Reset & Production Release Closeout
* **Stable branch:** `main`
* **Documentation branch:** `docs/password-reset-closeout`
* **Current production/main commit:** `d1e4d37`
* **Current release tag:** `v1.4.0`
* **Next planned release tag:** `v1.5.0`
* **Production Flyway version:** `V9`
* **Backend automated tests:** `106 passing`
* **Focused password-reset tests:** `14 passing`
* **Frontend TypeScript validation:** `PASS`
* **Production API:** `UP`
* **Production health:** `UP`

The frontend MVP, backend MVP, production deployment, mobile distribution, persistent-session authentication, backend reminder synchronisation, account deletion, privacy/store-readiness work, email verification and password reset are complete.

Authentication email is live in production using:

```text
React Native / Expo
        |
        v
Render Spring Boot API
        |
        +----> Neon PostgreSQL
        |
        +----> Resend
                 |
                 v
        verify@applymate.website
```

Production authentication email now supports:

* Email-verification codes
* Password-reset codes
* Password-changed notifications

The remaining work for `v1.5.0` is documentation closeout, release tagging and branch cleanup.

---

# July 2026

## 12 July 2026 â€” Project Initialisation

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

## 13 July 2026 â€” Authentication Interface

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

## 14 July 2026 â€” Application Tracking Screens

### Completed

- Built the applications list screen.
- Built the application-details screen.
- Added the initial application data model.
- Added navigation between application records and detail views.
- Continued developing application-management flows.

### Outcome

Users could navigate through the primary job-application tracking interface.

---

## 16 July 2026 â€” Frontend MVP Completed

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

## 17 July 2026 â€” Backend Foundation

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

## 18â€“22 July 2026 â€” Authentication and Application API Development

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

## 23 July 2026 â€” Backend MVP Completed

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

## 24 July 2026 â€” Frontend API Integration

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

## 25 July 2026 â€” Dashboard Summary Integration

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

## 28 July 2026 â€” MVP Polish Completed

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

## 28 July 2026 â€” Deployment & Production Readiness

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

## 29 July 2026 â€” Neon Production Database

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

## 29 July 2026 â€” Render Production Backend

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

## 29 July 2026 â€” Production Backend Smoke Testing

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

## 29 July 2026 â€” Mobile Production Integration

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

## 29 Julyâ€“8 August 2026 â€” Mobile Distribution & Release Readiness

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

## 3â€“7 August 2026 â€” Persistent Session Authentication

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

## 7â€“8 August 2026 â€” Account Deletion

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

## 8 August 2026 â€” Privacy & Account-Deletion Pages

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

## 8 August 2026 â€” Android Release Candidate Verification

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

## 8â€“10 August 2026 â€” Email Verification Backend Development

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
    â”œâ”€â”€ unverified
    â”‚      -> 403 EMAIL_VERIFICATION_REQUIRED
    â”‚      -> no tokens
    â”‚
    â””â”€â”€ verified
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

## 10 August 2026 â€” PR #6 and Controlled Production Deployment

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

## 11 August 2026 â€” Initial Production Registration Failure

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

## 11 August 2026 â€” Security Hardening

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

## PR #7 â€” Hotfix Merge

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

## 11 August 2026 â€” V8

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

## PR #8 â€” V8 Merge

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

# Current Release Summary

| Area                                  | Status      |
| ------------------------------------- | ----------- |
| Frontend MVP                          | Complete    |
| Backend MVP                           | Complete    |
| PostgreSQL integration                | Complete    |
| JWT access tokens                     | Complete    |
| Production access-token lifetime      | 15 minutes  |
| Refresh-token sessions                | Complete    |
| Silent refresh                        | Complete    |
| Refresh-token rotation                | Complete    |
| Session restoration                   | Complete    |
| Application CRUD                      | Complete    |
| User isolation                        | Complete    |
| Dashboard summary                     | Complete    |
| Search/filtering/sorting              | Complete    |
| Backend reminder synchronisation      | Complete    |
| Local notifications                   | Complete    |
| Account deletion                      | Complete    |
| Privacy Policy                        | Complete    |
| Public deletion page                  | Complete    |
| EAS configuration                     | Complete    |
| Android internal distribution         | Complete    |
| Android production-connected testing  | Complete    |
| Email verification                    | Complete    |
| Password reset                        | Complete    |
| Reset-session revocation              | Complete    |
| Password-changed notification         | Complete    |
| Resend transactional email            | Complete    |
| Shared Resend transport               | Complete    |
| `applymate.website` email domain      | Verified    |
| Verification restart recovery         | Complete    |
| Verification resend/cooldown          | Complete    |
| Unverified login protection           | Complete    |
| Unverified refresh protection         | Complete    |
| Resend secret-safety hardening        | Complete    |
| Password-reset enumeration protection | Complete    |
| Password-reset rollback protection    | Complete    |
| Flyway production schema              | V9          |
| Backend automated tests               | 106 passing |
| Focused password-reset tests          | 14 passing  |
| Frontend TypeScript validation        | Passing     |
| Expo Doctor                           | 18/18       |
| GitHub CI                             | Green       |
| Render deployment                     | Healthy     |
| Neon database                         | Healthy     |
| Real reset email                      | Verified    |
| Old-password rejection                | Verified    |
| New-password login                    | Verified    |
| Password-changed email                | Verified    |
| Final release documentation           | In progress |
| `v1.5.0` release tag                  | Pending     |

---

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

---

# Release Closeout

The functional work for the **Password Reset** release is complete.

Production currently runs:

```text
main commit: d1e4d37
Flyway:      V9
Backend:     UP
Database:    healthy
Email:       operational
Tests:       106 passing
Reset tests: 14 passing
Frontend:    typecheck passing
CI:          green

Production verification confirmed:

/status                    -> HTTP 200
/actuator/health            -> HTTP 200
/forgot-password unknown    -> HTTP 202
Reset email                 -> received
Old password                -> rejected
New password                -> accepted
Password-changed email      -> received

Remaining work before v1.5.0:

Complete documentation updates.
Update the root README.
Review documentation diffs.
Commit and merge documentation closeout.
Create and push release tag v1.5.0.
Remove completed temporary feature/documentation branches.
Next Development Phase

Potential future development includes:

Job-link import
Expanded email integration beyond authentication
Additional application automation
Profile/account-management improvements
Google Play public release preparation
Apple TestFlight/App Store distribution after Apple Developer Program enrolment

Password Reset is no longer part of the backlog.

New feature development should begin after v1.5.0 is formally closed.