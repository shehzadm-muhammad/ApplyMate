# ApplyMate Roadmap

## Current Phase

**Final Handoff & Store Submission Readiness**

Product roadmap status: **FROZEN**.

Sections below describing future ideas are retained as historical backlog/context only. They are not approved development commitments. After v1.8.0, ApplyMate feature development is frozen except for genuine bugs, store/compliance requirements, Google OAuth verification, security maintenance and provider-required maintenance.

Current release:

```text
v1.8.0
```

Previous release:

```text
v1.7.0
```

Store marketing version:

```text
1.0.0
```

Current production Flyway:

```text
V9
```

Final handoff/store-readiness gates completed so far:

```text
Full handoff audit                    PASS
Independent clean clone               PASS
Frontend npm ci/typecheck/export      PASS
Expo dependencies                     PASS
Expo Doctor                           17/18 known Nitro warning
Backend clean verify                  144/144 PASS
Backend package                       PASS
Production Docker image               PASS
Android production AAB                PASS
iOS Simulator native build            PASS
Handoff runbook                       COMPLETE
Store submission pack                 COMPLETE
Production Gmail gate                 PASS / OFF
Production Gmail UI in export         ABSENT
```

Unrestricted public Gmail remains pending Google restricted-scope verification. Store submission itself remains account-gated and is not part of the completed product-feature scope.

# Phase 1 — Frontend MVP

**Status: Complete**

- [x] React Native, Expo and TypeScript setup
- [x] ApplyMate branding and theme
- [x] Splash screen
- [x] Registration screen
- [x] Login screen
- [x] Protected navigation
- [x] Dashboard
- [x] Applications list
- [x] Application details
- [x] Create application
- [x] Edit application
- [x] Delete application
- [x] Profile screen
- [x] Settings screen
- [x] Reminder interface
- [x] Local notification scheduling
- [x] Local device preferences

---

# Phase 2 — Backend MVP

**Status: Complete**

- [x] Spring Boot backend
- [x] PostgreSQL database
- [x] Docker Compose development database
- [x] Flyway migrations
- [x] User registration
- [x] Secure password hashing
- [x] Login
- [x] JWT access tokens
- [x] Protected API routes
- [x] Current-user profile
- [x] Job-application persistence
- [x] Application CRUD
- [x] Per-user application ownership
- [x] User-isolation protection
- [x] Backend validation
- [x] Consistent API errors
- [x] Automated backend tests

---

# Phase 3 — Frontend and Backend Integration

**Status: Complete**

- [x] Environment-based API URL
- [x] Central API client
- [x] Secure native token storage
- [x] Browser token-storage fallback
- [x] Backend registration
- [x] Backend login
- [x] Backend current-user profile
- [x] Backend-powered application CRUD
- [x] Session restoration
- [x] Invalid-session handling
- [x] Local-development smoke testing

---

# Phase 4 — MVP Polish

**Status: Complete**

## Dashboard

- [x] Backend dashboard-summary endpoint
- [x] Backend-powered dashboard counts
- [x] Loading state
- [x] Error state
- [x] Pull-to-refresh

## Applications

- [x] Search
- [x] Status filtering
- [x] Sorting
- [x] Loading states
- [x] Error states
- [x] Refresh behaviour

## Backend Quality

- [x] Stronger request validation
- [x] Global exception handling
- [x] Consistent validation responses
- [x] Controller tests
- [x] User-isolation tests
- [x] Test-code cleanup

## Repository Milestone

- [x] Full-stack MVP merged into `main`
- [x] MVP tagged as `v1.1.0-mvp`
- [x] Initial project documentation added

---

# Phase 5 — Deployment & Production Readiness

**Status: Complete**

## Documentation and Repository

- [x] Project context
- [x] Architecture documentation
- [x] API reference
- [x] Development log
- [x] Roadmap
- [x] Root README
- [x] MIT licence ownership correction

## Continuous Integration

