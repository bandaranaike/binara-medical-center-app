# Project Overview

## Repositories

- Frontend: `/home/eranda/test/test-f`
- Backend API: `/home/eranda/test/test-b`

## Frontend Stack

- Next.js `15.5.9`
- React `18.3.1`
- TypeScript
- Tailwind CSS
- Axios for API requests
- Zustand for some client state

## Main Frontend Areas

- Authentication pages under `app/login` and `app/password-reset`
- Dashboard routes under `app/dashboard`
- Shared UI components in `components/`
- Form helpers in `components/form/`
- Shared utilities in `lib/`
- Shared types in `types/`
- User state in `context/UserContext.tsx`

## Important Local Conventions

- Use TypeScript and React functional components.
- Prefer arrow functions.
- Use four-space indentation.
- Use Tailwind utility classes for styling.
- Import app modules with the `@/` alias.
- Reuse existing shared components where possible.

## Validation

- Primary automated check currently available: `npm run lint`
