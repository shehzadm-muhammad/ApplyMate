# ApplyMate

**Apply smarter. Get hired faster.**

ApplyMate is a full-stack mobile job-application tracker built with React Native, Expo, Spring Boot and PostgreSQL.

It allows users to manage job applications, reminders and authenticated sessions from a mobile application backed by a production REST API.

Current production capabilities include:

* Mandatory email verification for new accounts
* Secure password reset by email
* Password-changed notifications
* Persistent rotating refresh-token sessions
* Short-lived JWT access tokens
* Secure public job-link import into an editable application preview
* Optional Gmail recruitment-email integration with manual user-triggered sync

---

# About ApplyMate

Users can:

* Create an account
* Verify their email address
* Sign in securely
* Reset a forgotten password
* Maintain a persistent authenticated session
* Import supported public job links into an editable application preview
* Create and manage job applications
* Search, filter and sort applications
* View dashboard statistics
* Create reminders
* Receive local reminder notifications
* Permanently delete their account and associated data

Server-managed data is stored in PostgreSQL and isolated by authenticated user.

Current capabilities include:

* React Native / Expo frontend
* Spring Boot backend
* PostgreSQL persistence
* Email verification
* Secure password reset
* Resend transactional email
* Verified `applymate.website` sending domain
* JWT access tokens
* Refresh-token rotation
* Refresh-session revocation
* Secure persistent sessions
* Job-application CRUD
* Secure Job Link Import preview
* JSON-LD and HTML job extraction
* SSRF-safe outbound job-page fetching
* Backend-synchronised reminders
* Search, filtering and sorting
* Dashboard summaries
* Account deletion
* Privacy Policy integration
* Automated testing
* Docker deployment
* GitHub Actions CI
* Render production hosting
* Neon PostgreSQL
* Expo Application Services
* Android internal distribution
* Native Google Identity Services integration for Gmail
* Deterministic recruitment-email detection and application matching
* Review/confirm/ignore workflow for email-derived application updates

Email verification, password reset, Job Link Import and Recruitment Email Integration are implemented and validated. Gmail remains available to authorised Google test users, while unrestricted production builds disable Gmail until Google approves the required `gmail.readonly` restricted-scope verification.

Current release:

```text
v1.8.0
```

Previous release:

```text
v1.7.0
```

v1.7.0 baseline tag/commit:

```text
092f523427a19b8b55896d2701fe000249221dac
```

Store marketing version:

```text
1.0.0
```

`v1.8.0` is the Final Handoff & Store Readiness release. Its documentation names the release before the final annotated tag is created; the tag must only be created after final validation, merge to `main` and green CI.
---

# Production Architecture

```text
+------------------------------------------+
|        React Native / Expo Client        |
|                                          |
|  TypeScript                              |
|  React Navigation                        |
|  Expo SecureStore                        |
|  AsyncStorage                            |
|  Expo Notifications                      |
|  Native Google Identity Services         |
+-------------------+----------------------+
                    |
          +---------+-------------------------------+
          |                                         |
          | HTTPS + JSON                            | OAuth + HTTPS
          | JWT / refresh session                   | gmail.readonly
          v                                         v
+----------------------------------+     +---------------------------+
|              Render              |     |       Google / Gmail      |
|                                  |     |                           |
| Spring Boot Docker API           |     | Google account selection  |
| Java 21                          |     | Gmail API                  |
| Spring Security                  |     | metadata/body-on-demand   |
| Flyway                           |     +---------------------------+
| JPA / Hibernate                  |
+-------------+--------------------+
              |
      +-------+---------+----------------------+
      |                 |                      |
  JDBC/TLS           HTTPS                  HTTPS
      |                 |                      |
      v                 v                      v
+------------+   +------------------+   +----------------------+
|    Neon    |   |      Resend      |   | Public job websites  |
|            |   |                  |   |                      |
| PostgreSQL |   | Verification     |   | Server-side fetch    |
| 17         |   | Password reset   |   | JSON-LD / HTML       |
| Flyway V9  |   | Password changed |   | extraction           |
+------------+   +------------------+   +----------------------+
```

Normal ApplyMate account, application, reminder and authentication traffic goes through the Spring Boot API.

Job Link Import continues to fetch public job pages only through the backend. The mobile client does not fetch job pages directly.

Recruitment Email Integration is intentionally different: the optional Gmail connection is authorised on the mobile device and the mobile client talks directly to Google Identity Services and the Gmail API using only:

```text
https://www.googleapis.com/auth/gmail.readonly
```

Gmail access tokens, message bodies, snippets and provider credentials are never sent through Render and are never stored in PostgreSQL.

The Gmail workflow is manual and local-first:

```text
Connect Gmail
    -> Check for updates
    -> staged Gmail retrieval
    -> deterministic detection/matching
    -> local suggestions
    -> user reviews
    -> Confirm / Ignore
    -> existing ApplyMate application API only after Confirm
```

Supporting services:

