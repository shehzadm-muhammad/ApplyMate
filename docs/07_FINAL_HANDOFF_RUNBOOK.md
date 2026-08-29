# ApplyMate — Final Handoff & Deployment Runbook

## Purpose

This document is the authoritative operational handoff guide for ApplyMate.

It is intended to allow a competent developer who has repository access and the required service-account access to:

* clone the repository;
* build and validate the frontend;
* build, test and package the backend;
* run ApplyMate locally;
* deploy the Spring Boot API;
* connect the production PostgreSQL database;
* maintain transactional email;
* build native Android and iOS releases;
* configure Google/Gmail integration;
* verify production health;
* recover or roll back a failed release;
* prepare store binaries for submission.

No secret values are contained in this document.

Where another project document conflicts with this runbook on operational deployment procedure, this runbook is the deployment source of truth.

---

# 1. Release State

Current release:

```text
v1.8.0
```

Previous release:

```text
v1.7.0
```

v1.7.0 baseline tag/commit:

```text
092f523427a19b8b55896d2701fe000249221dac
```

Store marketing version:

```text
1.0.0
```

v1.8.0 is the **Final Handoff & Store Readiness** release.

Release-content merge commit:

```text
7f9078d54bb736f2fb0830837c0fd261ec212a7a
```

The annotated `v1.8.0` tag must identify the exact frozen `main` release commit after required CI and final native validation. The durable closure invariant is:

```text
v1.8.0 tag == main == origin/main
```

For v1.8.0 and later, product feature development is frozen except for genuine bugs, store/compliance work, Google OAuth verification, security maintenance and provider-required maintenance.

---

# 2. Repository

Repository:

```text
https://github.com/shehzadm-muhammad/ApplyMate.git
```

Primary stable branch:

```text
main
```

Production deployments must be based on reviewed commits merged into `main`.

Do not deploy an uncommitted local working tree.

---

# 3. Architecture

ApplyMate is a full-stack mobile job-application tracker.

Primary components:

```text
React Native / Expo mobile client
        |
        | HTTPS / JSON
        v
Spring Boot API on Render
        |
        +------ PostgreSQL on Neon
        |
        +------ Resend transactional email
        |
        +------ supported public job websites
```

Gmail integration follows a separate direct-device architecture:

```text
ApplyMate mobile client
        |
        | Google OAuth
        | gmail.readonly
        v
Google Identity Services / Gmail API
```

Gmail message data does not pass through the ApplyMate Spring Boot backend.

The backend is the authoritative store for:

* user accounts;
* email-verification state;
* password-reset challenges;
* refresh sessions;
* applications;
* reminders.

Device-local storage is used for:

* access/refresh-token client storage;
* local notification identifiers/settings;
* Gmail connection metadata;
* Gmail recruitment-email processing state.

Gmail OAuth is configured with:

```text
offlineAccess: false
```

ApplyMate therefore does not intentionally obtain a long-lived Gmail refresh token for backend/offline Gmail processing.

---

# 4. Technology Baseline

## Frontend

```text
React Native 0.81.5
React 19.1
Expo SDK 54
TypeScript 5.9
React Navigation 7
Expo SecureStore
Expo Notifications
AsyncStorage
react-native-nitro-google-signin
```

## Backend

```text
Java 21
Spring Boot 4.1
Maven Wrapper
Spring Security
Spring Data JPA / Hibernate
Flyway
PostgreSQL 17
HikariCP
```

## Infrastructure

```text
GitHub
GitHub Actions
GitHub Pages
Expo Application Services
Render
Neon
Resend
Google Cloud / Google Auth Platform
Google Gmail API
DNS / domain provider for applymate.website
```

---

# 5. Developer Prerequisites

Required:

```text
Git
Node.js >= 20.19
npm
Java 21
Docker Desktop / Docker Engine
PowerShell or equivalent shell
```

Validated frontend toolchain during final handoff testing:

```text
Node 24.18.0
npm 11.16.0
```

Java 21 is the authoritative backend JDK even if newer JDKs are installed locally.

EAS CLI may be run without a permanent global install:

```powershell
npx --yes eas-cli@latest --version
```

For Android device/native development, install:

```text
Android Studio / Android SDK
```

For cloud EAS builds, a local Android SDK is not required.

A Mac is not required for EAS cloud iOS builds or EAS Submit.

---

# 6. Fresh Clone

```powershell
git clone https://github.com/shehzadm-muhammad/ApplyMate.git
cd ApplyMate
```

