# ApplyMate API Reference

## Overview

ApplyMate exposes a JSON REST API from the Spring Boot backend.

All primary application endpoints use:

```text
/api/v1
````

Production API:

```text
https://applymate-api-bami.onrender.com
```

## Content Type

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

* Short-lived JWT access tokens
* Long-lived refresh tokens
* Refresh-token rotation
* Server-side refresh-session revocation

Production session configuration:

```text
Access token lifetime: 1 hour
Refresh session lifetime: 30 days
```

## Public Routes

These routes do not require a valid access token:

```text
GET  /api/v1/status
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /actuator/health
```

The refresh endpoint must remain public because it is specifically used when an access token has expired.

Logout also accepts a refresh token directly and does not require the access token to remain valid.

## Protected Routes

User, application and reminder routes require:

```http
Authorization: Bearer <access-token>
```

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

This endpoint is intended for operational and deployment health checks.

### Production URLs

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

| Field       | Required | Rules                                       |
| ----------- | -------: | ------------------------------------------- |
| `firstName` |      Yes | Must not be blank; maximum 100 characters   |
| `lastName`  |      Yes | Must not be blank; maximum 100 characters   |
| `email`     |      Yes | Valid email address; maximum 320 characters |
| `password`  |      Yes | Between 8 and 72 characters                 |

Email addresses are normalised before storage.

### Successful Response

**Status:** `201 Created`

```json
{
  "id": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "createdAt": "2026-08-08T08:00:00Z"
}
```

### Possible Errors

* `400 Bad Request` — validation failed
* `409 Conflict` — email already exists
* `500 Internal Server Error` — unexpected backend failure

---

## Log In

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
  "expiresAt": "2026-08-08T09:00:00Z",
  "refreshToken": "<opaque-refresh-token>",
  "refreshExpiresAt": "2026-09-07T08:00:00Z",
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

### Possible Errors

* `400 Bad Request` — malformed or invalid request
* `401 Unauthorized` — credentials are incorrect
* `500 Internal Server Error` — unexpected backend failure

---

## Refresh an Authentication Session

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
  "expiresAt": "2026-08-08T10:00:00Z",
  "refreshToken": "<new-refresh-token>",
  "refreshExpiresAt": "2026-09-07T09:00:00Z",
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

### Possible Errors

* `400 Bad Request` — refresh token is missing/blank
* `401 Unauthorized` — refresh token is invalid, expired, revoked or otherwise unusable
* `500 Internal Server Error` — unexpected backend failure

---

## Log Out

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

The client should then remove its locally stored access and refresh tokens.

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
  "createdAt": "2026-08-08T08:00:00Z"
}
```

### Possible Errors

* `401 Unauthorized` — access token missing, invalid or expired
* `404 Not Found` — authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

## Delete Current User

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

Deleting the user permanently removes the user's backend-owned data, including:

* User account
* Job applications
* Reminders
* Refresh-token sessions

The mobile client separately performs local cleanup after the server confirms successful deletion.

### Possible Errors

* `401 Unauthorized` — access token missing, invalid or expired
* `404 Not Found` — authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

# Application Endpoints

All application endpoints operate only on records owned by the authenticated user.

A user cannot retrieve, update or delete another user's application.

When an application does not exist or does not belong to the authenticated user, the API returns:

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
  "createdAt": "2026-08-08T08:00:00Z",
  "updatedAt": "2026-08-08T08:00:00Z"
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

| Parameter | Required | Description                              |
| --------- | -------: | ---------------------------------------- |
| `status`  |       No | Filter by one backend application status |
| `search`  |       No | Case-insensitive text search             |

The parameters may be used independently or together.

### Search Fields

Search applies to:

* Company
* Job title
* Location
* Recruiter
* Required skills

### Examples

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

