# Deployment Guidelines

> CI/CD pipeline and deployment workflow for DeciBel frontend

## 🔄 CI/CD Overview

The project uses automated checks and deployment pipelines to ensure code quality and reliable releases.

**Pipeline Stages:**
1. **Code Quality** - Linting and formatting
2. **Type Checking** - TypeScript validation
3. **Testing** - Unit tests with coverage
4. **Build** - Production build verification
5. **Deploy** - Automated deployment to target environment

---

## 🛠️ CI Pipeline Configuration

### Automated Checks (On Every Push)

```yaml
# Example CI configuration (.github/workflows/ci.yml)
name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Linter
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Run Tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
```

### Required Scripts

Ensure these scripts are in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "build": "next build"
  }
}
```

---

## 🌍 Deployment Environments

### 1. Development (`dev` branch)
- **Purpose:** Integration and testing
- **Auto-deploy:** On every merge to `dev`
- **URL:** `https://dev.soundwave.app` (example)

### 2. Staging (optional)
- **Purpose:** Pre-production testing
- **Auto-deploy:** On tagged releases
- **URL:** `https://staging.soundwave.app` (example)

### 3. Production (`main` branch)
- **Purpose:** Live application
- **Auto-deploy:** On merge to `main`
- **URL:** `https://soundwave.app` (example)

---

## ✅ Pre-Deployment Checklist

Before merging to `dev` or `main`:

### Code Quality
- [ ] All ESLint errors resolved (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format`)
- [ ] No TypeScript errors (`npm run type-check`)

### Testing
- [ ] All tests pass (`npm test`)
- [ ] Test coverage ≥ 95% (`npm run test:coverage`)
- [ ] E2E tests pass (if applicable)

### Build
- [ ] Production build succeeds (`npm run build`)
- [ ] No build warnings or errors
- [ ] Bundle size is acceptable

### Configuration
- [ ] Environment variables documented
- [ ] `.env.example` is up to date
- [ ] No sensitive data in code

### Documentation
- [ ] README updated if needed
- [ ] CHANGELOG updated (if using)
- [ ] API changes documented

---

## 🚀 Deployment Workflow

### Deploying to Development

```bash
# 1. Rebase your working branch on latest dev
git fetch origin
git rebase origin/dev

# 2. Run pre-deployment checks
npm run lint
npm run type-check
npm test
npm run build

# 3. Push branch updates
git push --force-with-lease

# 4. Open PR to dev and wait for CI + required approvals
# (No direct pushes to dev/main)

# CI/CD will automatically:
# - Run all checks
# - Build application
# - Deploy to dev environment after PR merge to dev
```

### Deploying to Production

```bash
# 1. Create release branch from dev
git checkout dev
git pull origin dev
git checkout -b chore/release-v1.2.0

# 2. Update version (if using semantic versioning)
npm version patch  # or minor/major

# 3. Run full verification
npm run lint
npm run type-check
npm test:ci
npm run build

# 4. Open PR from release branch to main
# Required approvals: Sub-Team Leader (+ Team Leader for cross-team/architectural changes)

# 5. After PR merge, tag release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"

# 6. Push to trigger production deployment
git push origin main --tags

# 7. Open sync PR from main back to dev if required
```

---

## 🔧 Environment Variables

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=true
NODE_ENV=development
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.decibel.app
NEXT_PUBLIC_USE_MOCK=false
NODE_ENV=production
```

**Important:** 
- Never commit `.env` files
- Use CI/CD secrets for sensitive values
- Document all variables in `.env.example`

---

## 📊 Monitoring Deployment

### Build Status
- Check CI/CD pipeline status in GitHub Actions
- Review build logs for errors or warnings
- Verify deployment completed successfully

### Post-Deployment Verification
- [ ] Application loads without errors
- [ ] Critical features work as expected
- [ ] API integration functional
- [ ] No console errors in browser
- [ ] Performance metrics acceptable

### Rollback Procedure

If deployment fails or causes issues:

```bash
# Option 1: Revert the problematic commit on a new branch
git checkout -b fix/revert-bad-release
git revert <commit-hash>
git push -u origin fix/revert-bad-release

# Option 2: Open emergency PR to main, then sync to dev
# (Do not force-push protected branches)
```

---

## 🚨 Deployment Rules

### Critical Rules

1. **Never Deploy Broken Code**
   - All CI checks must pass
   - Manual testing completed
   - Code reviewed and approved

2. **Protected Branches**
  - No direct pushes to `dev` or `main`
  - Use pull requests for all changes
  - Merge with required role approvals

3. **Version Control**
   - Tag all production releases
   - Follow semantic versioning
   - Update CHANGELOG

---

## 🔍 Troubleshooting

### Build Fails in CI

```bash
# Clear cache and rebuild locally
rm -rf .next node_modules
npm install
npm run build
```

### Tests Pass Locally but Fail in CI

```bash
# Run tests in CI mode locally
npm run test:ci

# Check for:
# - Environment-specific issues
# - Timezone differences
# - File system case sensitivity
```

### Deployment Succeeds but App Broken

1. Check environment variables in deployment platform
2. Review build logs for warnings
3. Test production build locally: `npm run build && npm start`
4. Check browser console for errors

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Last Updated:** March 9, 2026  
