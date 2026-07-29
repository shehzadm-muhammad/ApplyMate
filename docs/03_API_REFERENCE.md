# ApplyMate API Reference

## Overview

ApplyMate exposes a JSON REST API from the Spring Boot backend.

All primary application endpoints use the following prefix:

```text
/api/v1

## Content Type

Requests containing a JSON body should include:

```http
Content-Type: application/json
Accept: application/json
```

## Authentication

Protected endpoints require a JWT access token:

```http
Authorization: Bearer <access-token>
```

The access token is returned by the login endpoint.

The following routes are public:

* `GET /api/v1/status`
* `POST /api/v1/auth/register`
* `POST /api/v1/auth/login`
* `GET /actuator/health`

All user and application routes require authentication.

## Application Status Values

The backend accepts these exact uppercase values:

```text
SAVED
APPLIED
ASSESSMENT
INTERVIEW
OFFER
REJECTED
```

Invalid status values result in `400 Bad Request`.

---

# System Endpoints

## Get API status

```http
GET /api/v1/status
```

### Authentication

Not required.

### Successful response

**Status:** `200 OK`

```json
{
  "name": "ApplyMate API",
  "version": "1.0.0",
  "status": "UP"
}
```

This endpoint confirms that the application API is responding.

It does not provide detailed database-health information.

---

## Get operational health

```http
GET /actuator/health
```

### Authentication

Not required.

### Successful response

**Status:** `200 OK`

A typical healthy response is:

```json
{
  "status": "UP"
}
```

This endpoint is intended for deployment-platform health checks.

---

### Production verification

The deployed production endpoints are:

```text
https://applymate-api-bami.onrender.com/api/v1/status
https://applymate-api-bami.onrender.com/actuator/health

# Authentication Endpoints

## Register a user

```http
POST /api/v1/auth/register
```

### Authentication

Not required.

### Request body

```json
{
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "email": "muhammad@example.com",
  "password": "securePassword123"
}
```

### Validation

| Field       | Required | Rules                                                 |
| ----------- | -------: | ----------------------------------------------------- |
| `firstName` |      Yes | Must not be blank; maximum 100 characters             |
| `lastName`  |      Yes | Must not be blank; maximum 100 characters             |
| `email`     |      Yes | Must be a valid email address; maximum 320 characters |
| `password`  |      Yes | Between 8 and 72 characters                           |

Email addresses are trimmed and normalised to lowercase before storage.

### Successful response

**Status:** `201 Created`

```json
{
  "id": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "createdAt": "2026-07-28T10:30:00Z"
}
```

### Possible errors

* `400 Bad Request` — request validation failed
* `409 Conflict` — an account already exists for the supplied email
* `500 Internal Server Error` — unexpected backend failure

---

## Log in

```http
POST /api/v1/auth/login
```

### Authentication

Not required.

### Request body

```json
{
  "email": "muhammad@example.com",
  "password": "securePassword123"
}
```

### Validation

| Field      | Required | Rules                         |
| ---------- | -------: | ----------------------------- |
| `email`    |      Yes | Must be a valid email address |
| `password` |      Yes | Must not be blank             |

### Successful response

**Status:** `200 OK`

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresAt": "2026-07-28T10:45:00Z",
  "userId": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad"
}
```

The frontend must send the returned token with subsequent protected requests:

```http
Authorization: Bearer <jwt-access-token>
```

### Possible errors

* `400 Bad Request` — malformed or invalid request body
* `401 Unauthorized` — email or password is incorrect
* `500 Internal Server Error` — unexpected backend failure

---

# User Endpoints

## Get the current user

```http
GET /api/v1/users/me
```

### Authentication

Required.

### Successful response

**Status:** `200 OK`

```json
{
  "id": "9cb0a8ba-1117-4af0-a04f-32a383459987",
  "email": "muhammad@example.com",
  "firstName": "Muhammad",
  "lastName": "Shehzad",
  "enabled": true,
  "createdAt": "2026-07-28T10:30:00Z"
}
```

### Possible errors

* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — the authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

# Application Endpoints

All application endpoints operate only on records owned by the authenticated user.

A user cannot retrieve, update or delete another user's application.

When an application does not exist or does not belong to the authenticated user, the API returns `404 Not Found`.

## Application object

Application responses use this structure:

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
  "createdAt": "2026-07-28T11:00:00Z",
  "updatedAt": "2026-07-28T11:00:00Z"
}
```

## Application fields

| Field                 | Required | Validation                                                                |
| --------------------- | -------: | ------------------------------------------------------------------------- |
| `jobUrl`              |       No | Maximum 2,000 characters; empty or beginning with `http://` or `https://` |
| `company`             |      Yes | Must not be blank; maximum 200 characters                                 |
| `jobTitle`            |      Yes | Must not be blank; maximum 200 characters                                 |
| `location`            |       No | Maximum 200 characters                                                    |
| `salary`              |       No | Maximum 200 characters                                                    |
| `status`              |      Yes | Must be one of the supported backend status values                        |
| `notes`               |       No | Maximum 5,000 characters                                                  |
| `jobDescription`      |       No | Maximum 20,000 characters                                                 |
| `requiredSkills`      |       No | Maximum 10,000 characters                                                 |
| `benefits`            |       No | Maximum 10,000 characters                                                 |
| `recruiter`           |       No | Maximum 200 characters                                                    |
| `applicationDeadline` |       No | ISO date in `YYYY-MM-DD` format                                           |

Optional text fields may be supplied as empty strings.

---

## List applications

```http
GET /api/v1/applications
```

### Authentication

Required.

### Query parameters

