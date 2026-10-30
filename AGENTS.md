# AutoRecordLive Application

## Product

Build an application that lets users:

- Follow hosts or channels by URL.
- Automatically record their live streams when they start broadcasting.
- Store recordings so users can access and download them later.

## Repository Structure

This repository holds only the user app. The back end, admin console, and landing pages are out of scope.

- `user-app/` — the user app, where users follow hosts and watch and download recordings.
- `docs/` — product, architecture, and development documentation.

## Task Tracking

Work is tracked on Trello, with one board per sprint.

| Sprint | Board |
| --- | --- |
| `S0` | [Phase 0 - Concept/Requirements](https://trello.com/b/AWtmVjbe/phase-0-concept-requirements) |

Rules for every board:

- **Lists:** Backlog → Queued → In Progress → In Review → Closed.
- **Titles:** `<sprint>-<n>: <short description>`, such as `S0-4: Write product vision`. Number cards in order on each board; never reuse or renumber one.
- **Labels:** one per card, matching the [commit type](#commit-messages) of its work, such as `feat` or `docs`.
- **Access:** can read cards to gather context, but never create, move, or edit cards on your own.

## Development Workflow

- `main` is the only long-lived branch and must stay releasable.
- Do each piece of work in its own `<type>/<slug>` branch from `main`, such as `feat/follow-channel`.
- When the user approves the work, commit it, push the branch, and open a PR into `main`.
- Never merge the PR yourself. The user squash merges and deletes the remote branch on GitHub.
- When the user confirms the PR is done, switch to `main`, pull it, and delete the local branch.
- Release by tagging `main` with a version (e.g. `v0.3.0`) only when the user asks.
- Hotfix an old release: fix on `main`, cherry-pick into a release branch from its tag (e.g. `release/v0.3.x`), and tag the next patch (e.g. `v0.3.1`).

## Commit Messages

Use this format:

```text
<type>[optional scope]: <short description>
```

Keep the subject to one lowercase line, ideally 50 characters or fewer. Do not add a body or footer, except for an optional `Co-Authored-By:` trailer, separated from the subject by a blank line.

Allowed types:

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation updates
- `chore` — non-production maintenance, such as tooling or dependency updates
- `refactor` — code changes that neither add a feature nor fix a bug
- `test` — add or update tests
- `style` — formatting or whitespace changes with no behavior impact
- `ci` — continuous integration changes
- `build` — build system or external dependency changes
- `perf` — performance improvement
- `arch` — big architecture decision
- `revert` — revert a previous commit
