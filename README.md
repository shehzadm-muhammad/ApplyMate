# ApplyMate

**Apply smarter. Get hired faster.**

ApplyMate is a full-stack mobile job-application tracker built with React Native, Expo, Spring Boot and PostgreSQL.

It allows users to manage job applications, reminders and authenticated sessions from a mobile application backed by a production REST API.

The current production release also includes mandatory email verification for new accounts.

---

# About ApplyMate

Users can:

- Create an account
- Verify their email address
- Sign in securely
- Maintain a persistent authenticated session
- Create and manage job applications
- Search, filter and sort applications
- View dashboard statistics
- Create reminders
- Receive local reminder notifications
- Permanently delete their account and associated data

Server-managed data is stored in PostgreSQL and isolated by authenticated user.

Current capabilities include:

- React Native / Expo frontend
- Spring Boot backend
- PostgreSQL persistence
- Email verification
- Resend transactional email
- Verified `applymate.website` sending domain
- JWT access tokens
- Refresh-token rotation
- Secure persistent sessions
- Job-application CRUD
- Backend-synchronised reminders
- Search, filtering and sorting
- Dashboard summaries
- Account deletion
- Privacy Policy integration
- Automated testing
- Docker deployment
- GitHub Actions CI
- Render production hosting
- Neon PostgreSQL
- Expo Application Services
- Android internal distribution

The email-verification feature is deployed and verified in production.

The project is currently being closed out for release:

```text
v1.4.0
```

---

# Production Architecture

```text
┌────────────────────────────────────┐
│     React Native / Expo Client     │
│                                    │
│  TypeScript                        │
│  React Navigation                  │
│  Expo SecureStore                  │
│  Expo Notifications                │
└────────────────┬───────────────────┘
                 │
                 │ HTTPS + JSON
                 │ JWT / refresh session
                 ▼
┌────────────────────────────────────┐
│              Render                │
│                                    │
│  Spring Boot Docker API            │
│  Java 21                           │
│  Spring Security                   │
│  Flyway                            │
│  JPA / Hibernate                   │
└─────────────┬─────────────┬────────┘
              │             │
              │ JDBC/TLS    │ HTTPS
              ▼             ▼
┌──────────────────────┐  ┌─────────────────────┐
│        Neon          │  │       Resend        │
│                      │  │                     │
│ PostgreSQL 17        │  │ Verification email  │
│ Flyway V8            │  │                     │
└──────────────────────┘  │ applymate.website   │
                          │                     │
                          │ verify@             │
                          │ applymate.website   │
                          └──────────┬──────────┘
                                     │
                                     ▼
                               User inbox
```

Supporting services:

```text
Expo Application Services
    -> Android builds
    -> future iOS builds

GitHub Pages
    -> Privacy Policy
    -> Account deletion information
```

The mobile application never connects directly to PostgreSQL or Resend.

Backend secrets remain backend-only.

---

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

Current production status:

```text
/api/v1/status   -> UP
/actuator/health -> UP
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

## Verification Email

Transactional email provider:

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

- Six-digit numeric verification codes
- `SecureRandom` code generation
- Ten-minute expiry
- Maximum five incorrect attempts
- Sixty-second resend cooldown
- Five-code issue limit per one-hour window
- Replacement-code invalidation
- HMAC-SHA-256 code protection
- Server-side verification pepper
- No raw verification-code persistence
- Unverified-login protection
- Unverified-refresh protection

Pending verification state survives an application restart.

The mobile client stores only information required to restore the flow.

It does not store:

```text
password
verification code
Resend API key
verification pepper
```

---

## Authentication

ApplyMate supports:

- User registration
- Email verification
- Secure password hashing
- Email/password login
- JWT access tokens
- Refresh tokens
- Refresh-token rotation
- Refresh-token families
- Refresh-session revocation
- Secure native token storage
- Silent access-token renewal
- Persistent session restoration
- Backend logout
- Invalid-session handling
- Current-user profile
- Protected navigation

Production session configuration:

```text
Access token:    1 hour
Refresh session: 30 days
```

If an access token expires while the refresh session remains valid, ApplyMate automatically obtains a new token and retries the protected request.

An unverified account cannot obtain authenticated application access through either login or refresh.

---

## Job Applications

Users can:

- Create applications
- List applications
- View application details
- Edit applications
- Delete applications
- Search applications
- Filter by status
- Sort records
- View backend-powered dashboard statistics

Every application belongs to one authenticated user.

Backend ownership rules prevent users from accessing another user's records.

---

## Dashboard

The dashboard provides:

- Total application count
- Saved count
- Applied count
- Assessment count
- Interview count
- Offer count
- Rejected count
- Loading state
- Error state
- Pull-to-refresh

Summary values come from:

```text
GET /api/v1/applications/summary
```

---

## Reminders

ApplyMate supports:

- Create reminders
- Edit reminders
- Delete reminders
- Backend reminder persistence
- Per-user reminder isolation
- Local notification scheduling
- Device notification cleanup

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

Actual operating-system notification scheduling remains device-side.

---

## Account Deletion

Users can permanently delete their account from:

```text
Profile -> Delete Account
```

The application uses two destructive confirmation prompts.

Successful deletion removes backend-owned data including:

- User account
- Job applications
- Reminders
- Refresh-token sessions
- Email-verification challenge data

The mobile client also removes:

- Authentication credentials
- Pending verification state
- Reminder notification identifiers
- Scheduled reminder notifications
- Account-specific local settings

Deleted credentials can no longer authenticate.

---

# Technology Stack

## Mobile Frontend

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Expo SecureStore
- AsyncStorage
- Expo Notifications
- Expo Application Services

## Backend

- Java 21
- Spring Boot 4.1
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- Bean Validation
- Spring Boot Actuator
- Spring RestClient
- Maven

## Database

- PostgreSQL 17
- Flyway
- Hibernate
- HikariCP

## Email

- Resend
- Custom verified sending domain
- DKIM
- SPF
- DMARC

## Infrastructure

- Docker
- Docker Compose
- Render
- Neon
- GitHub Actions
- GitHub Pages
- Expo Application Services

---

# Testing

ApplyMate uses:

- TypeScript compiler validation
- Expo Doctor
- Expo web export
- JUnit
- MockMvc
- Mockito
- Testcontainers
- Maven
- Docker verification
- PowerShell API smoke tests
- Android emulator testing
- Physical-device Expo testing
- Production mobile smoke testing
- Production email-delivery testing
- Flyway migration integration testing

Current backend result:

```text
Tests run: 89
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Latest Expo Doctor result:

