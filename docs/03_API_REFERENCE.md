# ApplyMate API Reference

## Overview

ApplyMate exposes a JSON REST API from the Spring Boot backend.

All primary application endpoints use:

```text
/api/v1
```

Production API:

```text
https://applymate-api-bami.onrender.com
```

The API currently supports:

* User registration
* Email verification
* Verification-email resend
* Forgot-password requests
* Secure password reset
* Email/password authentication
* JWT access tokens
* Rotating refresh-token sessions
* Refresh-session revocation after password reset
* Account deletion
* Job-application CRUD
* Dashboard summaries
* Reminder CRUD
* Per-user data isolation

---

# Content Type

Requests containing JSON should use:

```http
Content-Type: application/json
Accept: application/json
```

Successful `202` and `204` password-reset responses do not require a JSON response body.

---

# Authentication

Protected endpoints require a JWT access token:

```http
Authorization: Bearer <access-token>
```

ApplyMate uses:

* Short-lived JWT access tokens
* Long-lived refresh tokens
* Refresh-token rotation
* Server-side refresh-session revocation
* Email-verification enforcement before authenticated access
* Complete refresh-session revocation after password reset

Production session configuration:

```text
Access token lifetime: 15 minutes
Refresh session lifetime: 30 days
```

The production backend defaults access-token lifetime to `PT15M`.

---

# Email Verification

New users are created in an unverified state.

A newly registered account has:

```text
email_verified_at = NULL
```

Before the user can obtain authenticated application access, they must verify their email address using a six-digit code.

Verification rules:

```text
Code format:                 6 numeric digits
Code lifetime:               10 minutes
Maximum incorrect attempts:  5
Resend cooldown:             60 seconds
Issue-rate window:           1 hour
Maximum issues per window:   5
```

Raw verification codes are not stored by the backend.

The backend stores an HMAC-SHA-256 representation protected by a server-side secret pepper.

Resending creates a replacement verification code and invalidates the previous code.

---

# Password Reset

Users who cannot remember their password can request a six-digit reset code by email.

Password-reset rules:

```text
Code format:                 6 numeric digits
Code lifetime:               10 minutes
Maximum incorrect attempts:  5
Resend cooldown:             60 seconds
Issue-rate window:           1 hour
Maximum issues per window:   5
Minimum forgot-response time: 1 second
```

Raw password-reset codes are never stored.

Stored challenge codes are protected with HMAC-SHA-256 using a password-reset pepper that is separate from the email-verification pepper and JWT signing secret.

The HMAC input is bound to the owning user:

```text
password-reset:<userId>:<code>
```

Successful password reset:

```text
Changes the password hash
Revokes all active refresh-token sessions
Deletes the reset challenge
Sends a password-changed notification
```

Password reset does **not** mark an account as email verified.

---

# Public Routes

These routes do not require a valid access token:

```text
GET  /api/v1/status

POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET  /actuator/health
```

Verification and password-reset endpoints must remain public because those flows occur before normal authentication.

The refresh endpoint remains public because it is used specifically when an access token has expired.

Logout accepts a refresh token directly and does not require the access token to remain valid.

---

# Protected Routes

User, application and reminder routes require:

```http
Authorization: Bearer <access-token>
```

Unverified accounts cannot obtain normal authenticated application access.

---

# Application Status Values

The backend accepts:

```text
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED
```

Invalid status values result in:

```text
400 Bad Request
```

---

# Reminder Type Values

The backend accepts:

```text
INTERVIEW
ASSESSMENT
FOLLOW_UP
DEADLINE
OTHER
```

Invalid reminder types result in:

```text
400 Bad Request
```

---

# System Endpoints

## Get API Status

```http
GET /api/v1/status
```

### Authentication

Not required.

### Successful Response

**Status:** `200 OK`

```json
{
  "name": "ApplyMate API",
  "version": "1.0.0",
  "status": "UP"
}
```

This verifies that the main application API is responding.

Production verification after the V9 deployment returned HTTP `200`.

---

## Get Operational Health

```http
GET /actuator/health
```

### Authentication

Not required.

### Successful Response

**Status:** `200 OK`

The health response reports:

```json
{
  "status": "UP"
}
```

Additional health metadata can be present depending on Actuator configuration.

Production URLs:

```text
https://applymate-api-bami.onrender.com/api/v1/status
https://applymate-api-bami.onrender.com/actuator/health
```

Both were revalidated successfully after the password-reset production rollout.

---

# Authentication Endpoints

## Register a User

```http
POST /api/v1/auth/register
```

### Authentication

Not required.

### Request Body

```json
{
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "email": "muhammad@example.com",
  "password": "securePassword123"
}
```

### Validation

| Field       | Required | Rules                                       |
| ----------- | -------: | ------------------------------------------- |
| `firstName` |      Yes | Must not be blank; maximum 100 characters   |
| `lastName`  |      Yes | Must not be blank; maximum 100 characters   |
| `email`     |      Yes | Valid email address; maximum 320 characters |
| `password`  |      Yes | Between 8 and 72 characters                 |

Email addresses are normalised before storage.

### Successful Response

**Status:** `201 Created`

Example:

```json
{
  "id": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "createdAt": "2026-08-14T10:00:00Z",
  "verificationRequired": true,
  "verificationExpiresAt": "2026-08-14T10:10:00Z",
  "resendAvailableAt": "2026-08-14T10:01:00Z",
  "verificationEmailSent": true
}
```

Registration does **not** issue access or refresh tokens.

The account must first complete email verification and then perform normal login.

### Email-Delivery Failure Behaviour

Account creation and verification-challenge creation are committed before external email delivery is attempted.

If the account is created successfully but the initial verification email cannot be delivered, the account remains recoverable through:

```http
POST /api/v1/auth/resend-verification
```

### Possible Errors

* `400 Bad Request` — validation failed
* `409 Conflict` — an account already exists for the email
* `500 Internal Server Error` — unexpected backend failure

---

# Verify Email

```http
POST /api/v1/auth/verify-email
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "muhammad@example.com",
  "code": "482731"
}
```

### Validation

| Field   | Required | Rules                      |
| ------- | -------: | -------------------------- |
| `email` |      Yes | Valid email address        |
| `code`  |      Yes | Exactly six numeric digits |

### Successful Response

**Status:** `200 OK`

```json
{
  "verified": true,
  "message": "Email verified successfully"
}
```

Successful verification records a timestamp in:

```text
app_users.email_verified_at
```

The verification flow does not issue authentication tokens.

After successful verification, the client returns the user to normal email/password login.

### Possible Errors

#### Incorrect code

**Status:** `400 Bad Request`

```json
{
  "code": "VERIFICATION_CODE_INCORRECT"
}
```

#### Expired code

**Status:** `410 Gone`

```json
{
  "code": "VERIFICATION_CODE_EXPIRED"
}
```

#### Maximum attempts exceeded

**Status:** `429 Too Many Requests`

```json
{
  "code": "VERIFICATION_ATTEMPTS_EXCEEDED"
}
```

---

# Resend Verification Email

```http
POST /api/v1/auth/resend-verification
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "muhammad@example.com"
}
```

### Successful Response

**Status:** `202 Accepted`

The endpoint deliberately uses generic wording.

For an unknown or already-verified email address, the response does not reveal unnecessary account state.

### Replacement-Code Behaviour

```text
Existing code
     |
     v
Generate new code
     |
     v
Replace stored verification hash
     |
     v
Old code becomes invalid
```

### Resend Cooldown

**Status:** `429 Too Many Requests`

```json
{
  "code": "VERIFICATION_RESEND_COOLDOWN",
  "retryAfterSeconds": 42
}
```

The response can include:

```http
Retry-After: 42
```

### Issue Rate Limit

**Status:** `429 Too Many Requests`

```json
{
  "code": "VERIFICATION_RATE_LIMITED",
  "retryAfterSeconds": 1800
}
```

### Email Provider Failure

**Status:** `503 Service Unavailable`

```json
{
  "code": "VERIFICATION_EMAIL_UNAVAILABLE",
  "message": "Verification email is temporarily unavailable"
}
```

Provider API keys, Authorization headers and verification codes are never exposed.

---

# Forgot Password

```http
POST /api/v1/auth/forgot-password
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "muhammad@example.com"
}
```

### Validation

| Field   | Required | Rules               |
| ------- | -------: | ------------------- |
| `email` |      Yes | Valid email address |

Email is normalised by the backend.

### Successful Response

**Status:** `202 Accepted`

No response body is required.

```text
HTTP 202 Accepted
```

