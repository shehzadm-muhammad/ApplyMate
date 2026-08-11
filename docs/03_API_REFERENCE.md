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

- User registration
- Email verification
- Verification-email resend
- Email/password authentication
- JWT access tokens
- Rotating refresh-token sessions
- Account deletion
- Job-application CRUD
- Dashboard summaries
- Reminder CRUD
- Per-user data isolation

---

# Content Type

Requests containing JSON should use:

```http
Content-Type: application/json
Accept: application/json
```

---

# Authentication

Protected endpoints require a JWT access token:

```http
Authorization: Bearer <access-token>
```

ApplyMate uses:

- Short-lived JWT access tokens
- Long-lived refresh tokens
- Refresh-token rotation
- Server-side refresh-session revocation
- Email-verification enforcement before authenticated access

Production session configuration:

```text
Access token lifetime: 1 hour
Refresh session lifetime: 30 days
```

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
Code format:               6 numeric digits
Code lifetime:             10 minutes
Maximum incorrect attempts: 5
Resend cooldown:           60 seconds
Issue-rate window:         1 hour
Maximum issues per window: 5
```

Raw verification codes are not stored by the backend.

The backend stores an HMAC-SHA-256 representation protected by a server-side secret pepper.

Resending creates a replacement verification code and invalidates the previous code.

---

# Public Routes

These routes do not require a valid access token:

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

The verification endpoints must remain public because the user is not authenticated until verification and login are complete.

The refresh endpoint remains public because it is specifically used when an access token has expired.

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

---

## Get Operational Health

```http
GET /actuator/health
```

### Authentication

Not required.

### Successful Response

**Status:** `200 OK`

A healthy production response may look like:

```json
{
  "groups": [
    "liveness",
    "readiness"
  ],
  "status": "UP"
}
```

Production URLs:

```text
https://applymate-api-bami.onrender.com/api/v1/status
https://applymate-api-bami.onrender.com/actuator/health
```

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

| Field | Required | Rules |
|---|---:|---|
| `firstName` | Yes | Must not be blank; maximum 100 characters |
| `lastName` | Yes | Must not be blank; maximum 100 characters |
| `email` | Yes | Valid email address; maximum 320 characters |
| `password` | Yes | Between 8 and 72 characters |

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
  "createdAt": "2026-08-11T10:00:00Z",
  "verificationRequired": true,
  "verificationExpiresAt": "2026-08-11T10:10:00Z",
  "resendAvailableAt": "2026-08-11T10:01:00Z",
  "verificationEmailSent": true
}
```

Registration does **not** issue access or refresh tokens.

The account must first complete email verification and then perform normal login.

### Email-Delivery Failure Behaviour

Account creation and verification-challenge creation are committed before external email delivery is attempted.

If the account is created successfully but the initial verification email cannot be delivered, the response can indicate:

```json
{
  "verificationRequired": true,
  "verificationEmailSent": false
}
```

The account remains recoverable through:

```http
POST /api/v1/auth/resend-verification
```

### Possible Errors

- `400 Bad Request` â€” validation failed
- `409 Conflict` â€” an account already exists for the email
- `500 Internal Server Error` â€” unexpected backend failure

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

| Field | Required | Rules |
|---|---:|---|
| `email` | Yes | Valid email address |
| `code` | Yes | Exactly six numeric digits |

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

A failed attempt is recorded.

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

Other validation or unexpected backend errors can also occur.

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

### Validation

| Field | Required | Rules |
|---|---:|---|
| `email` | Yes | Valid email address |

### Successful Response

**Status:** `202 Accepted`

Example for an account where a new challenge was issued:

```json
{
  "message": "If verification is required for this email, a verification code will be sent when allowed.",
  "verificationExpiresAt": "2026-08-11T11:09:55Z",
  "resendAvailableAt": "2026-08-11T11:00:55Z"
}
```

The endpoint deliberately uses generic wording.

For an unknown or already-verified email address, the response does not reveal unnecessary account state.

Timing fields may be `null` when no verification challenge was issued.

### Replacement-Code Behaviour

When resend succeeds:

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

If resend is requested before the cooldown expires:

**Status:** `429 Too Many Requests`

