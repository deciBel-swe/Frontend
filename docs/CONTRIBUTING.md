# Contributing Guidelines

> **Team workflow and collaboration guide for the DeciBel frontend**

## 📋 Table of Contents

1. [Development Workflow](#development-workflow)
2. [Branching Strategy](#branching-strategy)
3. [Pull Request Process](#pull-request-process)
4. [Progress Reporting](#progress-reporting)

---

## 🔄 Development Workflow

### Step-by-Step Process

```
1. Check task assignment & understand requirements
   ↓
2. Create feature branch from develop
   ↓
3. Develop & test locally (95% coverage required)
   ↓
4. Self-review & run checks (lint, type-check, test)
   ↓
5. Push to remote branch
   ↓
6. Create Pull Request to develop
   ↓
7. Sub-team leader reviews & approves
   ↓
8. Address review comments if needed
   ↓
9. Merge to develop
   ↓
10. Delete feature branch
```

**Key Points:**
- Always branch from `develop`
- Follow [CODE_STYLE_GUIDE.md](CODE_STYLE_GUIDE.md) conventions
- Write unit tests (see [TESTING_GUIDE.md](TESTING_GUIDE.md))
- Run pre-push checks before creating PR
- Communicate blockers immediately
- For deployment workflow, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🌿 Branching Strategy

### Branch Types

| Branch | Purpose | Naming Convention | Example |
|--------|---------|-------------------|---------|
| `main` | Production-ready code | `main` | `main` |
| `develop` | Integration branch | `develop` | `develop` |
| `feature/*` | New features | `feature/<module>-<description>` | `feature/auth-google-oauth` |
| `bugfix/*` | Bug fixes | `bugfix/<issue-id>-<description>` | `bugfix/123-player-seek-bug` |
| `hotfix/*` | Urgent production fixes | `hotfix/<description>` | `hotfix/login-crash` |

### Branch Protection

- **`main`** - Protected, requires PR approval
- **`develop`** - Protected, requires PR approval
- **Feature branches** - Can be pushed directly by owner

### Creating a Feature Branch

```bash
# Always branch from develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/tracks-upload-form

# Push to remote
git push -u origin feature/tracks-upload-form
```

---

## 📝 Pull Request Process

### Before Creating a PR

```bash
# Run all checks
npm run lint           # No ESLint errors
npm run type-check     # No TypeScript errors
npm test               # All tests pass
npm run test:coverage  # Coverage ≥ 95%
npm run build          # Build succeeds
```

✅ **Checklist:**
- [ ] Code follows style guide
- [ ] All new code has unit tests
- [ ] Test coverage ≥ 95%
- [ ] No console.logs or debug code
- [ ] Commits follow convention (see [CODE_STYLE_GUIDE.md](CODE_STYLE_GUIDE.md#git-commit-messages))

### Creating a PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - **Base:** `develop`
   - **Compare:** `feature/your-feature-name`
   - **Title:** `[Feature/Bugfix/Refactor] Brief description`
   - **Assign:** Sub-team leader for review

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Related Task
   - Task ID: #42
   
   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Refactoring
   
   ## Changes Made
   - Bullet list of key changes
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Coverage: XX%
   
   ## Screenshots (if UI changes)
   [Add screenshots]
   ```

---
## 📊 Progress Reporting

### Weekly Progress Reports

**Due:** Every [Day] before [Time]

**Format:**
```markdown
## Week [N] Progress Report - [Your Name]

### Completed Tasks
- Implemented Google OAuth login flow
- Added unit tests for auth service (coverage: 97%)

### In Progress
- [Task Name] - Working on track upload form
- Expected completion: [Date]

### Blockers
- Waiting for backend API endpoint for track metadata
- [Task Name]: Clarification needed on file size limits

### Next Week Plan
- Complete track upload form
- Integrate with backend upload endpoint

```
**Last Updated:** February 21, 2026  
