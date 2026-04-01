# Task: Overhaul Authentication And Login Flow

## Metadata

- Task ID: `task-0002`
- Status: `done`
- Priority: `high`
- Type: `refactor`
- Created At: `2026-04-01`
- Updated At: `2026-04-01`
- Source: `raw-tasks.md entry RAW-0001`
- Related Repos: `test-f`, `test-b`
- Dependencies: `backend auth contract review`, `session handling decision`

## Original Request

- There is an issue with login. Sometimes the session expires and I need to log in again.
- I want to fully refractor the login page and mechanism.
- The backend can be adjusted for the new login mechanism.
- It should be more secure as this is a public application.
- Only need a login page. No password reset nor create an account available.

## Normalized Goal

Redesign the authentication flow so the public app has a single secure login entry point, improved session handling, and a simplified auth surface without password reset or registration UI.

## Scope

- Audit the current frontend login flow and session persistence behavior
- Redesign the login page UX and implementation
- Remove or retire password reset and registration entry points from the frontend
- Align frontend auth behavior with a more secure backend-compatible flow
- Define required backend changes in the sibling Laravel API when necessary

## Out Of Scope

- Full role and permission redesign unless required by the new auth flow
- Non-auth dashboard redesign outside auth-related layout adjustments

## Relevant Areas

- `app/login/page.tsx`
- `components/authentication/`
- `context/UserContext.tsx`
- `lib/axios.ts`
- `middleware.ts`
- `/home/eranda/test/test-b`

## Assumptions

- Session expiry is at least partly caused by the current auth/session mechanism and not just an infrastructure timeout.
- The user is open to backend API changes to support a stronger login flow.
- Password reset and registration can be removed from the public UI without breaking current business requirements.

## Plan

1. Inspect the existing login, auth context, middleware, and API integration.
2. Identify the session expiration failure mode and propose a safer auth contract.
3. Refactor the login page and auth flow to a single-login-entry experience.
4. Remove password reset and registration UI paths if no longer needed.
5. Validate the updated flow with frontend checks and document any backend follow-up.

## Progress Notes

- `2026-04-01`: Created from `RAW-0001` as a dedicated auth/security task.
- `2026-04-01`: Started implementation. Direction changed to Sanctum cookie-based SPA auth to eliminate frontend token storage.
- `2026-04-01`: Replaced frontend token storage with backend session bootstrapping and client-side route guarding.
- `2026-04-01`: Reworked the login UI into a single staff-only entry page and redirected password reset routes back to login.
- `2026-04-01`: Updated Laravel staff auth endpoints to use session-based login/logout with staff-role enforcement instead of returning API tokens.
- `2026-04-01`: Local Firefox testing required same-site development domains instead of mixing `localhost` with a custom backend host.

## Verification

- `npm run lint` in `test-f` completed without errors. The repository still has existing React hook warnings in unrelated files.
- `php artisan test --compact tests/Feature/Auth/AuthenticationTest.php` in `test-b` passed.

## Result

- Staff authentication now uses Sanctum-backed browser sessions instead of frontend-managed bearer tokens.
- The frontend no longer stores auth tokens in cookies or local storage.
- Public auth UI is reduced to a single login experience for staff users.
