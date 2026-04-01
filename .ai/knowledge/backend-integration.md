# Backend Integration Notes

## Backend Location

- Laravel backend API repository: `/home/eranda/test/test-b`

## Frontend Integration Point

- Frontend API helper is expected through `lib/axios.ts`.

## Working Agreement

- When a frontend task depends on backend behavior, note the backend dependency in the task file.
- If backend updates are required, keep them as separate but linked tasks unless the user asks for cross-repo implementation in the same pass.
- If API contracts are unclear, record assumptions in the task file before implementation.

## To Expand Later

- Base API URL and environment conventions
- Auth flow details
- Shared DTO or response shape notes
- Known frontend-backend coupling risks
