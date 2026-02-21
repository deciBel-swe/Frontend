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

# Create a new feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .
# or stage specific files
git add src/features/auth/LoginForm.tsx

# Commit changes
git commit -m "feat(auth): add login form validation"

# Push to remote
git push origin feature/your-feature-name

# Update your branch with latest develop
git checkout develop
git pull
git checkout feature/your-feature-name
git merge develop

# Delete local branch (after merging PR)
git branch -d feature/your-feature-name

# Delete remote branch
git push origin --delete feature/your-feature-name
```

---

## 📝 Commit Message Format

```bash
# Format
git commit -m "<type>(<scope>): <subject>"

# Examples
git commit -m "feat(auth): add Google OAuth login button"
git commit -m "fix(player): resolve seek bar jumping issue"
git commit -m "test(tracks): add unit tests for upload service"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): improve error handling in track service"
git commit -m "style(button): adjust padding and margins"
git commit -m "chore(deps): update dependencies"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

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
