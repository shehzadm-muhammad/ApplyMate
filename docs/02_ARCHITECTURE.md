# ApplyMate Architecture

## Overview

ApplyMate is a full-stack mobile application consisting of:

- A React Native and Expo mobile client
- A Spring Boot REST API
- JWT access-token authentication
- Persistent rotating refresh-token sessions
- Email verification during registration
- Resend transactional email delivery
- A PostgreSQL relational database
- Flyway database migrations
- Backend-synchronised reminders
- Local device notification scheduling
- A Docker-based production backend
- GitHub Actions continuous integration
- Expo Application Services for mobile builds
- GitHub Pages for public privacy and account-deletion information

The application uses one mobile client, one backend service and one PostgreSQL database.

Transactional verification email is sent from the backend through Resend.

---

# Production Architecture

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚        React Native / Expo Client        â”‚
â”‚                                          â”‚
â”‚  TypeScript                              â”‚
â”‚  React Navigation                        â”‚
â”‚  Expo SecureStore                        â”‚
â”‚  AsyncStorage                            â”‚
â”‚  Expo Notifications                      â”‚
â”‚                                          â”‚
â”‚  Auth state                              â”‚
â”‚  Pending verification state              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
                   â”‚ HTTPS + JSON
                   â”‚ JWT access token
                   â”‚ Refresh-token session
                   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Render                  â”‚
â”‚                                          â”‚
â”‚  Spring Boot Docker Service              â”‚
â”‚  Java 21                                 â”‚
â”‚  Spring Security                         â”‚
â”‚  Validation                              â”‚
â”‚  JPA / Hibernate                         â”‚
â”‚  Flyway                                  â”‚
â”‚  Spring RestClient                       â”‚
â”‚  Actuator Health Check                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚                 â”‚
                â”‚ JDBC over TLS   â”‚ HTTPS
                â”‚                 â”‚
                â–¼                 â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚          Neon          â”‚   â”‚         Resend         â”‚
â”‚                        â”‚   â”‚                        â”‚
â”‚ PostgreSQL 17          â”‚   â”‚ Transactional email    â”‚
â”‚ app_users              â”‚   â”‚                        â”‚
â”‚ job_applications       â”‚   â”‚ Verified domain:       â”‚
â”‚ reminders              â”‚   â”‚ applymate.website      â”‚
â”‚ refresh_tokens         â”‚   â”‚                        â”‚
â”‚ email_verification_    â”‚   â”‚ Sender:                â”‚
â”‚ codes                  â”‚   â”‚ verify@applymate.websiteâ”‚
â”‚ flyway_schema_history  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
                                         â”‚ Email
                                         â–¼
                                  User's email inbox
````

The mobile application communicates only with the Spring Boot API.

It never connects directly to PostgreSQL or Resend.

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

Current production release commit before documentation closeout:

```text
beca795
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

The production schema is currently at migration version:

```text
8
```

V8 removed the temporary rollout default introduced during the email-verification deployment.

Current `email_verified_at` schema behaviour:

```text
column_default = NULL
is_nullable    = YES
```

## Transactional Email

Provider:

```text
Resend
```

Verified sending domain:

```text
applymate.website
```

Verification sender:

```text
ApplyMate <verify@applymate.website>
```

The domain uses configured DKIM, SPF and DMARC DNS records.

The mobile application never receives the Resend API key.

Resend credentials remain backend-only production secrets.

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
* The mobile client never accesses Resend directly.
* Server-backed user data passes through the Spring Boot REST API.
* Access tokens are short-lived.
* Refresh-token sessions are persisted and revocable.
* Refresh tokens rotate after successful use.
* Only hashed refresh-token values are stored in PostgreSQL.
* Raw email-verification codes are never stored.
* Verification codes are protected using HMAC-SHA-256 with a server-side pepper.
* Unverified users cannot obtain authenticated application access.
* Every application and reminder is scoped to its authenticated owner.
* Database structure is managed through Flyway migrations.
* Applied migrations must never be edited.
* Environment-specific configuration is supplied through environment variables.
* Secrets remain outside Git and frontend bundles.
* Local notification scheduling remains separate from backend reminder persistence.
* Frontend screens do not depend directly on database implementation details.
* API and storage responsibilities are isolated in frontend services.
* Email-provider responsibilities are isolated behind a backend sender interface.
* Production infrastructure can be replaced without redesigning the mobile client.

---

# Frontend Architecture

The frontend source is located under:

```text
src/
â”œâ”€â”€ components/
â”œâ”€â”€ config/
â”œâ”€â”€ context/
â”œâ”€â”€ navigation/
â”œâ”€â”€ screens/
â”œâ”€â”€ services/
â”œâ”€â”€ theme/
â””â”€â”€ types/
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
* Handling verification-code entry
* Displaying verification resend timing

