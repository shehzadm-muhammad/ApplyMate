# ApplyMate Roadmap

## Current Phase

**Deployment & Production Readiness**

The full-stack MVP and MVP-polish phases are complete.

The current objective is to deploy the existing application reliably without redesigning the interface or adding new product features.

---

## Phase 1 — Frontend MVP

**Status: Complete**

* [x] Project setup with React Native, Expo and TypeScript
* [x] ApplyMate branding and theme
* [x] Splash screen
* [x] Registration screen
* [x] Login screen
* [x] Protected navigation
* [x] Dashboard
* [x] Applications list
* [x] Application details
* [x] Create application
* [x] Edit application
* [x] Delete application
* [x] Profile screen
* [x] Settings screen
* [x] Local reminders
* [x] Local notification scheduling
* [x] Local device preferences

---

## Phase 2 — Backend MVP

**Status: Complete**

* [x] Spring Boot backend
* [x] PostgreSQL database
* [x] Docker Compose for local PostgreSQL
* [x] Flyway database migrations
* [x] User registration
* [x] Secure password hashing
* [x] User login
* [x] JWT access tokens
* [x] Protected API routes
* [x] Current-user profile endpoint
* [x] Job-application entity and persistence
* [x] Application creation
* [x] Application listing
* [x] Application details
* [x] Application updating
* [x] Application deletion
* [x] Per-user application ownership
* [x] User-isolation protection
* [x] Backend validation
* [x] Consistent API error responses
* [x] Automated backend tests

---

## Phase 3 — Frontend and Backend Integration

**Status: Complete**

* [x] Environment-based frontend API URL
* [x] Central frontend API client
* [x] Secure native JWT storage
* [x] Web JWT storage
* [x] Backend-powered registration
* [x] Backend-powered login
* [x] Backend-powered current-user profile
* [x] Backend-powered application creation
* [x] Backend-powered application listing
* [x] Backend-powered application details
* [x] Backend-powered application editing
* [x] Backend-powered application deletion
* [x] Authentication-session restoration
* [x] Invalid-token handling
* [x] Local-development smoke testing

---

## Phase 4 — MVP Polish

**Status: Complete**

### Dashboard

* [x] Backend dashboard-summary endpoint
* [x] Backend-powered dashboard counts
* [x] Dashboard loading state
* [x] Dashboard error state
* [x] Dashboard pull-to-refresh

### Applications

* [x] Application search
* [x] Status filtering
* [x] Application sorting
* [x] Loading states
* [x] Error states
* [x] Refresh behaviour

### Backend quality

* [x] Stronger job-application validation
* [x] Global exception handling
* [x] Consistent validation responses
* [x] Application-controller tests
* [x] User-isolation tests
* [x] Test-code cleanup

### Repository

* [x] Full-stack MVP merged into `main`
* [x] MVP release tagged as `v1.1.0-mvp`
* [x] Initial project documentation added

---

## Phase 5 — Deployment & Production Readiness

**Status: In progress**

### 5.1 Documentation

* [x] Update project context
* [x] Expand architecture documentation
* [x] Complete API reference
* [x] Update development log
* [x] Update project roadmap
* [ ] Add root repository README
* [ ] Correct the repository licence

### 5.2 Continuous Integration

* [ ] Add a GitHub Actions workflow
* [ ] Install frontend dependencies in CI
* [ ] Run frontend TypeScript checks
* [ ] Build or validate the Expo frontend
* [ ] Configure Java in CI
* [ ] Run backend Maven tests
* [ ] Verify backend packaging
* [ ] Ensure CI does not require production credentials
* [ ] Require the workflow to pass before deployment work is merged

### 5.3 Production Backend Configuration

* [ ] Separate local and production backend configuration
* [ ] Add a production Spring profile
* [ ] Read database configuration from environment variables
* [ ] Read the JWT secret from an environment variable
* [ ] Validate required production variables at startup
* [ ] Configure the deployment-platform server port
* [ ] Configure production CORS behaviour
* [ ] Restrict exposed Actuator endpoints
* [ ] Keep detailed internal errors out of production responses
* [ ] Verify Flyway migrations in production mode
* [ ] Keep local Docker Compose development working

### 5.4 Backend Containerisation

