# AI Workspace

This folder keeps project knowledge, task intake, and normalized task tracking for the Next.js frontend in this repository.

## Purpose

- Keep stable project knowledge in versioned markdown files.
- Let the user write raw tasks in any language.
- Convert raw requests into structured task files before or during implementation.
- Track whether a task is planned, in progress, blocked, done, or cancelled.
- Keep implementation history attached to task files.

## Structure

- `knowledge/`
  - Stable project notes that should be reused across tasks.
- `tasks/`
  - Raw intake, normalized tasks, task index, and status-based folders.
- `templates/`
  - Reusable templates for task conversion and knowledge updates.

## Operating Rules

1. The user adds raw requests to `tasks/inbox/raw-tasks.md` in any language.
2. Each raw request is converted into one normalized task file using `templates/task-template.md`.
3. The normalized task file is placed in the correct status folder.
4. Every code change should reference a task file.
5. When work progresses, update both the task file and `tasks/index.md`.
6. Reusable findings from completed work should be added to `knowledge/`.

## Task Statuses

- `planned`: approved or understood, but not started.
- `in-progress`: currently being worked on.
- `blocked`: cannot proceed until a dependency or decision is resolved.
- `done`: finished and verified as far as the repo allows.
- `cancelled`: intentionally stopped or replaced.

## Current Scope

- Frontend app: this repository (`test-f`)
- Backend API: sibling Laravel repository at `/home/eranda/test/test-b`