Screens do not contain backend persistence logic.

## Components

The `components/` directory contains reusable user-interface elements.

Examples include:

* Form fields
* Buttons
* Settings rows
* Shared presentation controls

Components remain focused on presentation and reusable interaction behaviour.

---

# Navigation Architecture

The `navigation/` directory defines public, verification and authenticated navigation flows.

Current high-level flow:

```text
Unauthenticated
    |
    â”œâ”€â”€ Welcome
    â”œâ”€â”€ Register
    â”œâ”€â”€ Login
    â””â”€â”€ Verify Email

Authenticated
    |
    â””â”€â”€ Main application
         â”œâ”€â”€ Dashboard
         â”œâ”€â”€ Applications
         â”œâ”€â”€ Reminders
         â””â”€â”€ Profile
```

Navigation does not authenticate users itself.

It reacts to state supplied by `AuthContext`.

## Pending Verification Navigation

A user who has registered but has not yet verified their email is represented separately from an authenticated user.

```text
Register
   |
   v
Backend creates unverified user
   |
   v
Pending verification stored locally
   |
   v
Verify Email screen
```

If the application is closed and reopened while verification is pending:

```text
App starts
   |
   v
AuthContext bootstrap
   |
   â”œâ”€â”€ valid authenticated user
   â”‚       -> Main application
   â”‚
   â”œâ”€â”€ pending verification
   â”‚       -> Verify Email
   â”‚
   â””â”€â”€ neither
           -> normal public flow
```

A login attempt for an unverified account also redirects to the Verify Email flow.

---

# Authentication Context

`AuthContext` coordinates:

* Login
* Logout
* Session restoration
* Current-user loading
* Expired-session handling
* Silent access-token refresh
* Pending email-verification state
* Verification-flow restoration
* Clearing verification state after completion
* Account deletion
* Public/authenticated navigation state

If a valid refresh session exists, an expired access token does not automatically log the user out.

If refresh authentication fails because the session is no longer valid, the authentication context clears the current user and returns the app to the unauthenticated flow.

If login fails specifically because verification is required, the account is not treated as authenticated.

Instead:

```text
EMAIL_VERIFICATION_REQUIRED
        |
        v
Store pending verification email
        |
        v
Verify Email screen
```

---

# Frontend Configuration

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

A physical development device may instead use the development computer's LAN address.

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
pendingVerificationStorage.ts
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
* Preserving structured backend error codes
* Detecting authenticated `401` responses
* Refreshing expired access tokens
* Retrying the original request once
* Coordinating simultaneous refresh attempts
* Clearing invalid sessions when refresh authentication fails
* Preserving sessions during temporary network/server failures where appropriate
* Converting network failures into readable frontend errors

## Authentication Service

`authService.ts` handles authentication-specific API requests including:

```text
register
login
verifyEmail
resendVerificationEmail
refresh
logout
```

Registration does not automatically authenticate the new account.

Verification proves control of the email address but still returns the user to the password-based login flow.

## Pending Verification Storage

`pendingVerificationStorage.ts` stores only the minimum state required to restore an unfinished verification flow.

Stored values include:

```text
email
verificationExpiresAt
resendAvailableAt
```

It does not store:

```text
password
verification code
access token
refresh token
Resend credentials
```

Native platforms use secure device storage for this state.

Corrupt or invalid stored verification state is discarded defensively.

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

AsyncStorage remains available for non-secret device-specific state.

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
        â”œâ”€â”€> Spring Boot API
        â”‚       |
        â”‚       v
        â”‚   PostgreSQL reminder
        â”‚
        â””â”€â”€> Expo Notifications
                |
                v
        Device notification schedule
