<p align="center">
  <img src="assets/icon.png" alt="ApplyMate logo" width="120" />
</p>

<h1 align="center">ApplyMate</h1>

<p align="center">
  <strong>Apply smarter. Get hired faster.</strong>
</p>

<p align="center">
  A full-stack mobile application for tracking job applications, monitoring progress and managing the job-search process.
</p>

---

## About ApplyMate

ApplyMate is a React Native job-application tracker backed by a Spring Boot REST API and PostgreSQL database.

Users can create an account, sign in securely, manage their job applications and view dashboard statistics. Application records are stored in PostgreSQL and isolated by authenticated user.

The completed MVP includes the mobile frontend, backend API, persistent database, JWT authentication, application management, search, filtering, sorting, validation and automated backend testing.

The production MVP is deployed and has passed automated backend and mobile end-to-end smoke testing.

The project is currently entering the **Mobile Distribution & Release Readiness** phase.

## Live Production Deployment

ApplyMate currently uses:

```text
Expo mobile application
    -> Render Spring Boot Docker API
    -> Neon PostgreSQL

```

## Features

### Authentication

* User registration
* Secure password hashing
* User login
* JWT bearer-token authentication
* Authenticated session restoration
* Protected application navigation
* Current-user profile
* Invalid and expired token handling

### Job applications

* Create an application
* List applications
* View application details
* Edit an application
* Delete an application
* Search by company, role and related fields
* Filter by application status
* Sort application records
* Per-user ownership protection

### Dashboard

* Total application count
* Status-specific application counts
* Backend-powered summary data
* Loading and error states
* Pull-to-refresh

### Device features

* Local reminders
* Local notifications
* Face ID preference
* Notification preferences

Device features currently remain local and are not synchronised with the backend.

## Technology Stack

### Mobile frontend

* React Native
* Expo SDK 54
* TypeScript
* React Navigation
* Expo SecureStore
* AsyncStorage
* Expo Notifications

### Backend

* Java 21
* Spring Boot 4.1
* Spring Security
* OAuth2 Resource Server
* Spring Data JPA
* Bean Validation
* Spring Boot Actuator
* Maven

### Database and infrastructure

- PostgreSQL 17
- Flyway
- Hibernate
- HikariCP
- Docker Compose
- Production Docker image
- Render
- Neon
- GitHub Actions
- Testcontainers

### Testing

* JUnit
* MockMvc
* Mockito
* Testcontainers
* PowerShell end-to-end smoke testing

## Architecture

```text
React Native mobile application
              |
              | HTTPS and JSON
              | Authorization: Bearer <JWT>
              v
       Spring Boot REST API
              |
              | Spring Data JPA
              v
          PostgreSQL
```

The mobile client communicates only with the Spring Boot API. It never accesses PostgreSQL directly.

The backend authenticates JWT access tokens, validates requests, enforces per-user data ownership and persists application records through Spring Data JPA.

Flyway controls database schema changes.

## Architecture

### Production

```text
React Native / Expo application
              |
              | HTTPS and JSON
              | Authorization: Bearer <JWT>
              v
Render Spring Boot Docker API
              |
              | JDBC over TLS
              v
Neon PostgreSQL 17

```

## Repository Structure

```text
ApplyMate/
├── assets/                  # Application icons and static assets
├── backend/                 # Spring Boot backend
│   ├── scripts/             # Backend smoke-test scripts
│   ├── src/main/            # Production Java code and resources
│   ├── src/test/            # Backend tests
│   ├── compose.yaml         # Local PostgreSQL service
│   ├── pom.xml              # Maven configuration
│   └── README.md            # Backend-specific documentation
├── docs/                    # Project documentation
├── hooks/                   # React Native hooks
├── src/
│   ├── components/          # Reusable interface components
│   ├── config/              # Environment-based configuration
│   ├── context/             # Shared application state
│   ├── navigation/          # Public and protected navigation
│   ├── screens/             # Application screens
│   ├── services/            # API, authentication and storage services
│   ├── theme/               # Shared visual theme
│   └── types/               # TypeScript models and navigation types
├── App.tsx                  # React Native application root
├── app.json                 # Expo application configuration
├── package.json             # Frontend dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Prerequisites

Install the following before running ApplyMate locally:

* Git
* Node.js and npm
* Java 21
* Docker Desktop
* Expo Go or a supported mobile emulator

Docker must be running before starting PostgreSQL or executing backend integration tests.

## Local Development Setup

### 1. Clone the repository

```powershell
git clone https://github.com/shehzadm-muhammad/ApplyMate.git
cd ApplyMate
```

### 2. Install frontend dependencies

```powershell
npm ci
```

### 3. Create the frontend environment file

```powershell
Copy-Item .env.example .env.local
```

The default value is:

```text
EXPO_PUBLIC_API_URL=http://localhost:8080
```

Use `localhost` when running the Expo web app on the same computer as the backend.

When testing on a physical phone, replace `localhost` with the development computer's local network IP address:

```text
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

The phone and development computer must be able to communicate over the same network.

### 4. Create the backend environment file

```powershell
cd backend
Copy-Item .env.example .env
```

The local file contains:

```text
POSTGRES_DB=applymate
POSTGRES_USER=applymate
POSTGRES_PASSWORD=replace_with_local_password
POSTGRES_PORT=5432
JWT_SECRET=replace_with_base64_encoded_32_byte_secret
APP_CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:[*],http://127.0.0.1:[*]
```

Replace the example PostgreSQL password and JWT secret before starting the backend.

### 5. Generate a local JWT secret

Run this PowerShell command:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copy the generated value into `backend/.env`:

```text
JWT_SECRET=<generated-value>
```

Never commit `backend/.env`.