```text
Expo Application Services
    -> Android development/preview/production builds
    -> future iOS builds

GitHub Pages
    -> Privacy Policy
    -> Account deletion information
```

Backend secrets remain backend-only.
# Live Services

## Production API

```text
https://applymate-api-bami.onrender.com
```

API status:

```text
https://applymate-api-bami.onrender.com/api/v1/status
```

Operational health:

```text
https://applymate-api-bami.onrender.com/actuator/health
```

Current production verification:

```text
/api/v1/status   -> HTTP 200 / UP
/actuator/health -> HTTP 200 / UP
```

## Public Website

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

Privacy Policy:

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

Account deletion:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

Support/privacy contact:

```text
support.applymate@gmail.com
```

## Transactional Email

Provider:

```text
Resend
```

Verified domain:

```text
applymate.website
```

Production sender:

```text
ApplyMate <verify@applymate.website>
```

Current authentication email types:

```text
Email-verification code
Password-reset code
Password-changed notification
```

---

# Features

## Email Verification

New users must verify ownership of their email address before receiving authenticated application access.

Registration flow:

```text
Register
   |
   v
Create unverified account
   |
   v
Generate six-digit verification code
   |
   v
Send email through Resend
   |
   v
Verify Email screen
   |
   v
Email verified
   |
   v
Normal login
```

Verification security includes:

* Six-digit numeric verification codes
* `SecureRandom` generation
* Ten-minute expiry
* Maximum five incorrect attempts
* Sixty-second resend cooldown
* Five-code issue limit per one-hour window
* Replacement-code invalidation
* HMAC-SHA-256 code protection
* Server-side verification pepper
* No raw verification-code persistence
* Unverified-login protection
* Unverified-refresh protection

Pending verification state survives an application restart.

The mobile client does not persist the user's password or raw verification code.

---

## Password Reset

ApplyMate provides secure forgotten-password recovery.

Flow:

```text
Login
   |
   v
Forgot Password
   |
   v
Send reset code
   |
   v
Reset Password
   |
   v
Change password
   |
   v
Login with new password
```

Security includes:

* Six-digit numeric reset codes
* `SecureRandom` generation
* Ten-minute expiry
* Maximum five incorrect attempts
* Sixty-second resend cooldown
* Five-code issue limit per one-hour window
* HMAC-SHA-256 reset-code protection
* Separate password-reset pepper
* User-bound reset-code hashes
* Replacement-code invalidation
* Single-use reset challenges
* Generic invalid/expired reset response
* Account-enumeration-resistant forgot-password responses
* Minimum forgot-password response duration
* No raw reset-code persistence
* Refresh-session revocation after successful reset

Successful password reset:

```text
Password changed
      |
      v
All active refresh sessions revoked
      |
      v
Reset challenge deleted
      |
      v
Password-changed email
```

Password reset does **not** automatically verify an unverified email address.

---

## Authentication

ApplyMate supports:

* User registration
* Email verification
* Password reset
* Secure password hashing
* Email/password login
* JWT access tokens
* Refresh tokens
* Refresh-token rotation
* Refresh-token families
* Refresh-session revocation
* Secure native token storage
* Silent access-token renewal
* Persistent session restoration
* Backend logout
* Invalid-session handling
* Current-user profile
* Protected navigation

Production session configuration:

```text
Access token:    15 minutes
Refresh session: 30 days
```

If an access token expires while the refresh session remains valid, ApplyMate automatically obtains a new token and retries the protected request.

An unverified account cannot obtain authenticated application access through either login or refresh.

A successful password reset revokes all existing refresh-token sessions for the account.

---

## Job Link Import

ApplyMate can import supported public job adverts into the existing Add Application form.

Flow:

```text
Paste public job URL
      |
      v
POST /api/v1/applications/import-preview
      |
      v
Safe server-side fetch
      |
      v
JSON-LD JobPosting first
      |
      v
HTML fallback if needed
      |
      v
Editable preview
      |
      v
User reviews/changes fields
      |
      v
Existing Save Application flow
```

The import endpoint does **not** create an application record.

Imported fields remain editable and the user controls the final saved data.

The importer does not overwrite:

```text
status
notes
```

If an import fails or is unsupported, the user can continue entering the application manually.

### Import security

The backend treats submitted URLs as untrusted input.

Controls include:

* HTTP/HTTPS destination validation
* Hostname canonicalisation
* IDN/punycode handling
* Trailing-dot normalisation
* Private, loopback and link-local destination rejection
* DNS destination checks
* Redirect-by-redirect revalidation
* Direct connections without forwarding user cookies or bearer credentials
* Connection and read timeouts
* Supported content-type checks
* 2 MiB streaming response limit
* Bounded compressed/decompressed responses
* Safe plain-text extraction
* No full submitted URL/query-string logging
* Per-user import rate limiting

LinkedIn and Indeed are intentionally unsupported for automatic import.

Rate limit:

```text
10 import attempts per authenticated user per 10 minutes
```