This endpoint deliberately returns generic behaviour.

For syntactically valid email requests, the public response does not reveal whether:

* An account exists
* An account is disabled
* A reset challenge is currently in cooldown
* The hourly issue limit has been reached
* Email delivery failed

Production verification confirmed that a deliberately nonexistent valid email receives:

```text
HTTP 202 Accepted
```

### Existing Account Behaviour

When the account is eligible:

```text
Find and lock user
      |
      v
Load/reset challenge
      |
      v
Generate 6-digit code
      |
      v
Store HMAC hash
      |
      v
Send reset email
      |
      v
Commit transaction
      |
      v
HTTP 202
```

### Email-Delivery Failure Behaviour

Reset challenge changes and email delivery occur inside the same issuance transaction.

If reset-code email delivery fails:

```text
Email send fails
      |
      v
Transaction rolls back
      |
      v
Challenge/cooldown/rate-limit mutation is not committed
      |
      v
Client still receives generic HTTP 202
```

This means a user does not lose a reset attempt or enter cooldown because of a provider failure.

### Account-Enumeration Protection

The endpoint uses:

* Generic public responses
* No account-existence response field
* No provider-failure disclosure
* A configurable minimum response duration

Default minimum response duration:

```text
1 second
```

---

# Reset Password

```http
POST /api/v1/auth/reset-password
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "muhammad@example.com",
  "code": "482731",
  "newPassword": "NewSecurePassword123"
}
```

### Validation

| Field         | Required | Rules                       |
| ------------- | -------: | --------------------------- |
| `email`       |      Yes | Valid email address         |
| `code`        |      Yes | Exactly six numeric digits  |
| `newPassword` |      Yes | Between 8 and 72 characters |

Password confirmation is a frontend-only validation field.

It is not sent to the API.

### Successful Response

**Status:** `204 No Content`

No response body is returned.

Successful reset performs:

```text
Validate account
      |
      v
Validate reset challenge
      |
      v
Verify HMAC-protected code
      |
      v
Encode new password
      |
      v
Update password hash
      |
      v
Revoke every active refresh session for the user
      |
      v
Delete reset challenge
      |
      v
Commit
      |
      v
Send password-changed notification
```

### Single-Use Behaviour

Successful reset deletes the challenge.

Submitting the same code again fails.

### Replacement-Code Behaviour

A successful resend replaces the previous stored code hash.

Therefore:

```text
Old code -> invalid
New code -> valid until expiry/use/attempt limit
```

### Refresh-Session Revocation

All active refresh-token sessions for the account are revoked during successful reset.

Any previously issued refresh token can no longer obtain a new access token.

Already-issued access JWTs are not blacklisted and can remain valid until normal expiry.

Production access-token lifetime is limited to:

```text
15 minutes
```

### Generic Reset-Code Error

Invalid reset-challenge cases use one public machine-readable error:

**Status:** `400 Bad Request`

```json
{
  "code": "PASSWORD_RESET_CODE_INVALID_OR_EXPIRED",
  "message": "Password reset code is invalid or expired. Request a new code."
}
```

This generic result covers cases including:

```text
Missing reset challenge
Incorrect code
Expired code
Maximum attempts reached
Invalid/cross-account challenge use
Already-consumed challenge
```

The API does not expose which internal condition caused the rejection.

### Unverified Account Behaviour

An unverified account may use password reset.

A successful password reset does **not** modify:

```text
email_verified_at
```

Therefore an unverified user who changes their password still receives:

```text
EMAIL_VERIFICATION_REQUIRED
```

when attempting authenticated login.

### Password-Changed Email Failure

The password-changed notification is informational.

If that notification cannot be delivered after the reset transaction commits:

```text
Password remains changed
Refresh sessions remain revoked
Reset challenge remains consumed
HTTP reset success is not rolled back
```

---

# Log In

```http
POST /api/v1/auth/login
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "muhammad@example.com",
  "password": "securePassword123"
}
```

### Validation

| Field      | Required | Rules               |
| ---------- | -------: | ------------------- |
| `email`    |      Yes | Valid email address |
| `password` |      Yes | Must not be blank   |

### Successful Response

