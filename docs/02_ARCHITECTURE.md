# ApplyMate Architecture

## Overview

ApplyMate is a full-stack mobile application consisting of:

- A React Native and Expo mobile client
- A Spring Boot REST API
- JWT access-token authentication
- Persistent refresh-token sessions
- A PostgreSQL relational database
- Flyway database migrations
- Backend-synchronised reminders
- Local device notification scheduling
- A Docker-based production backend
- GitHub Actions continuous integration
- Expo Application Services for mobile builds
- GitHub Pages for public privacy and account-deletion information

The application uses one mobile client, one backend service and one PostgreSQL database.

## Production Architecture

```text
┌────────────────────────────────────┐
│     React Native / Expo Client     │
│                                    │
│  TypeScript                        │
│  React Navigation                  │
│  Expo SecureStore                  │
│  AsyncStorage                      │
│  Expo Notifications                │
└────────────────┬───────────────────┘
                 │
                 │ HTTPS + JSON
                 │ JWT access token
                 │ Refresh-token session
                 ▼
┌────────────────────────────────────┐
│              Render                │
│                                    │
│  Spring Boot Docker Service        │
│  Java 21                           │
│  Spring Security                   │
│  Validation                        │
│  JPA / Hibernate                   │
│  Flyway                            │
│  Actuator Health Check             │
└────────────────┬───────────────────┘
                 │
                 │ JDBC over TLS
                 ▼
┌────────────────────────────────────┐
│               Neon                 │
│                                    │
│  PostgreSQL 17                     │
│  app_users                         │
│  job_applications                  │
│  reminders                         │
│  refresh_tokens                    │
│  flyway_schema_history             │
└────────────────────────────────────┘
````

The mobile application communicates only with the Spring Boot API.

It never connects directly to PostgreSQL.

Local operating-system notifications are scheduled by the mobile application and do not require a direct database connection.

---

# Production Services

## Backend

* Provider: Render
* Service type: Docker web service
* Region: Frankfurt
* Java runtime: Java 21
* Spring Boot: 4.1
* Production profile: `prod`

Public API:

```text
https://applymate-api-bami.onrender.com
```

Status endpoint:

```text
https://applymate-api-bami.onrender.com/api/v1/status
```

Health endpoint:

```text
https://applymate-api-bami.onrender.com/actuator/health
```

Render supplies the production HTTP port through the platform environment.

The application does not assume local port `8080` in production.

## Database

* Provider: Neon
* Database: `applymate`
* PostgreSQL version: 17
* SSL required
* Accessible only through backend database credentials

Database structure is controlled by Flyway.

The production schema is currently at migration version 5.

## Mobile Distribution

Expo Application Services is used to create mobile builds.

Expo project:

```text
@zaib_367/ApplyMate
```

Permanent identifiers:

```text
Android: com.zaib367.applymate
iOS:     com.zaib367.applymate
```

Preview and production EAS environments use the deployed Render API.

## Public Web Pages

GitHub Pages hosts ApplyMate's public privacy and deletion information:

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

Privacy Policy:

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

Account deletion information:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

---

# Architectural Principles

ApplyMate follows these principles:

* The mobile client never accesses PostgreSQL directly.
* Server-backed user data passes through the Spring Boot REST API.
* Access tokens are short-lived.
* Refresh-token sessions are persisted and revocable.
* Refresh tokens rotate after successful use.
* Only hashed refresh-token values are stored in PostgreSQL.
* Every application and reminder is scoped to its authenticated owner.
* Database structure is managed through Flyway migrations.
* Environment-specific configuration is supplied through environment variables.
* Secrets remain outside Git and frontend bundles.
* Local notification scheduling remains separate from backend reminder persistence.
* Frontend screens do not depend directly on database implementation details.
* API and storage responsibilities are isolated in frontend services.
* Production infrastructure can be replaced without redesigning the mobile client.

---

# Frontend Architecture

The frontend source is located under:

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

The `screens/` directory contains complete mobile application screens.

Screens are responsible for:

* Rendering interface state
* Handling user interaction
* Calling frontend services
* Displaying loading states
* Displaying validation and API errors
* Refreshing data after user actions
* Triggering account and reminder actions

Screens do not contain backend persistence logic.

## Components

The `components/` directory contains reusable user-interface elements.

Examples include reusable settings rows and form controls.

Components remain focused on presentation and reusable interaction behaviour.

## Navigation

The `navigation/` directory defines public and authenticated navigation flows.

Authentication state determines whether the user sees:

```text
Unauthenticated
    -> Welcome
    -> Register
    -> Login

Authenticated
    -> Dashboard
    -> Applications
    -> Reminders
    -> Profile