The mobile Add Application form preserves unsaved drafts when navigating away.

After a successful save, the form resets to a fresh state.

---

## Recruitment Email Integration

ApplyMate v1.7.0 adds an optional Gmail-first recruitment-email workflow.

The feature does **not** silently change applications and does **not** introduce a new backend email-ingestion service.

Flow:

```text
Profile
   |
   v
Connect Gmail
   |
   v
Google account selection
   |
   v
gmail.readonly consent
   |
   v
Manual "Check for updates"
   |
   v
Gmail candidate-message search
   |
   v
Metadata-first deterministic classification
   |
   +-- clearly unrelated -> discard
   |
   +-- enough evidence -> classify
   |
   +-- plausible but unclear -> fetch bounded textual body only
   |
   v
Deterministic application matching
   |
   v
Local Email Updates suggestions
   |
   +-- Ignore -> no application change
   |
   +-- Confirm -> revalidate current application state
                    |
                    v
              Existing application API update
```

### Gmail privacy and data handling

The exact Google scope is:

```text
https://www.googleapis.com/auth/gmail.readonly
```

The v1 implementation:

* Uses native Google Identity Services through `react-native-nitro-google-signin`
* Uses `offlineAccess: false`
* Does not request a server auth code
* Does not store a Google refresh token in the ApplyMate backend
* Sends Gmail API requests directly from the mobile client
* Sends no Gmail message content or Google access token through Render
* Stores no Gmail data in PostgreSQL
* Does not fetch raw MIME or attachments
* Starts with message IDs and metadata
* Fetches a bounded inline text body only when metadata is insufficient for classification
* Discards fetched body text after processing
* Does not persist Gmail snippets or full bodies
* Stores only bounded local processed-message IDs and suggestion metadata
* Namespaces local state by ApplyMate user and Google account
* Clears local Gmail processing state on disconnect/account cleanup

Connection/ownership metadata uses secure device storage. Bounded processed-message IDs and suggestion metadata use local AsyncStorage rather than one large SecureStore item.

### Detection and matching

Recruitment-email detection is deterministic and AI-free.

Categories include:

```text
Application received
Assessment
Interview
Offer
Rejection
Follow-up
```

Application matching uses deterministic evidence such as:

* Company name
* Job title
* Sender/domain evidence
* Job URL/domain evidence
* Plausible chronology

The review flow re-checks the application's **current** status before confirmation.

ApplyMate will not move an application backwards from a later normal recruitment stage because of an old email. Rejection emails are also checked against the application's latest `updatedAt` timestamp so an older rejection cannot overwrite newer progress.

If no application exists, the user can create one from the email workflow. Only safely derived company/title/status values are prefilled; the normal Add Application form remains editable.

No email-derived update is persisted to the application until the user explicitly confirms it.

### Sync model

v1.7.0 uses manual sync only.

There is no:

```text
background Gmail worker
Gmail Pub/Sub
server-side mailbox polling
Outlook/Yahoo/IMAP integration
AI classification
automatic status mutation
```

The initial Gmail search is bounded, processed IDs are deduplicated, suggestions are retained within bounded local limits, and an incremental overlap window allows safe repeat syncs.

### Google verification status

`gmail.readonly` is a Google Restricted scope.

The integration has been validated with the Google OAuth app in External/Testing mode using authorised test users. This is sufficient for development and release-candidate validation, but unrestricted public Gmail availability remains gated on Google's required OAuth/restricted-scope verification process.

That external approval status must not be described as complete until Google has actually approved it.

### v1.8.0 production release gate

Public Gmail availability is controlled by:

```text
EXPO_PUBLIC_GMAIL_ENABLED
```

Authoritative EAS values:

```text
production  = false
preview     = true
development = true
```

The committed `.env.example` also defaults Gmail to `false`. When disabled, Profile does not render Gmail controls and the Gmail authorization/token-refresh paths fail before `requestScopes(gmail.readonly)` can be reached. Disconnect/cleanup remains available so previously connected test state can still be removed.

This keeps the implemented Gmail feature available for authorised testing without representing it as unrestricted public functionality.

## Job Applications

Users can:

* Create applications
* List applications
* View application details
* Edit applications
* Delete applications
* Search applications
* Filter by status
* Sort records
* View backend-powered dashboard statistics

Every application belongs to one authenticated user.

Backend ownership rules prevent users from accessing another user's records.

---

## Dashboard

The dashboard provides:

* Total application count
* Saved count
* Applied count
* Assessment count
* Interview count
* Offer count
* Rejected count
* Loading state
* Error state
* Pull-to-refresh

Summary values come from:

```text
GET /api/v1/applications/summary
```

---

## Reminders

ApplyMate supports:

* Create reminders
* Edit reminders
* Delete reminders
* Backend reminder persistence
* Per-user reminder isolation
* Local notification scheduling
* Device notification cleanup

Architecture:

