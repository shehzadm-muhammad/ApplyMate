# ApplyMate Project Context

## Product

ApplyMate is a full-stack mobile job-application tracker.

It allows authenticated users to:

* Create and manage job applications
* Track application progress
* Search, filter and sort applications
* View dashboard statistics
* Create reminders linked to applications
* Receive local reminder notifications
* Maintain a persistent authenticated session
* Verify their email address during registration
* Securely reset a forgotten password by email
* Permanently delete their account and associated data

## Current Phase

**Password Reset & Production Release Closeout**

The following phases are complete:

* Frontend MVP
* Backend MVP
* Frontend and backend integration
* MVP polish
* Production deployment
* Production database deployment
* CI and Docker production readiness
* Expo Application Services configuration
* Android internal distribution
* Backend reminder synchronisation
* Persistent-session authentication
* Account deletion
* Privacy-policy and account-deletion webpages
* Mobile Distribution & Release Readiness
* Production email verification
* Resend transactional email integration
* Email-verification production migration rollout
* Resend secret-handling hardening
* Post-rollout database cleanup
* Secure password-reset backend
* Mobile forgot-password and reset-password flow
* Password-reset transactional email delivery
* Password-reset session revocation
* Password-reset automated security validation
* Password-reset production rollout and end-to-end verification

The application is running successfully against the production Spring Boot backend and Neon PostgreSQL database.

Email verification and password reset are both live and verified end-to-end in production.

## Current Git State

* Stable branch: `main`
* Documentation branch: `docs/password-reset-closeout`
* Current production/main commit: `d1e4d37`
* Current release tag: `v1.4.0`
* Next planned release tag: `v1.5.0`
* Current milestone: Password Reset & Production Release Closeout

The `v1.5.0` tag will be created after documentation is updated and release closeout checks are complete.

## Technology Stack

### Mobile frontend

* React Native
* Expo SDK 54
* TypeScript
* React Navigation
* Expo SecureStore
* AsyncStorage
* Expo Notifications
* EAS Build

### Backend

* Java 21
* Spring Boot 4.1
* Maven
* Spring Security
* OAuth2 Resource Server
* Spring Data JPA
* Bean Validation
* Spring Boot Actuator
* Spring RestClient

### Database

* PostgreSQL 17
* Flyway
* Hibernate
* HikariCP

### Local development

* Docker Desktop
* Docker Compose
* Local PostgreSQL container
* Maven Wrapper
* Expo development server
* Android emulator
* Physical-device Expo testing

### Production infrastructure

* Render Docker web service
* Neon PostgreSQL
* Resend transactional email
* `applymate.website` verified sending domain
* HTTPS public API
* Platform-managed environment variables
* Render health checks
* GitHub Actions CI
* Expo Application Services
* GitHub Pages

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
       |        Verification emails
       |        Password-reset emails
       |        Password-changed emails
       |        verify@applymate.website
       |
       | Encrypted PostgreSQL connection
       v
Neon PostgreSQL
```

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
d1e4d37
```

### Database

Provider: Neon PostgreSQL

Production database:

```text
applymate
```

Current Flyway schema version:

```text
9
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
* Password-reset challenges

The temporary V7 `email_verified_at` database default was removed by V8 after the email-verification rollout completed successfully.

V9 adds the password-reset challenge model without modifying the existing email-verification tables.

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

Sender:

```text
ApplyMate <verify@applymate.website>
```

Transactional email is used for:

* Email-verification codes
* Password-reset codes
* Password-changed notifications

The production domain has verified DKIM, SPF and DMARC configuration.

Production API keys, email-verification secrets and password-reset secrets are stored only in Render environment variables.

The backend uses a shared `ResendEmailClient` for provider transport so verification and password-reset email features do not duplicate Resend HTTP configuration or secret handling.

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
* Forgot-password requests
* Secure password reset by email code
* Secure password hashing
* Email/password login
* JWT access tokens
* Refresh tokens
* Refresh-token rotation
* Refresh-token family tracking
* Refresh-token revocation
* Refresh-session revocation after password reset
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
Access token: 15 minutes
Refresh session: 30 days
```

If an access token expires while the refresh session remains valid, the mobile app automatically obtains a new token and retries the original request.

The user remains signed in without having to enter their credentials again.

A successful password reset revokes all active refresh-token sessions for that account.

Already-issued access tokens are not blacklisted and may remain usable until their short expiry, which is limited to 15 minutes by the production default.

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

## Password Reset

ApplyMate provides a secure password-reset flow for users who have forgotten their password.

The mobile flow is:

```text
Login
  -> Forgot Password
  -> Send reset code
  -> Reset Password
  -> Login with new password
```

### Password-reset behaviour

* Six-digit numeric reset codes
* Reset code lifetime: 10 minutes
* Maximum incorrect attempts: 5
* Resend cooldown: 60 seconds
* Maximum issues per rate-limit window: 5
* Rate-limit window: 1 hour
* Resending generates a replacement code
* Previous codes become invalid immediately after replacement
* Successful codes are single-use
* Raw reset codes are never stored in PostgreSQL
* Reset codes are stored as HMAC-SHA-256 hashes
* Password-reset HMAC uses a separate production pepper
* Hash input is bound to the owning user
* Reset codes cannot be used across accounts
* Passwords continue to use the existing secure password encoder
* Password validation remains 8–72 characters
* Successful reset revokes all active refresh-token sessions
* Successful reset deletes the reset challenge
* A password-changed notification email is sent after success
* Failure of the password-changed notification does not undo the password reset

Unverified users are allowed to reset their password.

Resetting a password does **not** verify the user's email address.

An unverified user who resets their password remains unverified and continues to receive the existing email-verification-required login behaviour.

### Account-enumeration protection

The forgot-password endpoint returns the same public result for syntactically valid requests whether or not an account exists.

Public behaviour:

```text
HTTP 202 Accepted
```

The service also uses a minimum response-duration strategy to reduce timing differences between account-existence paths.

Email-provider failures during reset-code issuance are not exposed to the client.

If reset-code email delivery fails, the database transaction rolls back so the failed delivery does not consume the challenge, resend cooldown or rate-limit state.

### Reset-code failure behaviour

Missing challenges, incorrect codes, expired codes, exhausted attempts and other invalid reset-code cases are exposed through one generic public error:

```text
PASSWORD_RESET_CODE_INVALID_OR_EXPIRED
```

The mobile application advises the user to request another code.

## Authentication API

```text
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
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

Password-reset code failures intentionally use the generic:

```text
PASSWORD_RESET_CODE_INVALID_OR_EXPIRED
```

## Resend Secret Handling

A previous production rollout test identified that a malformed Resend API-key environment value could cause Java HTTP-header validation to include the malformed Authorization header in an exception message.

The affected production key was immediately revoked and replaced.

The backend was hardened so that:

* Leading and trailing API-key whitespace is normalised
* Embedded whitespace and control characters are rejected
* API-key validation errors never include the key
* HTTP request-construction failures are converted to the safe email-delivery error path
* Sensitive header details are not retained in the resulting exception chain
* Provider failures use safe feature-specific error handling

Password-reset development reused this hardened provider transport through the shared `ResendEmailClient` instead of introducing a second independent Resend client.

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
* Password-reset challenge data through database relationships

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
* Forgot password
* Password reset
* Reset-code resend and rate limiting
* Password-changed notification
* Refresh-session revocation after password change

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
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
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

Email-verification challenges and password-reset challenges are associated with their owning user account.

Password-reset codes are cryptographically bound to the owning user's ID.

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

The email-verification and password-reset flows have additionally been tested on a real mobile device against the production backend using Expo.

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

Password reset adds:

```text
Successful password reset revokes all active refresh-token sessions
for the affected account.
```

## Production Verification

### Public endpoints

The following production endpoints are healthy:

```text
/api/v1/status
/actuator/health
```

These endpoints were revalidated after the V9 production deployment.

Production verification returned:

```text
/api/v1/status       -> HTTP 200
/actuator/health     -> HTTP 200
```

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
* Forgot-password public access
* Password reset
* Login with changed password

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

### Production password reset

Verified end-to-end:

```text
Mobile Login
    -> Forgot Password
    -> Render API
    -> Neon password-reset challenge
    -> Resend
    -> real recipient inbox
    -> six-digit reset code
    -> Reset Password
    -> refresh sessions revoked
    -> password-changed email
    -> Login with new password