```text
18/18 checks passed
```

GitHub Actions is green for the current production code.

---

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

- Git
- Node.js and npm
- Java 21
- Docker Desktop
- Expo Go, Android emulator or compatible development device

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
```

Production:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

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
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Use independently generated values where separate secrets are required.

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

From the repository root:

```powershell
npm start
```

or:

```powershell
npm run android
npm run web
```

---

# Environment Files

| File | Purpose | Committed |
|---|---|---:|
| `.env.example` | Frontend environment template | Yes |
| `.env.local` | Local frontend configuration | No |
| `backend/.env.example` | Backend environment template | Yes |
| `backend/.env` | Local backend secrets | No |

Secrets, passwords, signing keys and provider credentials must never be committed.

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
       ├── Unverified
       │      -> EMAIL_VERIFICATION_REQUIRED
       │
       └── Verified
              |
              ├── JWT access token
              └── Refresh token
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

# Email Verification Errors

The API exposes machine-readable verification errors such as:

```text
EMAIL_VERIFICATION_REQUIRED
VERIFICATION_CODE_INCORRECT
VERIFICATION_CODE_EXPIRED
VERIFICATION_ATTEMPTS_EXCEEDED
VERIFICATION_RESEND_COOLDOWN
VERIFICATION_RATE_LIMITED
VERIFICATION_EMAIL_UNAVAILABLE
```

Cooldown and rate-limit errors can include retry timing.

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

# Database Management

Local PostgreSQL is defined by:

```text
backend/compose.yaml
```

Start:

```powershell
docker compose up -d
```

Stop without deleting data:

```powershell
docker compose down
```

Delete the local database volume:

```powershell
docker compose down -v
```

The final command permanently removes local database data.

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
```

Current production schema:

```text
V8
```

Final `email_verified_at` schema behaviour:

```text
column_default = NULL
is_nullable    = YES
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

- Provider: Render
- Deployment: Docker
- Production profile: `prod`
- Health endpoint: `/actuator/health`

## Database

- Provider: Neon
- PostgreSQL: 17
- Database: `applymate`
- SSL required
- Flyway: V8

## Email

- Provider: Resend
- Domain: `applymate.website`
- Sender: `verify@applymate.website`

Production configuration uses platform-managed environment variables.

Examples:

```text
SPRING_PROFILES_ACTIVE

DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_ACCESS_TOKEN_TTL
REFRESH_TOKEN_TTL

APP_CORS_ALLOWED_ORIGIN_PATTERNS
PORT

EMAIL_PROVIDER
EMAIL_FROM
RESEND_API_KEY
EMAIL_VERIFICATION_PEPPER
```

Secret values must never be committed to Git or included in documentation.

---

# Mobile Distribution

ApplyMate is linked to Expo Application Services.

Expo project:

```text
@zaib_367/ApplyMate
```

Permanent identifiers:

```text
Android:
com.zaib367.applymate