```text
Reminder record
    -> Spring Boot API
    -> PostgreSQL

Notification scheduling
    -> Expo Notifications
    -> Mobile operating system
```

Reminder records are server-managed.

Operating-system notification scheduling remains device-side.

---

## Account Deletion

Users can permanently delete their account from:

```text
Profile -> Delete Account
```

The application uses two destructive confirmation prompts.

Successful deletion removes backend-owned data including:

* User account
* Job applications
* Reminders
* Refresh-token sessions
* Email-verification challenge data
* Password-reset challenge data

The mobile client also removes:

* Authentication credentials
* Pending verification state
* Reminder notification identifiers
* Scheduled reminder notifications
* Account-specific local settings

Deleted credentials can no longer authenticate.

---

# Technology Stack

## Mobile Frontend

* React Native
* Expo SDK 54
* TypeScript
* React Navigation
* Expo SecureStore
* AsyncStorage
* Expo Notifications
* Expo Application Services
* `react-native-nitro-google-signin`
* `react-native-nitro-modules`
* Google Identity Services / Gmail API

## Backend

* Java 21
* Spring Boot 4.1
* Spring Security
* OAuth2 Resource Server
* Spring Data JPA
* Bean Validation
* Spring Boot Actuator
* Spring RestClient
* Maven

## Database

* PostgreSQL 17
* Flyway
* Hibernate
* HikariCP

## Email

* Resend
* Custom verified sending domain
* DKIM
* SPF
* DMARC

## Infrastructure

* Docker
* Docker Compose
* Render
* Neon
* GitHub Actions
* GitHub Pages
* Expo Application Services

---

# Testing

ApplyMate uses:

* TypeScript compiler validation
* Deterministic email-integration logic checks
* Expo Doctor
* Expo web export
* JUnit
* MockMvc
* Mockito
* Testcontainers
* Maven
* Docker verification
* PowerShell API smoke tests
* Android emulator testing
* Android native development-build testing
* Standalone Android EAS preview testing
* Production mobile smoke testing
* Production email-delivery testing
* Flyway migration integration testing

Latest v1.7.0 release-candidate validation:

```text
npm run typecheck
PASS

npx --yes tsx src/scripts/emailIntegrationLogicCheck.ts
PASS

npx expo install --check
Dependencies are up to date

Expo web export
PASS

Backend Maven clean verify
PASS

Docker image build
PASS

Docker runtime user
applymate

Production API
/api/v1/status   -> HTTP 200 / UP
/actuator/health -> HTTP 200 / UP
```

Latest Expo Doctor result:

```text
17/18 checks passed
```

The single remaining warning is React Native Directory metadata reporting:

```text
Untested on New Architecture: react-native-nitro-google-signin
```

The warning is intentionally left visible rather than suppressed. The exact native dependency has passed a real Expo SDK 54 Android development build, a standalone EAS preview build, Google OAuth, Gmail API access, token-refresh recovery and the full v1.7.0 Gmail smoke-test matrix.

The Gmail release validation also covered:

* Real `gmail.readonly` consent
* Manual sync
* Processed-message deduplication
* Local suggestion persistence/migration
* Application/account isolation
* Old-stage downgrade prevention
* Stale rejection protection
* Create-application-from-email
* Explicit confirm before application update
* Ignore without mutation
* Disconnect cleanup
* Reconnect
* No Gmail token/body/snippet logging

GitHub Actions continues to validate frontend, backend and Docker changes on pushes and pull requests.
# Repository Structure

```text
ApplyMate/
├── assets/
├── backend/
│   ├── scripts/
│   ├── src/main/
│   │   ├── java/
│   │   └── resources/
│   │       └── db/migration/
│   ├── src/test/
│   ├── compose.yaml
│   ├── Dockerfile
│   └── pom.xml
├── docs/
│   ├── 01_PROJECT_CONTEXT.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_API_REFERENCE.md
│   ├── 04_DEVELOPMENT_LOG.md
│   ├── 05_ROADMAP.md
│   ├── 06_PRODUCT_BACKLOG.md
│   ├── index.html
│   ├── privacy-policy.html
│   └── delete-account.html
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── theme/
│   └── types/
├── App.tsx
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

---

# Local Development

## Prerequisites

Install:

* Git
* Node.js 20.19+ and npm (Node 24.18.0 / npm 11.16.0 validated during final clean-clone testing)
* Java 21
* Docker Desktop
* Android emulator or compatible development device
* Expo development build / installed EAS development client for v1.7.0 Gmail work

Docker must be running for the local PostgreSQL database and Testcontainers integration tests.

---

## 1. Clone the Repository

```powershell
git clone https://github.com/shehzadm-muhammad/ApplyMate.git
cd ApplyMate
```

---

## 2. Install Frontend Dependencies

```powershell
npm ci
```

---

## 3. Configure Frontend Environment

Create:

```powershell
Copy-Item .env.example .env.local
```

Local backend example:

```text
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_GMAIL_ENABLED=false
```

Authorised Gmail testing may opt in locally by setting `EXPO_PUBLIC_GMAIL_ENABLED=true` in the ignored `.env.local`. Production must remain `false` until Google restricted-scope approval is complete.

Production:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

A physical device can use the development computer's LAN address when both devices are on the same network.

For Android emulator development:

```powershell
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