Verify:

```powershell
git status -sb
git log -1 --oneline --decorate
```

A clean clone must not contain:

```text
.env
.env.local
node_modules
backend/.env
backend/target
dist
```

Never copy another developer's local environment files, build output or `node_modules` into a fresh checkout.

---

# 7. Frontend Local Configuration

Create the frontend environment file from the committed template:

```powershell
Copy-Item .env.example .env.local
```

Default template:

```text
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_GMAIL_ENABLED=false
```

For a physical device talking to a backend on the developer's PC, use an accessible LAN URL instead of localhost.

`EXPO_PUBLIC_GMAIL_ENABLED` is a build-time/public configuration value, not a secret. Only the exact string `true` enables Gmail. Missing/other values fail safe to disabled.

Authorised Gmail development testing may set the ignored local `.env.local` value to `true`. Unrestricted production must remain `false` until Google restricted-scope approval.

Production EAS builds receive their values from the EAS `production` environment rather than from a developer's ignored local file.

Current production API endpoint:

```text
https://applymate-api-bami.onrender.com
```

`EXPO_PUBLIC_*` variables are embedded/client-visible and must never contain secrets.

---

# 8. Frontend Build and Validation

Install exactly from the lockfile:

```powershell
npm ci
```

TypeScript:

```powershell
npm run typecheck
```

Expo dependency compatibility:

```powershell
npx expo install --check
```

Expo Doctor:

```powershell
npx expo-doctor
```

Known accepted SDK 54 warning:

```text
react-native-nitro-google-signin
Untested on New Architecture
```

This warning has been left visible rather than suppressed.

Native Android Google Sign-In and Gmail integration have nevertheless passed real EAS native builds and device smoke tests.

Web export:

```powershell
npm run build:web
```

Gmail deterministic integration logic:

```powershell
npx --yes tsx src/scripts/emailIntegrationLogicCheck.ts
```

Final handoff clean-clone validation on 29 August 2026 passed:

```text
npm ci                  PASS
TypeScript              PASS
Expo dependencies       PASS
Expo Doctor             17/18, known warning only
Web export              PASS
Gmail logic check       PASS
```

---

# 9. Backend Local Environment

Create:

```powershell
Copy-Item .\\backend\\.env.example .\\backend\\.env
```

Never commit `backend/.env`.

Generate independent cryptographically random values for:

```text
JWT_SECRET
EMAIL_VERIFICATION_PEPPER
PASSWORD_RESET_PEPPER
```

The three values must not be reused for one another.

For local PostgreSQL, configure:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORT
```

Transactional email defaults to disabled locally.

---

# 10. Local PostgreSQL

From:

```text
backend/
```

run:

```powershell
docker compose up -d
docker compose ps
```

Routine shutdown without deleting data:

```powershell
docker compose down
```

WARNING:

```powershell
docker compose down -v
```

deletes the Compose-managed PostgreSQL volume and therefore destroys that local database.

Use `-v` only when intentionally resetting local data.

## Multiple repository clones

Docker Compose derives resource names from its project name.

When running multiple ApplyMate clones on the same computer, use a unique Compose project name to prevent database-volume collisions:

```powershell
docker compose -p applymate-mytest up -d
```

and clean up that exact project using:

```powershell
docker compose -p applymate-mytest down -v
```

Do not assume separate checkout directories automatically guarantee isolated Docker volumes.

---

# 11. Backend Development

Use Java 21.

From:

```text
backend/
```

start PostgreSQL first, then run:

```powershell
.\\mvnw.cmd spring-boot:run
```

Local API:

```text
http://localhost:8080
```

Status:

```text
GET /api/v1/status
```

Health:

```text
GET /actuator/health
```

---

# 12. Backend Test and Package Commands

Full verification:

```powershell
.\\mvnw.cmd --batch-mode --no-transfer-progress clean verify
```

Expected final handoff result:

```text
Tests run: 144
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Package:

```powershell
.\\mvnw.cmd --batch-mode --no-transfer-progress clean package
```

Expected artifact:

```text
backend/target/backend-1.0.0.jar
```

---

# 13. Production Docker Image

From repository root:

```powershell
docker build --pull --tag applymate-backend:local .\\backend
```

The production image:

* builds with Maven + Temurin Java 21;
* runs with Temurin Java 21 JRE;
* uses a non-root `applymate` user;
* activates the Spring `prod` profile;
* exposes the API;
* contains an Actuator health check.