```

Stored device notification identifiers are associated with the authenticated user.

This allows local notification cleanup during reminder changes and account deletion.

---

# Account Deletion Service

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
Clear pending verification state
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
â”œâ”€â”€ application/
â”œâ”€â”€ auth/
â”œâ”€â”€ reminder/
â”œâ”€â”€ security/
â”œâ”€â”€ user/
â”œâ”€â”€ common/error/
â”œâ”€â”€ system/
â””â”€â”€ ApplyMateBackendApplication.java
```

Although classes are grouped by feature, the backend maintains controller, service, repository and persistence responsibilities.

---

# Controller Layer

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

---

# DTO and Validation Layer

Request and response DTOs define the public API contract.

Validation covers fields such as:

* Required values
* Maximum lengths
* Email formatting
* Six-digit verification-code formatting
* Application statuses
* Dates
* URLs
* Reminder values
* Authentication request data

Persistence entities are not exposed directly as the API contract.

---

# Service Layer

Services implement application business rules.

Responsibilities include:

* Resolving authenticated users
* Creating/updating/deleting entities
* Enforcing ownership
* Search/filter logic
* Dashboard calculations
* Authentication
* Email-verification challenge lifecycle
* Verification-code validation
* Verification resend limits
* Transactional email orchestration
* Refresh-token lifecycle management
* Account deletion
* Response mapping
* Domain-specific exceptions

---

# Repository Layer

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

Email-verification challenge access is associated with the owning user account.

Challenge updates use locking where required to prevent concurrent issue/verification races.

---

# Persisted Domain Data

PostgreSQL stores:

* Application users
* Password hashes
* Email verification timestamp
* Email-verification code hashes
* Verification expiry and rate-limit state
* Job applications
* Reminders
* Refresh-token session records
* Ownership relationships
* Creation/update timestamps

The following sensitive values are not stored in usable plaintext form:

```text
password
raw refresh token
raw email-verification code
email-verification pepper
Resend API key
JWT signing secret
```

---

# Email Verification Architecture

## Registration Flow

```text
1. User submits registration details.
2. Backend normalises the email.
3. Backend checks for an existing account.
4. Password is securely hashed.
5. New app_users row is created with:
       email_verified_at = NULL
6. Backend creates an email-verification challenge.
7. Raw six-digit code exists only transiently.
8. HMAC-SHA-256 hash of the code is stored.
9. User/challenge transaction commits.
10. Backend asks the configured email provider to send the code.
11. Mobile stores pending verification state.
12. Verify Email screen is displayed.
```

The registration database transaction completes before external email delivery.

This prevents a temporary email-provider outage from silently rolling back an otherwise valid account.

If initial email delivery fails, the unverified account can recover through the resend flow.

## Verification-Code Security

Verification codes use:

```text
SecureRandom
6 numeric digits
```

Code hashing uses:

```text
HMAC-SHA-256
```

The HMAC input includes the user identity and code.

Conceptually:

```text
HMAC(
    server-side pepper,
    userId + ":" + verificationCode
)
```

The production pepper:

* Is separate from the JWT signing secret
* Is stored only in backend environment configuration
* Must be at least 32 decoded bytes
* Is never sent to the frontend
* Is never stored in PostgreSQL

Hash comparison uses secure byte comparison rather than ordinary string equality.

## Verification Timing and Limits

Default rules:

```text
Code TTL:                 10 minutes
Maximum failed attempts:  5
Resend cooldown:          60 seconds
Issue window:             1 hour
Maximum issues/window:    5
```

Resending replaces the current challenge.

The backend ensures a replacement code does not reuse the previous stored hash.

The previous code therefore becomes invalid after resend.

## Verification Flow

```text
Verify Email screen
        |
        v
POST /api/v1/auth/verify-email
        |
        v
Lock verification state
        |
        â”œâ”€â”€ expired
        â”‚      -> VERIFICATION_CODE_EXPIRED
        â”‚
        â”œâ”€â”€ too many attempts
        â”‚      -> VERIFICATION_ATTEMPTS_EXCEEDED
        â”‚
        â”œâ”€â”€ incorrect
        â”‚      -> increment attempts
        â”‚      -> VERIFICATION_CODE_INCORRECT
        â”‚
        â””â”€â”€ correct
               |
               v
       app_users.email_verified_at = timestamp
               |
               v
       verification completed
               |
               v
       Mobile clears pending state
               |
               v
       Login screen
```

