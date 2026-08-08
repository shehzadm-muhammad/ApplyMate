## About ApplyMate

ApplyMate is a full-stack React Native mobile application backed by a Spring Boot REST API and PostgreSQL database.

Users can:

- Create an account
- Sign in securely
- Maintain a persistent authenticated session
- Create and manage job applications
- Search, filter and sort applications
- View dashboard statistics
- Create reminders
- Receive local reminder notifications
- Permanently delete their account and associated data

Server-managed data is stored in PostgreSQL and isolated by authenticated user.

The current release milestone includes:

- React Native / Expo frontend
- Spring Boot backend
- PostgreSQL persistence
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

The functional **Mobile Distribution & Release Readiness** work is complete and the project is being closed out for release `v1.3.0`.

---

# Production Architecture

```text
React Native / Expo mobile application
               |
               | HTTPS + JSON
               | JWT access token
               | Refresh-token session
               v
Render
Spring Boot Docker API
               |
               | JDBC over TLS
               v
Neon PostgreSQL 17
````

Supporting services:

```text
Expo Application Services
    -> Android / future iOS builds

GitHub Pages
    -> Privacy Policy
    -> Account deletion information
```

The mobile client never connects directly to PostgreSQL.

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

---

# Features

## Authentication

* User registration
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
Access token:    1 hour
Refresh session: 30 days
```

If an access token expires while the refresh session remains valid, ApplyMate automatically obtains a new token and retries the protected request.

## Job Applications

* Create an application
* List applications
* View application details
* Edit applications
* Delete applications
* Search applications
* Filter by status
* Sort application records
* Per-user ownership protection
* Backend validation
* Consistent API errors

## Dashboard

* Total application count
* Status-specific counts
* Backend-powered summary data
* Loading state
* Error state
* Pull-to-refresh

## Reminders

* Create reminders
* Edit reminders
* Delete reminders
* Backend persistence
* Per-user reminder isolation
* Local notification scheduling
* Device notification cleanup

Reminder records are stored in PostgreSQL.

Actual notification scheduling remains device-side through Expo Notifications.

```text
Reminder record
    -> Spring Boot API
    -> PostgreSQL

Notification scheduling
    -> Expo Notifications
    -> Mobile operating system
```

## Account Deletion

Users can permanently delete their account from:

```text
Profile -> Delete Account
```

The app uses two destructive confirmation prompts.

Successful deletion removes:

* User account
* Job applications
* Reminders
* Refresh-token sessions
* Local authentication credentials
* Stored reminder notification IDs
* Associated scheduled reminder notifications
* Local account-related settings

Deleted credentials can no longer authenticate.

## Device Features

Device-side functionality includes:

* Local notification scheduling
* Notification permission state
* Face ID preference
* Device-specific settings

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

## Backend

* Java 21
* Spring Boot 4.1
* Spring Security
* OAuth2 Resource Server
* Spring Data JPA
* Bean Validation
* Spring Boot Actuator
* Maven

## Database

* PostgreSQL 17
* Flyway
* Hibernate
* HikariCP

## Infrastructure

* Docker
* Docker Compose
* Render
* Neon
* GitHub Actions
* GitHub Pages
* Expo Application Services

## Testing

* TypeScript compiler
* Expo Doctor
* JUnit
* MockMvc
* Mockito
* Testcontainers
* Maven
* Docker verification
* PowerShell API smoke tests
* Android emulator testing
* Production mobile smoke testing

Current backend result:

```text
Tests run: 40
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Latest Expo Doctor result:

```text
18/18 checks passed
```

---

# Repository Structure

```text
ApplyMate/
├── assets/                         # App icons and static assets
├── backend/
│   ├── scripts/                    # Backend smoke-test scripts
│   ├── src/main/
│   │   ├── java/                   # Spring Boot application
│   │   └── resources/
│   │       └── db/migration/       # Flyway migrations
│   ├── src/test/                   # Backend tests
│   ├── compose.yaml                # Local PostgreSQL
│   ├── Dockerfile                  # Production backend image
│   └── pom.xml                     # Maven configuration
├── docs/
│   ├── 01_PROJECT_CONTEXT.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_API_REFERENCE.md
│   ├── 04_DEVELOPMENT_LOG.md
│   ├── 05_ROADMAP.md
│   ├── index.html                  # GitHub Pages landing page
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
* Node.js and npm
* Java 21
* Docker Desktop
* Expo Go, Android emulator or compatible development device

Docker must be running for the local PostgreSQL database and Testcontainers integration tests.

---

## 1. Clone the Repository

```powershell
git clone https://github.com/shehzadm-muhammad/ApplyMate.git
cd ApplyMate
```

## 2. Install Frontend Dependencies

```powershell
npm ci
```

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

When using an Android emulator against a local backend, ADB reverse can be used:

```powershell
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

Port responsibilities:

```text
8080 -> local Spring Boot API
8081 -> Expo / Metro development server
```

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
JWT_SECRET=<base64-secret>
```

Never commit `backend/.env`.

## 5. Generate a Development JWT Secret

PowerShell:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Store the generated value locally:

```text
JWT_SECRET=<generated-value>
```

## 6. Start PostgreSQL

From `backend/`:

```powershell
docker compose up -d
docker compose ps
```

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

Expo / Metro normally runs on port `8081`.

---

# Environment Files