Verify runtime user:

```powershell
docker image inspect applymate-backend:local --format '{{.Config.User}}'
```

Expected:

```text
applymate
```

Verify health configuration:

```powershell
docker image inspect applymate-backend:local --format '{{json .Config.Healthcheck.Test}}'
```

---

# 14. Environment Variable Inventory

## Frontend / Expo

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Yes | No | Base URL used by the mobile/web client for the ApplyMate API. |
| `EXPO_PUBLIC_GMAIL_ENABLED` | Yes for EAS release environments | No | Build-time Gmail availability gate. Must be `false` for unrestricted production until Google approves the restricted `gmail.readonly` scope. |

Authoritative EAS values:

```text
production  = false
preview     = true
development = true
```

## Local PostgreSQL

| Variable            | Required locally | Secret | Purpose                              |
| ------------------- | ---------------- | ------ | ------------------------------------ |
| `POSTGRES_DB`       | Yes              | No     | Local PostgreSQL database name.      |
| `POSTGRES_USER`     | Yes              | No     | Local PostgreSQL role.               |
| `POSTGRES_PASSWORD` | Yes              | Yes    | Local PostgreSQL password.           |
| `POSTGRES_PORT`     | Yes              | No     | Host port mapped to PostgreSQL 5432. |

## Production database

| Variable                   | Required in production | Secret             | Purpose                                             |
| -------------------------- | ---------------------- | ------------------ | --------------------------------------------------- |
| `DB_URL`                   | Yes                    | Treat as sensitive | JDBC PostgreSQL URL for Neon.                       |
| `DB_USERNAME`              | Yes                    | Sensitive          | Production database role.                           |
| `DB_PASSWORD`              | Yes                    | Yes                | Production database password.                       |
| `DB_MAX_POOL_SIZE`         | No                     | No                 | Hikari maximum connection-pool size; default 10.    |
| `DB_MIN_IDLE`              | No                     | No                 | Hikari minimum idle connections; default 1.         |
| `DB_CONNECTION_TIMEOUT_MS` | No                     | No                 | Hikari connection timeout; default 30000 ms.        |
| `DB_MAX_LIFETIME_MS`       | No                     | No                 | Hikari connection max lifetime; default 1800000 ms. |

## Spring / HTTP

| Variable                           | Required           | Secret | Purpose                                                      |
| ---------------------------------- | ------------------ | ------ | ------------------------------------------------------------ |
| `SPRING_PROFILES_ACTIVE`           | Production         | No     | Must use `prod` for production deployment.                   |
| `PORT`                             | Production runtime | No     | HTTP listening port supplied/configured by hosting platform. |
| `APP_CORS_ALLOWED_ORIGIN_PATTERNS` | Production         | No     | Allowed browser-origin patterns for CORS.                    |

## Authentication

| Variable               | Required | Secret | Purpose                                            |
| ---------------------- | -------- | ------ | -------------------------------------------------- |
| `JWT_SECRET`           | Yes      | Yes    | HMAC signing secret for JWT access tokens.         |
| `JWT_ACCESS_TOKEN_TTL` | No       | No     | Access-token lifetime; production default `PT15M`. |
| `REFRESH_TOKEN_TTL`    | No       | No     | Refresh-session lifetime; default `P30D`.          |

## Email verification

| Variable                                   | Required | Secret | Purpose                                             |
| ------------------------------------------ | -------- | ------ | --------------------------------------------------- |
| `EMAIL_VERIFICATION_PEPPER`                | Yes      | Yes    | HMAC pepper for verification codes.                 |
| `EMAIL_VERIFICATION_CODE_TTL`              | No       | No     | Verification-code lifetime; default `PT10M`.        |
| `EMAIL_VERIFICATION_RESEND_COOLDOWN`       | No       | No     | Minimum resend interval; default `PT60S`.           |
| `EMAIL_VERIFICATION_MAX_ATTEMPTS`          | No       | No     | Maximum incorrect attempts; default `5`.            |
| `EMAIL_VERIFICATION_ISSUE_WINDOW`          | No       | No     | Verification issue-rate window; default `PT1H`.     |
| `EMAIL_VERIFICATION_MAX_ISSUES_PER_WINDOW` | No       | No     | Maximum issued codes per issue window; default `5`. |

## Password reset

