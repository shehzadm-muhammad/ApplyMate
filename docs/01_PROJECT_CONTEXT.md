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
* Optionally connect Gmail and manually check for recruitment-email updates
* Review, confirm or ignore email-derived status suggestions
* Create a missing application directly from an email-update workflow
## Current Phase

**Final Handoff & Store Submission Readiness**

ApplyMate feature development is complete. The v1.8.0 release finalises reproducibility, native store-build readiness, operational handoff, store metadata/compliance documentation and safe public Gmail gating.

The following phases are complete:

* Frontend MVP
* Backend MVP
* Frontend/backend integration and polish
* Production Render/Neon deployment
* CI and Docker production readiness
* Expo Application Services configuration
* Android internal distribution
* Backend reminder synchronisation
* Persistent-session authentication
* Account deletion
* Privacy-policy and account-deletion webpages
* Production email verification
* Secure password reset
* Secure Job Link Import
* Recruitment Email Integration implementation
* Real Gmail OAuth/API testing with authorised Google test users
* Independent clean-clone reproducibility proof
* Android production AAB build validation
* Native iOS Simulator compilation validation
* Final deployment/handoff runbook
* Store submission pack
* Production Gmail release gating
* Public privacy/deletion disclosure refresh

Public Gmail remains intentionally disabled in unrestricted production builds while Google `gmail.readonly` restricted-scope approval is pending.

## Current Git State

* Stable branch: `main`
* Finalisation branch: `release/final-handoff-store-readiness`
* Previous release: `v1.7.0`
* Current release: `v1.8.0`
* v1.7.0 baseline tag/commit: `092f523427a19b8b55896d2701fe000249221dac`
* Production Flyway: `V9`
* Store marketing version: `1.0.0`

The final `v1.8.0` annotated tag is intentionally created only after this documentation and release-hardening work is merged to `main`, required CI is green, the final native release validation is complete and `main == origin/main`. Documentation therefore names `v1.8.0` as the current release before tagging, without falsely claiming that the final tag already exists.

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
* `react-native-nitro-google-signin`
* `react-native-nitro-modules`
* Google Identity Services / Gmail API

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
       +---------------- HTTPS + JSON ----------------> Render Spring Boot API
       |                                                  |
       |                                                  +--> Neon PostgreSQL
       |                                                  +--> Resend
       |                                                  +--> Public job pages
       |
       +----------- OAuth + HTTPS --------------------> Google / Gmail API
                    gmail.readonly