```json
{
  "code": "VERIFICATION_RESEND_COOLDOWN",
  "retryAfterSeconds": 42
}
```

The HTTP response also includes:

```http
Retry-After: 42
```

### Issue Rate Limit

If the maximum number of verification-code issues is reached:

**Status:** `429 Too Many Requests`

```json
{
  "code": "VERIFICATION_RATE_LIMITED",
  "retryAfterSeconds": 1800
}
```

A `Retry-After` header is also returned.

### Email Provider Failure

If the backend cannot safely send the verification email:

**Status:** `503 Service Unavailable`

```json
{
  "code": "VERIFICATION_EMAIL_UNAVAILABLE",
  "message": "Verification email is temporarily unavailable"
}
```

Provider API keys, request Authorization headers and verification codes must never be exposed in this response.

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

| Field | Required | Rules |
|---|---:|---|
| `email` | Yes | Valid email address |
| `password` | Yes | Must not be blank |

### Successful Response

**Status:** `200 OK`

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresAt": "2026-08-11T12:00:00Z",
  "refreshToken": "<opaque-refresh-token>",
  "refreshExpiresAt": "2026-09-10T11:00:00Z",
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

The refresh token must be stored securely and used only with the refresh/logout endpoints.

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

No access or refresh tokens are issued.

The mobile application uses this error code to redirect the user to the Verify Email flow.

### Incorrect Password

Incorrect credentials remain:

```text
401 Unauthorized
```

This prevents an incorrect password from being used to determine verification state.

### Possible Errors

- `400 Bad Request` â€” malformed or invalid request
- `401 Unauthorized` â€” credentials are incorrect
- `403 Forbidden` â€” correct credentials but email verification is still required
- `500 Internal Server Error` â€” unexpected backend failure

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

The endpoint returns the same authentication response structure as login:

```json
{
  "accessToken": "<new-jwt-access-token>",
  "tokenType": "Bearer",
  "expiresAt": "2026-08-11T13:00:00Z",
  "refreshToken": "<new-refresh-token>",
  "refreshExpiresAt": "2026-09-10T12:00:00Z",
  "userId": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad"
}
```

### Rotation Behaviour

A successful refresh:

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

The client must replace the previous token pair with the newly returned pair.

### Unverified Account Protection

Refresh cannot be used to bypass email verification.

If a refresh session belongs to an unverified account:

```text
Refresh session
      |
      v
User found to be unverified
      |
      v
Session revoked
      |
      v
403 EMAIL_VERIFICATION_REQUIRED
```

No access token is returned.

### Possible Errors

- `400 Bad Request` â€” refresh token missing/blank
- `401 Unauthorized` â€” refresh token invalid, expired, revoked or otherwise unusable
- `403 Forbidden` â€” account requires email verification
- `500 Internal Server Error` â€” unexpected backend failure

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

No response body is returned.

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
  "createdAt": "2026-08-11T10:00:00Z"
}
```

### Possible Errors

- `401 Unauthorized` â€” access token missing, invalid or expired
- `404 Not Found` â€” authenticated user no longer exists
- `500 Internal Server Error` â€” unexpected backend failure

---

# Delete Current User

```http
DELETE /api/v1/users/me
```

### Authentication

Required.

### Successful Response

**Status:** `204 No Content`

No body is returned.

The backend derives the user ID from the authenticated JWT.

The client cannot supply another user's identifier.

Deleting the user permanently removes user-owned backend data including:

- User account
- Job applications
- Reminders
- Refresh-token sessions
- Email-verification challenge data

The mobile client separately performs local cleanup after the server confirms successful deletion.

### Possible Errors

- `401 Unauthorized` â€” access token missing, invalid or expired
- `404 Not Found` â€” authenticated user no longer exists
- `500 Internal Server Error` â€” unexpected backend failure

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
  "salary": "Â£30,000",
  "status": "APPLIED",
  "notes": "Applied through the company website.",
  "jobDescription": "Develop and maintain backend services.",
  "requiredSkills": "Java, Spring Boot, PostgreSQL",
  "benefits": "Hybrid working and pension",
  "recruiter": "Jane Smith",
  "applicationDeadline": "2026-08-15",
  "createdAt": "2026-08-11T08:00:00Z",
  "updatedAt": "2026-08-11T08:00:00Z"
}
```

