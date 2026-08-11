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
- Verify their email address during registration
- Permanently delete their account and associated data

## Current Phase

**Email Verification & Production Rollout Closeout**

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
- Mobile Distribution & Release Readiness
- Production email verification
- Resend transactional email integration
- Email-verification production migration rollout
- Resend secret-handling hardening
- Post-rollout database cleanup

The application is running successfully against the production Spring Boot backend and Neon PostgreSQL database.

Email verification is now live and verified end-to-end in production.

## Current Git State

- Stable branch: `main`
- Documentation branch: `docs/email-verification-closeout`
- Current production/main commit: `beca795`
- Current release tag: `v1.3.0`
- Next planned release tag: `v1.4.0`
- Current milestone: Email Verification & Production Rollout Closeout

The `v1.4.0` tag will be created after documentation is updated and release closeout checks are complete.

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
- Spring RestClient

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
- Physical-device Expo testing

### Production infrastructure

- Render Docker web service
- Neon PostgreSQL
- Resend transactional email
- `applymate.website` verified sending domain
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
       |                |
       |                | HTTPS
       |                v
       |              Resend
       |                |
       |                v
       |          Verification email
       |          verify@applymate.website
       |
       | Encrypted PostgreSQL connection
       v
Neon PostgreSQL
````

The mobile application communicates only with the Spring Boot API.

It never connects directly to PostgreSQL or Resend.

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

Current production deployment commit:

```text
beca795
```

### Database

Provider: Neon PostgreSQL

Production database:

```text
applymate
```

Current Flyway schema version:

```text
8
```

Current migrations cover:

* User accounts
* Job applications
* Reminders
* Refresh-token sessions
* Refresh-token schema correction
* Email verification
* Zero-downtime email-verification rollout compatibility
* Post-rollout email-verification cleanup

The temporary V7 `email_verified_at` database default was removed by V8 after the rollout completed successfully.

Current `app_users.email_verified_at` behaviour:

```text
column_default = NULL
is_nullable    = YES
```

Database credentials are stored only in production environment variables.

### Transactional Email

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

The production domain has verified DKIM, SPF and DMARC configuration.

Production API keys and email-verification secrets are stored only in Render environment variables.

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
* Email verification during registration
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

## Email Verification

New accounts must verify ownership of their email address before authenticated application access is granted.

Registration creates an unverified account and issues an email-verification challenge.

Existing accounts that pre-dated the email-verification release were migrated as verified so existing users remained able to log in.

### Verification behaviour

* Six-digit numeric verification codes
* Verification code lifetime: 10 minutes
* Maximum incorrect attempts: 5
* Resend cooldown: 60 seconds
* Maximum issues per rate-limit window: 5
* Rate-limit window: 1 hour
* Resending generates a replacement code
* Previous codes become invalid after replacement
* Raw verification codes are never stored in PostgreSQL
* Verification codes are stored as HMAC-SHA-256 hashes
* HMAC uses a server-side production pepper
* Login is blocked for unverified users
* Refresh-token access is also blocked for unverified users
* Verification state survives application restarts
* Successful verification returns the user to the login flow

### Email-verification state

Verified users have:

```text
email_verified_at = <timestamp>
```

Unverified users have:

```text
email_verified_at = NULL
```

## Authentication API

```text
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/users/me
DELETE /api/v1/users/me
```

## Verification API Error Behaviour

The backend returns structured verification-specific errors.

Examples include:

```text
EMAIL_VERIFICATION_REQUIRED
VERIFICATION_CODE_INCORRECT
VERIFICATION_CODE_EXPIRED
VERIFICATION_ATTEMPTS_EXCEEDED
VERIFICATION_RESEND_COOLDOWN
VERIFICATION_RATE_LIMITED
VERIFICATION_EMAIL_UNAVAILABLE
```

Cooldown and rate-limit responses can include:

```text
retryAfterSeconds
```

and the HTTP `Retry-After` header.

## Resend Secret Handling

A production rollout test identified that a malformed Resend API-key environment value could cause Java HTTP-header validation to include the malformed Authorization header in an exception message.

The affected production key was immediately revoked and replaced.

The backend was hardened so that:

* Leading and trailing API-key whitespace is normalised
* Embedded whitespace and control characters are rejected
* API-key validation errors never include the key
* HTTP request-construction failures are converted to the safe email-delivery error path
* Sensitive header details are not retained in the resulting exception chain
* Provider failures use the existing safe `VERIFICATION_EMAIL_UNAVAILABLE` response path

Regression tests cover the production failure scenario.

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
* Email-verification data through database relationships

The mobile application also clears:

* Stored authentication tokens
* Pending email-verification state
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
* Email verification
* Verification resend and cooldown behaviour
* Persistent verification recovery after app restart

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
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
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

Email-verification challenges are also associated with their owning user account.

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

The previous mobile-distribution release candidate passed smoke testing against the production backend.

Verified behaviour included:

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

The new email-verification flow has additionally been tested on a real mobile device against the production backend using Expo.

## iOS Distribution

The Expo/EAS project is configured with the permanent iOS bundle identifier:

```text
com.zaib367.applymate
```

Expo Go has been used for development and production-connected testing.