**Status:** `200 OK`

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresAt": "2026-08-14T11:15:00Z",
  "refreshToken": "<opaque-refresh-token>",
  "refreshExpiresAt": "2026-09-13T11:00:00Z",
  "userId": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad"
}
```

The access token is used for protected API requests:

```http
Authorization: Bearer <jwt-access-token>
```

The refresh token must be stored securely and used only with refresh/logout operations.

### Unverified Account

The backend validates the password before revealing that email verification is required.

If the password is correct but the account remains unverified:

**Status:** `403 Forbidden`

```json
{
  "code": "EMAIL_VERIFICATION_REQUIRED",
  "message": "Email verification is required"
}
```

No authentication tokens are issued.

### Incorrect Password

Incorrect credentials return:

```text
401 Unauthorized
```

### Password Reset Effect

After a successful password reset:

```text
Old password -> rejected
New password -> accepted
```

This behaviour has been verified against production.

---

# Refresh an Authentication Session

```http
POST /api/v1/auth/refresh
```

### Authentication

No access token required.

### Request Body

```json
{
  "refreshToken": "<current-refresh-token>"
}
```

The refresh token must not be blank.

### Successful Response

**Status:** `200 OK`

The endpoint returns the same authentication response structure as login with a newly issued access token and rotated refresh token.

### Rotation Behaviour

```text
Current refresh token
        |
        v
Validate session
        |
        v
Revoke current refresh token
        |
        v
Issue new access token
        |
        v
Issue new refresh token
```

The client must replace the previous token pair.

### Password Reset Revocation

A successful password reset calls the backend's all-session revocation path.

A refresh token belonging to a session that existed before password reset becomes unusable.

Expected result:

```text
401 Unauthorized
```

### Unverified Account Protection

Refresh cannot be used to bypass email verification.

If a refresh session belongs to an unverified account, the session is revoked and authenticated access is denied.

---

# Log Out

```http
POST /api/v1/auth/logout
```

### Authentication

No valid access token required.

### Request Body

```json
{
  "refreshToken": "<current-refresh-token>"
}
```

### Successful Response

**Status:** `204 No Content`

Logout revokes the backend refresh session represented by the supplied token.

The client then removes its locally stored access and refresh tokens.

---

# User Endpoints

## Get Current User

```http
GET /api/v1/users/me
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

```json
{
  "id": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "enabled": true,
  "createdAt": "2026-08-14T10:00:00Z"
}
```

---

# Delete Current User

```http
DELETE /api/v1/users/me
```

### Authentication

Required.

### Successful Response

**Status:** `204 No Content`

The backend derives the user ID from the authenticated JWT.

The client cannot supply another user's identifier.

Deleting the user permanently removes user-owned backend data including:

* User account
* Job applications
* Reminders
* Refresh-token sessions
* Email-verification challenge data
* Password-reset challenge data

The mobile client separately performs local cleanup after the server confirms successful deletion.

---

# Application Endpoints

All application endpoints operate only on records owned by the authenticated user.

A user cannot retrieve, update or delete another user's application.

When an application does not exist or does not belong to the authenticated user:

```text
404 Not Found
```

## Application Object

```json
{
  "id": "06feb388-7a80-409a-a8b3-9cff672b083c",
  "jobUrl": "https://example.com/jobs/java-developer",
  "company": "Example Company",
  "jobTitle": "Junior Java Developer",
  "location": "Birmingham",
  "salary": "£30,000",
  "status": "APPLIED",
  "notes": "Applied through the company website.",
  "jobDescription": "Develop and maintain backend services.",
  "requiredSkills": "Java, Spring Boot, PostgreSQL",
  "benefits": "Hybrid working and pension",
  "recruiter": "Jane Smith",
  "applicationDeadline": "2026-08-15",
  "createdAt": "2026-08-14T08:00:00Z",
  "updatedAt": "2026-08-14T08:00:00Z"
}
```

## Application Fields

| Field                 | Required | Validation                                        |
| --------------------- | -------: | ------------------------------------------------- |
| `jobUrl`              |       No | Maximum 2,000 characters; empty or HTTP/HTTPS URL |
| `company`             |      Yes | Must not be blank; maximum 200 characters         |
| `jobTitle`            |      Yes | Must not be blank; maximum 200 characters         |
| `location`            |       No | Maximum 200 characters                            |
| `salary`              |       No | Maximum 200 characters                            |
| `status`              |      Yes | Supported application status                      |
| `notes`               |       No | Maximum 5,000 characters                          |
| `jobDescription`      |       No | Maximum 20,000 characters                         |
| `requiredSkills`      |       No | Maximum 10,000 characters                         |
| `benefits`            |       No | Maximum 10,000 characters                         |
| `recruiter`           |       No | Maximum 200 characters                            |
| `applicationDeadline` |       No | ISO date `YYYY-MM-DD`                             |