Verification does not bypass the user's password.

The user still performs normal login after verification.

## Resend Flow

```text
POST /api/v1/auth/resend-verification
        |
        v
Find unverified account/challenge
        |
        â”œâ”€â”€ cooldown active
        â”‚      -> VERIFICATION_RESEND_COOLDOWN
        â”‚
        â”œâ”€â”€ issue limit reached
        â”‚      -> VERIFICATION_RATE_LIMITED
        â”‚
        â””â”€â”€ allowed
               |
               v
       Generate replacement code
               |
               v
       Replace stored hash/timestamps
               |
               v
       Send email through Resend
```

Responses for unknown/already-verified email addresses remain generic to reduce account enumeration.

---

# Verification Email Provider Architecture

Email sending is abstracted behind:

```text
VerificationEmailSender
```

Current implementations include:

```text
ResendVerificationEmailSender
UnavailableVerificationEmailSender
```

Provider selection is environment-driven.

Production:

```text
EMAIL_PROVIDER=resend
```

A disabled/unavailable provider can be used in environments where real email sending is not configured.

## Resend Request Path

```text
EmailVerificationService / AuthService
        |
        v
VerificationEmailSender
        |
        v
ResendVerificationEmailSender
        |
        v
HTTPS POST
https://api.resend.com/emails
```

Requests contain:

* Verified `from` address
* Recipient email
* Verification email subject
* Text body
* HTML body
* Idempotency key

The idempotency key is generated from user and issuance information and does not contain the verification code.

## Resend Secret Safety

The production Resend integration includes defensive configuration handling.

The API key:

* Is loaded only by the backend
* Has outer whitespace removed
* Is rejected if embedded whitespace/control characters remain
* Is never intentionally logged
* Is not propagated inside safe delivery exceptions
* Is not exposed to the mobile application

A production deployment test identified that malformed header configuration could otherwise cause the underlying Java HTTP client to include the Authorization header value in an exception message.

The affected credential was revoked and replaced.

The sender was subsequently hardened and regression-tested.

---

# Security Architecture

## Public Routes

Routes that must work without an active access token include:

```text
GET  /api/v1/status

POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET  /actuator/health
```

`refresh` must remain accessible after an access token expires.

`logout` revokes a refresh-token session and therefore does not depend on a still-valid access token.

Verification endpoints are public because the user is deliberately not authenticated yet.

Their behaviour is protected by verification-specific limits and generic responses where appropriate.

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

---

# Login Flow

```text
1. User submits email and password.
2. Backend authenticates the password.
3. Backend loads the account.
4. Backend checks email verification.
5. If unverified:
       -> no tokens issued
       -> EMAIL_VERIFICATION_REQUIRED
6. If verified:
       -> JWT access token generated
       -> opaque refresh token generated
7. Backend stores only the refresh-token hash.
8. Mobile stores both tokens securely.
9. Protected requests use the access token.
```

The password check occurs before returning the verification-required state.

This prevents incorrect passwords from being used to probe whether an account is awaiting verification.

---

# Access Token Lifetime

Production access-token lifetime:

```text
1 hour
```

The access token is intentionally shorter-lived than the persistent session.

---

# Refresh Session Lifetime

Production refresh-session lifetime:

```text
30 days
```

A successful refresh creates a new token pair.

---

# Refresh Token Rotation

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

---

# Refresh Token Families

Refresh tokens belong to a session family.

```text
Session family
â”œâ”€â”€ Refresh A
â”œâ”€â”€ Refresh B
â””â”€â”€ Refresh C
```

Reuse of a revoked token can indicate token duplication.

The service can revoke the active family when suspicious reuse is detected.

---

# Refresh Token Persistence

The backend stores:

* Token record ID
* User ID
* Family ID
* SHA-256 token hash
* Expiry time
* Revocation time
* Creation time

The usable refresh token itself is not stored in PostgreSQL.

---

# Unverified Refresh Protection

Email verification is enforced beyond the login endpoint.

If a refresh token belongs to a user whose account is unverified:

```text
refresh request
     |
     v
user verification check fails
     |
     v
refresh session revoked
     |
     v
EMAIL_VERIFICATION_REQUIRED
```

