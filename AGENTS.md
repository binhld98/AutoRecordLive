# AutoRecordLive Application

## Product

Build an application that lets users:

- Follow hosts or channels by URL.
- Automatically record their live streams when they start broadcasting.
- Store recordings so users can access and download them later.

## Repository Structure

- `fe/` — front-end application and user-facing experience.
- `be/` — back-end services, live-status monitoring, recording orchestration, and related APIs.
- `docs/` — product, architecture, and development documentation.

## Front-End Development Workflow

- Use `fe` as the default branch for SPA development in `fe/`.
- Start front-end work from `fe` in a dedicated Git worktree.
- Keep the work in that worktree available for review. Merge it back into `fe` only after the user has reviewed and verified the work and approved the merge.

## Commit Messages

Use this format:

```text
<type>[optional scope]: <short description>
```

Keep the message to one lowercase line, ideally 50 characters or fewer. Do not add a body or footer.

Allowed types:

- `feat` — new feature
- `fix` — bug fix
- `chore` — non-production maintenance, such as tooling or dependency updates
- `refactor` — code changes that neither add a feature nor fix a bug
- `docs` — documentation updates
- `style` — formatting or whitespace changes with no behavior impact
- `test` — add or update tests
- `perf` — performance improvement
- `ci` — continuous integration changes
- `build` — build system or external dependency changes
- `revert` — revert a previous commit