```

Navigation does not authenticate the user itself.

It reacts to authentication state supplied by `AuthContext`.

## Authentication Context

`AuthContext` coordinates:

* Login
* Logout
* Session restoration
* Current-user loading
* Expired-session handling
* Silent access-token refresh
* Account deletion
* Public/authenticated navigation state

If a valid refresh session exists, an expired access token does not automatically log the user out.

If refresh authentication fails because the session is no longer valid, the authentication context clears the current user and returns the app to the unauthenticated flow.

## Frontend Configuration

The API base URL is supplied through:

```text
EXPO_PUBLIC_API_URL
```

Typical values:

```text
Local backend:
http://127.0.0.1:8080

Production:
https://applymate-api-bami.onrender.com
```

For Android emulator testing, ADB reverse may be used when connecting to a locally running backend.

The public API URL may appear in the frontend bundle.

Secrets must never use the `EXPO_PUBLIC_` prefix.

---

# Frontend Service Layer

The `services/` directory separates network, authentication, notification and storage operations from screens.

Important services include:

```text
apiClient.ts
authService.ts
applicationService.ts
accountService.ts
notificationService.ts
reminderStorage.ts
settingsStorage.ts
tokenStorage.ts
```

## Central API Client

`apiClient.ts` is responsible for:

* Building URLs from `EXPO_PUBLIC_API_URL`
* Serialising JSON request bodies
* Adding standard request headers
* Loading access tokens
* Adding bearer authentication to protected requests
* Parsing successful responses
* Converting backend failures into `ApiError`
* Detecting authenticated `401` responses
* Refreshing expired access tokens
* Retrying the original request once
* Coordinating simultaneous refresh attempts
* Clearing invalid sessions when refresh authentication fails
* Preserving sessions during temporary network/server failures where appropriate
* Converting network failures into readable frontend errors

## Silent Refresh Coordination

Several protected API requests can fail at the same time after an access token expires.

The frontend prevents each request from independently rotating the same refresh token.

```text
Multiple requests receive 401
            |
            v
One shared refresh operation
            |
            v
New access + refresh tokens stored
            |
            v
Waiting requests continue
```

This avoids unnecessary refresh-token reuse and race conditions.

## Token Storage

Native Android/iOS platforms use Expo SecureStore for authentication credentials.

Stored authentication data includes:

* Access token
* Refresh token

Web fallback storage uses browser `localStorage`.

Rotated authentication credentials replace the previous token pair.

AsyncStorage is used for non-secret device-specific state.

## Application Service

The application service:

* Calls application endpoints
* Maps frontend status labels to backend enum values
* Maps backend DTOs into frontend models
* Encodes search/filter parameters
* Keeps API shapes separate from screens

## Reminder Architecture

Reminder records are persisted by the backend.

Local notification scheduling remains on the device.

```text
User creates reminder
        |
        ├──> Spring Boot API
        │       |
        │       v
        │   PostgreSQL reminder
        │
        └──> Expo Notifications
                |
                v
        Device notification schedule
```

Stored device notification identifiers are associated with the authenticated user.

This allows local notification cleanup during reminder changes and account deletion.

## Account Deletion Service

`accountService.ts` coordinates the mobile side of permanent account deletion.

The sequence is:

```text
DELETE /api/v1/users/me
        |
        v
Backend confirms deletion
        |
        v
Cancel scheduled local reminders
        |
        v
Clear stored reminder notification IDs
        |
        v
Clear local account-related settings
        |
        v
Remove access + refresh tokens
        |
        v
AuthContext clears current user
        |
        v
Welcome screen
```

Local data is not treated as proof that backend deletion succeeded.

The backend deletion must succeed first.

---

# Backend Architecture

Backend source:

```text
backend/src/main/java/com/applymate/backend/
```

The project is organised by feature.

Important backend areas include:

```text
com.applymate.backend
├── application/
├── auth/
├── reminder/
├── security/
├── user/
├── common/error/
├── system/
└── ApplyMateBackendApplication.java
```

Although classes are grouped by feature, the backend maintains controller, service, repository and persistence responsibilities.

## Controller Layer

Controllers are responsible for:

* Mapping HTTP routes
* Reading path/query parameters
* Receiving request DTOs
* Triggering Bean Validation
* Reading the authenticated principal
* Delegating business operations to services
* Returning response DTOs
* Returning appropriate HTTP status codes

Controllers do not directly implement database persistence.

## DTO and Validation Layer

Request and response DTOs define the public API contract.

Validation covers fields such as:

* Required values
* Maximum lengths
* Email formatting
* Application statuses
* Dates
* URLs
* Reminder values
* Authentication request data

Persistence entities are not exposed directly as the API contract.

## Service Layer

Services implement application business rules.

Responsibilities include:

* Resolving authenticated users
* Creating/updating/deleting entities
* Enforcing ownership
* Search/filter logic
* Dashboard calculations
* Authentication
* Refresh-token lifecycle management
* Account deletion
* Response mapping
* Domain-specific exceptions

## Repository Layer

Spring Data JPA repositories access PostgreSQL.

User-owned queries must include the authenticated user's identity.

This applies to:

* Listing applications
* Searching/filtering applications
* Loading application details
* Updating applications
* Deleting applications
* Calculating summaries
* Loading reminders
* Modifying reminders

Another user's record must not be exposed merely because its identifier is known.

## Persisted Domain Data

PostgreSQL stores:

* Application users
* Password hashes
* Job applications
* Reminders
* Refresh-token session records
* Ownership relationships
* Creation/update timestamps

---

# Security Architecture

## Public Routes

Routes that must work without an active access token include:

```text
GET  /api/v1/status
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /actuator/health
```

`refresh` must remain accessible after an access token expires.

`logout` revokes a refresh-token session and therefore does not depend on a still-valid access token.

## Protected Routes

Protected application, reminder, profile and account-deletion operations require:

```http
Authorization: Bearer <access-token>
```

Examples include:

```text
GET    /api/v1/users/me
DELETE /api/v1/users/me