```

Normal account, application, reminder and authentication operations continue to use the Spring Boot API.

Job Link Import remains backend-controlled: public job pages are fetched only by the Spring Boot service, which performs URL/redirect validation and returns a transient editable preview.

Recruitment Email Integration is mobile/local-first and deliberately bypasses the ApplyMate backend for Gmail data. The native client authorises the Google account and calls the Gmail API directly.

The Gmail path sends **none** of the following through Render:

```text
Google access token
Gmail message body
Gmail snippet
raw MIME
attachment content
```

No Gmail data is stored in PostgreSQL. Only a user-confirmed application change is sent through the existing authenticated application API.
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

## Recruitment Email Integration

v1.7.0 provides an optional Gmail-first recruitment-email workflow.

### OAuth and provider boundary

Google scope:

```text
https://www.googleapis.com/auth/gmail.readonly
```

Implementation:

* Native Google Identity Services through `react-native-nitro-google-signin`
* `offlineAccess: false`
* No server auth code
* No backend Google refresh token
* Direct mobile-to-Gmail API traffic
* Google OAuth app currently External/Testing for authorised test users
* Unrestricted public Gmail rollout pending Google's restricted-scope verification

Expo Go is not supported for this feature because the app now depends on a native Google/Nitro module. Android development/preview builds have been compiled and tested successfully.

### Manual sync and staged retrieval

Sync is user-triggered from Profile.

The Gmail client:

1. Lists bounded candidate message IDs.
2. Fetches metadata such as From, Subject, Date and snippet for unseen candidates.
3. Runs deterministic recruitment-email detection.
4. Fetches only bounded inline textual body content when metadata is insufficient.
5. Never requests raw MIME or attachments.
6. Discards fetched body text after processing.
7. Persists no body or snippet.

The first search uses a bounded lookback. Subsequent sync uses an overlap window and processed-message IDs to avoid duplicate suggestions.

### Local storage

Connection and account-ownership metadata use secure device storage.

Processed Gmail IDs and suggestion metadata use bounded AsyncStorage state namespaced by:

```text
ApplyMate user ID
+
Google account ID
```

The integration state is retention-limited and capped. A migration moves older Gmail processing state out of a single large SecureStore JSON item into AsyncStorage.

Locally stored suggestion metadata can include:

```text
provider message/thread IDs
received timestamp
detected category/confidence
matched application ID/confidence
suggested status
subject
sender display
review state
```

It does not include the Gmail body or snippet.

### Deterministic detection and matching

No AI is used.

Detection categories:

```text
APPLICATION_RECEIVED
ASSESSMENT
INTERVIEW
OFFER
REJECTION
FOLLOW_UP
UNKNOWN
```

Matching uses deterministic company/title/domain/date evidence.

Precision rules suppress low-confidence/noisy items rather than turning the Email Updates screen into a general inbox.

### Review and confirmation safety

Suggestions never update an application automatically.

The review screen lets the user:

* Choose/change an existing application
* Create a missing application
* Ignore the suggestion
* Confirm an actionable change

If a new application is created from an email, safely derived company/job-title/status values can prefill the normal Add Application form; all fields remain editable.

Before Confirm, ApplyMate reloads current applications and resolves the action again.

Safety rules include:

* Normal stages never move backwards because of an older email.
* An already-rejected application is not automatically revived.
* Rejection emails are compared with the application's latest `updatedAt` to prevent an older rejection overwriting newer progress.
* Same-stage email updates can be marked handled without an unnecessary backend write.
* The suggestion is marked confirmed only after any required application API update succeeds.

### Account isolation and cleanup

Gmail connection/integration state is scoped to the current ApplyMate user.

On the same device, one Gmail account cannot be silently claimed by another ApplyMate account while it is still owned by the first account.

Disconnect:

* Revokes Google access when provider revocation can be confirmed
* Removes local Gmail connection metadata
* Removes local processed/suggestion state
* Leaves saved applications and reminders untouched

Account deletion performs best-effort Gmail cleanup as part of local account cleanup.

Logout clears the active native Google session while keeping the user's namespaced connection metadata available for safe restoration when appropriate.

### v1 boundaries

v1.7.0 intentionally has:

```text
Gmail only
manual sync only
no background worker
no Pub/Sub
no Outlook/Yahoo/IMAP
no AI classifier
no automatic application mutation
no Gmail backend/Flyway endpoint
```

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

Gmail integration state is additionally namespaced by the authenticated ApplyMate user ID and selected Google account ID. Gmail messages themselves are not persisted in the backend database.
## Mobile Distribution

Expo Application Services is configured for Android and iOS.

### Expo project

```text
@zaib_367/ApplyMate
```

EAS project ID:

```text
51084402-f9c2-459f-b2ee-d97854a31c0e
```

### Permanent application identifiers

```text
Android: com.zaib367.applymate
iOS:     com.zaib367.applymate
```

### Versioning

```text
Store marketing version: 1.0.0
Repository release:      v1.8.0
```

EAS remote versioning is configured for native build numbers/version codes.

### EAS profiles

* `development` — development client / internal distribution
* `preview` — standalone internal testing
* `ios-simulator` — native iOS Simulator build without App Store credentials
* `production` — store distribution with remote auto-increment

### EAS environments

```text
production:
  EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
  EXPO_PUBLIC_GMAIL_ENABLED=false

preview:
  EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
  EXPO_PUBLIC_GMAIL_ENABLED=true

development:
  EXPO_PUBLIC_GMAIL_ENABLED=true
