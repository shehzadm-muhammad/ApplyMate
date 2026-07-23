# ApplyMate Backend

Spring Boot REST API for ApplyMate, a job-application tracking application.

## Features

- User registration
- Secure password hashing
- JWT authentication
- Current-user profile
- Job-application CRUD
- Per-user ownership protection
- Status filtering
- Case-insensitive search
- Dashboard summary counts
- PostgreSQL persistence
- Flyway database migrations
- Consistent JSON error responses
- CORS support for Expo web
- Automated tests and end-to-end smoke testing

## Technology

- Java 21 target
- Spring Boot 4.1
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- PostgreSQL 17
- Flyway
- Maven Wrapper
- Docker Compose
- JUnit, MockMvc and Mockito

## Project structure

```text
backend/
├── scripts/
│   └── smoke-test.ps1
├── src/
│   ├── main/
│   │   ├── java/com/applymate/backend/
│   │   │   ├── application/
│   │   │   ├── auth/
│   │   │   ├── common/error/
│   │   │   ├── security/
│   │   │   ├── system/
│   │   │   └── user/
│   │   └── resources/
│   │       ├── db/migration/
│   │       └── application.properties
│   └── test/
├── compose.yaml
├── .env.example
├── pom.xml
└── README.md