Port responsibilities:

```text
8080 -> Spring Boot API
8081 -> Expo / Metro
```

---

## 4. Configure Backend Environment

```powershell
cd backend
Copy-Item .env.example .env
```

Local configuration includes values such as:

```text
POSTGRES_DB=applymate
POSTGRES_USER=applymate
POSTGRES_PASSWORD=<local-password>
POSTGRES_PORT=5432

JWT_SECRET=<local-secret>

EMAIL_PROVIDER=<local-provider>
EMAIL_VERIFICATION_PEPPER=<local-secret>
PASSWORD_RESET_PEPPER=<separate-local-secret>
```

If real email delivery is used locally, provider credentials must remain inside ignored environment configuration.

Never commit:

```text
backend/.env
.env.local
```

---

## 5. Generate Development Secrets

For a 32-byte Base64 secret in PowerShell:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$secret
```

Use independently generated values for:

```text
EMAIL_VERIFICATION_PEPPER
PASSWORD_RESET_PEPPER
```

Do not reuse a production secret for local development.

---

## 6. Start PostgreSQL

From `backend/`:

```powershell
docker compose up -d
docker compose ps
```

---

## 7. Start Spring Boot

From `backend/`:

```powershell
.\mvnw.cmd spring-boot:run
```

Local API:

```text
http://localhost:8080
```

Verify:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/status
Invoke-RestMethod http://localhost:8080/actuator/health
```

---

## 8. Start Expo

The v1.7.0 app includes a native Gmail module and must be run with a native development build rather than Expo Go.

From the repository root:

```powershell
npx expo start --dev-client
```

For a clean Metro restart:

```powershell
npx expo start --dev-client --clear
```

Web export remains available for CI validation, but the native Gmail flow is Android/iOS only.

---

# Environment Files

| File                   | Purpose                       | Committed |
| ---------------------- | ----------------------------- | --------: |
| `.env.example`         | Frontend environment template |       Yes |
| `.env.local`           | Local frontend configuration  |        No |
| `backend/.env.example` | Backend environment template  |       Yes |
| `backend/.env`         | Local backend secrets         |        No |

Secrets, passwords, signing keys, peppers and provider credentials must never be committed.

---

# Authentication Flow

## Registration & Verification

```text
Registration form
       |
       v
POST /api/v1/auth/register
       |
       v
Unverified account
       |
       v
Verification email
       |
       v
POST /api/v1/auth/verify-email
       |
       v
Email verified
       |
       v
Login
```

## Password Reset

```text
Forgot Password
       |
       v
POST /api/v1/auth/forgot-password
       |
       v
Reset email
       |
       v
Six-digit reset code
       |
       v
POST /api/v1/auth/reset-password
       |
       v
Password changed
       |
       v
Existing refresh sessions revoked
       |
       v
Login with new password
```

## Login

```text
Email + password
       |
       v
Spring Boot authentication
       |
       v
Email verification check
       |
       +-- Unverified
       |      -> EMAIL_VERIFICATION_REQUIRED
       |
       +-- Verified
              |
              +-- JWT access token
              +-- Refresh token
```

## Silent Refresh

```text
Protected request
       |
       v
Access token expired
       |
       v
401 Unauthorized
       |
       v
POST /api/v1/auth/refresh
       |
       v
Rotate refresh token
       |
       v
Store new token pair
       |
       v
Retry original request
```

## Logout

```text
POST /api/v1/auth/logout
       |
       v
Revoke refresh session
       |
       v
Remove local credentials
       |
       v
Return to authentication flow
```

---

# Main API Routes

All primary application routes use:

```text
/api/v1
```

## Public

```text
GET  /api/v1/status

POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET  /actuator/health
```

## Users

```text
GET    /api/v1/users/me
DELETE /api/v1/users/me
```

## Applications

```text
GET    /api/v1/applications
POST   /api/v1/applications
POST   /api/v1/applications/import-preview
GET    /api/v1/applications/summary
GET    /api/v1/applications/{id}
PUT    /api/v1/applications/{id}
DELETE /api/v1/applications/{id}
```

## Reminders

```text
GET    /api/v1/reminders
POST   /api/v1/reminders
GET    /api/v1/reminders/{id}
PUT    /api/v1/reminders/{id}
DELETE /api/v1/reminders/{id}
```

Protected routes require:

```http
Authorization: Bearer <access-token>
```

See the complete [API Reference](docs/03_API_REFERENCE.md).

---

# Authentication Errors

Email-verification errors include:

```text
EMAIL_VERIFICATION_REQUIRED
VERIFICATION_CODE_INCORRECT
VERIFICATION_CODE_EXPIRED
VERIFICATION_ATTEMPTS_EXCEEDED
VERIFICATION_RESEND_COOLDOWN
VERIFICATION_RATE_LIMITED
VERIFICATION_EMAIL_UNAVAILABLE
```

Password-reset challenge failures use:

```text
PASSWORD_RESET_CODE_INVALID_OR_EXPIRED
```

The reset error is intentionally generic.

Forgot-password requests for syntactically valid email addresses return generic `202 Accepted` behaviour to reduce account enumeration.

Job Link Import uses structured safe errors for invalid/unsafe URLs, unsupported sites/content, extraction failure, rate limiting, upstream unavailability and timeouts.

Rate-limited import responses can include:

```text
retryAfterSeconds
```

The frontend displays safe import failures without echoing sensitive submitted query-string data.

---

# Application Statuses

Backend values:

```text
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED
```

The frontend maps these to user-facing labels.

---

# Reminder Types

Backend values:

```text
INTERVIEW
ASSESSMENT
FOLLOW_UP
DEADLINE
OTHER
```

---

# Flyway

Database migrations are stored under:

```text
backend/src/main/resources/db/migration/
```

Current production sequence:

```text
V1 - application users
V2 - job applications
V3 - reminders
V4 - refresh-token sessions
V5 - refresh-token schema correction
V6 - email verification
V7 - email-verification rollout compatibility
V8 - remove rollout compatibility default
V9 - password-reset challenges
```

Current production schema:

```text
V9
```

Production verification:

```text
Successfully validated 9 migrations
Current version of schema "public": 9
Schema "public" is up to date
```

Applied migrations must never be edited.

New schema changes require new migration files.

---

# Testing Commands

## Frontend TypeScript

```powershell
npm run typecheck
```

## Expo Doctor

```powershell
npx expo-doctor
```

## Expo Web Export

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8080"
npm run build:web
Remove-Item Env:EXPO_PUBLIC_API_URL
```

## Backend Tests

From `backend/`:

```powershell
.\mvnw.cmd test
```

## Full Maven Verification

```powershell
.\mvnw.cmd clean verify
```

## Backend Smoke Test

With PostgreSQL and the backend running:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\scripts\smoke-test.ps1
```

---

# Continuous Integration

GitHub Actions validates pushes and pull requests.

## Frontend

```text
npm ci
TypeScript validation
Expo web export
```

## Backend

```text
Java 21
PostgreSQL
Maven tests/package
JUnit
MockMvc
Mockito
Testcontainers
```

## Docker

```text
Production image build
Non-root runtime verification
Health configuration verification
```

No production credentials are required by CI.

---

# Production Deployment

## Backend

* Provider: Render
* Deployment: Docker
* Production profile: `prod`
* Health endpoint: `/actuator/health`

## Database

* Provider: Neon
* PostgreSQL: 17
* Database: `applymate`
* SSL required
* Flyway: V9

## Email

* Provider: Resend
* Domain: `applymate.website`
* Sender: `verify@applymate.website`

Production configuration uses platform-managed environment variables.

Examples:

```text
SPRING_PROFILES_ACTIVE

DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
REFRESH_TOKEN_TTL

APP_CORS_ALLOWED_ORIGIN_PATTERNS
PORT

EMAIL_PROVIDER
EMAIL_FROM
RESEND_API_KEY
EMAIL_VERIFICATION_PEPPER
PASSWORD_RESET_PEPPER
```

Production access-token lifetime defaults to:

```text
PT15M
```

No Render `JWT_ACCESS_TOKEN_TTL` override is currently required.

Secret values must never be committed to Git or included in documentation.

---

# Mobile Distribution

ApplyMate is linked to Expo Application Services.

Expo project:

```text
@zaib_367/ApplyMate
```

EAS project ID:

```text
51084402-f9c2-459f-b2ee-d97854a31c0e
```

Permanent identifiers:

```text
Android: com.zaib367.applymate
iOS:     com.zaib367.applymate
```

Marketing version:

```text
1.0.0
```

EAS build profiles:

* `development` — native development client, internal distribution
* `preview` — standalone internal testing
* `ios-simulator` — credential-free native iOS Simulator compilation
* `production` — store distribution with remote native version auto-increment

EAS environments:

```text
production:
  EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
  EXPO_PUBLIC_GMAIL_ENABLED=false

preview:
  EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
  EXPO_PUBLIC_GMAIL_ENABLED=true

development:
  EXPO_PUBLIC_GMAIL_ENABLED=true
```

## Android

Checkpoint 3 produced a real store-distribution Android App Bundle using the existing EAS-managed keystore.

```text
Build ID:     b4f877a4-7120-4af2-b5b1-cb8c0f933675
Profile:      production
Distribution: store
Version:      1.0.0
Version code: 2
Result:       PASS / AAB generated
```

This build validates the native release pipeline. A final AAB must be rebuilt from the exact frozen `v1.8.0` commit before store submission because the final release includes the Gmail production gate and documentation/compliance hardening.