- [x] GitHub Actions
- [x] `npm ci`
- [x] TypeScript validation
- [x] Expo web export
- [x] Java 21
- [x] PostgreSQL CI service
- [x] Maven tests
- [x] Spring Boot packaging
- [x] Integration testing
- [x] Production Docker image build
- [x] Non-root container verification
- [x] Docker health verification

## Production Backend

- [x] Spring `prod` profile
- [x] Environment-based database configuration
- [x] Environment-based JWT configuration
- [x] Production CORS
- [x] Platform-provided server port
- [x] Restricted Actuator exposure
- [x] Production error handling
- [x] Flyway production validation
- [x] Render Docker deployment
- [x] HTTPS API
- [x] Health endpoint

## Production Database

- [x] Neon PostgreSQL
- [x] PostgreSQL 17
- [x] European region
- [x] SSL
- [x] Credentials outside Git
- [x] PostgreSQL portability preserved

## Production Verification

- [x] API status
- [x] Actuator health
- [x] Registration
- [x] Login
- [x] JWT authentication
- [x] Current-user profile
- [x] Application CRUD
- [x] Search
- [x] Filtering
- [x] Dashboard summary
- [x] Validation
- [x] Unauthenticated-request rejection
- [x] Cross-user isolation
- [x] Mobile-to-production smoke testing

### Phase 5 Result

ApplyMate became a deployed full-stack mobile application:

```text
Expo
  -> Render
  -> Neon PostgreSQL
```

Release tag:

```text
v1.2.0
```

---

# Phase 6 — Mobile Distribution & Release Readiness

**Status: Complete**

## 6.1 Expo Application Services

- [x] Verify EAS CLI
- [x] Connect ApplyMate to Expo Application Services
- [x] Configure `eas.json`
- [x] Define development build profile
- [x] Define preview build profile
- [x] Define production build profile
- [x] Configure EAS environments
- [x] Configure remote native versioning
- [x] Configure production auto-increment
- [x] Configure production API URL for EAS builds
- [x] Verify Expo configuration
- [x] Pass Expo Doctor

Latest result:

```text
18/18 checks passed
```

Expo project:

```text
@zaib_367/ApplyMate
```

---

## 6.2 Application Identity

- [x] Confirm application name: ApplyMate
- [x] Confirm Expo project slug
- [x] Configure permanent Android package identifier
- [x] Configure permanent iOS bundle identifier
- [x] Configure marketing version
- [x] Configure Android version-code management
- [x] Configure iOS build-number management
- [x] Add `expo-notifications` config plugin

Identifiers:

```text
Android:
com.zaib367.applymate

iOS:
com.zaib367.applymate
```

Marketing version:

```text
1.0.0
```

---

## 6.3 Backend-Synchronised Reminders

**Status: Complete**

- [x] Add reminder database persistence
- [x] Add Flyway reminder migration
- [x] Add authenticated reminder CRUD
- [x] Scope reminders to authenticated users
- [x] Synchronise mobile reminder data with backend
- [x] Preserve device-side notification scheduling
- [x] Store notification identifiers per user
- [x] Verify reminder isolation using separate accounts
- [x] Verify production reminder persistence

Architecture:

```text
Reminder record
    -> Spring Boot
    -> PostgreSQL

Notification scheduling
    -> Mobile device
    -> Expo Notifications
```

---

## 6.4 Persistent Authentication

**Status: Complete**

### Backend

- [x] Add refresh-token persistence
- [x] Add refresh-token Flyway migrations
- [x] Generate opaque refresh credentials
- [x] Store only refresh-token hashes
- [x] Add refresh-token expiry
- [x] Add refresh-token rotation
- [x] Add refresh-token families
- [x] Add revoked-token reuse handling
- [x] Add concurrency protection
- [x] Add refresh endpoint
- [x] Add logout endpoint
- [x] Add refresh-session revocation

### Mobile

