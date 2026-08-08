# ApplyMate Roadmap

## Current Phase

**Mobile Distribution & Release Closeout**

The functional work for the current mobile-beta milestone is complete.

Current production architecture:

```text
React Native / Expo mobile application
        |
        | HTTPS
        v
Render Spring Boot API
        |
        v
Neon PostgreSQL
````

Supporting services:

```text
Expo Application Services
    -> Android builds

GitHub Pages
    -> Privacy Policy
    -> Account deletion information
```

Production API:

```text
https://applymate-api-bami.onrender.com
```

Current release tag:

```text
v1.2.0
```

Next release tag:

```text
v1.3.0
```

Remaining work before `v1.3.0`:

* Complete documentation refresh
* Update root README
* Run final frontend checks
* Run final backend checks
* Run final Docker verification
* Confirm GitHub Actions CI
* Commit documentation closeout
* Create and push `v1.3.0`

---

# Phase 1 — Frontend MVP

**Status: Complete**

* [x] React Native, Expo and TypeScript setup
* [x] ApplyMate branding and theme
* [x] Splash screen
* [x] Registration screen
* [x] Login screen
* [x] Protected navigation
* [x] Dashboard
* [x] Applications list
* [x] Application details
* [x] Create application
* [x] Edit application
* [x] Delete application
* [x] Profile screen
* [x] Settings screen
* [x] Reminder interface
* [x] Local notification scheduling
* [x] Local device preferences

---

# Phase 2 — Backend MVP

**Status: Complete**

* [x] Spring Boot backend
* [x] PostgreSQL database
* [x] Docker Compose development database
* [x] Flyway migrations
* [x] User registration
* [x] Secure password hashing
* [x] Login
* [x] JWT access tokens
* [x] Protected API routes
* [x] Current-user profile
* [x] Job-application persistence
* [x] Application CRUD
* [x] Per-user application ownership
* [x] User-isolation protection
* [x] Backend validation
* [x] Consistent API errors
* [x] Automated backend tests

---

# Phase 3 — Frontend and Backend Integration

**Status: Complete**

* [x] Environment-based API URL
* [x] Central API client
* [x] Secure native token storage
* [x] Browser token-storage fallback
* [x] Backend registration
* [x] Backend login
* [x] Backend current-user profile
* [x] Backend-powered application CRUD
* [x] Session restoration
* [x] Invalid-session handling
* [x] Local-development smoke testing

---

# Phase 4 — MVP Polish

**Status: Complete**

## Dashboard

* [x] Backend dashboard-summary endpoint
* [x] Backend-powered dashboard counts
* [x] Loading state
* [x] Error state
* [x] Pull-to-refresh

## Applications

* [x] Search
* [x] Status filtering
* [x] Sorting
* [x] Loading states
* [x] Error states
* [x] Refresh behaviour

## Backend Quality

* [x] Stronger request validation
* [x] Global exception handling
* [x] Consistent validation responses
* [x] Controller tests
* [x] User-isolation tests
* [x] Test-code cleanup

## Repository Milestone

* [x] Full-stack MVP merged into `main`
* [x] MVP tagged as `v1.1.0-mvp`
* [x] Initial project documentation added

---

# Phase 5 — Deployment & Production Readiness

**Status: Complete**

## Documentation and Repository

* [x] Project context
* [x] Architecture documentation
* [x] API reference
* [x] Development log
* [x] Roadmap
* [x] Root README
* [x] MIT licence ownership correction

## Continuous Integration

* [x] GitHub Actions
* [x] `npm ci`
* [x] TypeScript validation
* [x] Expo web export
* [x] Java 21
* [x] PostgreSQL CI service
* [x] Maven tests
* [x] Spring Boot packaging
* [x] Integration testing
* [x] Production Docker image build
* [x] Non-root container verification
* [x] Docker health verification

## Production Backend

* [x] Spring `prod` profile
* [x] Environment-based database configuration
* [x] Environment-based JWT configuration
* [x] Production CORS
* [x] Platform-provided server port
* [x] Restricted Actuator exposure
* [x] Production error handling
* [x] Flyway production validation
* [x] Render Docker deployment
* [x] HTTPS API
* [x] Health endpoint

## Production Database

* [x] Neon PostgreSQL
* [x] PostgreSQL 17
* [x] Frankfurt region
* [x] SSL
* [x] Credentials outside Git
* [x] PostgreSQL portability preserved

## Production Verification

* [x] API status
* [x] Actuator health
* [x] Registration
* [x] Login
* [x] JWT authentication
* [x] Current-user profile
* [x] Application CRUD
* [x] Search
* [x] Filtering
* [x] Dashboard summary
* [x] Validation
* [x] Unauthenticated-request rejection
* [x] Cross-user isolation
* [x] Mobile-to-production smoke testing

### Phase 5 Result

ApplyMate became a deployed full-stack mobile application with:

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

**Status: Functional work complete — release closeout in progress**

---

## 6.1 Expo Application Services

* [x] Verify EAS CLI
* [x] Connect ApplyMate to Expo Application Services
* [x] Configure `eas.json`
* [x] Define development build profile
* [x] Define preview build profile
* [x] Define production build profile
* [x] Configure EAS environments
* [x] Configure remote native versioning
* [x] Configure production auto-increment
* [x] Configure production API URL for EAS builds
* [x] Verify Expo configuration
* [x] Pass Expo Doctor

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

* [x] Confirm application name: ApplyMate
* [x] Confirm Expo project slug
* [x] Configure permanent Android package identifier
* [x] Configure permanent iOS bundle identifier
* [x] Configure marketing version
* [x] Configure Android version-code management
* [x] Configure iOS build-number management
* [x] Add `expo-notifications` config plugin

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

* [x] Add reminder database persistence
* [x] Add Flyway reminder migration
* [x] Add authenticated reminder CRUD
* [x] Scope reminders to authenticated users
* [x] Synchronise mobile reminder data with backend
* [x] Preserve device-side notification scheduling
* [x] Store notification identifiers per user
* [x] Verify reminder isolation using separate accounts
* [x] Verify production reminder persistence

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

* [x] Add refresh-token persistence
* [x] Add refresh-token Flyway migrations
* [x] Generate opaque refresh credentials
* [x] Store only refresh-token hashes
* [x] Add refresh-token expiry
* [x] Add refresh-token rotation
* [x] Add refresh-token families
* [x] Add revoked-token reuse handling
* [x] Add concurrency protection
* [x] Add refresh endpoint
* [x] Add logout endpoint
* [x] Add refresh-session revocation

### Mobile

* [x] Store access tokens securely
* [x] Store refresh tokens securely
* [x] Automatically refresh expired access tokens
* [x] Retry protected requests after refresh
* [x] Coordinate simultaneous refresh attempts
* [x] Restore persistent sessions
* [x] Handle truly expired/revoked sessions
* [x] Preserve session during temporary network failures
* [x] Revoke backend session during logout
* [x] Clear local credentials during logout

Production configuration:

```text
Access token:
1 hour

