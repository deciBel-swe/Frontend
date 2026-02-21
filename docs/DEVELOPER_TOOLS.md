# Developer Tools Setup

Complete guide to setting up your development environment.

## Prerequisites

### Required Software

#### Node.js & npm

**Version Requirements:**
- Node.js: `>= 18.17.0` (LTS recommended)
- npm: `>= 9.6.7` (comes with Node.js)

**Installation:**

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)
- Use the LTS (Long Term Support) version

**macOS:**
```bash
# Using Homebrew
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### Git

**Windows:** Download from [git-scm.com](https://git-scm.com/)  
**macOS:** `brew install git`  
**Linux:** `sudo apt-get install git`

**Verify:** `git --version`

---

## VS Code Extensions

### Essential Extensions

Install these for the best development experience:

#### 1. ESLint
- **ID:** `dbaeumer.vscode-eslint`
- **Purpose:** Real-time JavaScript/TypeScript linting
- **Install:** `code --install-extension dbaeumer.vscode-eslint`

#### 2. Prettier - Code formatter
- **ID:** `esbenp.prettier-vscode`
- **Purpose:** Automatic code formatting
- **Install:** `code --install-extension esbenp.prettier-vscode`

#### 3. Tailwind CSS IntelliSense
- **ID:** `bradlc.vscode-tailwindcss`
- **Purpose:** Tailwind class autocomplete and preview
- **Install:** `code --install-extension bradlc.vscode-tailwindcss`

#### 4. Jest
- **ID:** `Orta.vscode-jest`
- **Purpose:** Jest test runner integration
- **Install:** `code --install-extension Orta.vscode-jest`

#### 5. Path Intellisense
- **ID:** `christian-kohler.path-intellisense`
- **Purpose:** File path autocomplete
- **Install:** `code --install-extension christian-kohler.path-intellisense`

#### 6. GitLens
- **ID:** `eamodio.gitlens`
- **Purpose:** Enhanced Git integration
- **Install:** `code --install-extension eamodio.gitlens`

### Recommended Extensions

#### 7. Auto Rename Tag
- **ID:** `formulahendry.auto-rename-tag`
- **Install:** `code --install-extension formulahendry.auto-rename-tag`

#### 8. Import Cost
- **ID:** `wix.vscode-import-cost`
- **Install:** `code --install-extension wix.vscode-import-cost`

#### 9. Error Lens
- **ID:** `usernamehw.errorlens`
- **Install:** `code --install-extension usernamehw.errorlens`

#### 10. Better Comments
- **ID:** `aaron-bond.better-comments`
- **Install:** `code --install-extension aaron-bond.better-comments`

#### 11. Console Ninja
- **ID:** `WallabyJs.console-ninja`
- **Install:** `code --install-extension WallabyJs.console-ninja`

### Quick Install All Extensions

**PowerShell (Windows):**
```powershell
code --install-extension dbaeumer.vscode-eslint; `
code --install-extension esbenp.prettier-vscode; `
code --install-extension bradlc.vscode-tailwindcss; `
code --install-extension Orta.vscode-jest; `
code --install-extension christian-kohler.path-intellisense; `
code --install-extension eamodio.gitlens; `
code --install-extension formulahendry.auto-rename-tag; `
code --install-extension wix.vscode-import-cost; `
code --install-extension usernamehw.errorlens; `
code --install-extension aaron-bond.better-comments; `
code --install-extension WallabyJs.console-ninja
```

**Bash (macOS/Linux):**
```bash
code --install-extension dbaeumer.vscode-eslint && \
code --install-extension esbenp.prettier-vscode && \
code --install-extension bradlc.vscode-tailwindcss && \
code --install-extension Orta.vscode-jest && \
code --install-extension christian-kohler.path-intellisense && \
code --install-extension eamodio.gitlens && \
code --install-extension formulahendry.auto-rename-tag && \
code --install-extension wix.vscode-import-cost && \
code --install-extension usernamehw.errorlens && \
code --install-extension aaron-bond.better-comments && \
code --install-extension WallabyJs.console-ninja
```

---

## VS Code Settings

### Recommended User Settings

Add these to your VS Code User Settings (Ctrl+Shift+P → "Preferences: Open User Settings (JSON)"):

```json
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  
  // Code Actions
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  
  // TypeScript
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative",
  
  // Files
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  
  // Git
  "git.autofetch": true,
  "git.confirmSync": false
}
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=true
```

### 4. Verify Setup

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

### 5. Start Development Server

```bash
npm run dev
```

---

## Troubleshooting

### "Node is not recognized as a command"

**Solution:** 
- Restart terminal/VS Code after installing Node.js
- Verify installation: `node --version`

### "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ESLint/Prettier not working in VS Code

**Solution:**
- Ensure extensions are installed and enabled
- Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"
- Check output panel: View → Output → ESLint/Prettier

### Tailwind CSS classes not working

**Solution:**
```bash
rm -rf .next
npm run dev
```

### Port 3000 already in use

**Windows (PowerShell):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

### TypeScript errors in VS Code

**Solution:**
- Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
- Check TypeScript version: `npx tsc --version`

---

## Environment Verification Checklist

Before starting development:

- [ ] Node.js >= 18.17.0 installed
- [ ] npm >= 9.6.7 installed
- [ ] Git installed
- [ ] VS Code installed
- [ ] Essential extensions installed
- [ ] Project dependencies installed
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Tests pass
- [ ] Dev server starts

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)
