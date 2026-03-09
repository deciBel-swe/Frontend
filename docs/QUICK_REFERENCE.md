# Quick Reference

> Quick reference for frequently used development commands

---

## 📦 Package Management

```bash
# Install dependencies
npm install

# Install a new package
npm install <package-name>

# Install a dev dependency
npm install --save-dev <package-name>

# Remove a package
npm uninstall <package-name>

# Update packages
npm update

# Check for outdated packages
npm outdated
```

---

## 🚀 Development

```bash
# Start development server
npm run dev
# → Opens at http://localhost:3000

# Create production build
npm run build

# Start production server (after build)
npm run start
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

---

## 🔍 Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Check TypeScript types
npm run type-check

# Run all checks (lint + type-check + test)
npm run pre-commit
```

---

## 🌿 Git Workflow

```bash
# Check current status
git status

# Sync integration branch
git checkout dev
git pull origin dev

# Create a working branch
git checkout -b feat/auth-refresh-token

# Stage changes
git add .
# or stage specific files
git add src/features/auth/LoginForm.tsx

# Commit changes
git commit -m "feat(auth): add token refresh flow"

# Push to remote
git push -u origin feat/auth-refresh-token

# Rebase branch on latest dev
git fetch origin
git rebase origin/dev

# Open PR target: dev (never push directly to dev/main)

# Delete local branch (after PR merge)
git checkout dev
git pull origin dev
git branch -d feat/auth-refresh-token

# Delete remote branch
git push origin --delete feat/auth-refresh-token
```

---

## 📝 Commit Message Format

```bash
# Format
git commit -m "<type>(<scope>): <subject>"

# Examples
git commit -m "feat(auth): add token refresh flow"
git commit -m "fix(track): handle empty response safely"
git commit -m "refactor(prof): simplify settings state flow"
git commit -m "docs: clarify local setup steps"
git commit -m "chore(ci): speed up pipeline caching"
```

**Types:**
- `feat` - New feature or user-visible capability
- `fix` - Bug fix
- `docs` - Documentation-only change
- `style` - Formatting/lint-only change (no behavior change)
- `refactor` - Restructuring without behavior change
- `test` - Add or update tests
- `chore` - Maintenance (deps, tooling, CI, build, cleanup)

**Subject rules:**
- Use imperative mood (`add`, `update`, `remove`, `fix`)
- Use lowercase subject
- No trailing period
- Keep subject under about 50 characters

## 🌱 Branch Name Format

```text
<type>/<scope>-<short-description>
```

Examples:
- `feat/auth-refresh-token`
- `fix/track-null-guard`
- `docs/contribution-guide`
- `refactor/prof-settings-form`
- `test/msg-edge-cases`

Module scope codes:
- `auth` (Module 1)
- `prof` (Module 2)
- `soc` (Module 3)
- `track` (Module 4)
- `play` (Module 5)
- `eng` (Module 6)
- `pl` (Module 7)
- `disc` (Module 8)
- `msg` (Module 9)
- `notif` (Module 10)
- `admin` (Module 11)
- `sub` (Module 12)

---

## 🔧 Environment Variables

```bash
# Copy example file (first time only)
cp .env.example .env.local

# Edit environment variables
# Use your preferred editor (VSCode, nano, vim, etc.)
code .env.local
```

**Common variables:**
```env
NEXT_PUBLIC_USE_MOCK=true              # Use mock API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id-here
```

---

##  Project Analysis

```bash
# Count lines of code
npx cloc src/

# List all dependencies
npm list --depth=0

# Check bundle size (after build)
npm run build
# Then analyze .next folder
```

---

## 🐛 Debugging

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run Next.js with debugger
NODE_OPTIONS='--inspect' npm run dev

# Check for TypeScript errors only (no build)
npm run type-check

# Clear Next.js cache
rm -rf .next
# or on Windows
rmdir /s .next
```

---

## 🚨 Troubleshooting

```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json .next
npm install

# Fix ESLint cache issues
rm -rf .eslintcache
npm run lint

# Fix Jest cache issues
npm run test -- --clearCache

# Update npm
npm install -g npm@latest

# Check Node version
node --version
npm --version
```

---

## 🎯 Quick Shortcuts

```bash
# Full check before pushing
npm run lint && npm run type-check && npm run test

# Clean and rebuild
rm -rf .next && npm run build

# Run specific test file
npm run test -- LoginForm.test.tsx

# Update snapshots (if using)
npm run test -- -u

# Run tests matching a pattern
npm run test -- --testNamePattern="should render"
```

---

## 📚 Documentation

```bash
# Generate TypeScript documentation (if installed)
npx typedoc src/

# View README in terminal
cat README.md

# Open documentation in browser
# Just open docs/*.md files in browser or VSCode
```

---

## 🎨 VSCode Extensions

See [DEVELOPER_TOOLS.md](DEVELOPER_TOOLS.md) for the full list of recommended extensions and installation commands.

**Key Extensions:**
- ESLint
- Prettier  
- Tailwind CSS IntelliSense
- Jest Runner
- GitLens

**Useful Shortcuts:**
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `F2` - Rename symbol
- `Ctrl + .` - Quick fix
- `Alt + Shift + F` - Format document

---

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
