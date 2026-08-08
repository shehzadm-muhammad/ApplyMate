# ApplyMate Project Context

## Product

ApplyMate is a full-stack mobile job-application tracker.

It allows authenticated users to:

- Create and manage job applications
- Track application progress
- Search, filter and sort applications
- View dashboard statistics
- Create reminders linked to applications
- Receive local reminder notifications
- Maintain a persistent authenticated session
- Permanently delete their account and associated data

## Current Phase

**Mobile Distribution & Release Closeout**

The following phases are complete:

- Frontend MVP
- Backend MVP
- Frontend and backend integration
- MVP polish
- Production deployment
- Production database deployment
- CI and Docker production readiness
- Expo Application Services configuration
- Android internal distribution
- Backend reminder synchronisation
- Persistent-session authentication
- Account deletion
- Privacy-policy and account-deletion webpages
- Production and Android smoke testing

The application is running successfully against the production Spring Boot backend and Neon PostgreSQL database.

## Current Git State

- Stable branch: `main`
- Current release tag: `v1.2.0`
- Next planned release tag: `v1.3.0`
- Current milestone: Mobile Distribution & Release Closeout

The `v1.3.0` tag will be created after documentation is updated and final CI/Docker checks pass.

## Technology Stack

### Mobile frontend

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Expo SecureStore
- AsyncStorage
- Expo Notifications
- EAS Build

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
- Android emulator

### Production infrastructure

- Render Docker web service
- Neon PostgreSQL
- HTTPS public API
- Platform-managed environment variables
- Render health checks
- GitHub Actions CI
- Expo Application Services
- GitHub Pages

## Production Architecture

```text
React Native / Expo application
               |
               | HTTPS + JSON
               | JWT access token
               | Refresh-token session
               v
Render
Spring Boot API
               |
               | Encrypted PostgreSQL connection
               v
Neon PostgreSQL
````

The mobile application communicates only with the Spring Boot API.

It never connects directly to PostgreSQL.

## Production Services

### Backend

Provider: Render

Public API base URL:

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

### Database

Provider: Neon PostgreSQL

Production database:

```text
applymate
```

Current Flyway schema version:

```text
5
```

Current migrations cover:

* User accounts
* Job applications
* Reminders
* Refresh-token sessions
* Refresh-token schema correction

Database credentials are stored only in production environment variables.

## Continuous Integration

GitHub Actions validates the repository on pushes and pull requests.

### Frontend validation

* Install dependencies with `npm ci`
* Run TypeScript validation
* Produce an Expo web export

### Backend validation

* Configure Java 21
* Start PostgreSQL for CI
* Run Maven tests
* Package the Spring Boot application
* Run integration tests

### Docker validation

* Build the production backend image
* Verify the container runs successfully
* Verify production container configuration

## Authentication

ApplyMate uses backend-managed authentication.

Implemented authentication behaviour includes:

* User registration
* Secure password hashing
* Email/password login
* JWT access tokens
* Refresh tokens
* Refresh-token rotation
* Refresh-token family tracking
* Refresh-token revocation
* Hashed refresh-token storage
* Secure token storage on mobile
* Silent access-token renewal
* Persistent session restoration
* Backend logout
* Invalid-session handling
* Protected API routes
* Current-user profile
* Per-user data isolation

### Production session lifetime

```text
Access token: 1 hour
Refresh session: 30 days
```

If an access token expires while the refresh session remains valid, the mobile app automatically obtains a new token and retries the original request.

The user remains signed in without having to enter their credentials again.

## Authentication API

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/users/me
DELETE /api/v1/users/me
```

## Account Deletion

Authenticated users can permanently delete their account from:

```text
Profile -> Delete Account
```

The app uses two confirmation prompts before deletion.

The backend endpoint is:

```text
DELETE /api/v1/users/me
```

The authenticated user's ID is taken from the JWT rather than from a request parameter.

Deleting an account removes:

* The user account
* Job applications
* Reminders
* Refresh-token sessions

The mobile application also clears:

* Stored authentication tokens
* Stored reminder notification identifiers
* Local account-related settings
* Scheduled reminder notifications associated with the deleted account

The production deletion flow has been tested successfully.

Deleted credentials can no longer be used to log in.

## Completed Application Features

* Create job applications
* List applications
* View application details
* Edit applications
* Delete applications
* Search applications
* Filter by status
* Sort applications
* Dashboard summary counts
* Loading states
* Error states
* Pull-to-refresh
* Backend validation
* Consistent API errors
* Per-user application isolation

## Application Statuses

### Frontend

```text
Saved
Applied
Assessment
Interview
Offer
Rejected
```

### Backend

```text
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED
```

The frontend service layer maps between user-facing and backend values.

## Reminders

Reminder data is synchronised with the Spring Boot backend and stored in PostgreSQL.

Each reminder belongs to the authenticated user.

Local notifications remain device-side because Android and iOS schedule and display those notifications locally.

Architecture:

```text
Reminder data
    -> Spring Boot API
    -> PostgreSQL

Notification scheduling
    -> Mobile device
    -> Expo Notifications
```

Reminder data is isolated between user accounts.

## Main API Routes

All primary API routes use the `/api/v1` prefix.

### System

```text
GET /api/v1/status
GET /actuator/health
```

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Users

```text
GET    /api/v1/users/me
DELETE /api/v1/users/me
```

### Applications

```text
GET    /api/v1/applications
POST   /api/v1/applications
GET    /api/v1/applications/{id}
PUT    /api/v1/applications/{id}
DELETE /api/v1/applications/{id}
GET    /api/v1/applications/summary
```

### Reminders

Reminder API operations support authenticated reminder persistence and synchronisation.

Full endpoint details are documented in `03_API_REFERENCE.md`.

