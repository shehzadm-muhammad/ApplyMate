# ApplyMate Architecture

## Overview

ApplyMate is a full-stack mobile application consisting of:

- A React Native and Expo client
- A Spring Boot REST API
- JWT-based authentication
- A PostgreSQL relational database
- Flyway database migrations
- A Docker-based production backend
- GitHub Actions continuous integration

The application uses one mobile client, one backend service and one PostgreSQL database.

## Production Architecture

```text
┌───────────────────────────────┐
│   React Native / Expo Client  │
│                               │
│   TypeScript                  │
│   React Navigation            │
│   Expo SecureStore            │
│   AsyncStorage                │
└───────────────┬───────────────┘
                │
                │ HTTPS + JSON
                │ Authorization: Bearer <JWT>
                ▼
┌───────────────────────────────┐
│         Render                │
│                               │
│   Spring Boot Docker Service  │
│   Java 21                     │
│   Spring Security             │
│   Validation                  │
│   JPA / Hibernate             │
│   Flyway                      │
│   Actuator Health Check       │
└───────────────┬───────────────┘
                │
                │ JDBC over TLS
                ▼
┌───────────────────────────────┐
│          Neon                 │
│                               │
│   PostgreSQL 17               │
│   app_users                   │
│   job_applications            │
│   flyway_schema_history       │
└───────────────────────────────┘
```

## Production Services

### Backend

- Provider: Render
- Service type: Docker web service
- Region: Frankfurt
- Public API:

```text
https://applymate-api-bami.onrender.com
```

- Health endpoint:

```text
https://applymate-api-bami.onrender.com/actuator/health
```

### Database

- Provider: Neon
- Database name: `applymate`
- PostgreSQL version: 17
- Production branch: `production`
- SSL required
- Accessible only through backend database credentials

The mobile application never connects directly to Neon.

## Architectural Principles

ApplyMate follows these principles:

- The mobile client does not access PostgreSQL directly.
- All server-backed application data passes through the REST API.
- Authentication is stateless at the backend.
- Protected requests use JWT bearer tokens.
- Every application record is scoped to its authenticated owner.
- Database structure is managed through Flyway migrations.
- Environment-specific values are supplied through environment variables.
- Secrets are stored outside Git.
- Local-only device features remain separate from backend-managed data.
- Frontend screens do not depend directly on database or HTTP implementation details.
- Production infrastructure can be replaced without redesigning the mobile client.

---

# Frontend Architecture

The frontend source is located under `src/`.

```text
src/
├── components/
├── config/
├── context/
├── navigation/
├── screens/
├── services/
├── theme/
└── types/
```

## Screens

The `screens/` directory contains complete application screens.

Screens are responsible for:

- Rendering interface state
- Handling user interaction
- Calling frontend services
- Displaying loading states
- Displaying validation and API errors
- Refreshing data after user actions

Screens do not contain backend persistence logic.

## Components

The `components/` directory contains reusable interface elements shared by screens.

Components remain focused on presentation and reusable interaction behaviour.

## Navigation

The `navigation/` directory defines public and protected navigation flows.

Authentication state determines whether the user sees:

- Registration and login screens
- The authenticated application interface

Navigation does not authenticate the user itself. It reacts to state supplied by the authentication context.

## Context

The `context/` directory contains shared application state.

The authentication context coordinates:

- Registration
- Login
- Logout
- Initial session restoration
- Current-user loading
- Access-token state
- Public and protected navigation state

## Frontend Configuration

The API base URL is supplied through:

```text
EXPO_PUBLIC_API_URL
```

Examples:

```text
Local web:
http://localhost:8080

Local physical device:
http://<developer-machine-LAN-IP>:8080

Production:
https://applymate-api-bami.onrender.com
```

The configured value is normalised before requests are sent.

The public API URL may appear in the frontend bundle. Secrets must never use the `EXPO_PUBLIC_` prefix.

## Frontend Service Layer

The `services/` directory separates API and storage operations from screens.

Important services include:

- `apiClient.ts`
- `authService.ts`
- `applicationService.ts`
- `systemService.ts`
- `tokenStorage.ts`
- `authStorage.ts`
- `reminderStorage.ts`
- `settingsStorage.ts`
- `notificationService.ts`

### Central API client

The API client:

- Builds URLs from `EXPO_PUBLIC_API_URL`
- Serialises request bodies as JSON
- Adds standard JSON headers
- Retrieves stored JWT access tokens
- Adds bearer tokens to protected requests
- Parses successful responses
- Converts API failures into a consistent frontend error type
- Removes invalid authentication state after protected `401` responses
- Converts network failures into user-readable errors

