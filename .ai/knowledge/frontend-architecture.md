# Frontend Architecture Notes

## Routing

- The app uses the Next.js App Router.
- Route files live in `app/`.
- Dashboard sections are split by role or workflow under `app/dashboard/*`.

## Shared UI

- Large domain components live in `components/`.
- Reusable form controls live in `components/form/`.
- Admin-specific UI lives in `components/admin/`.
- Report-related UI lives in `components/reports/`.
- Reception and doctor specific UI live in `components/reception/` and `components/doctor/`.

## Shared Helpers

- API client: `lib/axios.ts`
- Modal state: `lib/modalStore.ts`
- Dashboard tab helpers: `lib/dashboardTabs.ts`
- Formatting helpers: `lib/readableDate.ts`, `lib/numbers.ts`, `lib/strings.ts`

## Cross-Cutting Concerns

- Authentication and user context appear to be frontend-managed through shared context and API calls.
- A number of pages are role-specific, so restructures should preserve access flow and dashboard navigation expectations.
- Existing helper components should be preferred over one-off controls.

## Restructure Guidance

- Keep route ownership clear.
- Avoid duplicating existing UI primitives.
- Prefer incremental refactors tied to task files.
- Record architecture decisions in `.ai/knowledge/` when they affect future work.