```

The committed `.env.example` defaults `EXPO_PUBLIC_GMAIL_ENABLED=false`.

## Android Distribution

Android development/preview builds remain valid for authorised Gmail testing.

Checkpoint 3 also produced a real production/store-distribution AAB using the existing EAS-managed keystore:

```text
Build ID: b4f877a4-7120-4af2-b5b1-cb8c0f933675
Version: 1.0.0
Version code: 2
Result: PASS
```

This proves the release pipeline. A final AAB must be built from the exact frozen `v1.8.0` commit before submission.

## iOS Distribution

The permanent bundle identifier is:

```text
com.zaib367.applymate
```

A credential-free EAS `ios-simulator` build successfully compiled the native iOS app:

```text
Build ID: 9d9d5aba-6054-4693-bf57-f2647d444ed4
Version: 1.0.0
Build number: 1
Result: PASS
```

The app declares `ITSAppUsesNonExemptEncryption=false`.

Apple distribution signing, TestFlight and App Store submission remain blocked only by Apple Developer Program enrolment; native iOS compilation itself is validated.

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
* Gmail connection/ownership metadata
* Gmail processed-message IDs
* Recruitment-email suggestion metadata and review state

Reminder records themselves are backend-synchronised.

Gmail processing state is local-first and never becomes PostgreSQL data. Only a user-confirmed application create/update uses the normal backend API.

Pending email-verification state is stored locally so the verification screen can be restored after an application restart.

Password-reset codes and new passwords are **not** persisted locally.

Gmail message bodies and snippets are also **not** persisted locally.
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

* Independent clean clone from `main`/`v1.7.0` baseline
* `npm ci`
* TypeScript compiler checks
* Expo dependency validation
* Expo Doctor
* Expo web export
* Gmail deterministic integration logic checks
* JUnit / MockMvc / Mockito
* Testcontainers
* Maven clean verification and package
* Isolated PostgreSQL/Flyway bootstrap
* Production Docker image verification
* GitHub Actions
* Android native development/preview testing
* Android production AAB build
* Native iOS Simulator EAS build
* Production API smoke testing
* Real Gmail OAuth/Gmail API testing with authorised test accounts
* Production Gmail-off bundle verification

Final handoff validation:

```text
Fresh Git clone / exact source      PASS
Frontend npm ci                     PASS
Frontend typecheck                  PASS
Expo dependencies                   PASS
Expo Doctor                         17/18 known Nitro metadata warning
Web export                          PASS
Gmail logic                         PASS
Backend clean verify                144 tests / 0 failures / 0 errors
Backend JAR                         PASS
Docker image                        PASS
Docker runtime user                 applymate
Docker healthcheck                  PASS
Android production AAB              PASS
iOS Simulator native build          PASS
Gmail production flag OFF           PASS
Gmail test flag ON                  PASS
Production export Gmail UI text     ABSENT
```

The single Expo Doctor warning is React Native Directory metadata reporting `react-native-nitro-google-signin` as untested on the New Architecture. It remains visible rather than being suppressed. The exact dependency has passed real native builds and Gmail runtime testing.

The clean-clone exercise also established an operational rule: parallel repository clones must use unique Docker Compose project names to avoid named-volume collisions. `docker compose down -v` must be treated as destructive local database reset, not routine shutdown.

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
* Request only Google `gmail.readonly` for Gmail integration.
* Never send Google access tokens or Gmail message content through the ApplyMate backend.
* Never persist Gmail access tokens, message bodies or snippets in PostgreSQL.
* Never fetch raw Gmail MIME or attachments for v1.
* Keep Gmail body retrieval bounded and transient.
* Namespace Gmail integration state by ApplyMate user and Google account.
* Never apply an email-derived application change without explicit user confirmation.
* Revalidate current application state immediately before confirmation.
* Prevent backwards/stale status mutations.
## Portability

ApplyMate uses standard PostgreSQL and JDBC configuration.

The database can later move to another PostgreSQL provider by changing environment configuration.

Flyway migrations remain the source of truth for recreating the schema.

ApplyMate does not depend on Neon-specific authentication or client libraries.

Transactional email provider transport is centralised through the backend `ResendEmailClient`, while feature-specific verification and password-reset email components remain separate from the mobile client and database models.

## Release Status

Current release:

```text
v1.8.0
```

Previous release:

```text
v1.7.0
```

v1.8.0 is the **Final Handoff & Store Readiness** release.

Release-hardening work includes:

1. Full repository/infrastructure handoff audit.
2. Independent clean-clone reproducibility verification.
3. 144/144 backend tests from an isolated fresh database environment.
4. Maven package and production Docker validation.
5. Android production/store AAB build validation.
6. Native iOS Simulator EAS compilation validation.
7. Dedicated `ios-simulator` EAS profile.
8. `ITSAppUsesNonExemptEncryption=false`.
9. Authoritative deployment/handoff runbook.
10. Apple App Store and Google Play submission pack.
11. Production Gmail feature gating.
12. `EXPO_PUBLIC_GMAIL_ENABLED=false` in production.
13. Gmail enabled only for authorised preview/development test builds.
14. Privacy and account-deletion disclosure reconciliation.
15. Documentation/release freeze preparation.

Google `gmail.readonly` remains a Restricted scope. Public Gmail is disabled in unrestricted production builds until Google approval is obtained.

Flyway remains `V9`; the v1.8.0 Gmail release gate requires no backend API or database migration.

Tag status at documentation time:

```text
v1.8.0 annotated tag: pending final validation / merge / green CI
```

After the v1.8.0 final tag, feature development is frozen except for genuine bug fixes, store/compliance work, Google OAuth verification, security maintenance and provider-required maintenance.

## Development Freeze

ApplyMate feature development is frozen after `v1.8.0`.

Permitted future changes:

* Genuine bug fixes
* Apple/Google store compliance requirements
* Google OAuth restricted-scope verification work
* Security maintenance
* Provider/API compatibility maintenance
* Operational documentation corrections

External gates that remain without reopening product scope:

* Apple Developer Program enrolment before App Store distribution
* Google Play developer account/application before Play submission
* Google restricted-scope approval before public Gmail is enabled

No additional email providers, AI features, application automation or unrelated product expansion are approved by this roadmap freeze.