The earlier v1.7.0 standalone preview build remains the Gmail-authorised runtime validation build and passed real Google OAuth/Gmail API testing.

## iOS

The permanent bundle identifier is:

```text
com.zaib367.applymate
```

Checkpoint 3 added an `ios-simulator` EAS profile and successfully compiled the native iOS application without Apple distribution credentials.

```text
Build ID:     9d9d5aba-6054-4693-bf57-f2647d444ed4
Profile:      ios-simulator
Version:      1.0.0
Build number: 1
Result:       PASS / native Simulator archive generated
```

The app also declares:

```text
ITSAppUsesNonExemptEncryption=false
```

This proves native iOS compilation. Apple App Store production signing, TestFlight and App Store submission remain unavailable until Apple Developer Program enrolment.

No App Store or Google Play submission has been performed as part of v1.8.0 finalisation.

# Account Deletion & Privacy

## In-App Deletion

```text
Profile -> Delete Account
```

Backend endpoint:

```text
DELETE /api/v1/users/me
```

## Privacy Policy

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

## Account Deletion Information

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

## Support

```text
support.applymate@gmail.com
```

---

# Security Notes

ApplyMate follows these security rules:

* Passwords are stored as secure hashes.
* JWT access tokens are short-lived.
* Production access tokens default to 15 minutes.
* Refresh tokens are opaque random credentials.
* Only refresh-token hashes are persisted.
* Refresh tokens rotate after use.
* Refresh sessions can be revoked.
* Successful password reset revokes active refresh sessions.
* Native authentication credentials use Expo SecureStore.
* Raw verification codes are never persisted.
* Raw password-reset codes are never persisted.
* Verification-code hashes use HMAC-SHA-256.
* Password-reset hashes use HMAC-SHA-256.
* Verification and password reset use separate peppers.
* Authentication peppers are backend-only.
* Resend credentials are backend-only.
* Forgot-password responses do not expose account existence.
* Password reset does not imply email verification.
* Unverified accounts cannot obtain normal authenticated access.
* Application and reminder queries are user-scoped.
* Account deletion derives identity from the authenticated JWT.
* Database credentials remain backend-only.
* JWT signing secrets remain backend-only.
* Production traffic uses HTTPS.
* Secrets are stored using platform environment configuration.
* Credentials exposed in logs must be treated as compromised and rotated.
* Applied production Flyway migrations are immutable.
* Submitted job URLs are treated as untrusted input.
* Full submitted job URLs and query strings are not logged.
* Every job-import redirect target is revalidated.
* Private, loopback and link-local import destinations are rejected.
* Job-page response and decompression sizes are bounded.
* Mobile authentication headers and user cookies are not forwarded to job sites.
* Imported data is not persisted until the user explicitly saves it.
* Gmail OAuth requests only the `gmail.readonly` scope.
* Gmail access tokens are not sent to the ApplyMate backend or PostgreSQL.
* ApplyMate does not persist Gmail message bodies or snippets.
* Gmail body retrieval is staged, bounded and discarded after classification.
* Raw MIME and Gmail attachments are not fetched by the v1 integration.
* Gmail suggestions never mutate an application without explicit user confirmation.
* Confirmation revalidates current application state to prevent stale/backwards updates.
* Gmail integration state is namespaced by ApplyMate user and Google account.
* Disconnect/account cleanup removes local Gmail processing state.
# Production Verification

Email verification has been tested end to end:

```text
Mobile registration
      |
      v
Render API
      |
      v
Neon unverified user
      |
      v
Verification challenge
      |
      v
Resend
      |
      v
Real user inbox
      |
      v
Verification
      |
      v
Login
      |
      v
Dashboard
```

Password reset has also been tested end to end:

```text
Forgot Password
      |
      v
Render API
      |
      v
Neon reset challenge
      |
      v
Resend
      |
      v
Real user inbox
      |
      v
Reset Password
      |
      v
Old password rejected
      |
      v
New password accepted
      |
      v
Password-changed email
```

Job Link Import has also been tested end to end against production:

```text
Public job URL
      |
      v
Render import-preview API
      |
      v
Safe server-side fetch
      |
      v
Editable mobile preview
      |
      v
User reviews/edits
      |
      v
Existing Save Application API
      |
      v
Neon PostgreSQL
```

Current verified production behaviour includes:

* Existing-account compatibility
* New unverified registration
* Verification email delivery
* Verification resend
* Old verification-code invalidation
* Unverified-login protection
* Unverified-refresh protection
* Login after verification
* Persistent authenticated sessions
* Forgot-password public access
* Unknown valid email returning HTTP `202`
* Real reset-email delivery
* Successful password reset
* Old-password rejection
* New-password authentication
* Password-changed email delivery
* Supported public job-link import
* Imported fields remaining editable
* Save through the existing application API
* Add Application form reset after successful save
* LinkedIn/Indeed automatic-import rejection
* Unsafe loopback URL rejection
* Existing application edit/delete regression after import rollout
* Flyway V9
* API status HTTP `200`
* Actuator health HTTP `200`

