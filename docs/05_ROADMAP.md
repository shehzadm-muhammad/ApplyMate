# ApplyMate Roadmap

## Current Phase

**Mobile Distribution & Release Readiness**

The full-stack MVP, MVP polish and production deployment phases are complete.

The deployed application currently uses:

```text
Expo mobile application
    -> Render Spring Boot Docker API
    -> Neon PostgreSQL
```

Production API:

```text
https://applymate-api-bami.onrender.com
```

---

## Phase 1 — Frontend MVP

**Status: Complete**

- [x] React Native, Expo and TypeScript setup
- [x] ApplyMate branding and theme
- [x] Splash screen
- [x] Registration screen
- [x] Login screen
- [x] Protected navigation
- [x] Dashboard
- [x] Applications list
- [x] Application details
- [x] Create application
- [x] Edit application
- [x] Delete application
- [x] Profile screen
- [x] Settings screen
- [x] Local reminders
- [x] Local notification scheduling
- [x] Local device preferences

---

## Phase 2 — Backend MVP

**Status: Complete**

- [x] Spring Boot backend
- [x] PostgreSQL database
- [x] Docker Compose for local PostgreSQL
- [x] Flyway database migrations
- [x] User registration
- [x] Secure password hashing
- [x] User login
- [x] JWT access tokens
- [x] Protected API routes
- [x] Current-user profile endpoint
- [x] Job-application persistence
- [x] Application creation
- [x] Application listing
- [x] Application details
- [x] Application updating
- [x] Application deletion
- [x] Per-user application ownership
- [x] User-isolation protection
- [x] Backend validation
- [x] Consistent API errors
- [x] Automated backend tests

---

## Phase 3 — Frontend and Backend Integration

**Status: Complete**

- [x] Environment-based frontend API URL
- [x] Central frontend API client
- [x] Secure native JWT storage
- [x] Browser JWT storage
- [x] Backend-powered registration
- [x] Backend-powered login
- [x] Backend-powered current-user profile
- [x] Backend-powered application creation
- [x] Backend-powered application listing
- [x] Backend-powered application details
- [x] Backend-powered application editing
- [x] Backend-powered application deletion
- [x] Authentication-session restoration
- [x] Invalid-token handling
- [x] Local-development smoke testing

---

## Phase 4 — MVP Polish

**Status: Complete**

### Dashboard

- [x] Backend dashboard-summary endpoint
- [x] Backend-powered dashboard counts
- [x] Loading state
- [x] Error state
- [x] Pull-to-refresh

### Applications

- [x] Search
- [x] Status filtering
- [x] Sorting
- [x] Loading states
- [x] Error states
- [x] Refresh behaviour

### Backend quality

- [x] Stronger request validation
- [x] Global exception handling
- [x] Consistent validation responses
- [x] Controller tests
- [x] User-isolation tests
- [x] Test-code cleanup

### Repository milestone

- [x] Full-stack MVP merged into `main`
- [x] MVP tagged as `v1.1.0-mvp`
- [x] Initial project documentation added

---

## Phase 5 — Deployment & Production Readiness

**Status: Complete**

### 5.1 Documentation and repository presentation

- [x] Update project context
- [x] Expand architecture documentation
- [x] Complete API reference
- [x] Update development log
- [x] Update roadmap
- [x] Add root repository README
- [x] Correct the MIT licence
- [x] Record production architecture
- [x] Record production smoke-test results

### 5.2 Continuous integration

- [x] Add GitHub Actions workflow
- [x] Install frontend dependencies using `npm ci`
- [x] Run frontend TypeScript checks
- [x] Produce an Expo web export
- [x] Configure Java 21
- [x] Start PostgreSQL for CI
- [x] Run backend Maven tests
- [x] Verify Spring Boot packaging
- [x] Run Testcontainers integration tests
- [x] Build the production Docker image
- [x] Verify the Docker runtime user
- [x] Verify the Docker health check
- [x] Confirm CI does not use production credentials
- [x] Confirm all CI jobs pass

### 5.3 Production backend configuration

- [x] Separate local and production configuration
- [x] Add the Spring `prod` profile
- [x] Read the database URL from an environment variable
- [x] Read database credentials from environment variables
- [x] Read the JWT secret from an environment variable
- [x] Support the platform-provided server port
- [x] Configure production CORS
- [x] Restrict Actuator exposure to health
- [x] Prevent detailed framework-error leakage
- [x] Configure database connection-pool limits
- [x] Disable destructive Flyway cleaning
- [x] Verify Flyway in production mode
- [x] Preserve local Docker Compose development

### 5.4 Backend containerisation

- [x] Add a production Dockerfile
- [x] Use a multi-stage Docker build
- [x] Build the application with Maven
- [x] Copy only the executable JAR into the runtime image
- [x] Use Java 21
- [x] Run as the non-root `applymate` user
- [x] Add an `/actuator/health` health check
- [x] Add `.dockerignore`
- [x] Prevent local secrets from entering the image
- [x] Build the image locally
- [x] Run the image locally against PostgreSQL
- [x] Confirm the container becomes healthy
- [x] Confirm API status and health endpoints
- [x] Run the full backend smoke test against the container

### 5.5 Production database

- [x] Select Neon PostgreSQL
- [x] Create the production project
- [x] Create the `applymate` database
- [x] Use PostgreSQL 17
- [x] Select the Frankfurt region
- [x] Create the `production` branch
- [x] Require SSL
- [x] Store credentials outside Git
- [x] Preserve standard PostgreSQL portability

