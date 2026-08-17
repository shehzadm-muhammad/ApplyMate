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
* Import supported public job links into an editable application preview
* Permanently delete their account and associated data

## Current Phase

**Job Link Import & Production Release Closeout**

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
* Secure backend job-link import preview
* Job-link SSRF and redirect protection
* Structured job-data extraction
* Editable mobile job-import workflow
* Job-import rate limiting and safe error handling
* Job-link import production rollout and end-to-end verification

The application is running successfully against the production Spring Boot backend and Neon PostgreSQL database.

Email verification, password reset and Job Link Import are live and verified end-to-end in production.

## Current Git State

* Stable branch: `main`
* Current production/main commit: `5be432d`
* Current release tag: `v1.5.0`
* Next planned release tag: `v1.6.0`
* Current milestone: Job Link Import & Production Release Closeout

The Job Link Import feature has been merged to `main`, pushed to `origin/main`, deployed to Render and verified against production.

The `v1.6.0` tag will be created after documentation is updated and final release-closeout checks are complete.

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
       |                |                 |
       |                | HTTPS           | HTTPS
       |                v                 v
       |              Resend        Public job pages
       |                |                 |
       |                v                 v
       |        Verification emails   Import preview
       |        Password-reset emails JSON-LD / HTML
       |        Password-changed emails
       |        verify@applymate.website
       |
       | Encrypted PostgreSQL connection
       v
Neon PostgreSQL
```

The mobile application communicates only with the Spring Boot API.

It never connects directly to PostgreSQL, Resend or third-party job pages.

For Job Link Import, the backend performs the outbound fetch, validates the destination and redirects, extracts a non-persistent preview, and returns safe editable fields to the mobile application.

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
5be432d
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
* Secure public job-link import preview
* JSON-LD JobPosting extraction
* HTML fallback job extraction
* Editable imported application details
* Import warnings and manual-entry fallback
* SSRF-safe URL and redirect validation
* Per-user job-import rate limiting

## Job Link Import

ApplyMate can import supported public job-advert URLs into the existing Add Application form.

The import flow is:

```text
User pastes public job URL
        -> authenticated backend import-preview endpoint
        -> safe server-side fetch
        -> JSON-LD JobPosting extraction first
        -> HTML fallback extraction second
        -> editable preview returned to mobile
        -> user reviews and edits all fields
        -> existing Save Application flow persists the application
```

The importer never saves a job application automatically.

Status and notes remain user-controlled and are not overwritten by imported data.

### Supported extraction behaviour

The backend:

* Prefers Schema.org `JobPosting` JSON-LD
* Falls back to deterministic HTML extraction
* Strips HTML and returns plain text
* Normalises imported values
* Truncates imported fields to existing application save limits
* Requires a minimum extraction-confidence threshold before returning success
* Returns warnings for partially extracted previews
* Allows manual entry when import is unavailable or incomplete

### URL and network security

The backend importer:

* Accepts only supported HTTP/HTTPS public job URLs
* Canonicalises hostnames before validation
* Handles lowercase hostnames, IDN/punycode and trailing-dot normalisation
* Rejects private, loopback, link-local and otherwise unsafe destinations
* Revalidates every redirect target
* Uses domain/subdomain matching rather than substring matching
* Explicitly treats LinkedIn and Indeed as unsupported for automatic import
* Uses direct connections rather than inherited proxy settings
* Sends no user cookies or authentication headers to job sites
* Applies connection and read timeouts
* Enforces a 2 MiB response limit while streaming
* Applies the size limit safely to compressed/decompressed responses
* Rejects unsupported content types
* Never logs the full user-submitted URL or query string

### Import rate limiting

Import attempts are rate-limited per authenticated user:

```text
10 import attempts per 10 minutes
```

The in-memory limiter removes expired entries so its state remains bounded.

Malformed, unsafe, unavailable and extraction-failure attempts count toward the import limit once they reach the service.

Bean-validation failures such as a blank URL are rejected before the service and do not consume an import attempt.

### Mobile behaviour

The existing Add Application form contains the Job Link Import workflow.

After a successful import:

* Imported values populate the existing form fields
* Every imported field remains editable
* Status remains unchanged
* Notes remain unchanged
* Warnings are shown when appropriate
* Nothing is persisted until the user presses Save Application

If an import fails, the user can continue entering the application manually.

Unsaved Add Application drafts remain available when navigating away and returning.

After a successful save, the Add Application form resets to a fresh state.

The Edit Application screen remains an edit-only workflow and does not expose re-import behaviour.

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
POST   /api/v1/applications/import-preview
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

Job-import previews are transient and are not persisted by the import endpoint. Persistence occurs only when the authenticated user submits the existing application save flow.

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

The email-verification, password-reset and Job Link Import flows have additionally been tested on a real mobile device against the production backend using Expo.

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

### Production Job Link Import

Verified end-to-end against the production Render backend:

```text
Mobile Add Application
    -> public job URL
    -> Render authenticated import-preview API
    -> safe outbound fetch
    -> structured extraction
    -> editable mobile preview
    -> user review/edit
    -> existing Save Application flow
    -> Neon PostgreSQL
