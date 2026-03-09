# Contributing Guidelines

> Team workflow and collaboration guide for the DeciBel frontend

## Table of Contents

1. [Core Version Control Rules](#core-version-control-rules)
2. [Branch Naming Convention](#branch-naming-convention)
3. [Commit Naming Convention](#commit-naming-convention)
4. [Pull Request Process](#pull-request-process)
5. [Progress Reporting](#progress-reporting)

---

## Core Version Control Rules

- No direct pushes to `dev` or `main`; all changes must go through pull requests.
- CI checks must pass before any review approval is given.
- Sub-Team Leader approval is required before merge.
- Team Leader approval is required for cross-team or architectural changes.
- Only Sub-Team Leaders or the Team Leader may merge pull requests.
- Developers must delete their feature branch after a successful merge.

Reserved branches:

- `main`: production-ready branch
- `dev`: pre-production integration branch

---

## Branch Naming Convention

### Recommended Format

```
<type>/<scope>-<short-description>
```

- `type`: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`
- `scope`: short module/area name (optional)
- `short-description`: concise, lowercase, hyphen-separated

### Types

- `feat`: new feature or user-visible capability
- `fix`: bug fix
- `docs`: documentation-only change
- `style`: formatting/lint-only changes (no behavior change)
- `refactor`: restructuring without behavior change
- `test`: add/update tests
- `chore`: maintenance (deps, tooling, CI, build, cleanup)

### Scope Guidance

- Use the official module scope codes listed below for module-related work.
- If scope is unclear, omit it instead of inventing a misleading scope.

### Module Naming Convention

Use these exact short names when a branch or commit belongs to a specific module:

| Module | Scope Code |
|--------|------------|
| Module 1 | `auth` |
| Module 2 | `prof` |
| Module 3 | `soc` |
| Module 4 | `track` |
| Module 5 | `play` |
| Module 6 | `eng` |
| Module 7 | `pl` |
| Module 8 | `disc` |
| Module 9 | `msg` |
| Module 10 | `notif` |
| Module 11 | `admin` |
| Module 12 | `sub` |


### Examples

- `feat/auth-refresh-token`
- `fix/track-null-guard`
- `docs/contribution-guide`
- `refactor/prof-settings-form`
- `test/msg-edge-cases`

### Creating a Branch

```bash
# Always branch from dev
git checkout dev
git pull origin dev

# Create your working branch
git checkout -b feat/auth-refresh-token

# Push to remote
git push -u origin feat/auth-refresh-token
```

---

## Commit Naming Convention

### Format

```
<type>(<scope>): <subject>
```

### Subject Rules

- Use imperative mood: `add`, `update`, `remove`, `fix`
- Keep subject lowercase
- No trailing period
- Keep subject under about 50 characters

### Examples

```bash
feat(auth): add token refresh flow
fix(track): handle empty response safely
refactor(prof): simplify settings state flow
docs: clarify local setup steps
chore(ci): speed up pipeline caching
```

---

## Pull Request Process

### Stage 1: Developer (PR Author)

1. Branch from `dev` using the branch naming convention.
2. Implement one feature/fix/refactor theme per PR.
3. Run local checks before opening PR:
   - Formatter
   - Linter/static analysis
   - Relevant unit tests
4. Open PR targeting `dev` with a title following commit naming format.
5. Fill PR description with:
   - What changed
   - Why the change is needed
   - How to test it
   - Relevant screenshots/links if needed
6. Assign the Sub-Team Leader as reviewer.
7. Link issue using `Closes #<issue_number>`.
8. Respond to comments and push fixes promptly.

Developer pre-PR checklist:

- [ ] Branched from latest `dev`
- [ ] Branch name follows `<type>/<scope>-<short-description>`
- [ ] Commit messages follow `<type>(<scope>): <subject>`
- [ ] Code runs locally without errors
- [ ] Formatter has been run
- [ ] Linter/static checks pass
- [ ] Relevant unit tests are written and passing
- [ ] No debug prints or log spam
- [ ] No commented-out code
- [ ] No duplicated logic introduced
- [ ] Naming and structure follow repository conventions
- [ ] PR is scoped to one theme
- [ ] PR description is complete
- [ ] Sub-Team Leader is assigned
- [ ] Relevant issue is linked

### Stage 2: Sub-Team Leader (First Reviewer)

1. Wait for all CI checks to pass before reviewing.
2. Review code against the checklist below.
3. Leave clear, actionable comments.
4. If needed, request changes with specific guidance.
5. Approve only when concerns are resolved and CI is green.
6. Merge PR into `dev` using a merge commit.
7. Verify post-merge behavior in `dev`.
8. Escalate cross-team concerns to the Team Leader.

Sub-Team Leader review checklist:

- [ ] All CI checks pass (lint, format, tests, build)
- [ ] No merge conflicts with `dev`
- [ ] PR is reviewable in size/scope
- [ ] Code is clean and readable
- [ ] Naming is clear and consistent
- [ ] No unnecessary complexity
- [ ] No debug code, dead code, or commented-out blocks
- [ ] Design aligns with module/system architecture
- [ ] Correct patterns and abstractions are used
- [ ] No layering violations
- [ ] No duplicated existing logic
- [ ] Feature/fix matches PR description
- [ ] Edge cases are handled appropriately
- [ ] Error handling is adequate
- [ ] Tests exist and cover critical paths
- [ ] Tests are meaningful (not implementation-detail only)
- [ ] API contracts are respected (for backend-related changes)
- [ ] Integration in `dev` does not break other modules

### Stage 3: Team Leader (Final Oversight)

1. Monitor open PRs for blockers and stalled work.
2. Spot-check merged PRs for quality standards.
3. Perform mandatory review for:
   - Cross-team or cross-module changes
   - Architectural changes
   - Shared infrastructure/CI/configuration changes
4. Coordinate integration testing on `dev` with Sub-Team Leaders.
5. Validate overall system behavior after significant changes.
6. Provide final sign-off before any promotion to `main`.

Team Leader review checklist:

- [ ] Relevant Sub-Team Leader approval is present
- [ ] No regressions introduced across modules
- [ ] Cross-team API contracts are respected
- [ ] Shared infra/config changes are intentional and safe
- [ ] PR standards are being followed consistently
- [ ] No direct merges bypassing required review
- [ ] CI remains green and is not bypassed
- [ ] Scope aligns with current iteration plans
- [ ] No contributor is blocked waiting on review/merge
- [ ] Integration testing on `dev` is proceeding safely

---

## Progress Reporting

### Weekly Progress Reports

Due every team-defined reporting cycle.

Template:

```markdown
## Week [N] Progress Report - [Your Name]

### Completed Tasks
- [Task and outcome]
- [Task and outcome]

### In Progress
- [Task name] - [current status]
- Expected completion: [Date]

### Blockers
- [Blocker details]

### Next Week Plan
- [Planned task]
- [Planned task]
```

**Last Updated:** March 9, 2026