This prevents an old or synthetic refresh session from bypassing the verification requirement.

---

# Concurrency Protection

Refresh-token rotation uses both client-side and backend safeguards.

Frontend:

```text
shared refresh promise
```

Backend:

```text
pessimistic write lock while rotating the token
```

Email-verification state also uses locking where required to coordinate challenge issuance and verification.

---

# Logout

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

---

# Account Deletion Security

Account deletion endpoint:

```text
DELETE /api/v1/users/me
```

The user identifier is obtained from the authenticated JWT.

Clients cannot supply a different user ID to delete another account.

Database relationships remove user-owned backend data when the account is deleted.

Email-verification challenge records reference the user with cascade deletion.

---

# JWT Configuration

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

---

# CORS

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
email_verification_codes
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

---

# Database Relationships

User-owned entities reference `app_users`.

Account deletion removes associated user data through database ownership/cascade relationships where configured.

This includes:

* Job applications
* Reminders
* Refresh-token sessions
* Email-verification challenge data

---

# Database Migrations

Migration files are stored under:

```text
backend/src/main/resources/db/migration/
```

Current production migration history:

```text
V1 - create app users table
V2 - create job applications table
V3 - create reminders table
V4 - create refresh tokens table
V5 - alter refresh token hash type
V6 - add email verification
V7 - preserve legacy registration during email verification rollout
V8 - remove email verification rollout default
```

## V6

V6 introduced:

* `app_users.email_verified_at`
* Backfill of pre-existing users as verified
* `email_verification_codes`
* Verification challenge timing/attempt state

Backfilling existing users prevented the new verification requirement from locking out users who already had valid accounts before the feature existed.

## V7

V7 introduced a temporary:

```text
DEFAULT CURRENT_TIMESTAMP
```

for `app_users.email_verified_at`.

This protected registrations handled by an older application instance during the zero-downtime Render deployment window after V6 had already changed the schema.

The new backend explicitly persisted `NULL` for new registrations, so email verification remained required on the new application version.

## V8

After the old deployment was fully replaced and production verification succeeded, V8 removed the temporary default:

```sql
ALTER TABLE app_users
ALTER COLUMN email_verified_at
DROP DEFAULT;
```

Post-rollout state:

```text
Existing verified account   -> remains verified
Existing unverified account -> remains unverified
New registration            -> starts unverified
Direct insert omitting field -> remains unverified
```

## Migration Rules

Flyway migrations:

* Run in version order
* Are recorded in `flyway_schema_history`
* Must not be edited after being applied to shared environments
* Must be extended with new migration files
* Are validated before migration
* Are tested through integration tests before production deployment

---

# Database Portability

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
â”œâ”€â”€ Expo / Metro on port 8081
â”œâ”€â”€ Android emulator / Expo Go / physical device
â”œâ”€â”€ Spring Boot on port 8080
â””â”€â”€ Docker
    â””â”€â”€ PostgreSQL 17 on port 5432
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

Physical devices can use the development computer's LAN address.

Production mobile builds do not use these local ports.

---

# Production Container Architecture

The backend Dockerfile uses a multi-stage build.

```text
Build stage
â”œâ”€â”€ Maven
â”œâ”€â”€ Java 21 JDK
â”œâ”€â”€ pom.xml
â””â”€â”€ backend source
        |
        | Maven package
        v
Executable Spring Boot JAR
        |
        v
Runtime stage
â”œâ”€â”€ Java 21 runtime
â”œâ”€â”€ curl
â”œâ”€â”€ non-root applymate user
â””â”€â”€ app.jar
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
PostgreSQL CI service / Testcontainers
        |
Java 21
        |
Maven test/package
        |
JUnit / MockMvc / Mockito / integration tests
```

Current backend suite:

```text
89 tests
0 failures
0 errors
0 skipped
```

The email-verification suite includes coverage for:

* HMAC verification-code security
* Verification expiry
* Failed-attempt limits
* Resend cooldown
* Hourly issuance limits
* Replacement-code invalidation
* Verification transaction behaviour
* Registration email-provider failure recovery
* Unverified login
* Unverified refresh protection
* Resend provider behaviour
* Provider secret-safety regression behaviour
* Flyway migration compatibility
* Post-rollout V8 schema behaviour

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
* Email-verification pepper
* Local Resend test credentials
* Temporary test token lifetimes