Refresh session:
30 days
```

### Verification

* [x] Controlled one-minute expiry test
* [x] Silent refresh succeeded
* [x] User remained logged in
* [x] Refresh-token rotation succeeded
* [x] Production refresh test against Render/Neon
* [x] Production logout/session-revocation test

---

## 6.5 Account Deletion

**Status: Complete**

### Backend

* [x] Add authenticated account-deletion endpoint

```text
DELETE /api/v1/users/me
```

* [x] Derive user ID from authenticated JWT
* [x] Delete user-owned applications
* [x] Delete user-owned reminders
* [x] Delete refresh-token sessions
* [x] Prevent users from selecting another account for deletion

### Mobile

* [x] Add Delete Account option
* [x] Add first warning
* [x] Add final destructive confirmation
* [x] Call backend deletion endpoint
* [x] Cancel local scheduled notifications
* [x] Remove notification identifiers
* [x] Remove local settings
* [x] Remove access token
* [x] Remove refresh token
* [x] Clear authenticated state
* [x] Return to Welcome screen

### Verification

* [x] Local disposable-account deletion test
* [x] Production disposable-account deletion test
* [x] Confirm deleted credentials cannot authenticate

---

## 6.6 Privacy & Account-Deletion Information

**Status: Complete**

* [x] Create ApplyMate support/privacy email
* [x] Create public Privacy Policy
* [x] Create public account-deletion information
* [x] Create GitHub Pages landing page
* [x] Configure GitHub Pages from `main/docs`
* [x] Add Privacy Policy option inside the mobile app
* [x] Verify public Privacy Policy opens
* [x] Document in-app account deletion
* [x] Document external deletion-request route

Public support:

```text
support.applymate@gmail.com
```

Website:

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

---

## 6.7 Android Internal Distribution

**Status: Complete for current beta milestone**

* [x] Create Android preview/internal-distribution build
* [x] Install standalone Android APK
* [x] Test production API connection
* [x] Test login
* [x] Test dashboard
* [x] Test application creation
* [x] Test application editing
* [x] Test application deletion
* [x] Test reminders
* [x] Test session restoration
* [x] Test logout
* [x] Test Privacy Policy link
* [x] Test Delete Account UI
* [x] Run final Android release-candidate smoke test

Final Android release-candidate testing passed.

Standalone testing during this phase used the configured Android test emulator.

Physical-device/public Play testing can be performed during the public-release phase.

---

## 6.8 iOS Distribution

**Status: Configuration complete; standalone distribution deferred**

* [x] Configure permanent bundle identifier
* [x] Configure EAS project
* [x] Configure production API environment
* [x] Test development flow using Expo Go
* [x] Review Apple Developer requirements
* [ ] Enrol in Apple Developer Program
* [ ] Generate standalone iOS build
* [ ] Test through TestFlight
* [ ] Submit to App Store

Standalone iOS/TestFlight/App Store distribution requires paid Apple Developer Program enrolment.

This was intentionally deferred and does not block the current Android beta/portfolio milestone.

---

## 6.9 Release Validation

* [x] TypeScript validation
* [x] Expo Doctor
* [x] Backend Maven tests
* [x] 40 backend tests passing
* [x] Render deployment
* [x] Neon schema validation
* [x] Production authentication test
* [x] Production refresh-token test
* [x] Production account-deletion test
* [x] Android standalone smoke test
* [x] Privacy Policy verification
* [ ] Final Docker validation after documentation closeout
* [ ] Final GitHub Actions CI
* [ ] Create `v1.3.0`

---

## Phase 6 Completion Result

The **functional implementation** for Mobile Distribution & Release Readiness is complete.

ApplyMate now includes:

* EAS mobile-build configuration
* Permanent Android and iOS identifiers
* Production API build configuration
* Android internal distribution
* Backend-synchronised reminders
* Local notifications
* Persistent authenticated sessions
* Refresh-token rotation
* Secure token storage
* Session revocation
* Account deletion
* Public Privacy Policy
* Public account-deletion information
* Production backend/database
* Android release-candidate smoke testing

Remaining work is release administration only:

```text
Documentation
    ->