Optional text values may be supplied as empty strings.

---

## List Applications

```http
GET /api/v1/applications
```

### Authentication

Required.

### Query Parameters

| Parameter | Required | Description                          |
| --------- | -------: | ------------------------------------ |
| `status`  |       No | Filter by backend application status |
| `search`  |       No | Case-insensitive text search         |

The parameters may be used independently or together.

Search applies to:

* Company
* Job title
* Location
* Recruiter
* Required skills

Applications are returned newest-first.

An empty result is:

```json
[]
```

---

# Create Application

```http
POST /api/v1/applications
```

### Authentication

Required.

### Successful Response

**Status:** `201 Created`

---

# Get Application

```http
GET /api/v1/applications/{applicationId}
```

### Authentication

Required.

`applicationId` must be a valid UUID.

### Successful Response

**Status:** `200 OK`

---

# Update Application

```http
PUT /api/v1/applications/{applicationId}
```

### Authentication

Required.

This is a full update operation.

Required fields such as `company`, `jobTitle` and `status` must still be supplied.

### Successful Response

**Status:** `200 OK`

---

# Delete Application

```http
DELETE /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Successful Response

**Status:** `204 No Content`

---

# Get Application Summary

```http
GET /api/v1/applications/summary
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

```json
{
  "total": 12,
  "saved": 2,
  "applied": 4,
  "assessment": 1,
  "interview": 3,
  "offer": 1,
  "rejected": 1
}
```

All status fields are returned even when a count is zero.

---

# Reminder Endpoints

Reminder data is persisted by the backend and scoped to the authenticated user.

The operating-system notification itself is scheduled separately by the mobile client.

A user cannot retrieve, modify or delete another user's reminder.

## Reminder Object

```json
{
  "id": "83f619c6-c55a-4ac0-a868-364468299d85",
  "title": "Prepare for interview",
  "company": "Example Company",
  "type": "INTERVIEW",
  "dueAt": "2026-08-15T09:30:00Z",
  "notes": "Review Java and Spring Boot examples.",
  "completed": false,
  "createdAt": "2026-08-14T08:00:00Z",
  "updatedAt": "2026-08-14T08:00:00Z"
}
```

## Reminder Fields

| Field       |          Create |    Update | Rules                             |
| ----------- | --------------: | --------: | --------------------------------- |
| `title`     |        Required |  Required | Non-blank; maximum 200 characters |
| `company`   |       Supported | Supported | Maximum 200 characters            |
| `type`      |        Required |  Required | Valid reminder type               |
| `dueAt`     |        Required |  Required | ISO-8601 instant                  |
| `notes`     |        Optional |  Optional | Text                              |
| `completed` | Backend default |  Required | Boolean                           |

---

# Create Reminder

```http
POST /api/v1/reminders
```

### Authentication

Required.

### Successful Response

**Status:** `201 Created`

---

# List Reminders

```http
GET /api/v1/reminders
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

Reminders are returned ordered by `dueAt` ascending.

An authenticated user with no reminders receives:

```json
[]
```

---

# Get Reminder

```http
GET /api/v1/reminders/{reminderId}
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

If the reminder does not exist or belongs to another user:

```text
404 Not Found
```

---

# Update Reminder

