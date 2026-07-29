# ApplyMate Project Context

## Product

ApplyMate is a full-stack mobile job-application tracker.

It allows authenticated users to record job applications, monitor their progress, search and filter applications, and view dashboard statistics.

## Current Phase

**Mobile Distribution & Release Readiness**

The following phases are complete:

- Frontend MVP
- Backend MVP
- Frontend and backend integration
- MVP polish
- Deployment and production readiness

The deployed MVP is running successfully against a production Spring Boot backend and PostgreSQL database.

## Current Git State

- Stable branch: `main`
- Current documentation branch: `docs/production-closeout`
- Latest completed milestone: Production deployment and smoke testing
- Current release tag: `v1.1.0-mvp`
- Next planned release tag: `v1.2.0`

The `v1.2.0` tag will be created after the production close-out documentation is merged and CI passes.

## Technology Stack

### Mobile frontend

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Expo SecureStore
- AsyncStorage
- Expo Notifications

### Backend

- Java 21
- Spring Boot 4.1
- Maven
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- Bean Validation
- Spring Boot Actuator

### Database

- PostgreSQL 17
- Flyway
- Hibernate
- HikariCP

### Local development

- Docker Desktop
- Docker Compose
- Local PostgreSQL container
- Maven Wrapper
- Expo development server

### Production infrastructure

- Render Docker web service
- Neon PostgreSQL
- HTTPS public API
- Platform-managed environment variables
- Render health checks
- GitHub Actions continuous integration

### Testing

- TypeScript compiler checks
- Expo web export
- JUnit
- MockMvc
- Mockito
- Testcontainers
- Maven verification
- Docker image verification
- PowerShell backend smoke testing
- Manual mobile-to-production smoke testing

## Production Architecture

```text
React Native / Expo application
               |
               | HTTPS and JSON
               | Authorization: Bearer <JWT>
               v
Render
Spring Boot Docker service
               |
               | Encrypted PostgreSQL connection
               v
Neon
PostgreSQL database# ApplyMate Project Context

## Product

ApplyMate is a full-stack mobile job-application tracker.

It allows authenticated users to record job applications, monitor their progress, search and filter applications, and view dashboard statistics.

## Current Phase

**Mobile Distribution & Release Readiness**

The following phases are complete:

- Frontend MVP
- Backend MVP
- Frontend and backend integration
- MVP polish
- Deployment and production readiness

The deployed MVP is running successfully against a production Spring Boot backend and PostgreSQL database.

## Current Git State

- Stable branch: `main`
- Current documentation branch: `docs/production-closeout`
- Latest completed milestone: Production deployment and smoke testing
- Current release tag: `v1.1.0-mvp`
- Next planned release tag: `v1.2.0`

The `v1.2.0` tag will be created after the production close-out documentation is merged and CI passes.

## Technology Stack

### Mobile frontend

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Expo SecureStore
- AsyncStorage
- Expo Notifications

### Backend

- Java 21
- Spring Boot 4.1
- Maven
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- Bean Validation
- Spring Boot Actuator

### Database

- PostgreSQL 17
- Flyway
- Hibernate
- HikariCP

### Local development

- Docker Desktop
- Docker Compose
- Local PostgreSQL container
- Maven Wrapper
- Expo development server

### Production infrastructure

- Render Docker web service
- Neon PostgreSQL
- HTTPS public API
- Platform-managed environment variables
- Render health checks
- GitHub Actions continuous integration

### Testing

- TypeScript compiler checks
- Expo web export
- JUnit
- MockMvc
- Mockito
- Testcontainers
- Maven verification
- Docker image verification
- PowerShell backend smoke testing
- Manual mobile-to-production smoke testing

## Production Architecture

```text
React Native / Expo application
               |
               | HTTPS and JSON
               | Authorization: Bearer <JWT>
               v
Render
Spring Boot Docker service
               |
               | Encrypted PostgreSQL connection
               v
Neon
PostgreSQL database

The mobile application communicates only with the Spring Boot API. It never connects directly to PostgreSQL.

Production Services
Backend
Provider: Render
Service type: Docker web service
Region: Frankfurt
Public API base URL:
https://applymate-api-bami.onrender.com
API status endpoint:
https://applymate-api-bami.onrender.com/api/v1/status
Health endpoint:
https://applymate-api-bami.onrender.com/actuator/health
Database
Provider: Neon
Database name: applymate
PostgreSQL version: 17
Production branch: production
SSL required
Credentials stored only in Render environment variables
Continuous Integration

