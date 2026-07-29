# ApplyMate Architecture

## Overview

ApplyMate is a full-stack mobile application consisting of:

* A React Native and Expo client
* A Spring Boot REST API
* JWT-based authentication
* A PostgreSQL relational database
* Flyway database migrations

The application is currently designed as a single mobile client communicating with a single backend service.

## System Context

```text
┌─────────────────────────────┐
│     React Native Client     │
│       Expo / TypeScript     │
└──────────────┬──────────────┘
               │
               │ HTTPS + JSON
               │ Authorization: Bearer <JWT>
               ▼
┌─────────────────────────────┐
│      Spring Boot API        │
│                             │
│ Controllers                 │
│ Security                    │
│ Validation                  │
│ Services                    │
│ Repositories                │
└──────────────┬──────────────┘
               │
               │ JDBC / JPA
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│ app_users                   │
│ job_applications            │
│ flyway_schema_history       │
└─────────────────────────────┘
```

## Architectural Principles

ApplyMate follows these principles:

* The mobile client does not access PostgreSQL directly.
* All server-backed application data passes through the REST API.
* Authentication is stateless at the backend.
* Protected requests use JWT bearer tokens.
* Every application record is scoped to its authenticated owner.
* Database structure is managed through Flyway migrations.
* Environment-specific values are supplied through environment variables.
* Local-only device features remain separate from backend-managed data.
* The frontend user interface should not depend directly on HTTP implementation details.

## Frontend Architecture

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

### Screens

The `screens/` directory contains complete application screens.

Screens are responsible for:

* Rendering user-interface state
* Handling user interaction
* Calling frontend services
* Displaying loading states
* Displaying validation and API errors
* Refreshing data after user actions

Screens must not contain backend database logic.

### Components

The `components/` directory contains reusable interface elements shared by screens.

Components should remain focused on presentation and reusable interaction behaviour.

### Navigation

The `navigation/` directory defines the available navigation stacks and tabs.

Authentication state controls whether the user sees:

* The public authentication flow
* The protected application flow

Navigation does not authenticate the user itself. It responds to state supplied by the authentication context.

### Context

The `context/` directory contains shared application state.

The authentication context is responsible for coordinating:

* Initial session restoration
* Login
* Registration
* Logout
* Current authenticated user state
* Protected versus public navigation state

### Configuration

The `config/` directory contains environment-dependent frontend configuration.

The backend base URL is supplied through:

```text
EXPO_PUBLIC_API_URL
```

The frontend removes trailing slashes from the configured value before making requests.

Examples:

```text
Local web:
http://localhost:8080

Local physical device:
http://<developer-machine-LAN-IP>:8080

Production:
https://<production-api-domain>
```

No production API URL, token or credential should be hard-coded into a screen or service.

### Service Layer

The `services/` directory separates network and storage operations from the user interface.

Important services include:

* `apiClient.ts`
* `authService.ts`
* `applicationService.ts`
* `systemService.ts`
* `tokenStorage.ts`
* `authStorage.ts`
* `reminderStorage.ts`
* `settingsStorage.ts`
* `notificationService.ts`

#### Central API client

The central API client:

* Builds requests from the configured API base URL
* Serialises request bodies as JSON
* Adds `Accept: application/json`
* Adds `Content-Type: application/json` when required
* Retrieves the access token
* Adds the JWT bearer token to protected requests
* Parses successful and unsuccessful responses
* Converts backend failures into a consistent frontend error type
* Removes an invalid or expired access token after a protected `401` response
* Converts network failures into a user-readable connection error

Feature services should use this client rather than duplicating request logic.

#### Application service

The application service:

* Calls application API endpoints
* Maps frontend display values to backend enum values
* Maps backend responses to frontend application models
* Encodes search, filtering and sorting query parameters
* Keeps backend response shapes separate from screen components

### Token and Session Storage

On native platforms, JWT access tokens are stored using Expo SecureStore.

On the web build, access tokens are stored using browser `localStorage`.

Basic cached session and user-display information are stored separately through AsyncStorage.

The JWT remains the authority for protected backend access. Cached session data must not bypass backend authentication.

### Local-Only Services

The following features remain local to the device:

* Reminders
* Notification scheduling
* Face ID preference
* Notification preferences

These features do not currently pass through the backend API.

## Backend Architecture

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

* Mapping HTTP routes
* Reading path and query parameters
* Receiving request DTOs
* Triggering Bean Validation
* Reading the authenticated principal
* Delegating business operations to services
* Returning response DTOs and HTTP status codes

Controllers should not directly implement persistence logic.

## DTO and Validation Layer

Request and response DTOs define the public API contract.

Request DTOs are responsible for validating input such as:

* Required fields
* Maximum lengths
* Email formatting
* Valid application statuses
* Valid date values

Persistence entities must not be returned directly as the external API contract.

## Service Layer

Services implement application business rules.

Service responsibilities include:

* Resolving the authenticated user
* Creating and updating entities
* Enforcing application ownership
* Applying search and filtering rules
* Returning dashboard-summary counts
* Mapping entities into API responses
* Raising domain-specific exceptions when data cannot be accessed

## Repository Layer

Repositories use Spring Data JPA to access PostgreSQL.

Repository operations must preserve user isolation.

Application queries must include the authenticated user's identity when:

* Listing applications
* Searching applications
* Filtering applications
* Loading application details
* Updating an application
* Deleting an application
* Calculating summary counts

A request containing another user's application identifier must not expose that application.

## Entity Layer

Entities represent persisted database records.

The main persisted domain concepts are:

* Application users
* Job applications

A job application is associated with one application user.

## Security Architecture

### Public routes

Registration, login and the public system-status endpoint can be accessed without a JWT.

### Protected routes

User-profile and application-management routes require:

```http
Authorization: Bearer <access-token>
```

### Login flow

```text
1. User submits an email address and password.
2. The backend loads the user account.
3. The password is checked against the stored password hash.
4. The backend creates a signed JWT access token.
5. The frontend stores the token.
6. Later protected requests include the token as a bearer token.
```

### Protected request flow

```text
1. The mobile client loads the stored access token.
2. The API client adds the Authorization header.
3. Spring Security validates the JWT signature and claims.
4. The authenticated identity becomes available to the request.
5. The controller delegates to the relevant service.
6. The service performs the operation using the authenticated user's identity.
7. The repository reads or modifies only that user's data.
8. The API returns a JSON response.
```

### JWT characteristics

The backend currently uses:

* A configured issuer
* A signed secret
* A limited access-token lifetime
* A user authority represented by the token scope

The JWT secret must always be provided through an environment variable and must never be committed to Git.

## Error Handling

The backend has centralised error handling.

Expected API errors include:

* Invalid request data
* Invalid credentials
* Missing or invalid authentication
* Duplicate registration data
* Missing application records
* Unsupported request values
* Unexpected server failures

The frontend API client converts backend error responses into a consistent `ApiError` structure for screens to display.

Internal exception details, database credentials and stack traces must not be exposed to clients in production responses.

## Persistence Architecture

PostgreSQL is the system of record for:

* Registered users
* Password hashes
* Job applications
* Application ownership
* Application timestamps and statuses

The backend uses:

* Spring Data JPA for persistence
* Hibernate for ORM behaviour
* Flyway for schema migrations
* UTC for database-related application timestamps

Hibernate schema generation is not used to create production tables automatically. The configured schema is validated against Flyway-managed migrations.

## Database Migrations

Flyway migration files are stored under:

```text
backend/src/main/resources/db/migration/
```

Migration files:

* Are executed in version order
* Record their execution in `flyway_schema_history`
* Must not be edited after being applied to shared environments
* Must be extended through new migration files for later schema changes

## Local Development Topology

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

The Compose configuration provides:

* PostgreSQL 17
* Environment-based database credentials
* A persistent Docker volume
* A database-health check
* Automatic container restart unless manually stopped

## Target Production Topology

```text
Mobile application
        │
        │ HTTPS
        ▼
Public backend service
        │
        │ Private encrypted database connection
        ▼
Managed PostgreSQL database
```

The intended production deployment will use:

* A containerised Spring Boot backend
* A managed PostgreSQL service
* Platform-managed environment variables
* HTTPS for all public API traffic
* A production API base URL supplied to the Expo build
* Health checks for backend availability
* Persistent managed database storage

The production database must not be exposed directly to the mobile client.

## Environment Separation

### Local environment

Local development may use:

* Root frontend environment files
* Backend local `.env` files
* Docker Compose PostgreSQL
* Localhost or LAN API addresses

### Continuous integration environment

CI will use:

* A clean dependency installation
* Frontend TypeScript checks
* Backend Maven tests
* Testcontainers or an isolated test database
* No production credentials

### Production environment

Production will use platform-managed variables for:

* Database connection details
* JWT signing secret
* Allowed CORS origins
* Server port
* Environment profile
* Other platform-specific runtime settings

Production secrets must not be stored in:

* Git
* Docker images
* Expo source code
* Documentation
* Test fixtures
* Committed environment files

## Deployment Boundary

During deployment readiness, the following boundaries must remain unchanged:

* Application data continues to use the Spring Boot API.
* PostgreSQL remains the backend system of record.
* Reminders and device preferences remain local.
* No new product feature is added.
* Existing screens and navigation are not redesigned.
* Environment configuration may change only to support local and production operation.
