# Task: Modernize Application UI And Theme System

## Metadata

- Task ID: `task-0003`
- Status: `in-progress`
- Priority: `high`
- Type: `refactor`
- Created At: `2026-04-01`
- Updated At: `2026-04-02`
- Source: `raw-tasks.md entry RAW-0001`
- Related Repos: `test-f`
- Dependencies: `visual direction confirmation during implementation`

## Original Request

- The entire application should have a more modern UI.
- You have freedom to move menus.
- Rounded corners are not around 8 px - 16 px.
- There should be a dark mode and light mode and an icon to switch between them.
- Like to have something similar to this screenshot: `.ai/resources/Screenshot 2026-03-24 091308.png`
- The theme color is `#532e90`. You can use some variation instead of blue in the screenshot.

## Normalized Goal

Introduce a modern visual system for the full frontend application, including updated navigation patterns, a branded purple-based theme, and a user-controlled dark/light mode.

## Scope

- Define a refreshed visual direction for the app
- Add app-wide theme tokens for light and dark modes
- Add a theme toggle control with icon-based switching
- Modernize layout, spacing, surfaces, and navigation placement
- Use the provided screenshot as visual inspiration while keeping the app specific to this product

## Out Of Scope

- Auth/session logic changes beyond presentation needs
- Backend API changes
- One-off cosmetic tweaks that do not align with a reusable design system

## Relevant Areas

- `app/layout.tsx`
- `app/globals.css`
- `app/dashboard/layout.tsx`
- `components/`
- `components/form/`
- `.ai/resources/Screenshot 2026-03-24 091308.png`

## Assumptions

- A design-system-first refactor is preferred over isolated page-level styling patches.
- Existing layouts may be restructured as long as workflows remain usable.
- The purple brand color should remain primary, with improved contrast and dark-mode variants.

## Plan

1. Audit the current layout and shared component styling approach.
2. Define theme variables, dark/light mode behavior, and navigation direction.
3. Update global styles and shared shell components first.
4. Roll the new visual system through major app surfaces incrementally.
5. Verify consistency and responsiveness after each major slice.

## Progress Notes

- `2026-04-01`: Created from `RAW-0001` as a separate app-wide UI modernization task.
- `2026-04-02`: Started implementation with global theme tokens, dark/light mode support, and dashboard shell redesign.
- `2026-04-02`: Added a theme provider, global design tokens, theme toggle, updated typography, and reusable surface/input/button styles.
- `2026-04-02`: Rebuilt the dashboard shell into a sidebar workspace layout and refreshed login, modal, welcome, and loading experiences.
- `2026-04-02`: Adjusted the shell to a compact top navigation layout to preserve width for table-heavy pages and reduced the default radius scale.
- `2026-04-02`: Restyled the shared admin table component, pagination, and related inputs/selects while keeping the existing table behavior and structure intact.

## Verification

- `npm run lint` completed successfully. Existing unrelated React hook warnings remain in legacy feature files.

## Result

- Global light/dark theme support now exists.
- The main shell and high-visibility shared surfaces reflect the new visual direction.
- Additional legacy page internals still need incremental restyling to fully unify the app.