| Parameter | Required | Description                                     |
| --------- | -------: | ----------------------------------------------- |
| `status`  |       No | Filters by one exact backend application status |
| `search`  |       No | Performs a case-insensitive text search         |

The parameters may be used individually or together.

### Search fields

The `search` value is matched against:

* Company
* Job title
* Location
* Recruiter
* Required skills

### Examples

List all applications:

```http
GET /api/v1/applications
```

Filter by status:

```http
GET /api/v1/applications?status=INTERVIEW
```

Search by text:

```http
GET /api/v1/applications?search=java
```

Combine filtering and search:

```http
GET /api/v1/applications?status=APPLIED&search=barclays
```

Query values must be URL encoded by the client.

### Successful response

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
    "createdAt": "2026-07-28T11:00:00Z",
    "updatedAt": "2026-07-28T11:00:00Z"
  }
]
```

Applications are returned with the newest created records first.

An authenticated user with no matching applications receives:

```json
[]
```

### Possible errors

* `400 Bad Request` — invalid query-parameter value
* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — the authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

## Create an application

```http
POST /api/v1/applications
```

### Authentication

Required.

### Request body

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

### Successful response

**Status:** `201 Created`

The response body contains the newly created application object, including its generated `id`, `createdAt` and `updatedAt` values.

### Possible errors

* `400 Bad Request` — validation failed or the request body is malformed
* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — the authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

## Get an application

```http
GET /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Path parameter

| Parameter       | Description             |
| --------------- | ----------------------- |
| `applicationId` | UUID of the application |

### Example

```http
GET /api/v1/applications/06feb388-7a80-409a-a8b3-9cff672b083c
```

### Successful response

**Status:** `200 OK`

The response body contains the requested application object.

### Possible errors

* `400 Bad Request` — `applicationId` is not a valid UUID
* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — application does not exist or belongs to another user
* `500 Internal Server Error` — unexpected backend failure

---

## Update an application

```http
PUT /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Request body

The update request uses the same fields and validation rules as the create request.

This is a full update operation. Required fields such as `company`, `jobTitle` and `status` must still be supplied.

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

### Successful response

**Status:** `200 OK`

The response body contains the updated application object.

### Possible errors

* `400 Bad Request` — invalid UUID, validation failure or malformed request body
* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — application does not exist or belongs to another user
* `500 Internal Server Error` — unexpected backend failure

---

## Delete an application

```http
DELETE /api/v1/applications/{applicationId}
```

### Authentication

Required.

### Successful response

**Status:** `204 No Content`

The response contains no body.

### Possible errors

* `400 Bad Request` — `applicationId` is not a valid UUID
* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — application does not exist or belongs to another user
* `500 Internal Server Error` — unexpected backend failure

---

## Get application summary

```http
GET /api/v1/applications/summary
```

### Authentication

Required.

### Successful response

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

All supported status fields are included, even when their count is zero.

The `total` value is the sum of all status counts belonging to the authenticated user.

### Possible errors

* `401 Unauthorized` — token is missing, invalid or expired
* `404 Not Found` — the authenticated user no longer exists
* `500 Internal Server Error` — unexpected backend failure

---

# Error Response Format

API errors use a consistent JSON structure:

```json
{
  "timestamp": "2026-07-28T11:15:00Z",
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

## Error fields

| Field         | Description                                          |
| ------------- | ---------------------------------------------------- |
| `timestamp`   | Time at which the backend created the error response |
| `status`      | Numeric HTTP status                                  |
| `error`       | Standard HTTP reason phrase                          |
| `message`     | General explanation of the error                     |
| `path`        | Requested API path                                   |
| `fieldErrors` | Validation messages keyed by request-field name      |

For errors not related to field validation, `fieldErrors` is normally empty:

```json
{
  "timestamp": "2026-07-28T11:15:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication is required",
  "path": "/api/v1/applications",
  "fieldErrors": {}
}
```

## Common HTTP statuses

|                      Status | Meaning in ApplyMate                                       |
| --------------------------: | ---------------------------------------------------------- |
|                    `200 OK` | Request succeeded                                          |
|               `201 Created` | A resource was created                                     |
|            `204 No Content` | Resource was deleted                                       |
|           `400 Bad Request` | Validation, malformed JSON, UUID or parameter error        |
|          `401 Unauthorized` | Authentication is absent, invalid, expired or login failed |
|             `403 Forbidden` | An authenticated principal does not have permission        |
|             `404 Not Found` | User or owned application was not found                    |
|              `409 Conflict` | Registration email already exists                          |
| `500 Internal Server Error` | Unexpected backend error                                   |

## Authentication-error headers

A protected request that is missing valid authentication returns:

```http
WWW-Authenticate: Bearer
Cache-Control: no-store
```

Clients should remove invalid or expired login state after receiving an authenticated `401 Unauthorized` response.

---

# Date and Identifier Formats

## UUIDs

User and application identifiers use UUID strings:

```text
06feb388-7a80-409a-a8b3-9cff672b083c
```

## Calendar dates

Application deadlines use ISO calendar dates:

```text
2026-08-15
```

## Timestamps

Created, updated and expiry timestamps use ISO-8601 UTC timestamps:

```text
2026-07-28T11:00:00Z
```

---

# API Ownership Rule

Application access is always scoped using both:

* The requested application identifier
* The authenticated user's identifier

The API intentionally returns `404 Not Found` when a requested application belongs to another user. This avoids exposing whether another user's application identifier exists.

---

# Production Behaviour

The production backend is hosted on Render's free service tier.

After a period of inactivity, the first request may take longer while the backend and database resume.

Clients should treat this as a temporary connection delay rather than an authentication failure.

The mobile application communicates only with the public HTTPS API. It never receives or stores PostgreSQL connection details.