GitHub Actions validates the repository on pushes and pull requests.

Frontend job
Installs dependencies with npm ci
Runs TypeScript validation
Produces an Expo web export
Backend job
Configures Java 21
Starts PostgreSQL for CI
Runs Maven tests
Packages the Spring Boot application
Runs Testcontainers integration tests
Docker job
Builds the production backend image
Confirms the image runs as the non-root applymate user
Confirms the image includes a health check

All CI jobs passed before production deployment was completed.

Authentication

ApplyMate uses backend-managed authentication.

Completed authentication behaviour includes:

User registration
Secure password hashing
Login
JWT access-token generation
JWT bearer-token validation
Protected API routes
Current-user profile
Authenticated session restoration
Invalid-token handling
Per-user application ownership

The production JWT secret is stored in Render and is never committed to Git.

Completed Application Features
Create a job application
List the authenticated user's applications
View application details
Edit an application
Delete an application
Search applications
Filter by application status
Sort applications
Dashboard summary counts
Loading states
Error states
Pull-to-refresh
Backend request validation
Consistent backend error responses
User-specific data isolation
Application Statuses
Frontend values
Saved
Applied
Assessment
Interview
Offer
Rejected
Backend values
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED

The frontend service layer maps between user-facing labels and backend enum values.

Main API Routes

All primary API routes use the /api/v1 prefix.

System
GET /api/v1/status
GET /actuator/health
Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
Users
GET /api/v1/users/me
Applications
GET /api/v1/applications
POST /api/v1/applications
GET /api/v1/applications/{id}
PUT /api/v1/applications/{id}
DELETE /api/v1/applications/{id}
GET /api/v1/applications/summary
Data Ownership

Every job application belongs to one authenticated user.

Backend services and repository queries must scope application access to the authenticated user.

A user must never be able to read, update or delete another user's application.

Requests for applications owned by another user return 404 Not Found rather than revealing that the record exists.

Local-Only Features

The following features remain on the device:

Reminders
Local notifications
Face ID preference
Notification settings

These features use local device storage and are not currently synchronised with the backend.

Environment Strategy
Local development
Expo runs on the developer computer or test device.
Spring Boot runs locally.
PostgreSQL runs through Docker Compose.
Local configuration is stored in ignored environment files.
The frontend may use localhost or the developer computer's LAN address.
Production
Spring Boot runs from the production Docker image on Render.
PostgreSQL runs on Neon.
The mobile application uses the Render HTTPS API URL.
Database credentials and JWT secrets are stored in Render.
Flyway applies and validates database migrations during startup.
Render monitors /actuator/health.
Production Verification
Public endpoint verification

The following production endpoints returned UP:

/api/v1/status
/actuator/health
Automated backend smoke test

The production smoke test passed:

Registration
Duplicate-registration rejection
Login
Invalid-password rejection
JWT authentication
Current-user profile
Request validation
Application creation
Application listing
Application details
Application editing
Search
Status filtering
Dashboard summary
Application deletion
Unauthenticated-request rejection
Two-user application isolation
Smoke-test data cleanup
Mobile production smoke test

The Expo mobile application successfully completed:

Registration
Login
Application creation
Dashboard count refresh
Application editing
Search and filtering
Logout
Login after logout
Persistent application retrieval
Application deletion

This confirms the complete production path:

Expo mobile application
    -> Render Spring Boot API
    -> Neon PostgreSQL
Portability

ApplyMate uses standard PostgreSQL and normal JDBC configuration.

The production database can later move to another PostgreSQL provider by changing:

DB_URL
DB_USERNAME
DB_PASSWORD

Flyway migrations remain the source of truth for recreating the schema.

Existing data can be moved using standard PostgreSQL backup and restore tools.

ApplyMate does not depend on Neon-specific authentication, storage, APIs or client libraries.

Security Rules
Never commit .env or .env.local.
Never commit database credentials.
Never commit JWT signing secrets.
Store production secrets in the hosting platform.
Require HTTPS for production traffic.
Keep PostgreSQL inaccessible to the mobile client.
Preserve user-isolation checks.
Run CI before merging production changes.
Run smoke tests after deployment changes.
Next Phase

The next phase is:

Mobile Distribution & Release Readiness

Planned work includes:

Review Expo Application Services configuration.
Configure production application identifiers.
Configure release-build environment variables.
Create internal Android and iOS builds.
Test release builds on physical devices.
Prepare privacy and store documentation.
Prepare Google Play and Apple App Store listings.
Submit builds after release testing passes.

New product features remain deferred until the release-build process is stable.