# ApplyMate Development Log

## Current Status

- **Current phase:** Mobile Distribution & Release Readiness
- **Stable branch:** `main`
- **Working branch:** `docs/production-closeout`
- **Latest completed milestone:** Production deployment and full smoke testing
- **Current release tag:** `v1.1.0-mvp`
- **Next planned release tag:** `v1.2.0`

The frontend MVP, backend MVP, full-stack integration, MVP polish, continuous integration and production deployment phases are complete.

The production backend is running on Render and connects to PostgreSQL hosted by Neon.

---

## 12 July 2026 — Project Initialisation

### Completed

* Created the ApplyMate React Native project using Expo and TypeScript.
* Added the initial application entry point.
* Added the ApplyMate colour theme and branding.
* Created the splash screen.
* Started the authentication navigation flow.
* Created the initial Git repository and GitHub repository.

### Outcome

ApplyMate had a working React Native foundation with a defined visual identity and initial navigation structure.

---

## 13 July 2026 — Authentication Interface

### Completed

* Created reusable authentication interface components.
* Added reusable text-input components.
* Built registration and login screens.
* Added client-side form validation.
* Added touched-field validation so errors appear after users interact with fields.
* Connected authentication screens to navigation.

### Outcome

The frontend authentication flow was visually and structurally complete, although authentication was still local at this stage.

---

## 14 July 2026 — Application Tracking Screens

### Completed

* Built the applications list screen.
* Built the application-details screen.
* Added the initial application data model.
* Added navigation between application records and detail views.
* Continued developing the application-management interface.

### Outcome

Users could navigate through the primary job-application tracking interface.

---

## 16 July 2026 — Frontend MVP Completed

### Completed

* Completed the first frontend MVP.
* Added dashboard functionality.
* Added application creation and editing flows.
* Added profile and settings screens.
* Added reminders and local notification support.
* Added protected and public navigation flows.
* Added local storage for frontend MVP data.
* Tagged the completed frontend milestone.

### Outcome

The complete mobile interface could be demonstrated independently before backend integration.

---

## 17 July 2026 — Backend Foundation

### Completed

* Created the Spring Boot backend under `backend/`.
* Configured Java and Maven.
* Added the system-status endpoint.
* Added PostgreSQL 17 through Docker Compose.
* Added persistent local database storage.
* Added a PostgreSQL health check.
* Configured Spring Data JPA.
* Configured Flyway database migrations.
* Created the `app_users` database table.
* Implemented user registration.
* Added password hashing.
* Implemented login authentication.
* Added JWT access-token generation and validation.
* Added the authenticated current-user endpoint.
* Created the initial job-application database schema.

### Outcome

ApplyMate gained a working backend, persistent PostgreSQL database and stateless JWT authentication.

---

## 18–22 July 2026 — Authentication and Application API Development

### Completed

* Protected backend routes using Spring Security.
* Added authenticated job-application endpoints.
* Connected applications to their owning users.
* Added request and response DTOs.
* Added entity-to-response mapping.
* Added service and repository layers.
* Added application creation and listing.
* Added application detail retrieval.
* Added application updating.
* Added application deletion.
* Added authenticated-user resolution.
* Added ownership checks for application access.

### Outcome

The backend could securely manage application records for individual authenticated users.

---

## 23 July 2026 — Backend MVP Completed

### Completed

* Completed the full job-application CRUD API.
* Added application ownership protection.
* Ensured users could not read, update or delete another user's data.
* Added application filtering by status.
* Added case-insensitive application search.
* Added dashboard summary counts.
* Added consistent API error responses.
* Added centralised backend exception handling.
* Added authentication and application smoke testing.
* Completed the backend MVP.
* Merged the backend feature branch into `main`.

### Outcome

The Spring Boot backend provided all server functionality required by the mobile MVP.

---

## 24 July 2026 — Frontend API Integration

### Completed

* Migrated job-application data from AsyncStorage to the Spring Boot API.
* Added a central frontend API client.
* Added environment-based API URL configuration.
* Added JWT bearer tokens to protected requests.
* Added secure native token storage using Expo SecureStore.
* Added browser token storage for the web build.
* Connected registration to the backend.
* Connected login to the backend.
* Connected current-user profile data to the backend.
* Connected create, read, update and delete application flows to the backend.
* Preserved reminders and device preferences as local-only features.

### Outcome

Application data now flowed end to end:

```text
React Native → Spring Boot → PostgreSQL
```

The backend became the system of record for users and job applications.

---