GET    /api/v1/applications
POST   /api/v1/applications
PUT    /api/v1/applications/{id}
DELETE /api/v1/applications/{id}
```

## Login Flow

```text
1. User submits email and password.
2. Backend loads the account.
3. Password is checked against the stored password hash.
4. Backend generates a JWT access token.
5. Backend generates an opaque refresh token.
6. Backend stores only the refresh-token hash.
7. Mobile stores both tokens securely.
8. Protected requests use the access token.
```

## Access Token Lifetime

Production access-token lifetime:

```text
1 hour
```

The access token is intentionally shorter-lived than the persistent session.

## Refresh Session Lifetime

Production refresh-session lifetime:

```text
30 days
```

A successful refresh creates a new token pair.

## Refresh Token Rotation

Refresh tokens are single-use session credentials.

```text
Refresh A
   |
   | successful refresh
   v
Refresh A revoked
Refresh B issued
```

The old token cannot continue operating as the active refresh credential.

## Refresh Token Families

Refresh tokens belong to a session family.

```text
Session family
├── Refresh A
├── Refresh B
└── Refresh C
```

Reuse of a revoked token can indicate token duplication.

The service can revoke the active family when suspicious reuse is detected.

## Refresh Token Persistence

The backend stores:

* Token record ID
* User ID
* Family ID
* SHA-256 token hash
* Expiry time
* Revocation time
* Creation time

The usable refresh token itself is not stored in PostgreSQL.

## Concurrency Protection

Refresh-token rotation uses both client-side and backend safeguards.

Frontend:

```text
shared refresh promise
```

Backend:

```text
pessimistic write lock while rotating the token
```

This prevents concurrent protected requests from independently rotating the same session credential.

## Logout

Logout performs:

```text
Mobile sends current refresh token
        |
        v
Backend revokes refresh session
        |
        v
Mobile removes access token
        |
        v
Mobile removes refresh token
        |
        v
Authenticated user state cleared
```

Local logout cleanup still proceeds if the backend cannot be reached.

## Account Deletion Security

Account deletion endpoint:

```text
DELETE /api/v1/users/me
```

The user identifier is obtained from the authenticated JWT.

Clients cannot supply a different user ID to delete another account.

Database relationships remove user-owned backend data when the account is deleted.

## JWT Configuration

JWT configuration includes:

* Signing secret
* Issuer configuration
* Access-token lifetime
* Authenticated user identity
* Application authority/scope

The production JWT secret is stored in Render.

It must never appear in:

* Git
* Docker image layers
* Frontend source
* Documentation
* EAS public environment variables

## CORS

Browser CORS settings are configured through:

```text
APP_CORS_ALLOWED_ORIGIN_PATTERNS
```

Native React Native requests do not follow browser CORS rules in the same manner as Expo web.

---

# Persistence Architecture

PostgreSQL is the system of record for server-managed user data.

Current main tables include:

```text
app_users
job_applications
reminders
refresh_tokens
flyway_schema_history
```

The backend uses:

* Spring Data JPA
* Hibernate
* HikariCP
* Flyway
* UTC timestamps

Hibernate validates the schema.

Flyway remains responsible for creating and changing it.

## Database Relationships

User-owned entities reference `app_users`.

Account deletion removes associated user data through database ownership/cascade relationships where configured.

This includes:

* Job applications
* Reminders
* Refresh-token sessions

## Database Migrations

Migration files are stored under:

```text
backend/src/main/resources/db/migration/
```

Current migration history includes:

```text
V1 - application users
V2 - job applications
V3 - reminders
V4 - refresh-token table
V5 - refresh-token hash column correction
```

Flyway migrations:

* Run in version order
* Are recorded in `flyway_schema_history`
* Must not be edited after being applied to shared environments
* Must be extended with new migration files

## Database Portability

ApplyMate uses standard PostgreSQL and JDBC.

A different PostgreSQL provider can be used by changing:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

The application does not depend on Neon-specific authentication or client libraries.

---

# Local Development Topology

```text
Developer computer
├── Expo / Metro on port 8081
├── Android emulator / Expo Go / dev build
├── Spring Boot on port 8080
└── Docker
    └── PostgreSQL 17 on port 5432
