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
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

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

### 1. Development (`develop` branch)
- **Purpose:** Integration and testing
- **Auto-deploy:** On every merge to `develop`
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

Before merging to `develop` or `main`:

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
# 1. Ensure you're on develop branch
git checkout develop
git pull origin develop

# 2. Merge feature branch
git merge feature/your-feature-name

# 3. Run pre-deployment checks
npm run lint
npm run type-check
npm test
npm run build

# 4. Push to trigger CI/CD
git push origin develop

# CI/CD will automatically:
# - Run all checks
# - Build application
# - Deploy to dev environment
```

### Deploying to Production

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version (if using semantic versioning)
npm version patch  # or minor/major

# 3. Run full verification
npm run lint
npm run type-check
npm test:ci
npm run build

# 4. Merge to main
git checkout main
git merge release/v1.2.0

# 5. Tag release
git tag -a v1.2.0 -m "Release version 1.2.0"

# 6. Push to trigger production deployment
git push origin main --tags

# 7. Merge back to develop
git checkout develop
git merge main
git push origin develop
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
NEXT_PUBLIC_API_URL=https://api.soundwave.app
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
# Option 1: Revert commit
git revert <commit-hash>
git push origin main

# Option 2: Rollback to previous tag
git checkout v1.1.0
git push origin main --force  # Use with caution!
```

---

## 🚨 Deployment Rules

### Critical Rules

1. **Never Deploy Broken Code**
   - All CI checks must pass
   - Manual testing completed
   - Code reviewed and approved

2. **Version Control**
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

**Last Updated:** February 21, 2026  