- [x] Store access tokens securely
- [x] Store refresh tokens securely
- [x] Automatically refresh expired access tokens
- [x] Retry protected requests after refresh
- [x] Coordinate simultaneous refresh attempts
- [x] Restore persistent sessions
- [x] Handle expired/revoked sessions
- [x] Preserve sessions during temporary network failures
- [x] Revoke backend session during logout
- [x] Clear local credentials during logout

Production configuration:

```text
Access token:
15 minutes

Refresh session:
30 days
```

### Verification

- [x] Controlled one-minute expiry test
- [x] Silent refresh succeeded
- [x] User remained logged in
- [x] Refresh-token rotation succeeded
- [x] Production refresh test against Render/Neon
- [x] Production logout/session-revocation test

---

## 6.5 Account Deletion

**Status: Complete**

### Backend

- [x] Add authenticated account-deletion endpoint

```text
DELETE /api/v1/users/me
```

- [x] Derive user ID from authenticated JWT
- [x] Delete user-owned applications
- [x] Delete user-owned reminders
- [x] Delete refresh-token sessions
- [x] Prevent users from selecting another account for deletion

### Mobile

- [x] Add Delete Account option
- [x] Add first warning
- [x] Add final destructive confirmation
- [x] Call backend deletion endpoint
- [x] Cancel local scheduled notifications
- [x] Remove notification identifiers
- [x] Remove local settings
- [x] Remove access token
- [x] Remove refresh token
- [x] Clear authenticated state
- [x] Return to Welcome screen

### Verification

- [x] Local disposable-account deletion test
- [x] Production disposable-account deletion test
- [x] Confirm deleted credentials cannot authenticate

---

## 6.6 Privacy & Account-Deletion Information

**Status: Complete**

- [x] Create ApplyMate support/privacy email
- [x] Create public Privacy Policy
- [x] Create public account-deletion information
- [x] Create GitHub Pages landing page
- [x] Configure GitHub Pages from `main/docs`
- [x] Add Privacy Policy option inside the mobile app
- [x] Verify public Privacy Policy opens
- [x] Document in-app account deletion
- [x] Document external deletion-request route

Public support:

```text
support.applymate@gmail.com
```

Website:

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

---

## 6.7 Android Internal Distribution

**Status: Complete**

- [x] Create Android preview/internal-distribution build
- [x] Install standalone Android APK
- [x] Test production API connection
- [x] Test login
- [x] Test dashboard
- [x] Test application creation
- [x] Test application editing
- [x] Test application deletion
- [x] Test reminders
- [x] Test session restoration
- [x] Test logout
- [x] Test Privacy Policy link
- [x] Test Delete Account UI
- [x] Run final Android release-candidate smoke test

---

## 6.8 iOS Distribution

**Status: Native compilation validated; App Store distribution account-gated**

- [x] Configure permanent bundle identifier
- [x] Configure EAS project
- [x] Configure production API environment
- [x] Add `ios-simulator` EAS profile
- [x] Run credential-free native iOS Simulator EAS build
- [x] Confirm native iOS compilation succeeds
- [x] Add `ITSAppUsesNonExemptEncryption=false` declaration
- [ ] Enrol in Apple Developer Program
- [ ] Generate App Store production `.ipa`
- [ ] Test through TestFlight
- [ ] Submit to App Store

Validated Simulator build:

```text
Build ID: 9d9d5aba-6054-4693-bf57-f2647d444ed4
Version: 1.0.0
Build number: 1
Result: PASS
```

Paid Apple Developer Program enrolment is required only for App Store distribution credentials/TestFlight/submission, not for the native compilation proof already completed.

## 6.9 Release Validation

- [x] TypeScript validation
- [x] Expo Doctor
- [x] Backend Maven tests
- [x] Render deployment
- [x] Neon schema validation
- [x] Production authentication test
- [x] Production refresh-token test
- [x] Production account-deletion test
- [x] Android standalone smoke test
- [x] Privacy Policy verification
- [x] Docker validation
- [x] GitHub Actions CI
- [x] Create `v1.3.0`