Standalone iOS/TestFlight/App Store distribution remains deferred because it requires enrolment in the paid Apple Developer Program.

No paid Apple Developer action has been taken.

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

Email verification adds an additional defence-in-depth rule:

```text
Unverified users cannot obtain authenticated application access
through either login or refresh-token use.
```

## Production Verification

### Public endpoints

The following production endpoints return `UP`:

```text
/api/v1/status
/actuator/health
```

These endpoints were revalidated after the V8 production deployment.

### Production authentication

Verified:

* Registration
* Email verification
* Verification-code email delivery
* Verification resend
* Unverified login rejection
* Existing-user compatibility
* Login after verification
* Access-token issuance
* Refresh-token issuance
* Silent refresh
* Refresh-token rotation
* Logout
* Session revocation

### Production email verification

Verified end-to-end:

```text
Mobile registration
    -> Render API
    -> Neon unverified user
    -> verification challenge
    -> Resend
    -> verify@applymate.website
    -> real recipient inbox
    -> six-digit verification code
    -> email verification
    -> login
    -> dashboard
```

Additional production verification confirmed:

* New accounts initially have `email_verified_at = NULL`
* A verification challenge is created
* Verification emails arrive successfully
* Resent codes replace previous codes
* Old codes are rejected after resend
* Verification sets `email_verified_at`
* Verification challenge is cleared after completion
* Pending verification survives application restart
* Login redirects unverified users back to verification
* Existing pre-release accounts remained usable after migration
* Legacy accounts were backfilled as verified
* The temporary rollout default was removed after deployment

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

ApplyMate has public GitHub Pages documentation.

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

Pending email-verification state is also stored locally so the verification screen can be restored after an application restart.

It does not store the user's password or raw verification code.

## Environment Strategy

### Local development

* Expo runs on the development computer/emulator/device
* Spring Boot runs locally on port 8080
* PostgreSQL runs through Docker Compose
* Local configuration is stored in ignored environment files
* Android ADB reverse may be used for local emulator testing
* Local email-provider testing can use separate non-production credentials

### Production

* Spring Boot runs on Render
* PostgreSQL runs on Neon
* Transactional verification emails are sent through Resend
* Render provides the production service port
* Mobile builds use the Render HTTPS API URL
* Secrets are stored in platform environment variables
* Flyway validates and applies migrations during startup
* Render health is exposed through `/actuator/health`

Production email-related environment configuration includes:

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=ApplyMate <verify@applymate.website>
RESEND_API_KEY=<production secret>
EMAIL_VERIFICATION_PEPPER=<production secret>
```

Secret values must never be committed or included in documentation.

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
* Real-device Expo testing
* Production mobile smoke testing
* Real Resend email-delivery testing
* Flyway production migration validation

Latest backend test result:

```text
Tests run: 89
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Latest Expo Doctor result:

```text
18/18 checks passed
```

GitHub CI is green for the final V8 `main` release state.

## Security Rules

* Never commit `.env` or `.env.local`
* Never commit database credentials
* Never commit JWT signing secrets
* Never commit email-provider API keys
* Never commit the email-verification pepper
* Never commit signing keys or service-account credentials
* Store production secrets in platform environment variables
* Require HTTPS for production traffic
* Keep PostgreSQL inaccessible to the mobile client
* Keep Resend credentials inaccessible to the mobile client
* Store mobile authentication tokens securely
* Store only hashed refresh-token values in PostgreSQL
* Store only hashed email-verification codes in PostgreSQL
* Rotate refresh tokens after use
* Revoke refresh-token sessions during logout
* Block unverified users from login and refresh access
* Preserve per-user ownership checks
* Avoid logging authentication secrets, verification codes or provider credentials
* Run CI before release changes are merged
* Run smoke tests after production deployment changes

## Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

The database can later move to another PostgreSQL provider by changing environment configuration.

Flyway migrations remain the source of truth for recreating the schema.

ApplyMate does not depend on Neon-specific authentication or client libraries.

Transactional email is abstracted behind the backend verification-email sender interface, allowing the provider implementation to be replaced later without changing the mobile client or verification data model.

## Release Status

The functional work for the **Email Verification** feature is complete and deployed to production.

Completed release work includes:

1. Backend email-verification data model and services
2. Verification-code security and rate limiting
3. Verification and resend API endpoints
4. Login and refresh protection for unverified users
5. Resend transactional-email integration
6. Verified `applymate.website` sending domain
7. Mobile Verify Email screen
8. Persistent pending-verification recovery
9. Real-device testing
10. Production Render and Neon deployment
11. Flyway V6 and V7 rollout
12. Existing-user compatibility verification
13. Production Resend API-key rotation following deployment issue
14. Resend secret-handling security hotfix
15. Flyway V8 post-rollout cleanup
16. Final production health and migration verification
17. 89-test backend suite and green GitHub CI

Remaining release-closeout work:

1. Update shared project documentation
2. Update the root README
3. Commit and merge documentation closeout
4. Create the `v1.4.0` release tag

## Next Development Phase

Potential future work includes:

* Password reset
* Job-link import
* Email integration beyond account verification
* Additional automation features
* Google Play public release preparation
* Apple TestFlight/App Store distribution after Apple Developer Program enrolment

New product development should begin after the `v1.4.0` release is formally closed.