```http
PUT /api/v1/reminders/{reminderId}
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

---

# Delete Reminder

```http
DELETE /api/v1/reminders/{reminderId}
```

### Authentication

Required.

### Successful Response

**Status:** `204 No Content`

---

# Ownership Rules

## Applications

Application access is scoped using:

```text
Requested application ID
Authenticated user ID
```

Another user's application is not exposed.

## Reminders

Reminder access is similarly scoped to the authenticated owner.

## Email Verification

Verification challenges belong to an individual user.

Raw verification codes are never used as persistent identifiers.

## Password Reset

Password-reset challenges belong to an individual user.

The stored HMAC is calculated using the owning user ID.

A reset code issued for one user cannot validly reset another user's account.

## Account Deletion

Account deletion does not accept a user ID in the URL or request body.

The account identity comes from the authenticated JWT.

---

# Error Response Format

API errors use a consistent JSON structure.

Example:

```json
{
  "timestamp": "2026-08-14T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "PASSWORD_RESET_CODE_INVALID_OR_EXPIRED",
  "message": "Password reset code is invalid or expired. Request a new code.",
  "path": "/api/v1/auth/reset-password",
  "fieldErrors": {},
  "retryAfterSeconds": null
}
```

## Error Fields

| Field               | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `timestamp`         | Time the backend created the error                    |
| `status`            | Numeric HTTP status                                   |
| `error`             | HTTP reason                                           |
| `code`              | Machine-readable ApplyMate error code when available  |
| `message`           | User-readable/backend-defined explanation             |
| `path`              | Requested API path                                    |
| `fieldErrors`       | Validation messages keyed by request field            |
| `retryAfterSeconds` | Retry delay for applicable rate-limit/cooldown errors |

---

# Email Verification Error Codes

| Code                             | Typical HTTP Status | Meaning                                                |
| -------------------------------- | ------------------: | ------------------------------------------------------ |
| `EMAIL_VERIFICATION_REQUIRED`    |               `403` | Account must verify email before authenticated access  |
| `VERIFICATION_CODE_INCORRECT`    |               `400` | Submitted verification code is incorrect               |
| `VERIFICATION_CODE_EXPIRED`      |               `410` | Verification challenge has expired                     |
| `VERIFICATION_ATTEMPTS_EXCEEDED` |               `429` | Too many incorrect verification attempts               |
| `VERIFICATION_RESEND_COOLDOWN`   |               `429` | Resend requested too soon                              |
| `VERIFICATION_RATE_LIMITED`      |               `429` | Verification-code issuance limit reached               |
| `VERIFICATION_EMAIL_UNAVAILABLE` |               `503` | Verification email provider is temporarily unavailable |

---

# Password Reset Error Codes

| Code                                     | Typical HTTP Status | Meaning                                         |
| ---------------------------------------- | ------------------: | ----------------------------------------------- |
| `PASSWORD_RESET_CODE_INVALID_OR_EXPIRED` |               `400` | Reset code cannot be used; request another code |

The backend intentionally does not provide separate public codes for:

```text
WRONG_RESET_CODE
EXPIRED_RESET_CODE
RESET_ATTEMPTS_EXCEEDED
NO_RESET_CHALLENGE
CROSS_USER_RESET_CODE
```

Those internal conditions remain hidden behind the single generic reset error.

Forgot-password account-existence, cooldown, rate-limit and provider-delivery outcomes are also hidden behind HTTP `202` for syntactically valid requests.

---

# Common HTTP Statuses

|                      Status | Meaning                                                                  |
| --------------------------: | ------------------------------------------------------------------------ |
|                    `200 OK` | Request succeeded                                                        |
|               `201 Created` | Resource created                                                         |
|              `202 Accepted` | Generic verification/password-reset request accepted                     |
|            `204 No Content` | Operation succeeded without response body                                |
|           `400 Bad Request` | Validation, malformed request or generic password-reset-code failure     |
|          `401 Unauthorized` | Authentication missing/invalid, login failure or invalid refresh session |
|             `403 Forbidden` | Email verification required or authenticated operation forbidden         |
|             `404 Not Found` | User or owned resource not found                                         |
|              `409 Conflict` | Registration email already exists                                        |
|                  `410 Gone` | Verification code has expired                                            |
|     `429 Too Many Requests` | Verification attempts/cooldown/rate limit exceeded                       |
| `500 Internal Server Error` | Unexpected backend failure                                               |
|   `503 Service Unavailable` | Verification email provider unavailable                                  |

Password-reset email-provider failure during forgot-password is deliberately **not** exposed as `503`.

The caller continues to receive the generic accepted response.

---

# Authentication Error Handling

A protected request without valid access authentication returns:

```http
WWW-Authenticate: Bearer
```

The mobile client can respond to an expired access token by using the stored refresh token.

```text
Protected request returns 401
        |
        v
Check refresh token
        |
        v
POST /api/v1/auth/refresh
        |
        ├── Success
        |      |
        |      v
        |  Store rotated token pair
        |      |
        |      v
        |  Retry original request once
        |
        └── Invalid/expired/revoked refresh session
               |
               v
           Clear session
               |
               v
           Return to authentication flow