```

Production verification confirmed:

* Render deployed commit `5be432d`
* `/api/v1/status` returned HTTP `200`
* `/actuator/health` returned HTTP `200`
* A supported public job URL imported successfully
* Imported fields remained editable
* Status and notes remained user-controlled
* The imported application saved successfully through the existing save flow
* The Add Application form reset after a successful save
* LinkedIn/Indeed import was rejected safely
* An unsafe loopback URL was rejected safely
* Sensitive query-string content was not echoed back in the mobile error flow
* Existing application edit behaviour still worked
* Existing application delete behaviour still worked

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
* Job-import URL/SSRF validation testing
* Job-import redirect and response-limit testing
* Job-import extraction testing
* Job-import service and controller testing
* Production Job Link Import end-to-end testing

Latest backend test result:

```text
Tests run: 144
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Focused Job Link Import validation:

```text
Tests run: 38
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

The Job Link Import feature was also verified manually against the production Render backend from the mobile application.

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
* Never log full user-submitted job URLs or query strings
* Treat outbound job-page fetching as an SSRF-sensitive operation
* Revalidate every job-import redirect target
* Keep job-import response size and decompression bounded
* Never persist imported job data until the user reviews and explicitly saves it
* Run CI before release changes are merged
* Run smoke tests after production deployment changes

## Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

The database can later move to another PostgreSQL provider by changing environment configuration.

Flyway migrations remain the source of truth for recreating the schema.

ApplyMate does not depend on Neon-specific authentication or client libraries.

Transactional email provider transport is centralised through the backend `ResendEmailClient`, while feature-specific verification and password-reset email components remain separate from the mobile client and database models.

## Release Status

The functional work for **Job Link Import** is complete, merged to `main`, deployed to production and verified end-to-end.

Current production/main commit:

```text
5be432d
```

Completed release work includes:

1. Authenticated `POST /api/v1/applications/import-preview`
2. Non-persistent import-preview architecture
3. Safe URL parsing and hostname canonicalisation
4. Private/loopback/link-local destination blocking
5. Redirect-by-redirect safety validation
6. LinkedIn and Indeed unsupported-domain handling
7. Direct outbound connections without user cookies or authentication headers
8. Connection and read timeouts
9. 2 MiB streaming response limit
10. Safe compressed/decompressed response handling
11. Content-type validation
12. JSON-LD Schema.org `JobPosting` extraction
13. Deterministic HTML fallback extraction
14. Plain-text sanitisation
15. Save-limit normalisation and truncation
16. Minimum extraction-success thresholds
17. Per-user 10-imports-per-10-minutes rate limiting
18. Bounded cleanup of expired rate-limit entries
19. Structured safe import error handling
20. Existing Add Application form integration
21. Editable imported preview fields
22. Status and notes preserved during import
23. Manual-entry fallback after import failure
24. Unsaved Add Application draft preservation
25. Add Application reset after successful save
26. Edit Application kept unchanged
27. 38 focused Job Link Import tests
28. 144-test complete backend suite
29. Frontend TypeScript validation
30. Local mobile end-to-end verification
31. Merge commit `5be432d`
32. Push to `origin/main`
33. Render production deployment
34. Production API health verification
35. Production successful-import verification
36. Production imported-field editing verification
37. Production save/reset verification
38. Production LinkedIn/Indeed rejection verification
39. Production unsafe-URL rejection verification
40. Production existing edit/delete regression verification

No Flyway migration was required for Job Link Import.

No application data is persisted by the import endpoint.

Remaining release-closeout work:

1. Update shared project documentation
2. Update the root README
3. Commit and merge documentation closeout
4. Create the `v1.6.0` release tag
5. Remove completed temporary documentation branches if any

## Next Development Phase

Potential future work includes:

* Email integration beyond authentication emails
* Additional automation features
* Profile/account-management improvements
* Broader job-source compatibility where technically and legally appropriate
* Google Play public release preparation
* Apple TestFlight/App Store distribution after Apple Developer Program enrolment

New product development should begin after the `v1.6.0` release is formally closed.