| Variable                                   | Required | Secret | Purpose                                                    |
| ------------------------------------------ | -------- | ------ | ---------------------------------------------------------- |
| `PASSWORD_RESET_PEPPER`                    | Yes      | Yes    | HMAC pepper for password-reset codes.                      |
| `PASSWORD_RESET_CODE_TTL`                  | No       | No     | Reset-code lifetime; default `PT10M`.                      |
| `PASSWORD_RESET_RESEND_COOLDOWN`           | No       | No     | Minimum reset resend interval; default `PT60S`.            |
| `PASSWORD_RESET_MAX_ATTEMPTS`              | No       | No     | Maximum reset-code attempts; default `5`.                  |
| `PASSWORD_RESET_ISSUE_WINDOW`              | No       | No     | Reset-code rate-limit window; default `PT1H`.              |
| `PASSWORD_RESET_MAX_ISSUES_PER_WINDOW`     | No       | No     | Maximum reset codes per issue window; default `5`.         |
| `PASSWORD_RESET_MINIMUM_RESPONSE_DURATION` | No       | No     | Minimum forgot-password response duration; default `PT1S`. |

## Transactional email

| Variable                | Required            | Secret | Purpose                                            |
| ----------------------- | ------------------- | ------ | -------------------------------------------------- |
| `EMAIL_PROVIDER`        | Production          | No     | `resend` in production; may be `disabled` locally. |
| `EMAIL_FROM`            | When email enabled  | No     | Verified From identity used for ApplyMate mail.    |
| `RESEND_API_KEY`        | When Resend enabled | Yes    | Server-side Resend API credential.                 |
| `EMAIL_CONNECT_TIMEOUT` | No                  | No     | Provider HTTP connection timeout; default `PT5S`.  |
| `EMAIL_READ_TIMEOUT`    | No                  | No     | Provider HTTP read timeout; default `PT10S`.       |

No secret should ever be committed to Git, embedded into a mobile build or included in screenshots/documentation.

---

# 15. Production Backend — Render

Current API:

```text
https://applymate-api-bami.onrender.com
```

The backend is deployed as a Render Web Service using Docker and the GitHub repository.

Recreation settings:

```text
Source:           GitHub repository
Branch:           main
Runtime:          Docker
Root directory:   backend
Dockerfile:       Dockerfile
Health path:      /actuator/health
Spring profile:   prod
```

Equivalent Render configuration using repository root plus `backend/Dockerfile` is also valid, but a recreated service must use one consistent path model.

Set production environment variables in Render's environment settings.

Do not store production values in committed `.env` files.

Recommended explicit runtime value:

```text
PORT=8080
```

Production deploy sequence:

```text
push/merge reviewed commit to main
        |
        v
Render builds backend/Dockerfile
        |
        v
Spring starts with prod profile
        |
        v
Flyway validates/applies migrations
        |
        v
Hibernate validates schema
        |
        v
/actuator/health succeeds
        |
        v
new Render instance receives traffic
```

Never place secret environment variables in Docker `ARG` instructions.

---

# 16. Production Database — Neon

Provider:

```text
Neon
```

Database engine:

```text
PostgreSQL 17
```

Application database:

```text
applymate
```

Neon connections require TLS/SSL.

Retrieve the production connection information from the Neon project dashboard rather than from source control.

Render uses the JDBC-compatible connection information through:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Do not expose the Neon connection string to the mobile application.

---

# 17. Flyway Behaviour

Flyway is the only supported production schema-migration mechanism.

Current production schema level entering final handoff:

```text
V9
```

Migration files live under:

```text
backend/src/main/resources/db/migration/
```

Production configuration:

```text
spring.flyway.enabled=true
spring.flyway.clean-disabled=true
spring.jpa.hibernate.ddl-auto=validate
```

Rules:

1. Never manually modify `flyway_schema_history`.
2. Never rename or edit a migration already applied in production.
3. Never run Flyway `clean` against production.
4. Future schema changes must use a new forward migration.
5. A deployment must not be considered healthy until Flyway and Hibernate validation complete successfully.

---

# 18. Resend / Transactional Email

Provider:

```text
Resend
```

Verified sending domain:

```text
applymate.website
```

Production sender:

```text
ApplyMate <verify@applymate.website>
```

Production email functions:

* new-account verification;
* password-reset codes;
* password-changed notification.