```json
[
  {
    "id": "06feb388-7a80-409a-a8b3-9cff672b083c",
    "jobUrl": "https://example.com/jobs/java-developer",
    "company": "Example Company",
    "jobTitle": "Junior Java Developer",
    "location": "Birmingham",
    "salary": "£30,000",
    "status": "APPLIED",
    "notes": "",
    "jobDescription": "",
    "requiredSkills": "Java, Spring Boot",
    "benefits": "",
    "recruiter": "",
    "applicationDeadline": null,
    "createdAt": "2026-08-08T08:00:00Z",
    "updatedAt": "2026-08-08T08:00:00Z"
  }
]
```

Applications are returned newest-first.

If there are no matching applications:

```json
[]
```

---

## Create Application

```http
POST /api/v1/applications
```

### Authentication

Required.

### Request Body

```json
{
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
  "applicationDeadline": "2026-08-15"
}
```

### Successful Response

**Status:** `201 Created`

The response contains the created application including generated ID and timestamps.

---

## Get Application

```http
GET /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Path Parameter

`applicationId` must be a valid UUID.

### Successful Response

**Status:** `200 OK`

The response contains the requested application.

---

## Update Application

```http
PUT /api/v1/applications/{applicationId}
```

### Authentication

Required.

This is a full update operation.

Required fields such as `company`, `jobTitle` and `status` must still be supplied.

### Example Request

```json
{
  "jobUrl": "https://example.com/jobs/java-developer",
  "company": "Example Company",
  "jobTitle": "Junior Java Developer",
  "location": "Birmingham",
  "salary": "£32,000",
  "status": "INTERVIEW",
  "notes": "First interview booked.",
  "jobDescription": "Develop and maintain backend services.",
  "requiredSkills": "Java, Spring Boot, PostgreSQL",
  "benefits": "Hybrid working and pension",
  "recruiter": "Jane Smith",
  "applicationDeadline": "2026-08-15"
}
```

### Successful Response

**Status:** `200 OK`

The response contains the updated application.

---

## Delete Application

```http
DELETE /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Successful Response

**Status:** `204 No Content`

---

## Get Application Summary

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
  "createdAt": "2026-08-08T08:00:00Z",
  "updatedAt": "2026-08-08T08:00:00Z"
}
```

## Reminder Fields

| Field       |          Create |             Update | Rules                             |
| ----------- | --------------: | -----------------: | --------------------------------- |
| `title`     |        Required |           Required | Non-blank; maximum 200 characters |
| `company`   |       Supported |          Supported | Maximum 200 characters            |
| `type`      |        Required |           Required | Valid reminder type               |
| `dueAt`     |        Required |           Required | ISO-8601 instant                  |
| `notes`     |        Optional |           Optional | Text                              |
| `completed` | Backend default | Required on update | Boolean                           |

When no company is required, the mobile client uses an empty string.

## Create Reminder

```http
POST /api/v1/reminders
```

### Authentication

Required.

### Request Body

```json
{
  "title": "Prepare for interview",
  "company": "Example Company",
  "type": "INTERVIEW",
  "dueAt": "2026-08-12T09:30:00Z",
  "notes": "Review Java and Spring Boot examples."
}
```

### Successful Response

**Status:** `201 Created`

The response contains the created reminder.

New reminders begin with their backend-defined default completion state.

---

## List Reminders

```http
GET /api/v1/reminders
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

```json
[
  {
    "id": "83f619c6-c55a-4ac0-a868-364468299d85",
    "title": "Prepare for interview",
    "company": "Example Company",
    "type": "INTERVIEW",
    "dueAt": "2026-08-12T09:30:00Z",
    "notes": "Review Java and Spring Boot examples.",
    "completed": false,
    "createdAt": "2026-08-08T08:00:00Z",
    "updatedAt": "2026-08-08T08:00:00Z"
  }
]
```

Reminders are returned ordered by `dueAt` ascending.

An authenticated user with no reminders receives:

```json
[]
```

---

## Get Reminder

```http
GET /api/v1/reminders/{reminderId}
```

### Authentication

Required.

### Successful Response

**Status:** `200 OK`

Returns the owned reminder.

If the reminder does not exist or belongs to another user:

```text
404 Not Found
```

---

## Update Reminder

```http
PUT /api/v1/reminders/{reminderId}
```

### Authentication