Feature services use this client rather than duplicating request logic.

### Application service

The application service:

- Calls job-application endpoints
- Maps frontend status labels to backend enum values
- Maps backend responses into frontend models
- Encodes search and filtering query parameters
- Keeps backend DTO shapes separate from screens

## Token and Session Storage

On native platforms, JWT access tokens are stored using Expo SecureStore.

On the web build, access tokens are stored using browser `localStorage`.

Cached user-display and session information may use AsyncStorage.

The JWT remains the authority for protected backend access. Cached state cannot bypass backend authentication.

## Local-Only Features

The following features remain local to the device:

- Reminders
- Local notification scheduling
- Face ID preference
- Notification preferences

These features do not currently pass through the backend API.

---

# Backend Architecture

The backend source is located under:

```text
backend/src/main/java/com/applymate/backend/
```

The backend uses feature-based packages:

```text
com.applymate.backend
├── application/
├── auth/
├── common/error/
├── security/
├── system/
├── user/
└── ApplyMateBackendApplication.java
```

Although classes are grouped by feature, the backend follows logical application layers.

## Controller Layer

Controllers expose the REST API.

Controller responsibilities include:

- Mapping HTTP routes
- Reading path and query parameters
- Receiving request DTOs
- Triggering Bean Validation
- Reading the authenticated principal
- Delegating operations to services
- Returning response DTOs and HTTP status codes

Controllers do not directly implement persistence logic.

## DTO and Validation Layer

Request and response DTOs define the external API contract.

Request DTOs validate:

- Required fields
- Maximum lengths
- Email formatting
- Supported application statuses
- Date formats
- URL formats

Persistence entities are not returned directly as the public API contract.

## Service Layer

Services implement application business rules.

Service responsibilities include:

- Resolving the authenticated user
- Creating and updating entities
- Enforcing application ownership
- Applying search and filtering rules
- Calculating dashboard summary counts
- Mapping entities to API responses
- Raising domain-specific exceptions

## Repository Layer

Repositories use Spring Data JPA to access PostgreSQL.

Application operations must include the authenticated user's identity when:

- Listing applications
- Searching applications
- Filtering applications
- Loading application details
- Updating applications
- Deleting applications
- Calculating summary counts

A request containing another user's application ID must not expose that application.

## Entity Layer

The main persisted domain entities are:

- Application users
- Job applications

Each job application belongs to one application user.

---

# Security Architecture

## Public routes

The following routes are public:

- `GET /api/v1/status`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /actuator/health`

## Protected routes

User-profile and application-management routes require:

```http
Authorization: Bearer <access-token>
```

## Login Flow

```text
1. The user submits an email address and password.
2. The backend loads the user account.
3. The password is checked against the stored password hash.
4. The backend creates a signed JWT access token.
5. The frontend stores the access token.
6. Protected requests include the token as a bearer token.
```

## Protected Request Flow

```text
1. The mobile client loads the stored access token.
2. The API client adds the Authorization header.
3. Spring Security validates the JWT signature and claims.
4. The authenticated identity becomes available to the request.
5. The controller delegates to the relevant service.
6. The service applies ownership and business rules.
7. The repository accesses only the authenticated user's data.
8. The API returns a JSON response.
```

## JWT Configuration

The backend uses:

- A configured issuer
- A signed secret
- A limited access-token lifetime
- A user authority represented by the token scope

The production JWT secret is stored as a Render environment variable.

It must never be committed to Git, stored in the Docker image or included in frontend code.

## CORS

Allowed browser origins are configured through:

```text
APP_CORS_ALLOWED_ORIGIN_PATTERNS
```

Native React Native requests are not governed by browser CORS in the same way as an Expo web deployment.

Any future web frontend origin must be explicitly added to production CORS configuration.

---

# Error Handling

The backend uses centralised exception handling.

Expected API errors include:

- Invalid request data
- Malformed JSON
- Invalid credentials
- Missing or invalid authentication
- Duplicate registration data
- Missing application records
- Unsupported status values
- Unexpected server failures

The frontend API client converts backend errors into a consistent `ApiError` structure.

Production configuration prevents default framework responses from exposing:

- Stack traces
- Internal exception names
- Database details
- Binding implementation details

---

# Persistence Architecture

PostgreSQL is the system of record for:

- Registered users
- Password hashes
- Job applications
- Application ownership
- Application statuses
- Creation and update timestamps

The backend uses:

- Spring Data JPA for repository access
- Hibernate for ORM behaviour
- HikariCP for connection pooling
- Flyway for schema migrations
- UTC for backend timestamps

Hibernate validates the production schema but does not create it automatically.

## Database Migrations

Migration files are stored under:

```text
backend/src/main/resources/db/migration/
```

Flyway migrations:

- Run in version order
- Record execution in `flyway_schema_history`
- Create and update the database schema
- Must not be modified after being applied to a shared environment
- Must be extended using new migration files

Flyway runs when the production backend starts.

## Database Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

A different PostgreSQL provider can be used by replacing:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Schema recreation is handled by Flyway.

Existing data can be migrated using standard PostgreSQL backup and restore tools.

The application does not depend on Neon-specific client libraries, authentication or APIs.

---

# Local Development Topology

```text
Developer computer
├── Expo development server
├── React Native app or web build
├── Spring Boot process on port 8080
└── Docker
    └── PostgreSQL 17 on port 5432