### Phase 6 Result

ApplyMate gained:

- EAS mobile-build configuration
- Permanent Android and iOS identifiers
- Production API build configuration
- Android internal distribution
- Backend-synchronised reminders
- Persistent sessions
- Refresh-token rotation
- Account deletion
- Public privacy/deletion information

Release tag:

```text
v1.3.0
```

---

# Phase 7 — Public Store Release

**Status: Submission pack/build pipeline ready; developer-account submission deferred**

The product and release pipeline are prepared for store submission, but actual store submission is intentionally deferred until the relevant paid developer accounts exist.

## Google Play

- [ ] Create/verify Google Play Console developer access
- [x] Prepare Play Store metadata and descriptions
- [x] Prepare screenshot/graphic asset plan
- [x] Draft Data Safety answers from actual code/services
- [x] Supply source-controlled Privacy Policy URL
- [x] Supply source-controlled account-deletion URL
- [x] Generate/validate a production Android App Bundle
- [x] Verify existing EAS-managed Android signing credentials
- [ ] Create Play Console application
- [ ] Enable/configure Play App Signing
- [ ] Add Play App Signing SHA-1 to Google OAuth configuration before public Gmail enablement
- [ ] Configure Play submission service account
- [ ] Rebuild final AAB from frozen `v1.8.0` commit
- [ ] Upload/submit after account creation

## Apple App Store

- [ ] Enrol in Apple Developer Program
- [ ] Configure App Store Connect application record
- [x] Prepare App Store metadata and descriptions
- [x] Prepare iPhone/iPad screenshot plan
- [x] Draft App Privacy answers from actual code/services
- [x] Supply Privacy Policy URL
- [x] Verify in-app and external account deletion paths
- [x] Validate native iOS compilation via Simulator EAS build
- [ ] Generate signed App Store production `.ipa`
- [ ] Upload to TestFlight/App Store Connect
- [ ] Submit after paid account enrolment

## Gmail public availability

- [x] Confirm `gmail.readonly` remains Restricted
- [x] Keep authorised test-user Gmail flow working in preview/development
- [x] Add production feature gate
- [x] Set production `EXPO_PUBLIC_GMAIL_ENABLED=false`
- [x] Hide Gmail UI and guard scope requests in production
- [ ] Complete Google's restricted-scope production verification
- [ ] Enable public Gmail only after approval and revalidation

Store/account gates do not reopen product feature development.

# Phase 8 — Account & Authentication Improvements

**Status: Complete**

Email verification and secure password reset are complete and deployed to production.

---

## 8.1 Email Verification

**Status: Complete and deployed to production**

### Backend

- [x] Add email-delivery provider abstraction
- [x] Integrate Resend transactional email
- [x] Generate secure six-digit verification codes
- [x] Use `SecureRandom`
- [x] Store only HMAC-SHA-256 verification-code hashes
- [x] Add server-side verification pepper
- [x] Add verification-code expiry
- [x] Add failed-attempt limits
- [x] Add resend cooldown
- [x] Add issuance rate limiting
- [x] Add replacement-code behaviour
- [x] Ensure old code is invalid after resend
- [x] Add email-verification database schema
- [x] Add email-verification API
- [x] Add resend-verification API
- [x] Prevent unverified login
- [x] Prevent refresh-token verification bypass
- [x] Add structured verification API error codes
- [x] Add retry timing for cooldown/rate limiting
- [x] Preserve existing users during migration

### Frontend

- [x] Add Verify Email screen
- [x] Add six-digit numeric code entry
- [x] Add resend action
- [x] Add resend countdown
- [x] Handle backend retry timing
- [x] Persist pending verification state
- [x] Restore verification flow after app restart
- [x] Redirect unverified login attempts to verification
- [x] Clear pending state after successful verification/login
- [x] Avoid storing password or raw verification code

### Production Email Infrastructure