## Application Fields

| Field | Required | Validation |
|---|---:|---|
| `jobUrl` | No | Maximum 2,000 characters; empty or HTTP/HTTPS URL |
| `company` | Yes | Must not be blank; maximum 200 characters |
| `jobTitle` | Yes | Must not be blank; maximum 200 characters |
| `location` | No | Maximum 200 characters |
| `salary` | No | Maximum 200 characters |
| `status` | Yes | Supported application status |
| `notes` | No | Maximum 5,000 characters |
| `jobDescription` | No | Maximum 20,000 characters |
| `requiredSkills` | No | Maximum 10,000 characters |
| `benefits` | No | Maximum 10,000 characters |
| `recruiter` | No | Maximum 200 characters |
| `applicationDeadline` | No | ISO date `YYYY-MM-DD` |

Optional text values may be supplied as empty strings.

---

## List Applications

```http
GET /api/v1/applications
```

### Authentication

Required.

### Query Parameters

| Parameter | Required | Description |
|---|---:|---|
| `status` | No | Filter by backend application status |
| `search` | No | Case-insensitive text search |

The parameters may be used independently or together.

Search applies to:

- Company
- Job title
- Location
- Recruiter
- Required skills

Examples:

```http
GET /api/v1/applications
```

```http
GET /api/v1/applications?status=INTERVIEW
```

```http
GET /api/v1/applications?search=java
```

```http
GET /api/v1/applications?status=APPLIED&search=barclays
```

### Successful Response

**Status:** `200 OK`

Applications are returned newest-first.

If there are no matches:

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

The response contains the created application including generated ID and timestamps.

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

The response contains the requested application.

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

The response contains the updated application.

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
  "dueAt": "2026-08-12T09:30:00Z",
  "notes": "Review Java and Spring Boot examples.",
  "completed": false,
  "createdAt": "2026-08-11T08:00:00Z",
  "updatedAt": "2026-08-11T08:00:00Z"
}
```

## Reminder Fields

| Field | Create | Update | Rules |
|---|---:|---:|---|
| `title` | Required | Required | Non-blank; maximum 200 characters |
| `company` | Supported | Supported | Maximum 200 characters |
| `type` | Required | Required | Valid reminder type |
| `dueAt` | Required | Required | ISO-8601 instant |
| `notes` | Optional | Optional | Text |
| `completed` | Backend default | Required | Boolean |

When no company is required, the mobile client uses an empty string.

---

# Create Reminder

```http
POST /api/v1/reminders
```

### Authentication

Required.

### Successful Response

**Status:** `201 Created`

The response contains the created reminder.

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

Returns the updated reminder.

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

- Requested application ID
- Authenticated user ID

Another user's application is not exposed.

The API returns:

```text
404 Not Found
```

## Reminders

Reminder access is similarly scoped using:

- Requested reminder ID
- Authenticated user ID

Another user's reminder is not exposed.

## Email Verification

Verification challenge records are associated with an individual user.

Raw verification codes are never used as persistent identifiers.

## Account Deletion

Account deletion does not accept a user ID in the URL or request body.

The backend derives the account identity from the authenticated JWT.

---

# Error Response Format

API errors use a consistent JSON structure.

Current structure:

```json
{
  "timestamp": "2026-08-11T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VERIFICATION_CODE_INCORRECT",
  "message": "Verification code is incorrect",
  "path": "/api/v1/auth/verify-email",
  "fieldErrors": {},
  "retryAfterSeconds": null
}
```

## Error Fields

| Field | Description |
|---|---|
| `timestamp` | Time the backend created the error |
| `status` | Numeric HTTP status |
| `error` | HTTP reason |
| `code` | Machine-readable ApplyMate error code when available |
| `message` | User-readable/backend-defined explanation |
| `path` | Requested API path |
| `fieldErrors` | Validation messages keyed by request field |
| `retryAfterSeconds` | Retry delay for applicable rate-limit/cooldown errors |

For errors that do not have an ApplyMate-specific machine code:

```json
"code": null
```

For errors without retry timing:

```json
"retryAfterSeconds": null
```

---

# Validation Error Example

```json
{
  "timestamp": "2026-08-11T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": null,
  "message": "Request validation failed",
  "path": "/api/v1/applications",
  "fieldErrors": {
    "company": "Company is required",
    "status": "Status is required"
  },
  "retryAfterSeconds": null
}
```

---

# Email Verification Error Codes

| Code | Typical HTTP Status | Meaning |
|---|---:|---|
| `EMAIL_VERIFICATION_REQUIRED` | `403` | Account must verify email before authenticated access |
| `VERIFICATION_CODE_INCORRECT` | `400` | Submitted verification code is incorrect |
| `VERIFICATION_CODE_EXPIRED` | `410` | Verification challenge has expired |
| `VERIFICATION_ATTEMPTS_EXCEEDED` | `429` | Too many incorrect verification attempts |
| `VERIFICATION_RESEND_COOLDOWN` | `429` | Resend requested too soon |
| `VERIFICATION_RATE_LIMITED` | `429` | Verification-code issuance limit reached |
| `VERIFICATION_EMAIL_UNAVAILABLE` | `503` | Verification email provider is temporarily unavailable |

---

# Common HTTP Statuses

| Status | Meaning |
|---:|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `202 Accepted` | Verification resend request accepted |
| `204 No Content` | Operation succeeded without response body |
| `400 Bad Request` | Validation, malformed JSON, UUID, parameter or verification-code error |
| `401 Unauthorized` | Authentication missing/invalid, login failure or invalid refresh session |
| `403 Forbidden` | Email verification required or authenticated operation forbidden |
| `404 Not Found` | User or owned resource not found |
| `409 Conflict` | Registration email already exists |
| `410 Gone` | Verification code has expired |
| `429 Too Many Requests` | Verification attempts/cooldown/rate limit exceeded |
| `500 Internal Server Error` | Unexpected backend failure |
| `503 Service Unavailable` | Verification email provider unavailable |

---

# Authentication Error Handling

A protected request without valid access authentication returns:

```http
WWW-Authenticate: Bearer
```

A `401` from a protected request does not necessarily mean the user must immediately log in again.

The mobile client performs:

```text
Protected request returns 401
        |
        v