### 6. Start PostgreSQL

From the `backend` directory:

```powershell
docker compose up -d
docker compose ps
```

The PostgreSQL container should report a healthy status.

### 7. Start the backend

From the `backend` directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs locally at:

```text
http://localhost:8080
```

Verify it with:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/status
Invoke-RestMethod http://localhost:8080/actuator/health
```

### 8. Start the frontend

Open another PowerShell terminal in the repository root:

```powershell
npm start
```

Other available commands are:

```powershell
npm run web
npm run android
npm run ios
```

The `ios` command requires a supported macOS development environment. An iPhone can also connect through Expo Go during development.

## Environment Files

| File                   | Purpose                          | Committed |
| ---------------------- | -------------------------------- | --------: |
| `.env.example`         | Frontend environment template    |       Yes |
| `.env.local`           | Local frontend API configuration |        No |
| `backend/.env.example` | Backend environment template     |       Yes |
| `backend/.env`         | Local database and JWT secrets   |        No |

Secrets, passwords, private keys and production credentials must never be committed.

## Main API Routes

All primary API routes use the `/api/v1` prefix.

### Public routes

```text
GET  /api/v1/status
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /actuator/health
```

### Protected routes

```text
GET    /api/v1/users/me
GET    /api/v1/applications
POST   /api/v1/applications
GET    /api/v1/applications/{id}
PUT    /api/v1/applications/{id}
DELETE /api/v1/applications/{id}
GET    /api/v1/applications/summary
```

Protected requests require:

```http
Authorization: Bearer <access-token>
```

See the complete [API Reference](docs/03_API_REFERENCE.md).

## Application Statuses

The backend supports:

```text
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED
```

The frontend service layer maps these values to user-facing labels.

## Testing

### Frontend TypeScript check

From the repository root:

npm run typecheck

### Frontend production export

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8080"
npm run build:web
Remove-Item Env:EXPO_PUBLIC_API_URL

```

### Backend tests

From the `backend` directory:

```powershell
.\mvnw.cmd test
```

Docker must be available for tests that use Testcontainers.

### Backend package verification

.\mvnw.cmd clean verify

### End-to-end backend smoke test

Start PostgreSQL and the local backend first, then run from `backend/`:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\scripts\smoke-test.ps1

```

## Continuous Integration

GitHub Actions runs three validation jobs on pushes and pull requests.

### Frontend checks

- Installs dependencies with `npm ci`
- Runs TypeScript validation
- Produces an Expo web export

### Backend checks

- Configures Java 21
- Starts PostgreSQL
- Runs Maven verification
- Executes JUnit, MockMvc and Testcontainers tests
- Packages the Spring Boot application

### Docker checks

- Builds the production backend image
- Confirms the image runs as the non-root `applymate` user
- Confirms the image contains a health check

CI uses temporary test configuration and never receives production credentials.

## Database Management

The local PostgreSQL service is defined in:

```text
backend/compose.yaml
```

Start the database:

```powershell
docker compose up -d
```

Stop the database without deleting its data:

```powershell
docker compose down
```

Stop the database and delete the local database volume:

```powershell
docker compose down -v
```

The final command permanently removes locally stored ApplyMate database data.

Database schema changes are managed through Flyway migrations under:

```text
backend/src/main/resources/db/migration/
```

Existing migrations that have already been applied must not be edited. New schema changes should use a new migration file.

## Production Deployment

### Backend

- Provider: Render
- Runtime: Docker
- Region: Frankfurt
- Health check: `/actuator/health`
- Production profile: `prod`

### Database

- Provider: Neon
- PostgreSQL version: 17
- Database: `applymate`
- Branch: `production`
- SSL required

Production configuration is supplied through platform-managed environment variables:

```text
SPRING_PROFILES_ACTIVE
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
APP_CORS_ALLOWED_ORIGIN_PATTERNS
PORT

```

## Security Notes

* Passwords are stored as secure hashes, not plaintext.
* Protected requests require signed JWT access tokens.
* Native access tokens are stored with Expo SecureStore.
* Web access tokens are stored in browser local storage.
* Application queries are scoped to the authenticated user.
* Database credentials and JWT secrets are loaded from environment variables.
* Production traffic must use HTTPS.
* Production secrets must be stored by the deployment platform rather than Git.

## Documentation

| Document                                      | Description                                             |
| --------------------------------------------- | ------------------------------------------------------- |
| [Project Context](docs/01_PROJECT_CONTEXT.md) | Current project state, decisions and constraints        |
| [Architecture](docs/02_ARCHITECTURE.md)       | Frontend, backend, security and deployment architecture |
| [API Reference](docs/03_API_REFERENCE.md)     | API routes, bodies, validation and errors               |
| [Development Log](docs/04_DEVELOPMENT_LOG.md) | Chronological implementation history                    |
| [Roadmap](docs/05_ROADMAP.md)                 | Completed phases and future work                        |
| [Backend README](backend/README.md)           | Backend-specific overview                               |

## Current Project Phase

The following phases are complete:

- Frontend MVP
- Backend MVP
- Frontend and backend integration
- MVP polish
- Continuous integration
- Production backend configuration
- Backend containerisation
- Neon PostgreSQL deployment
- Render backend deployment
- Automated production smoke testing
- Mobile production integration testing

The next phase is **Mobile Distribution & Release Readiness**, including EAS configuration, internal Android and iOS builds, physical-device testing, privacy documentation and store preparation.

New product features remain deferred until release builds are stable.

## Licence

ApplyMate is licensed under the MIT License. See [LICENSE](LICENSE).

## Author

**Muhammad Shahzaib Shehzad**

GitHub: [shehzadm-muhammad](https://github.com/shehzadm-muhammad)