- [x] Purchase `applymate.website`
- [x] Verify domain in Resend
- [x] Configure DKIM
- [x] Configure SPF
- [x] Configure DMARC
- [x] Configure production sender

Production sender:

```text
ApplyMate <verify@applymate.website>
```

### Database Rollout

- [x] Add Flyway V6 — email verification
- [x] Backfill existing users as verified
- [x] Add Flyway V7 — zero-downtime compatibility
- [x] Verify existing accounts remain usable
- [x] Verify new accounts remain unverified
- [x] Add Flyway V8 — remove temporary rollout default
- [x] Confirm final production schema

Final state:

```text
Flyway: V8

email_verified_at
column_default = NULL
is_nullable    = YES
```

### Security Hardening

- [x] Detect malformed Resend credential behaviour during production test
- [x] Revoke affected production API key
- [x] Rotate production API key
- [x] Prevent secret-containing header exceptions escaping
- [x] Normalise safe outer API-key whitespace
- [x] Reject embedded whitespace/control characters
- [x] Add secret-safety regression tests
- [x] Preserve safe `VERIFICATION_EMAIL_UNAVAILABLE` behaviour

### Automated Testing

- [x] HMAC verification-code tests
- [x] Expiry tests
- [x] Failed-attempt tests
- [x] Cooldown tests
- [x] Rate-limit tests
- [x] Replacement-code tests
- [x] Transaction tests
- [x] Registration delivery-failure tests
- [x] Resend provider tests
- [x] Secret-safety regression tests
- [x] Unverified-login tests
- [x] Unverified-refresh tests
- [x] Migration compatibility tests
- [x] V8 post-rollout migration tests

Final backend result:

```text
Tests run: 89
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

### Production Verification

- [x] Existing legacy account login after migration
- [x] New account starts unverified
- [x] Verification challenge created
- [x] Real email delivered through Resend
- [x] Custom domain sender verified
- [x] Incorrect verification code rejected
- [x] Resend works
- [x] Old code invalidated after resend
- [x] New code accepted
- [x] Pending verification survives app restart
- [x] Unverified login redirects correctly
- [x] Successful verification
- [x] Login after verification
- [x] Dashboard access
- [x] Production API health after V8

Target behaviour achieved:

```text
Register
   |
   v
Verification email
   |
   v
Verify once
   |
   v
Normal email/password login
   |
   v
