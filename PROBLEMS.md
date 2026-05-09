# PROBLEMS.md

## Issues Found & Fixed During Testing

### 1. Missing `/api/trips/:id/seats` endpoint (FIXED)
- **Problem**: The `TripsController` had no `@Get(':id/seats')` route, but `TripsService.getAvailableSeats()` existed and the frontend called `/trips/${tripId}/seats`.
- **Fix**: Added `@Get(':id/seats')` route to `backend/src/modules/trips/trips.controller.ts` delegating to `tripsService.getAvailableSeats(id)`.

### 2. bcrypt modules not mocked in service tests (FIXED)
- **Problem**: `auth.service.spec.ts` and `users.service.spec.ts` tried to assert on `bcrypt.hash`/`bcrypt.compare` without mocking the modules, causing "received value must be a mock or spy function" errors.
- **Fix**: Added `jest.mock('bcryptjs', ...)` to `auth.service.spec.ts` and `jest.mock('bcrypt', ...)` to `users.service.spec.ts`.

### 3. TypeScript type errors on bcrypt spy mocks (FIXED)
- **Problem**: `jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)` caused TS2345 type errors in `auth.service.spec.ts`.
- **Fix**: Replaced `jest.spyOn` with direct mock calls: `(bcrypt.compare as jest.Mock).mockResolvedValue(false)`.

## Known Limitations

### 1. E2E tests use mocked Prisma, not real database
- E2E tests (`app.e2e-spec.ts`) override `PrismaService` with a mocked instance. This means they test controller/service wiring but not actual database interactions. A real integration test suite would need a test PostgreSQL instance.

### 2. Frontend tests mock all external dependencies
- API tests mock `axios` at the module level. Auth context tests mock `next/navigation` and `@/lib/api`. This means tests verify internal logic but not actual HTTP communication or Next.js routing behavior.

### 3. No page-level component tests
- Frontend tests cover the API layer (`api.ts`) and auth context (`context.tsx`). Individual page components (routes, schedule, bookings, etc.) are not unit tested due to their complexity (multiple PrimeReact components, server/client boundaries).

### 4. No e2e browser tests (Playwright/Cypress)
- No end-to-end browser automation tests exist. All tests are unit-level (Jest) or API-level (supertest).

## Test Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Backend Unit (10 services + 1 controller) | 93 | PASS |
| Backend E2E (all controllers) | 22 | PASS |
| Frontend Unit (API layer + Auth context) | 60 | PASS |
| **Total** | **175** | **ALL PASS** |