## 25 July 2026 — Dashboard Summary Integration

### Completed

* Connected the dashboard to:

```text
GET /api/v1/applications/summary
```

* Replaced locally calculated dashboard totals with backend summary data.
* Verified that summary counts were scoped to the authenticated user.
* Preserved the existing dashboard design.

### Outcome

Dashboard statistics were generated from authoritative backend application data.

---

## 28 July 2026 — MVP Polish Completed

### Frontend improvements

* Added dashboard loading states.
* Added dashboard error states.
* Added pull-to-refresh.
* Added application search.
* Added application status filtering.
* Added application sorting controls.
* Improved API error presentation.
* Preserved the existing interface and navigation design.

### Backend improvements

* Strengthened job-application validation.
* Added validation tests.
* Added application-controller tests.
* Added explicit user-isolation tests.
* Formatted and cleaned backend test code.
* Verified consistent validation and error behaviour.

### Repository work

* Added initial project source documentation.
* Added the project backlog and roadmap.
* Merged the completed frontend API integration and MVP-polish branch into `main`.
* Created the `v1.1.0-mvp` release tag.

### Outcome

The complete ApplyMate MVP included:

* React Native frontend
* Spring Boot backend
* PostgreSQL persistence
* JWT authentication
* User-specific application data
* Full application CRUD
* Search, filtering and sorting
* Dashboard summary data
* Loading, error and refresh states
* Request validation
* Consistent API errors
* Automated backend tests
* End-to-end smoke testing

The repository was ready to enter the deployment-readiness phase.

---

## 28 July 2026 — Deployment & Production Readiness Started

### Documentation

- Reviewed the public `main` branch and repository history.
- Corrected outdated source documentation.
- Expanded the architecture documentation.
- Completed the API reference.
- Updated the development log and roadmap.
- Added a root project README.
- Corrected the inherited Expo licence.
- Confirmed the MIT licence identifies Muhammad Shahzaib Shehzad as the copyright holder.

### Continuous integration

- Added GitHub Actions CI.
- Added frontend dependency installation using `npm ci`.
- Added TypeScript validation.
- Added Expo web export validation.
- Added Java 21 setup.
- Added PostgreSQL for backend CI.
- Added Maven tests and packaging.
- Added production Docker image building.
- Added verification of the non-root Docker user.
- Added verification of the Docker health check.
- Confirmed all three CI jobs passed.

### Production configuration

- Added `application-prod.properties`.
- Added environment-based production database configuration.
- Added environment-based JWT configuration.
- Added platform-provided server-port support.
- Added production CORS configuration.
- Restricted Actuator exposure to the health endpoint.
- Disabled destructive Flyway cleaning in production.
- Disabled detailed framework-error exposure.
- Added database connection-pool limits.
- Preserved the existing local-development configuration.

### Backend containerisation

- Added a multi-stage Java 21 Dockerfile.
- Built the application with Maven in the build stage.
- Copied only the executable Spring Boot JAR into the runtime image.
- Added a non-root `applymate` user.
- Added a Docker health check using `/actuator/health`.
- Added `.dockerignore`.
- Prevented `.env` files, local secrets, test sources and development files from entering the image.
- Built the Docker image locally.
- Confirmed the container ran as the `applymate` user.
- Confirmed the container became healthy.
- Confirmed the container connected to PostgreSQL.
- Confirmed Flyway validated the database migrations.

### Smoke-test improvements

- Updated the PowerShell smoke-test script to accept a configurable API base URL.
- Preserved `http://localhost:8080` as the default.
- Enabled the same script to test local, Docker and production backends.

### Outcome

ApplyMate gained repeatable CI, a production Spring profile and a verified production Docker image.

---

## 29 July 2026 — Production Database Deployed

### Completed

- Created the Neon production project.
- Created the `applymate` PostgreSQL database.
- Used PostgreSQL 17.
- Selected the Frankfurt region.
- Created the `production` database branch.
- Required SSL for the database connection.
- Stored database credentials outside Git.
- Confirmed the application remained independent of Neon-specific APIs or authentication.

### Outcome

ApplyMate gained a hosted PostgreSQL production database while preserving portability to other PostgreSQL providers.

---

## 29 July 2026 — Production Backend Deployed

### Completed

- Created a Render Docker web service.
- Connected Render to the ApplyMate GitHub repository.
- Deployed from the stable `main` branch.
- Configured `backend` as the service root directory.
- Used `backend/Dockerfile`.
- Selected the Frankfurt region.
- Configured the free Render instance.
- Added production environment variables:
  - `SPRING_PROFILES_ACTIVE`
  - `DB_URL`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `JWT_SECRET`
  - `APP_CORS_ALLOWED_ORIGIN_PATTERNS`