Required production values:

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=<verified ApplyMate sender>
RESEND_API_KEY=<secret stored in Render>
```

Prefer a Resend API key restricted to **Sending access** and, where supported, restricted to the ApplyMate sending domain.

Never put `RESEND_API_KEY` into Expo/EAS client variables.

If an API key is rotated:

1. create the new Resend key;
2. update `RESEND_API_KEY` in Render;
3. deploy/restart the backend;
4. verify a real transactional email;
5. revoke the old key.

---

# 19. applymate.website and DNS

`applymate.website` is an operational production dependency.

The domain currently supports ApplyMate transactional email through Resend.

DNS management must retain the records required for:

* SPF;
* DKIM;
* DMARC;
* Resend mail routing/verification;
* any future Google ownership/domain verification records;
* any future custom website mapping.

Do not delete or replace mail DNS records when adding web or Google verification records unless their interaction has been checked first.

The handoff developer requires access to the domain registrar/DNS provider.

The domain account itself, not just the DNS values, is part of the production handoff.

---

# 20. Public Web Pages

Current GitHub Pages site:

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

Support/privacy contact:

```text
support.applymate@gmail.com
```

These pages are source-controlled under:

```text
docs/
```

Store listing and Google OAuth URLs must point to live public HTTPS pages.

The privacy/deletion pages must be updated whenever the app's actual data practices change.

---

# 21. Gmail / Google Cloud Architecture

ApplyMate uses:

```text
https://www.googleapis.com/auth/gmail.readonly
```

This is requested only for the user-triggered recruitment-email integration.

The mobile client talks directly to Google.

The backend does not receive Gmail:

* access tokens;
* message bodies;
* snippets;
* raw MIME;
* provider credentials.

Current Web OAuth client ID used by the native integration:

```text
780981050021-h0ev6qpqndcftpc3eh6tj6f5otkcu6cf.apps.googleusercontent.com
```

Current iOS Google URL scheme:

```text
com.googleusercontent.apps.780981050021-uvq5g4ggvhouj53gdgbjihl1onqc9aah
```

Permanent package identifiers:

```text
Android: com.zaib367.applymate
iOS:     com.zaib367.applymate
```

The OAuth client IDs are identifiers, not secrets.

No Google OAuth client secret belongs in the React Native application.

---

# 22. Google Cloud / Gmail Configuration Handoff

The receiving developer requires access to the Google Cloud project containing the ApplyMate OAuth clients.

Required project configuration includes:

* Gmail API enabled;
* Google Auth Platform branding configured;
* External audience;
* correct support/developer contact addresses;
* OAuth clients matching Android/iOS/web integration;
* `gmail.readonly` listed in Data Access;
* authorised test users while the app remains in testing;
* production privacy-policy/homepage URLs;
* verified domains when required;
* verification status visible in Google's Verification Center.

The exact Google Cloud project ID is account-managed information and must be visible to the receiving developer through Google Cloud access.

Do not share an owner's Google password.

Grant the developer an appropriate Cloud IAM role instead.

---

# 23. Gmail Public-Release Restriction

`gmail.readonly` is a Restricted Google OAuth scope.

Current ApplyMate public-release status:

```text
Google restricted-scope approval: not evidenced/complete
Production Gmail availability:    disabled
Authorised test builds:            enabled
```

Release gate:

```text
EXPO_PUBLIC_GMAIL_ENABLED
```

Authoritative values:

```text
production  = false
preview     = true
development = true
```

When production is disabled:

* Profile does not render Gmail controls.
* `connectGmail` exits before Google authorization.
* Gmail token retrieval/sync exits before restricted-scope authorization.
* Gmail authorization refresh exits before restricted-scope requests.
* Disconnect/cleanup remains available for previously connected test state.

The production-like web export was checked and contained no `Connect Gmail` / `Email integration` UI wording.

Do not enable production Gmail merely because authorised test users work. Enable it only after Google has approved the necessary production access and the release has been revalidated.

Google verification materials should include the public homepage, updated Privacy Policy, requested scope, justification, complete consent flow, demonstration/reviewer instructions and current developer contacts.

Based on the present direct-device architecture, restricted Gmail data is not routed through an ApplyMate/third-party server. If that architecture changes, security-assessment obligations must be re-evaluated; Google's verification team remains authoritative.

---

# 24. Google Play Signing and Gmail

The Android application uses:

```text
com.zaib367.applymate
```

EAS currently holds the Android build keystore.

A successful production AAB was generated during final handoff validation using the existing EAS-managed keystore.

After a Google Play application is created and Play App Signing is enabled, obtain the **Play App Signing SHA-1 certificate fingerprint** from Play Console and ensure the appropriate Android OAuth configuration in Google Cloud recognises that signing identity before Gmail is made publicly available.

Do not confuse:

```text
EAS upload/build keystore certificate
```

with:

```text
Google Play App Signing certificate
```

The Play-delivered binary is signed with the Play signing certificate.

---

# 25. Expo / EAS Project

Project:

```text
@zaib_367/ApplyMate
```

EAS project ID:

```text
51084402-f9c2-459f-b2ee-d97854a31c0e
```

Permanent application identifiers:

```text
Android: com.zaib367.applymate
iOS:     com.zaib367.applymate
```

Production environment:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
EXPO_PUBLIC_GMAIL_ENABLED=false
```