iOS:
com.zaib367.applymate
```

Marketing version:

```text
1.0.0
```

EAS build profiles include:

- Development
- Preview
- Production

Preview and production environments use the Render production API.

---

## Android

Android preview/internal-distribution builds have been generated successfully.

Standalone production-connected testing verified:

- Launch
- Login
- Dashboard
- Application CRUD
- Search/filtering
- Reminders
- Session restoration
- Privacy Policy
- Delete Account UI
- Logout

Email verification has additionally been verified against production from a real mobile device through Expo.

---

## iOS

The permanent bundle identifier and EAS configuration are complete.

Development/production-connected testing has been performed through Expo Go.

Standalone/TestFlight/App Store distribution remains deferred until Apple Developer Program enrolment.

---

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

ApplyMate follows the following security rules:

- Passwords are stored as secure hashes.
- JWT access tokens are short-lived.
- Refresh tokens are opaque random credentials.
- Only refresh-token hashes are persisted.
- Refresh tokens rotate after use.
- Refresh sessions can be revoked.
- Native authentication credentials use Expo SecureStore.
- Raw verification codes are never persisted.
- Verification-code hashes use HMAC-SHA-256.
- The verification pepper is backend-only.
- Resend credentials are backend-only.
- Unverified accounts cannot obtain normal authenticated access.
- Application and reminder queries are user-scoped.
- Account deletion derives identity from the authenticated JWT.
- Database credentials remain backend-only.
- JWT signing secrets remain backend-only.
- Production traffic uses HTTPS.
- Secrets are stored using platform environment configuration.
- Credentials exposed in logs must be treated as compromised and rotated.
- Applied production Flyway migrations are immutable.

---

# Production Email Verification Rollout

The feature was deployed using a controlled migration sequence.

```text
Production V5
      |
      v
V6 - add email verification
      |
      v
V7 - temporary zero-downtime compatibility
      |
      v
Verify production registration/email flow
      |
      v
Security hardening
      |
      v
V8 - remove temporary compatibility default
```

Existing accounts were backfilled as verified.

New accounts start unverified.

Final production state:

```text
Flyway: V8

email_verified_at:
default  = NULL
nullable = YES
```

---

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
Verify Email screen
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

Verified production behaviour includes:

- Existing-account compatibility
- New unverified registration
- Verification email delivery
- Custom sender domain
- Correct-code verification
- Incorrect-code handling
- Resend
- Old-code invalidation
- App-restart recovery
- Unverified-login redirection
- Login after verification
- Persistent authenticated session
- Final V8 database migration
- API status `UP`
- Actuator health `UP`

---

# Operational Notes

The production environment uses portfolio-tier infrastructure.

Render can experience a cold-start delay after inactivity.

During startup, the API may temporarily be unavailable.

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
|---|---|
| [Project Context](docs/01_PROJECT_CONTEXT.md) | Current project state and production configuration |
| [Architecture](docs/02_ARCHITECTURE.md) | Frontend, backend, security and infrastructure architecture |
| [API Reference](docs/03_API_REFERENCE.md) | Routes, request/response contracts and errors |
| [Development Log](docs/04_DEVELOPMENT_LOG.md) | Chronological implementation and production history |
| [Roadmap](docs/05_ROADMAP.md) | Completed phases and future development |
| [Privacy Policy](docs/privacy-policy.html) | Public privacy information |
| [Account Deletion](docs/delete-account.html) | Public account-deletion information |

---

# Project Status

Completed milestones:

- Frontend MVP
- Backend MVP
- Frontend/backend integration
- MVP polish
- Deployment and production readiness
- Render deployment
- Neon PostgreSQL deployment
- CI
- Docker production configuration
- EAS configuration
- Android internal distribution
- Backend reminder synchronisation
- Persistent refresh-token authentication
- Account deletion
- Privacy and account-deletion webpages
- Production authentication testing
- Mobile distribution release
- Email verification
- Resend integration
- Verified transactional-email domain
- Verification restart recovery
- Verification rate limiting
- Unverified login/refresh protection
- Resend secret-safety hardening
- Flyway V8 rollout cleanup
- Production email-verification testing

Current release:

```text
v1.3.0
```

Next release:

```text
v1.4.0
```

Current production code before documentation closeout:

```text
beca795
```

Current production database:

```text
Flyway V8
```

Current backend automated result:

```text
89 tests passing
```

Potential future development includes:

- Password reset
- Job-link import
- Expanded email integration
- Application automation
- Public Google Play release
- Apple TestFlight/App Store distribution

---

# Licence

ApplyMate is licensed under the MIT License.

See [LICENSE](LICENSE).

---

# Author

**Muhammad Shahzaib Shehzad**

GitHub: [shehzadm-muhammad](https://github.com/shehzadm-muhammad)