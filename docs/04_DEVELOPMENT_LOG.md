# ApplyMate Development Log

## Current Status

- **Current phase:** Mobile Distribution & Release Closeout
- **Stable branch:** `main`
- **Working branch:** `main`
- **Latest completed milestone:** Final Android release-candidate verification
- **Current release tag:** `v1.2.0`
- **Next planned release tag:** `v1.3.0`

The frontend MVP, backend MVP, full-stack integration, MVP polish, production deployment, mobile distribution configuration, backend reminder synchronisation, persistent-session authentication, account deletion, privacy/store-readiness work and Android release testing are complete.

The production backend is running on Render and connects to PostgreSQL hosted by Neon.

The remaining work for `v1.3.0` is documentation closeout, final CI/Docker validation and release tagging.

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

## 29 July–7 August 2026 — Mobile Distribution & Release Readiness

### Expo Application Services

- Configured Expo Application Services for ApplyMate.
- Linked the project to the Expo account `@zaib_367`.
- Configured EAS Build.
- Added and reviewed `eas.json`.
- Configured preview and production build profiles.
- Configured EAS environment separation.
- Enabled remote native app versioning.
- Configured production auto-increment behaviour.

### Permanent application identifiers

Configured:

```text
Android package:
com.zaib367.applymate

iOS bundle identifier:
com.zaib367.applymate

These identifiers are now treated as permanent release identifiers.

Native configuration
Marketing version remained 1.0.0.
Configured Android version-code management through EAS.
Configured iOS build-number management through EAS.
Added the expo-notifications native config plugin.
Confirmed Expo Doctor passed all checks.

Latest Expo Doctor result:

18/18 checks passed
Production API environment

Configured the EAS preview and production environments to use:

EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com

The public API URL is build configuration rather than a secret.

Database credentials and JWT signing secrets remain backend-only.

Android internal distribution
Created Android preview/internal-distribution builds through EAS.
Installed standalone builds on the ApplyMate Android test emulator.
Confirmed the standalone application communicated with the Render production backend.
Verified application functionality outside Expo Go.
iOS distribution
Configured the permanent iOS bundle identifier.
Continued development testing through Expo Go.
Reviewed standalone iOS and TestFlight requirements.
Deferred paid Apple Developer Program enrolment.

No paid Apple Developer action was taken during this phase.

Outcome

ApplyMate gained a repeatable Android release-build pipeline while preserving the option to enable TestFlight/App Store distribution later.

Backend Reminder Synchronisation
Completed
Migrated reminder records from local-only persistence to the Spring Boot backend.
Added PostgreSQL persistence for reminders.
Added Flyway migration V3.
Added authenticated reminder CRUD operations.
Scoped reminder records to the authenticated user.
Preserved local device notification scheduling.
Associated stored notification identifiers with individual users.
Verified reminder isolation using two separate accounts.
Architecture
Reminder record
    -> Spring Boot API
    -> PostgreSQL

Notification delivery
    -> Expo Notifications
    -> Device operating system
Outcome

Reminder data now follows the signed-in user and remains isolated between accounts, while notification scheduling remains device-specific.

3–7 August 2026 — Persistent Session Authentication
Problem

ApplyMate originally used only a short-lived JWT access token.

Once that token expired, the user had to authenticate again.

The original development access-token lifetime made this particularly visible during testing.

Backend implementation

Added persistent refresh-token sessions.

Completed:

Added refresh-token persistence.
Added Flyway V4__create_refresh_tokens_table.sql.
Added Flyway V5__alter_refresh_token_hash_type.sql.
Added opaque cryptographically random refresh tokens.
Stored only SHA-256 refresh-token hashes in PostgreSQL.
Added refresh-token expiry.
Added refresh-token revocation.
Added refresh-token families.
Added refresh-token rotation.
Added revoked-token reuse handling.
Added pessimistic database locking during token rotation.
Added backend session revocation during logout.

Production session configuration:

Access token lifetime: 1 hour
Refresh session lifetime: 30 days
Authentication API changes

Added:

POST /api/v1/auth/refresh
POST /api/v1/auth/logout

Login and refresh responses now return:

JWT access token
Access-token expiry
Refresh token
Refresh-session expiry
Authenticated user information
Mobile implementation
Extended SecureStore authentication storage to contain both token types.
Added refresh-token storage and removal.
Added automatic refresh after an authenticated 401.
Added retry of the original protected request after successful refresh.
Added shared refresh coordination so simultaneous requests do not independently rotate the same token.
Added central expired-session handling.
Improved session restoration.
Preserved locally stored sessions during temporary backend/network failures.
Updated logout to revoke the backend refresh session before clearing local authentication state.
Removed stale dashboard authentication-error behaviour.
Controlled expiry verification

For end-to-end testing, the local access-token lifetime was temporarily reduced to:

1 minute

The Android client was then tested after genuine access-token expiry.

Verified:

User remained signed in.
Expired access token produced a refresh operation.
New access token was returned.
Refresh token was rotated.
Original protected request succeeded.
Dashboard and application functionality continued normally.
No authentication error was displayed.
Production verification

The same flow was verified against Render and Neon.

Production test confirmed:

Login                        PASS
Access token issued          PASS
Refresh token issued         PASS
Refresh endpoint             PASS
New access token issued      PASS
Refresh token rotated        PASS
Logout                       PASS
Session revocation           PASS
Automated tests

The backend test suite increased to:

Tests run: 40
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
Outcome

ApplyMate now provides persistent mobile sessions without requiring repeated login while retaining short-lived access credentials and revocable server-side sessions.

7–8 August 2026 — Account Deletion
Backend

Added:

DELETE /api/v1/users/me

The account to be deleted is derived from the authenticated JWT rather than from a client-supplied user ID.

Existing database ownership relationships allow deletion of associated user data.

Deleting an account removes:

User account
Job applications
Reminders
Refresh-token sessions
Mobile application

Added a destructive Delete Account option to the Profile screen.

The flow uses two confirmation prompts before permanent deletion.

After successful backend deletion, the application:

Cancels scheduled reminder notifications belonging to the user.
Clears stored reminder-notification identifiers.
Clears local account-related settings.
Removes access and refresh tokens.
Clears authenticated user state.
Returns to the Welcome screen.
Local verification

A disposable local account was used to test:

Registration
Login
Application creation
Reminder creation
Two-stage account-deletion confirmation
Backend account removal
User-owned data removal
Local authentication cleanup
Return to Welcome
Re-login rejection

All tests passed.

Production verification

The same disposable-account workflow was then tested against the deployed Render and Neon environment.

Verified:

Backend account deleted                 PASS
Applications/reminders deleted          PASS
Refresh session removed                 PASS
Local authentication tokens removed     PASS
Returned to Welcome                     PASS
Deleted credentials rejected            PASS
Outcome

ApplyMate now supports permanent self-service account deletion from inside the mobile application.

8 August 2026 — Privacy & Account-Deletion Web Pages
Public contact

Created the ApplyMate public support/privacy contact:

support.applymate@gmail.com
GitHub Pages

Added:

docs/index.html
docs/privacy-policy.html
docs/delete-account.html

Configured GitHub Pages to deploy:

Branch: main
Folder: /docs

Public site:

https://shehzadm-muhammad.github.io/ApplyMate/

Privacy Policy:

https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html

Account deletion information:

https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
Mobile integration

Added a Privacy Policy option to the Profile screen.

The mobile application opens the public privacy-policy page externally.

Outcome

ApplyMate now has public privacy and account-deletion information suitable for future mobile-store configuration.

8 August 2026 — Final Android Release Candidate Verification
Production infrastructure verification

Confirmed:

GET /api/v1/status
HTTP 200
status: UP

Confirmed:

GET /actuator/health
HTTP 200
status: UP

During testing, Render demonstrated cold-start behaviour after inactivity.

Backend logs confirmed:

Spring Boot production profile loaded.
Neon PostgreSQL connected successfully.
Flyway validated all five migrations.
Schema version was 5.
Tomcat started using the platform-provided production port.
Application startup completed successfully.
Final Android build

Created the final Android preview/internal-distribution build through EAS containing:

Production API configuration
Backend-synchronised reminders
Persistent authentication
Refresh-token rotation
Account deletion
Privacy Policy integration
Final APK smoke test

Verified:

Application launches successfully.
Login succeeds.
Dashboard loads production data.
Existing application data loads correctly.
Application create/edit/delete works.
Reminder creation works.
Reminder persistence works.
Closing and reopening preserves the authenticated session.
Privacy Policy option is present.
Public Privacy Policy opens successfully.
Delete Account option is present.
Logout succeeds.
Reopening after logout remains logged out.
No stale authentication error remains.
Outcome

The functional work for Mobile Distribution & Release Readiness is complete.

ApplyMate now has a tested standalone Android release candidate connected to the production Render and Neon environment.


---

# 3. Replace everything from `## Production Deployment Summary` to the end