Local secrets must never be committed.

## EAS Environments

EAS has separate build environments for:

* Preview
* Production

The public production API configuration is:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
```

No JWT, Resend, verification-pepper or database secrets are placed in frontend environment variables.

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

EMAIL_PROVIDER
EMAIL_FROM
RESEND_API_KEY
EMAIL_VERIFICATION_PEPPER
```

Current production email configuration includes:

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=ApplyMate <verify@applymate.website>
```

The actual Resend API key and verification pepper are secrets and must never appear in source control or documentation.

Neon stores the production PostgreSQL data.

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
       â”œâ”€â”€> delete job applications
       â”œâ”€â”€> delete reminders
       â”œâ”€â”€> delete refresh-token sessions
       â””â”€â”€> delete verification challenge
       |
       v
Mobile local cleanup
       |
       â”œâ”€â”€> cancel scheduled notifications
       â”œâ”€â”€> remove stored notification IDs
       â”œâ”€â”€> remove local account settings
       â”œâ”€â”€> clear pending verification state
       â””â”€â”€> remove authentication tokens
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
â”œâ”€â”€ index.html
â”œâ”€â”€ privacy-policy.html
â””â”€â”€ delete-account.html
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
* Email verification
* Real verification-email delivery
* Verification resend
* Old-code invalidation after resend
* Verification persistence across app restart
* Unverified-login rejection
* Login after verification
* Existing-user compatibility
* Access-token authentication
* Refresh-token issuance
* Refresh-token rotation
* Unverified-refresh protection
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
* Resend secret-handling hotfix verification
* Flyway V6/V7 production rollout
* Flyway V8 post-rollout cleanup
* Final V8 production health verification

Verified production path:

```text
React Native / Expo client
        |
        v
Render Spring Boot API
        |
        â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€> Resend
        â”‚                  |
        â”‚                  v
        â”‚             User inbox
        â”‚
        v
Neon PostgreSQL
```

Final production schema:

```text
Flyway V8
```

Final production health:

```text
/api/v1/status   -> UP
/actuator/health -> UP
```

---

# Email Verification Production Rollout Architecture

The email-verification feature was deployed using a controlled staged rollout.

```text
V5 production
    |
    v
Deploy application containing V6 + V7
    |
    â”œâ”€â”€ V6 adds verification schema
    â”‚
    â””â”€â”€ V7 protects old-instance registrations
            during zero-downtime overlap
    |
    v
Verify existing accounts remain usable
    |
    v
Verify new registrations require verification
    |
    v
Verify Resend delivery
    |
    v
Deploy secret-handling hotfix
    |
    v
Old application instances fully gone
    |
    v
Deploy V8
    |
    v
Remove temporary rollout default
```

This avoided forcing pre-existing accounts through a verification process they could not have completed when those accounts were originally created.

---

# Operational Characteristics

The current deployment uses portfolio-tier cloud infrastructure.

Render can experience cold-start delays after inactivity.

During cold start, the mobile application may temporarily be unable to reach the backend until the service becomes ready.

This affects response time but does not change data integrity or application architecture.

The production API is checked using:

```text
/api/v1/status
/actuator/health
```

Both return HTTP 200 and `UP` when the backend is ready.

---

# Architecture Boundaries

The following boundaries remain in place:

* Server-managed application data uses Spring Boot.
* PostgreSQL remains the backend system of record.
* Mobile clients never connect directly to PostgreSQL.
* Mobile clients never receive Resend credentials.
* Verification email delivery remains backend-controlled.
* Raw verification codes are not persisted.
* Email-verification secrets remain backend-only.
* Reminder records are backend-synchronised.
* Notification scheduling remains device-side.
* Device preferences remain local.
* Production secrets remain outside Git.
* Access tokens remain short-lived.
* Refresh sessions remain revocable and persistent.
* Unverified accounts cannot gain authenticated access.
* New database changes must use Flyway.
* Applied Flyway migrations must not be modified.
* Public privacy/deletion pages remain separate from authenticated API functionality.
* Standalone iOS distribution remains deferred until Apple Developer Program enrolment.