Preview environment:

```text
EXPO_PUBLIC_API_URL=https://applymate-api-bami.onrender.com
EXPO_PUBLIC_GMAIL_ENABLED=true
```

Development environment:

```text
EXPO_PUBLIC_GMAIL_ENABLED=true
```

Do not copy ignored local `.env.local` into EAS. Manage cloud values through EAS environment-variable commands/dashboard.

---

# 26. EAS Build Profiles

Current profiles:

## development

Purpose:

```text
development client
internal distribution
```

## preview

Purpose:

```text
standalone internal testing
preview EAS environment
```

## ios-simulator

Purpose:

```text
native iOS compilation/testing without App Store distribution credentials
production EAS environment
ios.simulator=true
```

## production

Purpose:

```text
store distribution
production EAS environment
remote version auto-increment
```

`appVersionSource` is:

```text
remote
```

EAS therefore owns native build-number/version-code progression.

---

# 27. Native Validation Evidence

Final handoff validation successfully produced:

## Android

```text
Build ID:
b4f877a4-7120-4af2-b5b1-cb8c0f933675
Profile:
production
Distribution:
store
Version:
1.0.0
Version code:
2
```

Result:

```text
AAB build successful
```

## iOS Simulator

```text
Build ID:
9d9d5aba-6054-4693-bf57-f2647d444ed4
Profile:
ios-simulator
Version:
1.0.0
Build number:
1
```

Result:

```text
native iOS Simulator compilation successful
```

The simulator build proves native compilation but is not an App Store `.ipa`.

---

# 28. iOS Encryption Declaration

ApplyMate currently declares:

```text
ITSAppUsesNonExemptEncryption=false
```

This was generated through EAS after confirming that the application uses only standard/exempt encryption.

Do not remove this setting unless the application's cryptographic behaviour materially changes.

---

# 29. Android Production Build

Authenticate:

```powershell
npx --yes eas-cli@latest whoami
```

Verify project:

```powershell
npx --yes eas-cli@latest project:info
```

Build:

```powershell
npx --yes eas-cli@latest build --platform android --profile production
```

Expected store artifact:

```text
.aab
```

Do not use an APK for a new Google Play production submission.

---

# 30. iOS Simulator Build

Credential-free native iOS compilation check:

```powershell
npx --yes eas-cli@latest build --platform ios --profile ios-simulator
```

Expected artifact:

```text
Simulator .app archive
```

This does not create an App Store binary.

---

# 31. iOS App Store Production Build

Requires Apple Developer Program access.

Once available:

```powershell
npx --yes eas-cli@latest build --platform ios --profile production
```

Expected artifact:

```text
.ipa
```

The Apple bundle identifier must remain:

```text
com.zaib367.applymate
```

Do not change this identifier after the store app record is established.

---

# 32. Google Play Submission

Do not run until a Google Play Developer account and ApplyMate Play Console application exist.

Required before EAS submission:

1. create the ApplyMate application in Play Console;
2. enable/configure Play App Signing;
3. create a Google service account for Play submission;
4. grant only the required Play Console permissions;
5. upload/configure the service-account key with EAS credentials.

Configure EAS credentials when required:

```powershell
npx --yes eas-cli@latest credentials --platform android
```

Build:

```powershell
npx --yes eas-cli@latest build --platform android --profile production
```

Submit latest eligible Android build:

```powershell
npx --yes eas-cli@latest submit --platform android --profile production --latest
```

The first submission is expected to target an internal testing release unless explicitly configured otherwise.

Store-listing completion and production rollout are managed in Play Console.

---

# 33. Apple App Store Submission

Do not run until paid Apple Developer Program enrolment exists.

Required:

* Apple Developer Program membership;
* ApplyMate App Store Connect record;
* bundle identifier `com.zaib367.applymate`;
* Apple distribution signing/provisioning;
* sufficient developer/App Store Connect permissions.