Replace that old ending with:

```markdown
---

## Current Release Summary

| Area | Status |
|---|---|
| Frontend MVP | Complete |
| Backend MVP | Complete |
| PostgreSQL integration | Complete |
| JWT access-token authentication | Complete |
| Refresh-token sessions | Complete |
| Silent token refresh | Complete |
| Refresh-token rotation | Complete |
| Session restoration | Complete |
| Application CRUD | Complete |
| User isolation | Complete |
| Dashboard summary | Complete |
| Search and filtering | Complete |
| Sorting | Complete |
| Backend validation | Complete |
| Backend reminder synchronisation | Complete |
| Local reminder notifications | Complete |
| Account deletion | Complete |
| Privacy Policy | Complete |
| Public account-deletion page | Complete |
| EAS configuration | Complete |
| Android package identifier | Complete |
| iOS bundle identifier | Complete |
| Android internal distribution | Complete |
| Android release-candidate testing | Complete |
| iOS standalone/TestFlight distribution | Deferred pending Apple Developer enrolment |
| Automated backend tests | 40 passing |
| Expo Doctor | 18/18 passing |
| Render backend deployment | Complete |
| Neon PostgreSQL deployment | Complete |
| Production authentication verification | Complete |
| Production account-deletion verification | Complete |
| GitHub Pages | Complete |
| Final documentation refresh | In progress |
| Final release tag `v1.3.0` | Pending |

---

## Known Operational Behaviour

The current deployment uses portfolio-tier infrastructure.

Render may require a cold start after inactivity.

During release testing, the backend required additional startup time before becoming publicly reachable.

Once ready, both:

```text
/api/v1/status
/actuator/health

returned HTTP 200 and UP.

This does not affect stored data but can temporarily delay the first API request.

Release Closeout

The functional Mobile Distribution & Release Readiness work is complete.

Remaining work before v1.3.0:

Finish updating shared project documentation.
Update the root README.
Run final frontend validation.
Run final backend validation.
Run final Docker validation.
Confirm GitHub Actions CI.
Commit and push documentation.
Create release tag v1.3.0.
Next Development Phase

After v1.3.0, candidate features include:

Email verification using OTP during registration
Password-reset flow
Job-link import
Email integration
Additional application automation
Google Play public-release preparation
Apple TestFlight/App Store distribution after Apple Developer Program enrolment

New product development should begin after the current mobile release milestone is formally closed.