```

After password reset, an old refresh token falls into the invalid/revoked path.

---

# Frontend Verification Recovery

The mobile client stores pending verification metadata separately from authentication tokens.

It may store:

```text
email
verificationExpiresAt
resendAvailableAt
```

It does not store:

```text
password
verification code
Resend API key
verification pepper
```

This allows an interrupted verification flow to resume after application restart.

---

# Frontend Password Reset State

Password-reset screens keep sensitive reset data only in transient screen state.

The client may pass:

```text
email
```

between password-reset screens.

It does not persist:

```text
reset code
new password
confirm password
password-reset pepper
```

The reset request sends:

```text
email
code
newPassword
```

`confirmPassword` exists only to validate matching input in the mobile UI.

---

# Date and Identifier Formats

## UUIDs

User, application and reminder identifiers use UUID strings:

```text
06feb388-7a80-409a-a8b3-9cff672b083c
```

## Authentication Codes

Email-verification and password-reset codes use:

```text
NNNNNN
```

Example:

```text
482731
```

## Calendar Dates

Application deadlines use:

```text
YYYY-MM-DD
```

Example:

```text
2026-08-15
```

## Instants and Timestamps

Reminder due times, authentication expiry times and verification/reset timestamps use ISO-8601 instants.

Example:

```text
2026-08-14T09:30:00Z
```

---

# Production Email Delivery

Authentication email is sent through Resend.

Production sender:

```text
ApplyMate <verify@applymate.website>
```

Verified sending domain:

```text
applymate.website
```

Current authentication email types include:

```text
Email-verification code
Password-reset code
Password-changed notification
```

The Resend API key exists only in backend production configuration.

It is never returned by the API or bundled with the mobile application.

Email verification and password reset use separate server-side peppers.

Production secret values are stored only in Render environment variables.

---

# Production Behaviour

Production API:

```text
https://applymate-api-bami.onrender.com
```

Production backend:

```text
Render
```

Production database:

```text
Neon PostgreSQL
```

Transactional email:

```text
Resend
```

Current production Flyway schema:

```text
V9
```

Production access-token default:

```text
PT15M
```

Production refresh-token lifetime:

```text
P30D
```

Backend readiness can be checked through:

```text
GET /api/v1/status
GET /actuator/health
```

Current production verification:

```text
GET  /api/v1/status
-> HTTP 200

GET  /actuator/health
-> HTTP 200

POST /api/v1/auth/forgot-password
with a nonexistent syntactically valid email
-> HTTP 202
```

---

# Current API Summary

```text
SYSTEM
GET    /api/v1/status
GET    /actuator/health

AUTHENTICATION
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

USERS
GET    /api/v1/users/me
DELETE /api/v1/users/me

APPLICATIONS
GET    /api/v1/applications
POST   /api/v1/applications
GET    /api/v1/applications/summary
GET    /api/v1/applications/{applicationId}
PUT    /api/v1/applications/{applicationId}
DELETE /api/v1/applications/{applicationId}

REMINDERS
GET    /api/v1/reminders
POST   /api/v1/reminders
GET    /api/v1/reminders/{reminderId}
PUT    /api/v1/reminders/{reminderId}
DELETE /api/v1/reminders/{reminderId}
```

---

# Production Verification Status

The following API behaviour has been verified against the deployed production environment:

* API status
* Actuator health
* Existing-user login
* New-user registration
* New users initially remaining unverified
* Verification challenge creation
* Real verification-email delivery
* Verification code acceptance
* Incorrect-code rejection
* Verification resend
* Old verification-code invalidation after resend
* Unverified-login rejection
* Successful login after verification
* Access-token issuance
* Refresh-token issuance
* Refresh-token rotation
* Unverified-refresh protection
* Application access after authentication
* Password-reset endpoint public access
* Unknown-email forgot-password `202`
* Real password-reset email delivery
* Successful password reset
* Old password rejected after reset
* New password accepted after reset
* Password-changed notification delivery
* Flyway V6/V7 email-verification rollout
* Flyway V8 email-verification cleanup
* Flyway V9 password-reset schema
* Resend secret-handling hardening
* Password-reset secret validation
* Final production API and health checks

Current automated backend validation:

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