Required.

### Request Body

```json
{
  "title": "Prepare for technical interview",
  "company": "Example Company",
  "type": "INTERVIEW",
  "dueAt": "2026-08-12T10:00:00Z",
  "notes": "Review Java, Spring Boot and PostgreSQL.",
  "completed": true
}
```

### Successful Response

**Status:** `200 OK`

Returns the updated reminder.

---

## Delete Reminder

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

* Requested application ID
* Authenticated user ID

If another user's application ID is supplied, the API returns:

```text
404 Not Found
```

## Reminders

Reminder access is similarly scoped using:

* Requested reminder ID
* Authenticated user ID

Another user's reminder is not exposed.

## Account Deletion

Account deletion does not accept a user ID in the URL or request body.

The backend derives the account identity from the authenticated JWT.

---

# Error Response Format

API errors use a consistent JSON structure.

Example validation response:

```json
{
  "timestamp": "2026-08-08T08:15:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Request validation failed",
  "path": "/api/v1/applications",
  "fieldErrors": {
    "company": "Company is required",
    "status": "Status is required"
  }
}
```

## Error Fields

| Field         | Description                                |
| ------------- | ------------------------------------------ |
| `timestamp`   | Time the backend created the error         |
| `status`      | Numeric HTTP status                        |
| `error`       | HTTP reason                                |
| `message`     | User-readable/backend-defined explanation  |
| `path`        | Requested API path                         |
| `fieldErrors` | Validation messages keyed by request field |

Non-field errors normally contain an empty `fieldErrors` object.

Example:

```json
{
  "timestamp": "2026-08-08T08:15:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication is required",
  "path": "/api/v1/applications",
  "fieldErrors": {}
}
```

## Common HTTP Statuses

|                      Status | Meaning                                                                  |
| --------------------------: | ------------------------------------------------------------------------ |
|                    `200 OK` | Request succeeded                                                        |
|               `201 Created` | Resource created                                                         |
|            `204 No Content` | Operation succeeded without response body                                |
|           `400 Bad Request` | Validation, malformed JSON, UUID or parameter error                      |
|          `401 Unauthorized` | Authentication missing/invalid, login failure or invalid refresh session |
|             `403 Forbidden` | Authenticated principal lacks permission                                 |
|             `404 Not Found` | User or owned resource not found                                         |
|              `409 Conflict` | Registration email already exists                                        |
| `500 Internal Server Error` | Unexpected backend failure                                               |

---

# Authentication Error Handling

A protected request without valid access authentication returns:

```http
WWW-Authenticate: Bearer
```

A `401` from a protected request does **not necessarily mean the user must immediately log in again**.

The ApplyMate mobile client performs:

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
        │      |
        │      v
        │  Store rotated token pair
        │      |
        │      v
        │  Retry original request once
        │
        └── Invalid/expired/revoked refresh session
               |
               v
           Clear session
               |
               v
           Return to authentication flow
```

Temporary network/server failures during refresh are treated differently from confirmed invalid refresh credentials.

---

# Date and Identifier Formats

## UUIDs

User, application and reminder identifiers use UUID strings:

```text
06feb388-7a80-409a-a8b3-9cff672b083c
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

Reminder due times and authentication expiry times use ISO-8601 instants.

Example:

```text
2026-08-12T09:30:00Z
```

Created/updated timestamps also use ISO-8601 UTC values.

---

# Production Behaviour

Production API:

```text
https://applymate-api-bami.onrender.com
```

The production backend is hosted on Render.

Portfolio-tier hosting can experience a cold-start delay after inactivity.

During that period, clients may temporarily receive connection failures or service-unavailable responses while the backend becomes ready.

Backend readiness can be checked through:

```text
GET /api/v1/status
GET /actuator/health
```

When healthy, both return HTTP `200`.

The mobile application communicates only with the HTTPS API.

It never receives or stores PostgreSQL credentials.

---

# Current API Summary

```text
SYSTEM
GET    /api/v1/status
GET    /actuator/health

AUTHENTICATION
POST   /api/v1/auth/register
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