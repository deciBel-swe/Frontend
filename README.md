# SoundGround - Social Streaming Platform

> A modern music streaming platform built with Next.js, TypeScript, and Tailwind CSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Documentation

- **[Developer Tools Setup](docs/DEVELOPER_TOOLS.md)** - VS Code extensions, prerequisites, and environment setup
- **[Code Style Guide](docs/CODE_STYLE_GUIDE.md)** - Coding standards and design patterns
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Writing and running tests
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Team workflow and collaboration
- **[Deployment Guidelines](docs/DEPLOYMENT.md)** - CI/CD pipeline and deployment workflow
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common commands and shortcuts

## 🛠 Tech Stack

### Core Technologies
- **Framework:** Next.js 16.x (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **State Management:** Context API
- **Server State:** TanStack Query (React Query)

### Development Tools
- **Package Manager:** npm
- **Code Quality:** ESLint + Prettier
- **Testing:** Jest + React Testing Library
- **Version Control:** Git

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Shared UI components
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── tracks/        # Track management
│   │   ├── playlists/     # Playlists
│   │   ├── profile/       # User profiles
│   │   ├── feed/          # Activity feed
│   │   ├── messaging/     # Direct messaging
│   │   ├── discovery/     # Search & discovery
│   │   └── notifications/ # Notifications
│   ├── services/          # API & external services
│   │   ├── api/          # Real API client
│   │   └── mocks/        # Mock API for development
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # App-wide constants
│   └── tests/            # Test files
├── public/               # Static assets
└── docs/                 # Additional documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Create production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # Run tests for CI

# Pre-commit
npm run pre-commit       # Run lint, type-check, and tests
```

## 🏗️ Architecture

### Design Principles
- **Feature-Based Architecture** - Self-contained, reusable modules
- **Modularity** - Clear separation of concerns
- **Dependency Injection** - Interchangeable mock and real services
- **Type Safety** - Strict TypeScript throughout

### Key Patterns
- **Service Layer Pattern** - Abstract API communication
- **Repository Pattern** - Centralize data access
- **Container/Presenter** - Separate logic from UI
- **Custom Hooks** - Reusable stateful logic

## 🔐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=true
```

## 🤝 Contributing

1. Follow the [Code Style Guide](CODE_STYLE_GUIDE.md)
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Run type checking: `npm run type-check`
5. Format code: `npm run format`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jest Documentation](https://jestjs.io/)

## 📝 License

This project is developed for educational purposes as part of a Software Engineering course.

**License Restrictions:**
- Educational use only
- Not for commercial use
- See [LICENSE](LICENSE) for full details

---

**Last Updated:** February 20, 2026  
**Version:** 0.1.0 (Initial Setup)