| File                   | Purpose                          | Committed |
| ---------------------- | -------------------------------- | --------: |
| `.env.example`         | Frontend environment template    |       Yes |
| `.env.local`           | Local frontend API configuration |        No |
| `backend/.env.example` | Backend environment template     |       Yes |
| `backend/.env`         | Local backend/database secrets   |        No |

Passwords, signing secrets, private keys and database credentials must never be committed.

---

# Authentication Flow

## Login

```text
Email + password
       |
       v
Spring Boot authentication
       |
       ├── JWT access token
       └── Refresh token
               |
               v
        Expo SecureStore
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
Remove local tokens
       |
       v
Return to authentication flow
```

---

# Main API Routes

All primary API routes use:

```text
/api/v1
```

## Public

```text
GET  /api/v1/status

POST /api/v1/auth/register
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

## Flyway

Database migrations are stored under:

```text
backend/src/main/resources/db/migration/
```

Current migration sequence:

```text
V1 - application users
V2 - job applications
V3 - reminders
V4 - refresh-token sessions
V5 - refresh-token schema correction
```

Applied migrations must not be edited.

New schema changes require a new Flyway migration.

---

# Testing

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

* `npm ci`
* TypeScript validation
* Expo web export

## Backend

* Java 21
* PostgreSQL CI service
* Maven verification
* JUnit
* MockMvc
* Testcontainers
* Spring Boot packaging

## Docker

* Build production backend image
* Verify non-root runtime
* Verify health configuration

Production credentials are not used by CI.

---

# Production Deployment

## Backend

* Provider: Render
* Deployment: Docker
* Region: Frankfurt
* Production profile: `prod`
* Health endpoint: `/actuator/health`

## Database

* Provider: Neon
* PostgreSQL: 17
* Database: `applymate`
* SSL required

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
```

No production secrets are committed to Git.

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

* Development
* Preview
* Production

Preview and production environments are configured to use the Render production API.

## Android

Android preview/internal-distribution builds have been generated successfully.

The final Android release candidate passed standalone production smoke testing.

Verified:

* Launch
* Login
* Dashboard
* Application CRUD
* Search/filtering
* Reminders
* Session restoration
* Privacy Policy
* Delete Account UI
* Logout
* Logged-out restoration

## iOS

The permanent bundle identifier and EAS configuration are complete.

Development testing has been performed using Expo Go.

Standalone/TestFlight/App Store distribution is deferred until Apple Developer Program enrolment.

---

# Account Deletion & Privacy

## In-App Deletion

Authenticated users can use:

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

* Passwords are stored as secure hashes.
* JWT access tokens are short-lived.
* Refresh tokens are opaque random credentials.
* Only refresh-token hashes are stored in PostgreSQL.
* Refresh tokens rotate after use.
* Refresh sessions can be revoked.
* Native authentication tokens are stored using Expo SecureStore.
* Application and reminder queries are scoped to the authenticated user.
* Account deletion derives user identity from authentication rather than client-supplied IDs.
* Database credentials remain backend-only.
* JWT signing secrets remain backend-only.
* Production traffic uses HTTPS.
* Secrets are stored using platform environment configuration rather than Git.

---

# Operational Notes

The current production environment uses portfolio-tier infrastructure.

Render can experience a cold-start delay after inactivity.

During startup, the API may temporarily be unavailable.

Readiness can be checked through:

```text
/api/v1/status
/actuator/health
```

Once ready, both return HTTP `200` and `UP`.

---

# Documentation

| Document                                      | Description                                                 |
| --------------------------------------------- | ----------------------------------------------------------- |
| [Project Context](docs/01_PROJECT_CONTEXT.md) | Current state, decisions and constraints                    |
| [Architecture](docs/02_ARCHITECTURE.md)       | Frontend, backend, security and infrastructure architecture |
| [API Reference](docs/03_API_REFERENCE.md)     | Routes, request/response structures and errors              |
| [Development Log](docs/04_DEVELOPMENT_LOG.md) | Chronological implementation history                        |
| [Roadmap](docs/05_ROADMAP.md)                 | Completed phases and planned work                           |
| [Backend README](backend/README.md)           | Backend-specific documentation                              |
| [Privacy Policy](docs/privacy-policy.html)    | Public privacy information                                  |
| [Account Deletion](docs/delete-account.html)  | Public account-deletion information                         |

---

# Project Status

Completed milestones:

* Frontend MVP
* Backend MVP
* Frontend/backend integration
* MVP polish
* Deployment and production readiness
* Render deployment
* Neon PostgreSQL deployment
* CI
* Docker production configuration
* EAS configuration
* Android internal distribution
* Backend reminder synchronisation
* Persistent refresh-token authentication
* Account deletion
* Privacy and account-deletion webpages
* Production authentication testing
* Android release-candidate testing

Current release:

```text
v1.2.0
```

Next release:

```text
v1.3.0
```

Remaining work for `v1.3.0` is release closeout only:

1. Final documentation validation
2. Final frontend/backend/Docker validation
3. GitHub Actions confirmation
4. Release tag creation

Potential future development includes:

* Email verification using OTP
* Password reset
* Job-link import
* Email integration
* Public Google Play release
* Apple TestFlight/App Store distribution

---

# Licence

ApplyMate is licensed under the MIT License.

See [LICENSE](LICENSE).

---

# Author

**Muhammad Shahzaib Shehzad**

GitHub: [shehzadm-muhammad](https://github.com/shehzadm-muhammad)