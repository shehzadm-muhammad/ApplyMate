# ApplyMate Project Context

## Product
ApplyMate is a React Native job-application tracker with a Spring Boot API
and PostgreSQL database.

## Current Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation

### Backend
- Java 21
- Spring Boot 3.5
- Maven
- PostgreSQL 17
- Flyway
- JWT authentication
- Docker Compose

## Current Git State
- Current branch: feat/frontend-api-integration
- Latest completed milestone: Application CRUD frontend/backend integration

## Completed Features
- Registration
- Login
- JWT authentication
- Protected navigation
- Current-user profile
- Create application
- List applications
- Application details
- Edit application
- Delete application
- User-specific application separation
- Dashboard reads backend application data
- Profile reads backend application data

## Application API
- GET /api/v1/applications
- POST /api/v1/applications
- GET /api/v1/applications/{id}
- PUT /api/v1/applications/{id}
- DELETE /api/v1/applications/{id}
- GET /api/v1/applications/summary

## Status Mapping

Frontend:
- Saved
- Applied
- Assessment
- Interview
- Offer
- Rejected

Backend:
- SAVED
- APPLIED
- ASSESSMENT
- INTERVIEW
- OFFER
- REJECTED

## Local-Only Features
These remain in AsyncStorage for now:
- Reminders
- Local notifications
- Face ID preference
- Notification settings

## Important Decisions
- Application data must always use the backend.
- Reminders remain local until notification synchronisation is designed.
- Do not redesign screens during backend migration.
- Preserve existing TypeScript service function names where practical.

## Current Sprint
MVP polish.

### Planned Order
1. Dashboard summary endpoint
2. Frontend loading and error states
3. Pull-to-refresh
4. Application search
5. Status filtering
6. Sorting
7. Backend validation
8. Global backend exception handling
9. Tests and code cleanup

## Next Immediate Task
Connect DashboardScreen to:
GET /api/v1/applications/summary