Build:

```powershell
npx --yes eas-cli@latest build --platform ios --profile production
```

Submit:

```powershell
npx --yes eas-cli@latest submit --platform ios --profile production --latest
```

EAS uploads the binary to App Store Connect.

The final App Review submission remains an App Store Connect action after metadata, privacy declarations and review information are complete.

---

# 34. Production Health Checks

Backend status:

```text
https://applymate-api-bami.onrender.com/api/v1/status
```

Operational health:

```text
https://applymate-api-bami.onrender.com/actuator/health
```

Expected:

```text
HTTP 200
UP
```

After every production backend deployment verify, at minimum:

```text
/api/v1/status
/actuator/health
login
token refresh
applications list
reminders list
email verification path if applicable
```

For releases touching specific functionality, add a targeted smoke test for that feature.

---

# 35. Render Deployment Verification

A successful Render deployment requires:

```text
Docker image built
Spring Boot started
Flyway completed
Hibernate schema validation passed
health endpoint returned success
Render marked deployment Live
```

If the new instance fails its health check, do not treat the deployment as successful merely because Docker built.

Inspect:

```text
Render Events
Render deploy logs
application startup logs
```

Do not enable debug logging containing secrets or authentication data.

---

# 36. Rollback — Application Code

For an application-code regression with no incompatible database migration:

1. identify the last known-good Git commit/tag;
2. use Render's rollback/redeploy functionality or redeploy the corresponding commit;
3. verify `/actuator/health`;
4. run production smoke tests;
5. document the failed release.

Prefer rolling forward with a reviewed fix when practical.

Do not rewrite published Git history.

---

# 37. Rollback — Database / Flyway

Application rollback and database rollback are separate concerns.

Because Flyway migrations are forward-only, reverting application code does not automatically revert production schema changes.

If a release includes a database migration:

1. assess whether the previous application version remains compatible with the migrated schema;
2. do not run Flyway clean;
3. do not manually remove Flyway history;
4. use a new corrective migration when possible.

For genuine production data/schema recovery, use Neon's supported Backup & Restore / point-in-time recovery facilities.

Before a high-risk migration, establish an appropriate Neon recovery point/snapshot according to the account's available plan.

After database recovery:

```text
verify schema
verify Flyway history
deploy compatible application version
verify health
run targeted data checks
```

Never perform production database recovery casually; it can discard legitimate writes made after the chosen restore point.

---

# 38. Secret Rotation / Recovery

## JWT secret

Rotating `JWT_SECRET` invalidates currently issued access tokens.

Coordinate rotation and verify authentication afterwards.

## Verification/password-reset peppers

Changing a pepper invalidates outstanding codes produced with the old pepper.

Rotate deliberately.

## Database credentials

If Neon credentials are rotated:

1. update Render `DB_USERNAME` / `DB_PASSWORD` / `DB_URL` as applicable;
2. redeploy;
3. verify Flyway/database connectivity;
4. revoke the old credential.

## Resend API key

Update Render first, verify email delivery, then revoke the old Resend key.

## Expo credentials

Use EAS credential management.

Do not download/share private signing material unless operationally necessary.

---

# 39. Account and Access Handoff

Never hand another developer passwords for personal accounts when the provider supports delegated access.

Use invitations, project roles or project transfer.

## GitHub

Receiving developer needs sufficient repository access to:

* clone/push;
* create branches;
* open/merge pull requests;
* inspect Actions;
* create releases/tags;
* manage GitHub Pages if responsible for public policy pages.

For full operational ownership, repository Admin access is appropriate.

## Expo / EAS

The current project is owned by the personal Expo account:

```text
@zaib_367
```

Expo explicitly advises against sharing personal-account authentication credentials.

For a genuine multi-developer handoff, move/transfer the project into an Expo Organization or otherwise use Expo's supported project/account transfer model.

The receiving deployment developer should have at least Developer-level EAS access; Admin/Owner is appropriate when they must manage members, billing or project transfer.

The receiving developer must also be able to use the existing Android signing credentials.

## Render

Provide access to the Render workspace/account containing the production web service.

Required operational capabilities:

* view logs/events;
* modify environment variables;
* deploy/redeploy;
* change health configuration;
* manage GitHub connection;
* roll back deployments.

## Neon

Provide access to the Neon project containing the production `applymate` database.

Required operational capabilities:

* inspect connection details;
* manage database roles/credentials;
* inspect branches;
* use Backup & Restore;
* inspect database health/usage.

## Resend

Provide team/account access sufficient to:

* inspect `applymate.website`;
* verify DNS status;
* inspect delivery logs;
* create/rotate production sending API keys.

Do not simply send the existing API key to another developer.

## Google Cloud / Google Auth Platform

Provide IAM access to the Google Cloud project containing the ApplyMate OAuth clients.

The developer must be able to inspect/manage:

* Gmail API;
* OAuth clients;
* Branding;
* Audience;
* Data Access/scopes;
* authorised test users;
* verification status;
* developer contact details.

## Domain / DNS

Provide delegated access or account transfer for the registrar/DNS provider controlling:

```text
applymate.website
```

This is required to maintain Resend and future Google verification records.

## Support mailbox

Operational ownership should include access to or delegation for:

```text
support.applymate@gmail.com
```

because store users, privacy requests and provider verification communications may use it.

---

# 40. Future Apple Account Handoff

Apple Developer Program enrolment is not yet part of the validated repository state.

After enrolment, a deployment developer should be invited through Apple's supported user/role system.

Do not share the Account Holder's Apple Account password.

The person responsible for build/signing may require:

```text
Developer or App Manager role
Certificates, Identifiers & Profiles access where appropriate
ApplyMate app access
```

The Account Holder remains responsible for membership/legal agreements.

---

# 41. Future Google Play Account Handoff

After Play Console enrolment, invite the deployment developer as a Play Console user.

Grant only permissions required to:

* manage ApplyMate;
* create/manage releases;
* inspect app signing;
* complete store configuration;
* submit releases.

Do not share the Play account owner's password.

Service-account credentials used by EAS must be treated as secrets.

---

# 42. CI

GitHub Actions validates:

```text
frontend install
TypeScript
web export
backend Maven verification
production Docker build/runtime properties
```

CI does not require production secrets.

Before final tagging:

```text
all required GitHub Actions jobs must be green
```

A green CI run complements but does not replace EAS native-build validation or production smoke tests.

---

# 43. Release Procedure

For a normal future bug-fix release:

```text
create branch
        |
        v
make contained fix
        |
        v
frontend/backend validation
        |
        v
native validation if mobile code/config changed
        |
        v
documentation update
        |
        v
pull request
        |
        v
merge to main
        |
        v
confirm CI green
        |
        v
production smoke test
        |
        v
annotated Git tag on exact main commit
```

Final identity check:

```powershell
git fetch origin --tags
git rev-parse HEAD
git rev-parse origin/main
git rev-list -n 1 <release-tag>
```

Required:

```text
tag == main == origin/main
```

---

# 44. Do Not Do These Things

Do not:

* commit `.env` files;
* commit production secrets;
* embed backend secrets in `EXPO_PUBLIC_*` variables;
* share personal Expo/Apple/Google passwords;
* run `npm audit fix --force` during release hardening without dependency review;
* suppress unexpected Expo Doctor findings merely to obtain a green result;
* run `docker compose down -v` unless intentionally deleting local data;
* use the same Compose project namespace for parallel test clones;
* manually modify Flyway production history;
* run Flyway clean in production;
* change the Android package name;
* change the iOS bundle identifier;
* create a new EAS project for the existing production app;
* replace the existing Android keystore without understanding signing consequences;
* submit unrestricted Gmail functionality before required Google approval;
* submit to Apple/Google stores without the repository's current compliance/store pack.

---

# 45. Current Known Release Constraints

At v1.8.0 release closeout:

```text
Clean-clone reproducibility:               PASS
Android production build pipeline:         PASS
iOS native Simulator compilation:          PASS
Production Gmail gate:                     PASS / OFF
Apple App Store production signing:        BLOCKED by paid Apple account
Google Play submission:                    BLOCKED until Play developer setup
Gmail public OAuth availability:           BLOCKED pending Google approval
```

The three blocked items are external account/approval gates, not missing product features.

Before actual store submission, rebuild the final binary from the exact frozen/tagged source and re-check the current provider/store requirements.

---

# 46. Final Handoff Principle

ApplyMate feature development is frozen.

For the `v1.8.0` store-ready release and later:

```text
new product features: NO
genuine bug fixes:     YES
store/compliance fixes: YES
provider-required maintenance: YES
```

Operational knowledge required to build, deploy or submit ApplyMate must be added to this runbook rather than retained only in private messages or developer memory.