Check refresh token
        |
        v
POST /api/v1/auth/refresh
        |
        â”œâ”€â”€ Success
        â”‚      |
        â”‚      v
        â”‚  Store rotated token pair
        â”‚      |
        â”‚      v
        â”‚  Retry original request once
        â”‚
        â””â”€â”€ Invalid/expired/revoked refresh session
               |
               v
           Clear session
               |
               v
           Return to authentication flow
```

If refresh fails with:

```text
EMAIL_VERIFICATION_REQUIRED
```

the session cannot be used to bypass verification.

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

This allows an interrupted verification flow to resume after the application is restarted.

---

# Date and Identifier Formats

## UUIDs

User, application and reminder identifiers use UUID strings:

```text
06feb388-7a80-409a-a8b3-9cff672b083c
```

## Verification Codes

Email-verification codes use:

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

Reminder due times, authentication expiry times and verification timestamps use ISO-8601 instants.

Example:

```text
2026-08-12T09:30:00Z
```

---

# Production Email Delivery

Verification email is sent through Resend.

Production sender:

```text
ApplyMate <verify@applymate.website>
```

Verified sending domain:

```text
applymate.website
```

The Resend API key exists only in backend production configuration.

It is never returned by the API or bundled with the mobile application.

The backend also uses a separate secret verification pepper for HMAC protection of stored verification codes.

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
V8
```

The production environment can experience a cold-start delay after inactivity.

Backend readiness can be checked through:

```text
GET /api/v1/status
GET /actuator/health
```

When healthy, both return HTTP `200` and `UP`.

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

- API status
- Actuator health
- Existing-user login after migration
- New-user registration
- New users initially remaining unverified
- Verification challenge creation
- Real verification-email delivery
- Verification code acceptance
- Incorrect-code rejection
- Verification resend
- Old-code invalidation after resend
- Unverified-login rejection
- Successful login after verification
- Access-token issuance
- Refresh-token issuance
- Refresh-token rotation
- Unverified-refresh protection
- Application access after authentication
- Flyway V6/V7 rollout
- Resend configuration recovery
- Resend secret-handling hotfix
- Flyway V8 rollout cleanup
- Final production API and health checks