Persistent authenticated session
```

---

## 8.2 Password Reset

**Status: Complete and deployed to production**

### Backend

- [x] Design secure forgot-password flow
- [x] Use six-digit numeric reset codes
- [x] Generate codes using `SecureRandom`
- [x] Add separate `PASSWORD_RESET_PEPPER`
- [x] Store only HMAC-SHA-256 reset-code hashes
- [x] Bind reset-code hashes to the owning user
- [x] Add 10-minute reset-code expiry
- [x] Add five-attempt limit
- [x] Add 60-second resend cooldown
- [x] Add five-issues-per-hour rate limit
- [x] Add minimum forgot-password response duration
- [x] Prevent account enumeration
- [x] Add generic invalid/expired reset-code behaviour
- [x] Add forgot-password endpoint
- [x] Add reset-password endpoint
- [x] Revoke all refresh sessions after successful reset
- [x] Delete reset challenge after successful use
- [x] Allow unverified accounts to reset without verifying them
- [x] Roll back reset challenge when reset-email delivery fails
- [x] Send password-changed notification after successful reset
- [x] Ensure notification failure does not roll back password change

API:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

Generic reset-code error:

PASSWORD_RESET_CODE_INVALID_OR_EXPIRED
Database
 Add Flyway V9
 Add password_reset_challenges
 Store challenge expiry and attempt state
 Store resend/rate-limit state
 Enforce one challenge per user
 Cascade challenge deletion with account deletion
 Verify V9 in production

Production schema:

Flyway V9
Transactional Email
 Extract shared hardened ResendEmailClient
 Reuse Resend transport for verification and password reset
 Send six-digit password-reset email
 Send password-changed notification
 Keep provider secrets backend-only
 Use separate verification and password-reset peppers
Frontend
 Add Forgot Password navigation from Login
 Add ForgotPasswordScreen
 Add ResetPasswordScreen
 Prefill email from Login when available
 Add six-digit reset-code input
 Add new-password field
 Add confirm-password field
 Validate 8–72 character passwords
 Add resend action
 Add local resend countdown
 Display generic invalid/expired-code message
 Return to Login after successful reset
 Display password-changed success message
 Avoid persisting reset code or new password
Automated Testing
 Existing-account reset issuance
 Unknown-email generic behaviour
 Incorrect-code handling
 Expired-code handling
 Maximum-attempt enforcement
 Resend cooldown
 Hourly issue limit
 Replacement-code invalidation
 Single-use reset challenge
 Cross-user code isolation
 Password replacement
 Refresh-session revocation
 Reset-email transaction rollback
 Unverified-account state preservation
 Password-changed notification failure behaviour
 Old-password rejection
 New-password authentication

Focused result:

Tests run: 14
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS

Full backend result:

Tests run: 106
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS

Frontend:

tsc --noEmit
PASS
Production Verification
 Configure separate production password-reset pepper
 Validate cryptographic configuration fails closed
 Deploy Flyway V9
 Verify Render startup
 Verify /api/v1/status returns HTTP 200
 Verify /actuator/health returns HTTP 200
 Verify unknown valid email returns HTTP 202
 Receive real reset email
 Complete real password reset
 Confirm old password is rejected
 Confirm new password authenticates
 Receive password-changed notification

Target behaviour achieved:

Forgot Password
       |
       v
Reset email
       |
       v
Six-digit code
       |
       v
Choose new password
       |
       v
Existing refresh sessions revoked
       |
       v
Login with new password

Security requirements achieved:

Account existence is not disclosed.
Raw reset codes are never stored.
Reset credentials expire and are rate limited.
Replacement codes invalidate previous codes.
Successful reset consumes the challenge.
Existing refresh sessions are revoked.
Password reset does not imply email verification.
```

# Phase 9 — Product Automation

**Status: Partially Complete**

## 9.1 Job Link Import

**Status: Complete and deployed to production**

### Backend

- [x] Add authenticated job-import preview endpoint
- [x] Keep import preview non-persistent
- [x] Parse and canonicalise submitted URLs
- [x] Reject malformed and unsafe destinations
- [x] Reject loopback, private and link-local destinations
- [x] Revalidate redirect targets
- [x] Use domain/subdomain matching rather than substring matching
- [x] Explicitly treat LinkedIn and Indeed as unsupported
- [x] Use direct outbound connections without forwarding user cookies/auth headers
- [x] Add connection and read timeouts
- [x] Enforce a 2 MiB streaming response limit
- [x] Bound compressed/decompressed response handling
- [x] Validate supported content types
- [x] Parse Schema.org `JobPosting` JSON-LD first
- [x] Add deterministic HTML fallback extraction
- [x] Strip HTML and return plain text
- [x] Normalise/truncate fields to existing application save limits
- [x] Require a minimum extraction-confidence threshold
- [x] Return import warnings for incomplete previews
- [x] Add per-user rate limiting
- [x] Keep rate-limiter memory bounded
- [x] Avoid logging full submitted URLs/query strings
- [x] Keep the feature AI-free
- [x] Avoid database/Flyway changes

API:

```text
POST /api/v1/applications/import-preview
```

Rate limit:

```text
10 import attempts per authenticated user per 10 minutes
```

### Frontend

- [x] Reuse the existing Add Application form
- [x] Add "Import job details" workflow
- [x] Populate existing editable fields from the preview
- [x] Preserve manual editing after import
- [x] Preserve user-controlled status
- [x] Preserve user-controlled notes
- [x] Display safe import errors
- [x] Display extraction warnings
- [x] Keep manual-entry fallback available
- [x] Keep Edit Application as an edit-only workflow
- [x] Preserve unsaved Add Application drafts when navigating away
- [x] Reset Add Application after a successful save
- [x] Reuse the existing application save endpoint for persistence