Recruitment Email Integration has also been release-candidate verified end to end on Android:

```text
Standalone EAS preview build
      |
      v
Native Google account selection
      |
      v
gmail.readonly
      |
      v
Direct Gmail API sync
      |
      v
Deterministic local suggestion engine
      |
      v
User review
      |
      +-- Ignore -> no change
      |
      +-- Confirm -> existing production application API
```

Verified Gmail behaviour includes:

* Real Google OAuth and Gmail API access
* Repeated sync without duplicate suggestions
* Local-state migration from SecureStore to AsyncStorage
* Old Applied/application-received email cannot downgrade Interview
* Old rejection cannot overwrite newer application progress
* Missing application can be created from the email workflow
* Forward updates apply only after Confirm
* Account B cannot see Account A Gmail state
* Disconnect removes Gmail integration state while preserving applications
* Production `/api/v1/status` and `/actuator/health` returned HTTP `200` after release-candidate testing

Unrestricted public Gmail access is not yet claimed; Google restricted-scope verification remains an external rollout gate.
# Operational Notes

The production environment uses portfolio-tier infrastructure.

Render can experience a cold-start delay after inactivity.

During startup, the API may temporarily be unavailable while Spring Boot and PostgreSQL connectivity initialise.

Readiness can be checked through:

```text
/api/v1/status
/actuator/health
```

Once ready, both return:

```text
HTTP 200
UP
```

---

# Documentation

| Document | Description |
| --- | --- |
| [Project Context](docs/01_PROJECT_CONTEXT.md) | Current project state, release status and production configuration |
| [Architecture](docs/02_ARCHITECTURE.md) | Frontend, backend, security, Gmail and infrastructure architecture |
| [API Reference](docs/03_API_REFERENCE.md) | REST routes, request/response contracts and errors |
| [Development Log](docs/04_DEVELOPMENT_LOG.md) | Chronological implementation, deployment and release history |
| [Roadmap](docs/05_ROADMAP.md) | Completed phases, frozen historical backlog and release gates |
| [Product Backlog](docs/06_PRODUCT_BACKLOG.md) | Historical backlog retained for context; not an active feature plan |
| [Final Handoff Runbook](docs/07_FINAL_HANDOFF_RUNBOOK.md) | Authoritative build/deploy/store handoff and recovery procedure |
| [Store Submission Pack](docs/08_STORE_SUBMISSION_PACK.md) | Apple/Google metadata, reviewer guidance and privacy declarations |
| [Privacy Policy](docs/privacy-policy.html) | Public privacy and Google-data disclosure |
| [Account Deletion](docs/delete-account.html) | Public account-deletion instructions and data scope |

# Project Status

ApplyMate feature development is complete. The project is in **Final Handoff & Store Submission Readiness**.

Completed milestones include:

* Frontend and backend MVPs
* Production Render + Neon deployment
* Docker/CI production readiness
* Backend-synchronised reminders
* Persistent rotating refresh-token sessions
* Account deletion and public privacy pages
* Production email verification through Resend
* Secure password reset and session revocation
* Secure Job Link Import
* Recruitment Email Integration for authorised Google test users
* Gmail production release gate
* Independent clean-clone reproducibility proof
* 144/144 backend tests from an isolated clean environment
* Production Docker image validation
* Android production AAB build validation
* Native iOS Simulator EAS compilation validation
* Final handoff/deployment runbook
* Apple App Store and Google Play submission pack
* Updated privacy and account-deletion disclosures

Current release:

```text
v1.8.0
```

Previous release:

```text
v1.7.0
```

Current production database:

```text
Flyway V9
```

Final handoff validation completed before the final merge/tag stage:

```text
Fresh clone / Git identity           PASS
npm ci                              PASS
Frontend TypeScript                 PASS
Expo dependency check               PASS
Expo Doctor                         17/18 known Nitro metadata warning
Expo web export                     PASS
Gmail deterministic logic           PASS
Backend clean verify                144 tests / 0 failures / 0 errors
Backend JAR package                 PASS
Production Docker image             PASS
Android production AAB              PASS
iOS Simulator native build          PASS
Production Gmail gate               PASS
Public Gmail UI in production export ABSENT
```

External account/approval gates remain:

* Google restricted-scope verification before unrestricted public Gmail is enabled
* Google Play developer account/application before Play submission
* Apple Developer Program enrolment before App Store distribution

These do not reopen product feature development.

After `v1.8.0`, ApplyMate is frozen except for genuine bug fixes, store/compliance changes, Google OAuth verification work, security maintenance and provider-required maintenance.

# Licence

ApplyMate is licensed under the MIT License.

See [LICENSE](LICENSE).

---

# Author

**Muhammad Shahzaib Shehzad**

GitHub: [shehzadm-muhammad](https://github.com/shehzadm-muhammad)