* [ ] Add a production backend Dockerfile
* [ ] Use a multi-stage Docker build
* [ ] Build the application with Maven
* [ ] Run only the packaged application in the final image
* [ ] Use a supported Java runtime
* [ ] Run the container as a non-root user where supported
* [ ] Add or configure a container health check
* [ ] Add an appropriate `.dockerignore`
* [ ] Build the image locally
* [ ] Run the image locally against PostgreSQL
* [ ] Verify the API status and health endpoints

### 5.5 Production Database and Backend Deployment

* [ ] Select the production hosting platform
* [ ] Create a managed PostgreSQL database
* [ ] Configure persistent database storage
* [ ] Configure encrypted database connections where supported
* [ ] Add production database environment variables
* [ ] Generate and store a strong production JWT secret
* [ ] Deploy the Spring Boot container
* [ ] Run Flyway migrations during backend startup
* [ ] Confirm the backend health check passes
* [ ] Confirm the public API is available over HTTPS
* [ ] Confirm secrets are absent from Git and deployment logs
* [ ] Record the deployment configuration in the documentation

### 5.6 Mobile Production API Connection

* [ ] Add the production HTTPS API base URL
* [ ] Preserve the local-development API configuration
* [ ] Verify registration against the production API
* [ ] Verify login against the production API
* [ ] Verify access-token storage
* [ ] Verify authenticated session restoration
* [ ] Verify expired or invalid token handling
* [ ] Confirm no localhost URL is used by the production build

### 5.7 Full Production Smoke Test

* [ ] Confirm public API status
* [ ] Confirm operational health
* [ ] Register production smoke-test user
* [ ] Log in and receive a JWT
* [ ] Read current-user profile
* [ ] Create an application
* [ ] List applications
* [ ] Read application details
* [ ] Update an application
* [ ] Search applications
* [ ] Filter applications
* [ ] Verify dashboard summary counts
* [ ] Delete an application
* [ ] Confirm deleted data cannot be retrieved
* [ ] Confirm unauthenticated requests are rejected
* [ ] Confirm one user cannot access another user's application
* [ ] Run the complete flow from the mobile application
* [ ] Record the smoke-test results

### Phase 5 completion criteria

Deployment readiness is complete when:

* CI passes on the repository.
* The backend runs from its production Docker image.
* The managed PostgreSQL database is persistent and reachable only through the backend.
* The backend is publicly available over HTTPS.
* Production secrets are stored outside Git.
* The mobile application communicates with the production API.
* Authentication and all application operations pass the production smoke test.
* Local development continues to work.

---

## Phase 6 — Mobile Distribution

**Status: Not started**

This phase begins only after production backend deployment and smoke testing are complete.

* [ ] Review Expo Application Services configuration
* [ ] Configure production application identifiers
* [ ] Configure release-build environment variables
* [ ] Create an internal Android build
* [ ] Create an internal iOS build
* [ ] Test release builds on physical devices
* [ ] Prepare app icons and store assets
* [ ] Prepare privacy documentation
* [ ] Prepare Google Play listing
* [ ] Prepare Apple App Store listing
* [ ] Submit store builds

No store submission should begin until the production API has passed the full smoke test.

---

## Future Product Backlog

**Status: Deferred**

These are product features and are intentionally excluded from the deployment-readiness phase.

### AI assistance

* [ ] Job-description parser
* [ ] CV analyser
* [ ] CV-to-job matching
* [ ] Cover-letter assistance
* [ ] Application improvement suggestions

### Application workflow

* [ ] Backend-synchronised reminders
* [ ] Cross-device notification synchronisation
* [ ] Email import
* [ ] Job-board import
* [ ] Interview-coach integration
* [ ] Document attachments
* [ ] Application activity history

### Platform improvements

* [ ] Password reset
* [ ] Email verification
* [ ] Refresh tokens
* [ ] Account deletion
* [ ] Data export
* [ ] Additional accessibility review
* [ ] Performance monitoring
* [ ] Error monitoring
* [ ] Analytics with appropriate privacy controls

Future features must be planned separately after the deployed MVP is stable.

---

## Current Immediate Task

Finish the documentation commit, then create the root `README.md` and correct the repository licence.
