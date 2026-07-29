# ApplyMate Project Context

## Product
ApplyMate is a React Native job-application tracker with a Spring Boot API
and PostgreSQL database.

## Current Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation

### Backend
- Java 21
- Spring Boot 3.5
- Maven
- PostgreSQL 17
- Flyway
- JWT authentication
- Docker Compose

## Current Git State
- Current branch: feat/frontend-api-integration
- Latest completed milestone: Application CRUD frontend/backend integration

## Completed Features
- Registration
- Login
- JWT authentication
- Protected navigation
- Current-user profile
- Create application
- List applications
- Application details
- Edit application
- Delete application
- User-specific application separation
- Dashboard reads backend application data
- Profile reads backend application data

## Application API
- GET /api/v1/applications
- POST /api/v1/applications
- GET /api/v1/applications/{id}
- PUT /api/v1/applications/{id}
- DELETE /api/v1/applications/{id}
- GET /api/v1/applications/summary

## Status Mapping

Frontend:
- Saved
- Applied
- Assessment
- Interview
- Offer
- Rejected

Backend:
- SAVED
- APPLIED
- ASSESSMENT
- INTERVIEW
- OFFER
- REJECTED

## Local-Only Features
These remain in AsyncStorage for now:
- Reminders
- Local notifications
- Face ID preference
- Notification settings

## Important Decisions
- Application data must always use the backend.
- Reminders remain local until notification synchronisation is designed.
- Do not redesign screens during backend migration.
- Preserve existing TypeScript service function names where practical.

## Current Sprint
MVP polish.

### Planned Order
1. Dashboard summary endpoint
2. Frontend loading and error states
3. Pull-to-refresh
4. Application search
5. Status filtering
6. Sorting
7. Backend validation
8. Global backend exception handling
9. Tests and code cleanup

## Next Immediate Task
Connect DashboardScreen to:
GET /api/v1/applications/summary# ApplyMate Project Context

## Product

ApplyMate is a full-stack job-application tracking application.

It allows authenticated users to manage their job applications, monitor application progress and view dashboard statistics from a React Native mobile interface backed by a Spring Boot REST API and PostgreSQL database.

## Current Phase

**Deployment & Production Readiness**

The full-stack MVP and MVP-polish phases are complete.

The current goal is to prepare the existing application for reliable production deployment without redesigning the interface or adding new product features.

## Current Git State

* Stable branch: `main`
* Working branch: `chore/deployment-readiness`
* Latest completed milestone: Full-stack MVP integration and polish
* Current release tag: `v1.1.0-mvp`
* Stable release commit: `a2e6b31`

## Technology Stack

### Frontend

* React Native
* Expo
* TypeScript
* React Navigation
* AsyncStorage
* Expo SecureStore
* Expo Notifications

### Backend

* Java 21
* Spring Boot 4.1
* Maven
* Spring Security
* OAuth2 Resource Server
* Spring Data JPA
* Bean Validation
* Spring Boot Actuator
* PostgreSQL 17
* Flyway
* Docker Compose

### Testing

* JUnit
* MockMvc
* Mockito
* Testcontainers
* PowerShell end-to-end smoke-test script

## Current Architecture

```text
React Native application
        |
        v
TypeScript service layer
        |
        v
Spring Boot REST API
        |
        +--> JWT authentication and authorization
        |
        v
PostgreSQL database
```

The mobile application communicates with the backend through the frontend service layer.

The backend validates requests, authenticates users through JWT bearer tokens, applies per-user data ownership rules and persists application data in PostgreSQL.

## Completed Authentication Features

* User registration
* User login
* Secure password hashing
* JWT access-token generation
* JWT bearer-token validation
* Protected application navigation
* Authenticated current-user profile
* Per-user application ownership
* Unauthorized-request handling

## Completed Application Features

* Create a job application
* List the authenticated user's applications
* View application details
* Edit an application
* Delete an application
* Search by company or role
* Filter by application status
* Sort applications
* Dashboard application-summary counts
* Loading states
* Error states
* Pull-to-refresh
* Backend request validation
* Consistent backend error responses

## Application Statuses

### Frontend display values

* Saved
* Applied
* Assessment
* Interview
* Offer
* Rejected

### Backend enum values

* `SAVED`
* `APPLIED`
* `ASSESSMENT`
* `INTERVIEW`
* `OFFER`
* `REJECTED`

The frontend service layer is responsible for mapping between display values and backend enum values.

## Main API Routes

All main application routes use the `/api/v1` prefix.

### System

* `GET /api/v1/status`

### Authentication

* `POST /api/v1/auth/register`
* `POST /api/v1/auth/login`

### Users

* `GET /api/v1/users/me`

### Applications

* `GET /api/v1/applications`
* `POST /api/v1/applications`
* `GET /api/v1/applications/{id}`
* `PUT /api/v1/applications/{id}`
* `DELETE /api/v1/applications/{id}`
* `GET /api/v1/applications/summary`

## Data Ownership

Every job application belongs to one authenticated user.

Backend services and repository queries must always scope application access to the authenticated user. A user must never be able to read, update or delete another user's applications.

Application data must always be stored through the backend and PostgreSQL database.

## Local-Only Features

The following features currently remain on the device:

* Reminders
* Local notifications
* Face ID preference
* Notification settings

These features use local device storage and are not synchronised with the backend.

They must remain local during the deployment-readiness phase.

## Environment Strategy

### Local Development

* React Native and Expo run on the developer machine or test device.
* Spring Boot runs locally.
* PostgreSQL runs through Docker Compose.
* Local environment variables configure database credentials, JWT secrets and frontend API access.

### Production

* The Spring Boot backend will run as a deployed containerised service.
* PostgreSQL will run as a managed production database.
* Secrets and database credentials will be supplied through deployment-platform environment variables.
* The mobile app will use the production HTTPS API base URL.
* Local development configuration must continue to work separately from production configuration.

## Production-Readiness Order

1. Update project documentation.
2. Add the root README and correct the licence.
3. Add continuous integration.
4. Prepare production configuration and the backend Dockerfile.
5. Deploy the Spring Boot backend and PostgreSQL database.
6. Connect the mobile application to the production API.
7. Run a complete production smoke test.

## Current Constraints

During this phase:

* Do not redesign the application.
* Do not add new product features.
* Do not move local-only features to the backend.
* Do not change application behaviour unless required for production reliability.
* Do not commit secrets, passwords, tokens or production credentials.
* Keep local development working while production support is added.
* Use environment variables for environment-specific configuration.
* Preserve existing API behaviour unless a production-readiness fix requires a documented change.

## Next Immediate Task

Complete and verify the project documentation before creating the root repository README and correcting the licence.