### Automated Validation

Focused Job Link Import tests:

```text
38 passing
0 failures
0 errors
```

Complete backend suite:

```text
144 passing
0 failures
0 errors
```

Frontend:

```text
tsc --noEmit
PASS
```

### Production Verification

- [x] Deploy merge commit `5be432d` to Render
- [x] Verify `/api/v1/status`
- [x] Verify `/actuator/health`
- [x] Import a supported public job URL
- [x] Edit imported fields
- [x] Save imported application through existing CRUD
- [x] Verify Add form resets after successful save
- [x] Verify LinkedIn/Indeed rejection
- [x] Verify unsafe URL rejection
- [x] Verify sensitive URL query data is not echoed in the mobile error flow
- [x] Regression-test existing application editing
- [x] Regression-test existing application deletion

Target behaviour achieved:

```text
Public job URL
      |
      v
Safe authenticated import preview
      |
      v
Editable existing application form
      |
      v
User review
      |
      v
Explicit Save Application
      |
      v
PostgreSQL
```

No application record is created by the import-preview endpoint itself.

---

## 9.2 Recruitment Email Integration

**Status: Implementation complete; unrestricted public Google approval pending**

### Provider and OAuth

- [x] Gmail v1 provider
- [x] Native Google Identity Services
- [x] Exact `gmail.readonly` scope
- [x] `offlineAccess: false`
- [x] No backend Google refresh token
- [x] Android native development build
- [x] Android standalone EAS preview build
- [ ] Google restricted-scope verification for unrestricted public Gmail rollout

### Retrieval and privacy

- [x] Manual user-triggered sync
- [x] Bounded candidate-message search
- [x] Metadata-first retrieval
- [x] Conditional bounded inline text-body retrieval
- [x] No raw MIME
- [x] No attachment API
- [x] No body/snippet persistence
- [x] No Gmail message/token content through Render
- [x] No PostgreSQL Gmail storage
- [x] No Gmail backend endpoint
- [x] No Flyway migration
- [x] Processed-message deduplication
- [x] Bounded/retained local processing state

### Detection and matching

- [x] Deterministic recruitment-email detector
- [x] Deterministic application matcher
- [x] Company evidence
- [x] Job-title evidence
- [x] Sender/domain evidence
- [x] Date/chronology evidence
- [x] No AI
- [x] Suppress low-confidence/noisy unmatched suggestions

### Review workflow

- [x] Email Updates screen
- [x] Show category/confidence
- [x] Show matched application/current status
- [x] Choose existing application
- [x] Change matched application
- [x] Create missing application
- [x] Safe company/title/status prefill
- [x] Return to Email Updates after save
- [x] Ignore suggestion
- [x] Confirm suggestion
- [x] Never silently mutate application

### Current-state safety

- [x] Preserve backend `updatedAt` in frontend model
- [x] Central suggestion resolver
- [x] Prevent normal-stage regressions
- [x] Prevent automatic revival from Rejected
- [x] Block stale rejection older than latest application update
- [x] Reload current applications immediately before Confirm
- [x] Mark suggestion confirmed only after backend update succeeds

### Storage and account isolation

- [x] Gmail connection metadata in secure device storage
- [x] Processing/suggestion state in bounded AsyncStorage
- [x] Safe migration from legacy SecureStore processing blob
- [x] Namespace by ApplyMate user + Google account
- [x] Prevent same-device Gmail ownership collision
- [x] Disconnect clears Gmail state but preserves applications
- [x] Account deletion performs Gmail cleanup
- [x] Account A/B isolation verified

### Runtime hardening