## Data Ownership

Every job application and reminder belongs to one authenticated user.

Backend services and repository queries must scope data access to the authenticated user's ID.

A user must never be able to read, update or delete another user's data.

## Mobile Distribution

Expo Application Services is configured for Android and iOS.

### Expo project

```text
@zaib_367/ApplyMate
```

### Permanent application identifiers

Android:

```text
com.zaib367.applymate
```

iOS:

```text
com.zaib367.applymate
```

### Versioning

Marketing version:

```text
1.0.0
```

EAS remote versioning is configured for native build numbers.

### EAS environments

Configured environments:

* Preview
* Production

Production API URL:

```text
https://applymate-api-bami.onrender.com
```

## Android Distribution

Android preview/internal-distribution builds are working successfully through EAS Build.

The final release candidate APK passed smoke testing against the production backend.

Verified behaviour includes:

* App launch
* Login
* Dashboard loading
* Existing data retrieval
* Application creation
* Application editing
* Application deletion
* Reminder creation
* Reminder persistence
* Session restoration after closing and reopening
* Privacy Policy access
* Delete Account UI
* Logout
* Reopening after logout remains logged out

## iOS Distribution

The Expo/EAS project is configured with the permanent iOS bundle identifier:

```text
com.zaib367.applymate
```

Expo Go has been used for development testing.

Standalone iOS/TestFlight/App Store distribution is currently deferred because it requires enrolment in the paid Apple Developer Program.

No paid Apple Developer action was taken during this phase.

## Persistent Session Verification

Persistent authentication was tested locally using a deliberately shortened one-minute access-token lifetime.

After the access token expired:

* The app remained logged in
* The refresh token was used automatically
* A new access token was issued
* The refresh token was rotated
* The original protected request succeeded
* No authentication error was shown

The same authentication flow was then verified against the production Render and Neon environment.

Production verification confirmed:

* Login succeeded
* Access token issued
* Refresh token issued
* Refresh endpoint succeeded
* Refresh token rotation succeeded
* Logout succeeded
* Refresh session revocation succeeded

## Production Verification

### Public endpoints

The following production endpoints have returned HTTP 200 and `UP`:

```text
/api/v1/status
/actuator/health
```

### Production authentication

Verified:

* Registration
* Login
* Access-token issuance
* Refresh-token issuance
* Silent refresh
* Refresh-token rotation
* Logout
* Session revocation

### Production application flow

Verified:

* Registration
* Login
* Dashboard
* Application creation
* Application editing
* Application deletion
* Search
* Filtering
* Reminders
* Session restoration
* Logout
* Second-user data isolation

### Production account deletion

Verified:

* Disposable account registration
* Login
* Application creation
* Reminder creation
* Two-stage deletion confirmation
* Backend account deletion
* User-owned data deletion
* Refresh-session deletion
* Local token cleanup
* Return to Welcome screen
* Deleted credentials rejected on subsequent login

## Privacy and Account Deletion Pages

ApplyMate now has public GitHub Pages documentation.

Site:

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

Privacy Policy:

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

Account deletion:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

Public support/privacy contact:

```text
support.applymate@gmail.com
```

The Privacy Policy is also linked from inside the mobile application.

## Local-Only Features

The following remain device-side:

* Local notification scheduling
* Notification permission state
* Face ID preference
* Device-specific settings

Reminder records themselves are backend-synchronised.

## Environment Strategy

### Local development

* Expo runs on the development computer/emulator/device
* Spring Boot runs locally on port 8080
* PostgreSQL runs through Docker Compose
* Local configuration is stored in ignored environment files
* Android ADB reverse may be used for local emulator testing

### Production

* Spring Boot runs on Render
* PostgreSQL runs on Neon
* Render provides the production service port
* Mobile builds use the Render HTTPS API URL
* Secrets are stored in platform environment variables
* Flyway validates and applies migrations during startup
* Render health is exposed through `/actuator/health`

## Testing

Current automated and manual validation includes:

* TypeScript compiler checks
* Expo Doctor
* Expo web export
* JUnit
* MockMvc
* Mockito
* Testcontainers
* Maven tests
* Docker verification
* GitHub Actions
* PowerShell API smoke testing
* Android emulator testing
* Production mobile smoke testing

Latest backend test result:

```text
Tests run: 40
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Latest Expo Doctor result:

```text
18/18 checks passed
```

## Security Rules

* Never commit `.env` or `.env.local`
* Never commit database credentials
* Never commit JWT signing secrets
* Never commit signing keys or service-account credentials
* Store production secrets in platform environment variables
* Require HTTPS for production traffic
* Keep PostgreSQL inaccessible to the mobile client
* Store mobile authentication tokens securely
* Store only hashed refresh-token values in PostgreSQL
* Rotate refresh tokens after use
* Revoke refresh-token sessions during logout
* Preserve per-user ownership checks
* Run CI before release changes are merged
* Run smoke tests after production deployment changes

## Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

The database can later move to another PostgreSQL provider by changing environment configuration.

Flyway migrations remain the source of truth for recreating the schema.

ApplyMate does not depend on Neon-specific authentication or client libraries.

## Release Status

The functional work for the **Mobile Distribution & Release Readiness** phase is complete.

Remaining release-closeout work:

1. Update shared project documentation
2. Update the root README
3. Run final frontend/backend/Docker/CI checks
4. Commit and push documentation changes
5. Create the `v1.3.0` release tag

## Next Development Phase

Potential next work includes:

* Email verification with OTP during registration
* Password reset
* Job-link import
* Email integration
* Additional automation features
* Google Play public release preparation
* Apple TestFlight/App Store distribution after Apple Developer Program enrolment

New product development should begin after the `v1.3.0` release is formally closed.