- Configured `/actuator/health` as the Render health-check path.
- Corrected the initial Dockerfile-path typo.
- Corrected the initial Neon-host placeholder in `DB_URL`.
- Confirmed Flyway connected to Neon and applied or validated the schema.
- Confirmed the public HTTPS service became live.

### Production URL

```text
https://applymate-api-bami.onrender.com
```

### Outcome

The Spring Boot Docker backend became publicly available over HTTPS and connected successfully to the Neon PostgreSQL database.

---

## 29 July 2026 — Production Backend Smoke Test Passed

### Public endpoint checks

The following endpoints returned `UP`:

```text
GET /api/v1/status
GET /actuator/health
```

### Automated smoke-test coverage

The production smoke test passed:

- Registration
- Duplicate-registration rejection
- Login
- Invalid-password rejection
- JWT authentication
- Current-user profile
- Request validation
- Application creation
- Application listing
- Application details
- Application editing
- Search
- Status filtering
- Dashboard summary
- Application deletion
- Unauthenticated-request rejection
- Cross-user application isolation
- Smoke-test data cleanup

### Outcome

The deployed Render backend and Neon database passed the complete automated backend workflow.

---

## 29 July 2026 — Mobile Production Integration Passed

### Completed

- Configured the Expo frontend to use:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

- Confirmed `.env.local` remained ignored by Git.
- Started Expo with a cleared development cache.
- Registered a production user from the mobile application.
- Logged in through the production backend.
- Stored the returned JWT access token.
- Loaded the authenticated user profile.
- Created a job application.
- Confirmed the dashboard count changed.
- Edited the application.
- Tested application search.
- Tested status filtering.
- Logged out.
- Logged back in.
- Confirmed the application persisted in Neon.
- Deleted the application.

### Outcome

The complete production path was verified:

```text
Expo mobile application
    -> Render Spring Boot Docker API
    -> Neon PostgreSQL
```

The deployed MVP worked end to end from the mobile interface.

---

## 29 July 2026 — Deployment & Production Readiness Completed

### Completed milestone

The deployment phase is complete.

ApplyMate now includes:

- React Native and Expo mobile frontend
- Spring Boot REST API
- PostgreSQL persistence
- JWT authentication
- User-specific data isolation
- Full job-application CRUD
- Search, filtering and sorting
- Dashboard summary data
- Backend request validation
- Consistent error responses
- Automated backend tests
- GitHub Actions CI
- Production Docker image
- Render HTTPS backend
- Neon PostgreSQL database
- Automated production smoke testing
- Successful mobile-to-production testing

### Known free-tier behaviour

The current deployment uses free portfolio-tier services.

Render may stop the backend after inactivity, and Neon may suspend inactive database compute.

The first request after inactivity may therefore take longer while the services resume.

This is acceptable for the current portfolio and testing stage.

---

## Production Deployment Summary

| Area | Status |
|---|---|
| Frontend MVP | Complete |
| Backend MVP | Complete |
| PostgreSQL integration | Complete |
| JWT authentication | Complete |
| Application CRUD | Complete |
| User isolation | Complete |
| Dashboard summary | Complete |
| Search and filtering | Complete |
| Sorting | Complete |
| Validation | Complete |
| Automated backend tests | Complete |
| Documentation refresh | Complete |
| Root README | Complete |
| Licence correction | Complete |
| Continuous integration | Complete |
| Production configuration | Complete |
| Backend Dockerfile | Complete |
| Docker image verification | Complete |
| Neon PostgreSQL deployment | Complete |
| Render backend deployment | Complete |
| Public HTTPS API | Complete |
| Production backend smoke test | Complete |
| Mobile production connection | Complete |
| Mobile production smoke test | Complete |

---

## Next Phase

The next phase is:

**Mobile Distribution & Release Readiness**

Planned work includes:

1. Configure Expo Application Services.
2. Configure production application identifiers.
3. Configure release-build environment variables.
4. Create internal Android and iOS builds.
5. Test release builds on physical devices.
6. Prepare privacy and store documentation.
7. Prepare Google Play and Apple App Store listings.
8. Submit builds after release testing passes.

## Next Immediate Task

Complete the production close-out documentation, run final validation, merge the documentation branch, confirm CI and create release tag `v1.2.0`.