- [x] Gmail API enablement verified
- [x] Empty/204 list response handling
- [x] Cached-access-token 401 recovery
- [x] Retry token refresh exactly once
- [x] No Gmail token/body logging
- [x] Keep Expo Doctor Nitro warning visible

### Release validation

- [x] Frontend typecheck
- [x] Deterministic email logic check
- [x] Expo dependency check
- [x] Expo web export
- [x] Backend Maven clean verify
- [x] Docker build/non-root/healthcheck verification
- [x] Existing ApplyMate regression
- [x] Four real-world email safety scenarios
- [x] Standalone Android preview smoke test
- [x] Production API/health revalidation

Target behaviour achieved:

```text
Gmail recruitment email
      |
      v
Local deterministic suggestion
      |
      v
User review
      |
      +-- Ignore -> nothing changes
      |
      +-- Confirm
             |
             v
      current state revalidated
             |
             v
      existing application API
```

External rollout gate:

```text
gmail.readonly is a Restricted scope
-> unrestricted public Gmail access requires Google verification
```

This approval item is external to the completed v1.7.0 implementation and must remain accurately documented until approved.

## 9.3 Future Application Automation

**Status: Future**

- [ ] Broaden supported public job-source compatibility where appropriate
- [ ] Additional email-provider support after Gmail v1
- [ ] Application activity history
- [ ] Document attachments

## 9.4 AI Assistance

**Status: Future**

- [ ] AI-assisted job-description analysis
- [ ] CV analyser
- [ ] CV-to-job matching
- [ ] Cover-letter assistance
- [ ] Application improvement suggestions

---

# Phase 10 — Notifications & Cross-Device Improvements

**Status: Future**

- [ ] Server-driven push notifications
- [ ] Cross-device notification synchronisation
- [ ] Advanced reminder recurrence
- [ ] Push-notification token management
- [ ] Notification delivery tracking where appropriate

---

# Phase 11 — Platform & Account Improvements

**Status: Future**

- [ ] Data export
- [ ] Accessibility review
- [ ] Performance monitoring
- [ ] Error monitoring
- [ ] Privacy-conscious analytics
- [ ] Additional account security controls

---

# Phase 12 — Future Integrations

**Status: Future**

- [ ] Interview-coach integration
- [ ] Additional application automation
- [ ] Calendar integrations
- [ ] Additional email workflows

---

# Current Release — v1.8.0

**Status: Final Handoff & Store Ready — final merge/tag mechanics pending**

Completed:

- [x] Full handoff audit
- [x] Independent clean-clone validation
- [x] Frontend install/typecheck/export validation
- [x] Expo dependency validation
- [x] Expo Doctor review
- [x] 144 backend tests
- [x] Maven package
- [x] Production Docker validation
- [x] Android production AAB build
- [x] iOS Simulator native build
- [x] Final deployment/handoff runbook
- [x] Store submission pack
- [x] Gmail public-release feature gate
- [x] Production Gmail disabled pending Google approval
- [x] Privacy/deletion disclosure update
- [x] Six core project documents reconciled to v1.8.0
- [ ] Run final all-gates validation on final branch
- [ ] Commit/push finalisation branch
- [ ] Merge finalisation branch to `main`
- [ ] Confirm CI green
- [ ] Rebuild final Android AAB from exact final `main` commit
- [ ] Re-run iOS Simulator validation from exact final `main` commit
- [ ] Create annotated `v1.8.0` tag
- [ ] Verify `tag == main == origin/main`
- [ ] Delete completed release branch

External gates that do not reopen product development:

- Apple Developer Program enrolment before App Store distribution
- Google Play developer account/application before Play submission
- Google restricted-scope verification before public Gmail is enabled

# Development Freeze

After the `v1.8.0` tag, the product roadmap is closed.

Permitted work:

```text
genuine bugs
store/compliance requirements
Google OAuth verification
security maintenance
provider/API maintenance
operational documentation corrections
```

Historical future phases/backlog above remain reference material only and are not approved implementation scope.