```

Production verification confirmed:

* `/api/v1/auth/forgot-password` is publicly accessible
* Unknown syntactically valid email returns HTTP `202 Accepted`
* Real password-reset email arrives successfully
* Reset code is accepted
* Password is changed successfully
* Old password is rejected
* New password successfully authenticates
* Password-changed notification email arrives successfully
* Flyway schema is at V9
* Production access-token default is 15 minutes
* Production password-reset pepper is stored only in Render

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

Pending email-verification state is stored locally so the verification screen can be restored after an application restart.

Password-reset codes and new passwords are **not** persisted locally.

## Environment Strategy

### Local development

* Expo runs on the development computer/emulator/device
* Spring Boot runs locally on port 8080
* PostgreSQL runs through Docker Compose
* Local configuration is stored in ignored environment files
* Android ADB reverse may be used for local emulator testing
* Physical devices can connect to the local backend through the development machine's LAN address
* Local email-provider testing can use separate non-production credentials

### Production

* Spring Boot runs on Render
* PostgreSQL runs on Neon
* Transactional verification and password-reset emails are sent through Resend
* Render provides the production service port
* Mobile builds use the Render HTTPS API URL
* Secrets are stored in platform environment variables
* Flyway validates and applies migrations during startup
* Render health is exposed through `/actuator/health`

Production email/authentication-related environment configuration includes:

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=ApplyMate <verify@applymate.website>
RESEND_API_KEY=<production secret>
EMAIL_VERIFICATION_PEPPER=<production secret>
PASSWORD_RESET_PEPPER=<separate production secret>
```

No `JWT_ACCESS_TOKEN_TTL` override is required in Render because the production application configuration defaults to:

```text
PT15M
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
* Password-reset transaction rollback testing
* Password-reset session-revocation testing

Latest backend test result:

```text
Tests run: 106
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Focused password-reset validation:

```text
Tests run: 14
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Latest frontend validation:

```text
tsc --noEmit
PASS
```

GitHub CI is green for the password-reset feature merged into `main`.

## Security Rules

* Never commit `.env` or `.env.local`
* Never commit database credentials
* Never commit JWT signing secrets
* Never commit email-provider API keys
* Never commit the email-verification pepper
* Never commit the password-reset pepper
* Never commit signing keys or service-account credentials
* Store production secrets in platform environment variables
* Require HTTPS for production traffic
* Keep PostgreSQL inaccessible to the mobile client
* Keep Resend credentials inaccessible to the mobile client
* Store mobile authentication tokens securely
* Store only hashed refresh-token values in PostgreSQL
* Store only hashed email-verification codes in PostgreSQL
* Store only hashed password-reset codes in PostgreSQL
* Use separate peppers for verification and password reset
* Rotate refresh tokens after use
* Revoke refresh-token sessions during logout
* Revoke all refresh-token sessions after password reset
* Block unverified users from login and refresh access
* Do not treat password reset as email verification
* Preserve per-user ownership checks
* Avoid logging authentication secrets, verification codes, reset codes or provider credentials
* Run CI before release changes are merged
* Run smoke tests after production deployment changes

## Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

The database can later move to another PostgreSQL provider by changing environment configuration.

Flyway migrations remain the source of truth for recreating the schema.

ApplyMate does not depend on Neon-specific authentication or client libraries.

Transactional email provider transport is centralised through the backend `ResendEmailClient`, while feature-specific verification and password-reset email components remain separate from the mobile client and database models.

## Release Status

The functional work for the **Password Reset** feature is complete and deployed to production.

Completed release work includes:

1. Secure password-reset challenge data model
2. Flyway V9 password-reset migration
3. Six-digit HMAC-protected reset codes
4. Dedicated password-reset production pepper
5. Reset expiry, incorrect-attempt protection, cooldown and rate limiting
6. Account-enumeration-resistant forgot-password behaviour
7. Transaction rollback when reset-code email delivery fails
8. Generic public reset-code failure behaviour
9. Shared hardened Resend email transport
10. Password-reset code email delivery
11. Password-changed notification email
12. Password update using the existing secure password encoder
13. Refresh-session revocation after successful reset
14. Unverified-account reset support without changing verification state
15. Mobile Forgot Password screen
16. Mobile Reset Password screen
17. Login success messaging after reset
18. 14 focused password-reset security and transaction tests
19. 106-test complete backend suite
20. Frontend TypeScript validation
21. GitHub PR #10 merge into `main`
22. Render production deployment
23. Neon/Flyway V9 production validation
24. Production API health verification
25. Unknown-email `202 Accepted` verification
26. Real production reset-email delivery
27. Old-password rejection after reset
28. New-password authentication after reset
29. Real password-changed notification delivery

Remaining release-closeout work:

1. Update shared project documentation
2. Update the root README
3. Commit and merge documentation closeout
4. Create the `v1.5.0` release tag
5. Remove completed temporary feature/documentation branches

## Next Development Phase

Potential future work includes:

* Job-link import
* Email integration beyond authentication emails
* Additional automation features
* Profile/account-management improvements
* Google Play public release preparation
* Apple TestFlight/App Store distribution after Apple Developer Program enrolment

New product development should begin after the `v1.5.0` release is formally closed.
