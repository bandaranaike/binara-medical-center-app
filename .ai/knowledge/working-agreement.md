# Working Agreement

## How Tasks Flow

1. The user writes a raw request in any language in `tasks/inbox/raw-tasks.md`.
2. The raw request is converted into a normalized task file.
3. The task gets a status and is moved into the matching folder.
4. Code changes are implemented against that task.
5. The task file is updated with progress, decisions, and verification notes.
6. When finished, the task is moved to `tasks/done/`.

## Task File Naming

- Use `task-XXXX-short-kebab-name.md`
- Example: `task-0007-restructure-dashboard-routing.md`

## Status Folder Rules

- `tasks/planned/` for ready but not started work
- `tasks/in-progress/` for active work only
- `tasks/blocked/` for paused tasks waiting on something
- `tasks/done/` for completed tasks
- `tasks/cancelled/` for intentionally abandoned or replaced tasks

## Update Rules

- Keep `tasks/index.md` in sync with the task file.
- Add implementation notes directly in the task file.
- Add reusable knowledge to `.ai/knowledge/`, not just to the task file.

## Verification Rule

- Run `npm run lint` when code changes are made, unless blocked by an unrelated issue.