### 5.6 Production backend deployment

- [x] Select Render
- [x] Create the Docker web service
- [x] Deploy from the stable `main` branch
- [x] Configure `backend` as the service root
- [x] Configure `backend/Dockerfile`
- [x] Select the Frankfurt region
- [x] Configure production environment variables
- [x] Generate a production JWT secret
- [x] Connect Render to Neon
- [x] Run Flyway during startup
- [x] Configure `/actuator/health`
- [x] Confirm the service becomes healthy
- [x] Confirm the API is available over HTTPS
- [x] Confirm production secrets are absent from Git

### 5.7 Mobile production API connection

- [x] Configure the Render HTTPS API URL
- [x] Preserve local-development API configuration
- [x] Confirm `.env.local` is ignored
- [x] Verify production registration
- [x] Verify production login
- [x] Verify access-token storage
- [x] Verify current-user loading
- [x] Verify logout and later login
- [x] Confirm application data persists in Neon
- [x] Confirm production requests do not use localhost

### 5.8 Production smoke testing

- [x] Confirm API status
- [x] Confirm operational health
- [x] Register a smoke-test user
- [x] Log in and receive a JWT
- [x] Read the current-user profile
- [x] Create an application
- [x] List applications
- [x] Read application details
- [x] Update an application
- [x] Search applications
- [x] Filter applications
- [x] Verify dashboard summary counts
- [x] Delete an application
- [x] Confirm deleted data cannot be retrieved
- [x] Confirm unauthenticated requests are rejected
- [x] Confirm users cannot access another user's data
- [x] Remove temporary smoke-test data
- [x] Run the complete workflow from the mobile application

### Phase 5 completion result

Deployment readiness is complete because:

- CI passes on the repository.
- The backend builds and runs from its production Docker image.
- PostgreSQL is hosted securely by Neon.
- The backend is publicly available over HTTPS.
- Secrets are stored outside Git.
- The mobile app communicates with the production API.
- Authentication and application operations passed automated production testing.
- The full workflow passed from the mobile interface.
- Local development continues to work.

---

## Phase 6 — Mobile Distribution & Release Readiness

**Status: Next**

This phase begins after the production close-out documentation is merged and release tag `v1.2.0` is created.

### 6.1 Expo Application Services

- [ ] Review Expo Application Services requirements
- [ ] Install or verify EAS CLI
- [ ] Connect the repository to an Expo project
- [ ] Add `eas.json`
- [ ] Define development, preview and production build profiles
- [ ] Configure release-build environment variables
- [ ] Confirm production builds use the Render HTTPS API

### 6.2 Application identity

- [ ] Confirm the final application name
- [ ] Configure Android package identifier
- [ ] Configure iOS bundle identifier
- [ ] Review Expo project slug
- [ ] Review application version
- [ ] Review Android version code
- [ ] Review iOS build number
- [ ] Confirm icons and splash assets meet release requirements

### 6.3 Internal builds

- [ ] Create an Android internal-distribution build
- [ ] Install the Android build on a physical device
- [ ] Create an iOS internal-distribution build
- [ ] Install the iOS build on an authorised device
- [ ] Verify authentication in release builds
- [ ] Verify application CRUD in release builds
- [ ] Verify dashboard summary data
- [ ] Verify search and filtering
- [ ] Verify logout and session restoration
- [ ] Verify local reminders and notifications

### 6.4 Release documentation

- [ ] Prepare a privacy policy
- [ ] Document collected and stored user data
- [ ] Document account and application-data handling
- [ ] Document local notification behaviour
- [ ] Prepare support contact information
- [ ] Prepare store descriptions
- [ ] Prepare screenshots
- [ ] Prepare application icons and promotional assets

### 6.5 Store preparation

- [ ] Create or verify Google Play Console access
- [ ] Create or verify Apple Developer access
- [ ] Prepare Google Play listing
- [ ] Prepare Apple App Store listing
- [ ] Complete data-safety and privacy questionnaires
- [ ] Upload signed release builds
- [ ] Complete internal testing
- [ ] Resolve store-review issues
- [ ] Submit builds after release testing passes

### Phase 6 completion criteria

Mobile release readiness is complete when:

- Android and iOS release builds are generated successfully.
- Production API configuration is included correctly.
- Release builds pass the full application smoke test.
- Privacy and store documentation are complete.
- Store listings and screenshots are prepared.
- Builds are ready for submission or internal testing.

---

## Future Product Backlog

**Status: Deferred**

These items are intentionally excluded from production close-out and mobile release preparation.

### AI assistance

- [ ] Job-description parser
- [ ] CV analyser
- [ ] CV-to-job matching
- [ ] Cover-letter assistance
- [ ] Application improvement suggestions

### Application workflow

- [ ] Backend-synchronised reminders
- [ ] Cross-device notification synchronisation
- [ ] Email import
- [ ] Job-board import
- [ ] Interview-coach integration
- [ ] Document attachments
- [ ] Application activity history

### Account and platform improvements

- [ ] Password reset
- [ ] Email verification
- [ ] Refresh tokens
- [ ] Account deletion
- [ ] Data export
- [ ] Accessibility review
- [ ] Performance monitoring
- [ ] Error monitoring
- [ ] Privacy-conscious analytics

Future features must be planned separately after release builds are stable.

---

## Current Immediate Task

Complete the production close-out documentation, run final validation, merge the documentation branch, confirm CI passes and create release tag `v1.2.0`.