Final validation
    ->
CI
    ->
v1.3.0
```

---

# Phase 7 — Public Store Release

**Status: Future**

This phase is intentionally separate from the current internal/beta release milestone.

## Google Play

* [ ] Create or verify Google Play Console developer access
* [ ] Prepare Play Store listing
* [ ] Prepare store description
* [ ] Prepare screenshots
* [ ] Prepare promotional assets
* [ ] Complete Data Safety questionnaire
* [ ] Supply Privacy Policy URL
* [ ] Supply account-deletion URL
* [ ] Generate production Android App Bundle
* [ ] Upload to Play Console
* [ ] Configure internal/closed testing
* [ ] Complete physical-device testing where required
* [ ] Resolve Play review/testing issues
* [ ] Submit public release

## Apple App Store

* [ ] Enrol in Apple Developer Program
* [ ] Configure App Store Connect
* [ ] Generate iOS distribution build
* [ ] Upload to TestFlight
* [ ] Test on authorised physical iOS devices
* [ ] Prepare App Store listing
* [ ] Prepare screenshots
* [ ] Complete App Privacy information
* [ ] Supply Privacy Policy URL
* [ ] Verify account deletion
* [ ] Resolve App Review issues
* [ ] Submit public release

---

# Phase 8 — Account & Authentication Improvements

**Status: Future**

## Email Verification

* [ ] Add email-delivery provider
* [ ] Generate secure six-digit OTPs
* [ ] Store OTP verification records securely
* [ ] Add OTP expiry
* [ ] Add verification-attempt limits
* [ ] Add resend cooldown/rate limiting
* [ ] Add email-verification API
* [ ] Add Verify Email screen
* [ ] Prevent unverified accounts from normal access
* [ ] Test complete registration-verification flow

Target behaviour:

```text
Register
   ->
Email OTP
   ->
Verify once
   ->
Normal email/password login thereafter
```

## Password Reset

* [ ] Add forgot-password flow
* [ ] Add secure reset verification
* [ ] Add password reset endpoint
* [ ] Add password-reset mobile screens
* [ ] Revoke existing sessions after password reset where appropriate

---

# Future Product Backlog

**Status: Deferred**

## Job Application Automation

* [ ] Job-link import
* [ ] Job-description extraction
* [ ] Job-board import
* [ ] Email-based application import
* [ ] Application activity history
* [ ] Document attachments

## AI Assistance

* [ ] Job-description parser
* [ ] CV analyser
* [ ] CV-to-job matching
* [ ] Cover-letter assistance
* [ ] Application improvement suggestions

## Reminder & Notification Improvements

* [ ] Cross-device notification synchronisation
* [ ] Server-driven push notifications
* [ ] Advanced reminder recurrence

## Account & Platform Improvements

* [ ] Data export
* [ ] Accessibility review
* [ ] Performance monitoring
* [ ] Error monitoring
* [ ] Privacy-conscious analytics

## Future Integration

* [ ] Interview-coach integration
* [ ] Additional automation workflows

---

# Current Immediate Task

Complete the `v1.3.0` release closeout:

1. Finish shared project documentation.
2. Update the root README.
3. Run final frontend checks.
4. Run final backend tests.
5. Run final Docker checks.
6. Confirm GitHub Actions CI.
7. Commit and push the documentation closeout.
8. Create and push release tag `v1.3.0`.

After that, the Mobile Distribution & Release Readiness milestone is formally complete.