```

The local PostgreSQL container is defined in:

```text
backend/compose.yaml
```

The Compose setup provides:

- PostgreSQL 17
- Environment-based credentials
- A persistent Docker volume
- A database health check
- Automatic restart unless manually stopped

---

# Production Container Architecture

The backend Dockerfile uses a multi-stage build.

```text
Build stage
├── Maven
├── Java 21 JDK
├── pom.xml
└── backend source
        |
        | mvn clean package
        ▼
Executable Spring Boot JAR
        |
        ▼
Runtime stage
├── Java 21 JRE
├── curl
├── non-root applymate user
└── app.jar
```

The final image:

- Does not contain Maven
- Does not include local `.env` files
- Does not include test sources
- Runs as the non-root `applymate` user
- Activates the Spring production profile
- Exposes the platform-provided server port
- Defines an `/actuator/health` Docker health check

The `.dockerignore` prevents local secrets and unnecessary files from entering the build context.

---

# Continuous Integration Architecture

GitHub Actions runs three jobs.

## Frontend checks

```text
npm ci
    |
npm run typecheck
    |
npm run build:web
```

## Backend checks

```text
PostgreSQL CI service
        |
Java 21
        |
Maven clean verify
        |
JUnit / MockMvc / Testcontainers
```

## Docker checks

```text
Build production Docker image
        |
Verify non-root user
        |
Verify health-check configuration
```

The Docker job runs only after the frontend and backend jobs pass.

No production credentials are used in CI.

---

# Environment Separation

## Local environment

Local development uses:

- Root `.env.local`
- Backend `.env`
- Docker Compose PostgreSQL
- Localhost or LAN API addresses
- Local development JWT secret

These files are ignored by Git.

## Continuous integration environment

CI uses:

- Temporary CI environment variables
- An isolated PostgreSQL service
- Testcontainers
- A placeholder frontend API URL
- No production credentials

## Production environment

Render stores:

- `SPRING_PROFILES_ACTIVE`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGIN_PATTERNS`
- Platform-provided `PORT`

Neon stores the production PostgreSQL data.

Production secrets must not be stored in:

- Git
- Docker images
- Frontend source code
- Documentation
- Test fixtures
- Committed environment files

---

# Production Verification

The deployed architecture has passed:

- Public API status verification
- Actuator health verification
- Registration and login
- JWT authentication
- Current-user profile retrieval
- Application CRUD
- Search and filtering
- Dashboard summary
- Validation checks
- Unauthenticated-request rejection
- Cross-user isolation checks
- Full mobile-to-production testing
- Persistence after logout and login

The verified production path is:

```text
Expo mobile client
    -> Render Docker backend
    -> Neon PostgreSQL
```

---

# Operational Characteristics

The current deployment uses free portfolio-tier services.

Render may stop the backend after inactivity. Neon may suspend inactive database compute.

The first request after inactivity can therefore take longer while both services resume.

This behaviour affects initial response time but does not change the application architecture or stored data.

---

# Architecture Boundaries

The following boundaries remain in place:

- Application data continues to use the Spring Boot API.
- PostgreSQL remains the backend system of record.
- The mobile client never accesses PostgreSQL directly.
- Reminders and device preferences remain local.
- Production secrets remain outside Git.
- Existing screens and navigation are not redesigned during release preparation.
- New product features remain deferred until release builds are stable.