```

Metro port `8081` serves the React Native development bundle.

Spring Boot port `8080` serves the local REST API.

They have separate responsibilities.

Android emulator development may use:

```text
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

when local routing requires it.

Production mobile builds do not use these local ports.

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
        | Maven package
        v
Executable Spring Boot JAR
        |
        v
Runtime stage
├── Java 21 runtime
├── curl
├── non-root applymate user
└── app.jar
```

The final image:

* Does not contain Maven
* Does not include committed secrets
* Runs as the non-root `applymate` user
* Activates the production profile
* Uses the platform-provided production port
* Exposes Actuator health information

---

# Continuous Integration Architecture

GitHub Actions validates the application through frontend, backend and Docker checks.

## Frontend

```text
npm ci
   |
npm run typecheck
   |
Expo web build/export
```

## Backend

```text
PostgreSQL CI service
        |
Java 21
        |
Maven verify/test
        |
JUnit / MockMvc / Testcontainers
```

The current backend test suite contains:

```text
40 tests
0 failures
0 errors
```

## Docker

```text
Build production image
        |
Verify runtime configuration
        |
Verify non-root execution
        |
Verify health behaviour
```

No production credentials are required by CI.

---

# Environment Separation

## Local Environment

Local development may use:

```text
.env.local
backend/.env
```

These files are ignored by Git.

Local environment values can include:

* Local API URL
* Local database credentials
* Development JWT secret
* Temporary test token lifetimes

## EAS Environments

EAS has separate build environments for:

* Preview
* Production

The public production API configuration is:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

No JWT secrets or database credentials are placed in the frontend environment.

## Production Environment

Render stores values such as:

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

Neon stores the production PostgreSQL data.

Production secrets must never be committed to Git.

---

# Account Deletion Architecture

Account deletion spans backend and device cleanup.

```text
Authenticated user
       |
       v
DELETE /api/v1/users/me
       |
       v
Delete app_users record
       |
       ├──> delete job applications
       ├──> delete reminders
       └──> delete refresh-token sessions
       |
       v
Mobile local cleanup
       |
       ├──> cancel scheduled notifications
       ├──> remove stored notification IDs
       ├──> remove local account settings
       └──> remove authentication tokens
       |
       v
Welcome / Login
```

A production disposable-account test confirmed that deleted credentials can no longer authenticate.

---

# Privacy and Store-Readiness Architecture

Privacy information is hosted separately from the backend API.

```text
GitHub Pages
├── index.html
├── privacy-policy.html
└── delete-account.html
```

The Privacy Policy is linked from the Profile screen.

Users can delete their account directly inside the application.

Users without access to the application are given a public deletion-information page and support contact.

Public support email:

```text
support.applymate@gmail.com
```

---

# Production Verification

The deployed architecture has passed:

* Public API status verification
* Actuator health verification
* Registration
* Login
* Access-token authentication
* Refresh-token issuance
* Refresh-token rotation
* Silent session refresh
* Current-user profile retrieval
* Application CRUD
* Dashboard summaries
* Search/filtering
* Reminder persistence
* Local reminder scheduling
* User-data isolation
* Session restoration
* Logout
* Account deletion
* Deleted-account login rejection
* Privacy Policy navigation
* Standalone Android preview-build testing

Verified production path:

```text
Android / Expo client
        |
        v
Render Spring Boot API
        |
        v
Neon PostgreSQL
```

---

# Operational Characteristics

The current deployment uses portfolio-tier cloud infrastructure.

Render can experience cold-start delays after inactivity.

During cold start, the mobile application may temporarily be unable to reach the backend until the service becomes ready.

This affects response time but does not change data integrity or application architecture.

The production API has been verified after startup using:

```text
/api/v1/status
/actuator/health
```

Both return HTTP 200 when the backend is ready.

---

# Architecture Boundaries

The following boundaries remain in place:

* Server-managed application data uses Spring Boot.
* PostgreSQL remains the backend system of record.
* Mobile clients never connect directly to PostgreSQL.
* Reminder records are backend-synchronised.
* Notification scheduling remains device-side.
* Device preferences remain local.
* Production secrets remain outside Git.
* Access tokens remain short-lived.
* Refresh sessions remain revocable and persistent.
* New database changes must use Flyway.
* Public privacy/deletion pages remain separate from authenticated API functionality.
* Standalone iOS distribution remains deferred until Apple Developer Program enrolment.
