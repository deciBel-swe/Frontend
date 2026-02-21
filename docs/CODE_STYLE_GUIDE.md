# Code Style Guide

> Unified coding standards and design patterns for the SoundGround frontend

## Table of Contents

1. [General Principles](#general-principles)
2. [File & Folder Naming](#file--folder-naming)
3. [TypeScript Conventions](#typescript-conventions)
4. [React Component Guidelines](#react-component-guidelines)
5. [State Management](#state-management)
6. [Styling Conventions](#styling-conventions)
7. [Import Organization](#import-organization)
8. [Comments & Documentation](#comments--documentation)
9. [Design Patterns](#design-patterns)
10. [Git Commit Messages](#git-commit-messages)

---

## General Principles

### Code Quality Rules
- ✅ Write clean, readable, and maintainable code
- ✅ Follow DRY (Don't Repeat Yourself)
- ✅ Prefer explicit over implicit
- ✅ Use TypeScript strictly - avoid `any` type
- ✅ Keep functions small and focused (single responsibility)
- ✅ Write self-documenting code with meaningful names

### Enforcement Tools
- **ESLint:** Next.js recommended rules
- **Prettier:** Automatic code formatting
- **TypeScript:** Strict mode enabled

---

## File & Folder Naming

### Files

```
✅ CORRECT                  ❌ INCORRECT
UserProfile.tsx             userProfile.tsx
useAuth.ts                  UseAuth.ts
authService.ts              AuthService.ts
types.ts                    Types.ts
UserProfile.test.tsx        userProfile.spec.tsx
```

**Rules:**
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services:** camelCase (e.g., `authService.ts`)
- **Utils:** camelCase (e.g., `formatDate.ts`)
- **Types:** camelCase or PascalCase (e.g., `types.ts` or `User.types.ts`)
- **Tests:** Same name as source + `.test` (e.g., `Button.test.tsx`)

### Folders

```
✅ CORRECT                  ❌ INCORRECT
features/auth               features/Auth
components/common           components/Common
services/api                services/API
```

**Rules:**
- All lowercase with hyphens for multi-word folders
- Feature folders: Singular or plural based on context

---

## TypeScript Conventions

### Type Definitions

```typescript
// ✅ CORRECT - Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ✅ CORRECT - Use type for unions, intersections, primitives
type UserRole = 'artist' | 'listener' | 'admin';
type ID = string | number;

// ❌ INCORRECT - Avoid any
function processData(data: any) { }

// ✅ CORRECT - Use proper typing
function processData(data: User[]): ProcessedData { }
```

### Naming Conventions

- **Interfaces:** PascalCase, no `I` prefix (e.g., `User`, not `IUser`)
- **Types:** PascalCase (e.g., `UserRole`)
- **Enums:** PascalCase, values in UPPER_SNAKE_CASE

```typescript
// ✅ CORRECT
enum TrackStatus {
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

// ❌ INCORRECT
enum trackStatus {
  processing = 'processing',
  finished = 'finished',
}
```

### Optional vs Required

```typescript
// ✅ CORRECT - Mark optional fields explicitly
interface TrackMetadata {
  title: string;              // Required
  genre: string;              // Required
  description?: string;       // Optional
  releaseDate?: Date;         // Optional
}
```

---

## React Component Guidelines

### Component Structure

```tsx
// ✅ CORRECT - Functional component with TypeScript
import { FC, useState } from 'react';

interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
  onUpdate?: (data: UserData) => void;
}

export const UserProfile: FC<UserProfileProps> = ({ 
  userId, 
  isEditable = false,
  onUpdate 
}) => {
  // 1. Hooks first
  const [user, setUser] = useState<User | null>(null);
  const { currentUser } = useAuth();
  
  // 2. Event handlers
  const handleUpdate = () => {
    // Implementation
  };
  
  // 3. Early returns
  if (!user) {
    return <LoadingSkeleton />;
  }
  
  // 4. Main render
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

### Component Organization

1. **Imports** (external → internal → styles)
2. **Type definitions** (interfaces, types)
3. **Component definition**
4. **Hooks** (useState, useEffect, custom hooks)
5. **Event handlers**
6. **Helper functions** (small, component-specific)
7. **Early returns** (loading, error states)
8. **Main JSX return**

### Export Strategy

```tsx
// ✅ CORRECT - Named exports (except pages)
export const Button = () => { };
export const UserCard = () => { };

// ✅ CORRECT - Pages use default export
export default function HomePage() { }

// ❌ INCORRECT - Default exports for components
export default Button;
```

### Props Destructuring

```tsx
// ✅ CORRECT - Destructure in function signature
export const Card: FC<CardProps> = ({ title, description, onClick }) => {
  return <div onClick={onClick}>...</div>;
};

// ❌ INCORRECT - Using props object
export const Card: FC<CardProps> = (props) => {
  return <div onClick={props.onClick}>{props.title}</div>;
};
```

---

## State Management

### Local State

```tsx
// ✅ CORRECT - Type useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// ❌ INCORRECT - Untyped state
const [data, setData] = useState(null);
```

### Global State (Context API)

```typescript
// ✅ CORRECT - Create typed context with provider

// contexts/AuthContext.tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = async (credentials: Credentials) => {
    setLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => setUser(null);
  
  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Styling Conventions

### Tailwind CSS

```tsx
// ✅ CORRECT - Organized, readable classes
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white hover:bg-gray-50
  border border-gray-200
  transition-colors duration-200
">

// ✅ CORRECT - Extract complex styles to constants
const cardStyles = "flex items-center p-4 rounded-lg bg-white border";

<div className={cardStyles}>

// ✅ CORRECT - Conditional classes with clsx
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded',
  isPrimary && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

---

## Import Organization

### Import Order

```tsx
// 1. External libraries (React, Next, third-party)
import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 2. Internal modules (absolute imports with @/)
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/api/authService';

// 3. Types
import type { User, UserRole } from '@/types';

// 4. Styles (if needed)
import styles from './Component.module.css';
```

### Absolute vs Relative Imports

```tsx
// ✅ CORRECT - Use absolute imports with @/
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

// ❌ INCORRECT - Relative imports across features
import { Button } from '../../../components/common/Button';
```

### Barrel Exports (index.ts)

```tsx
// ✅ CORRECT - features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { useAuth } from './hooks/useAuth';
export * from './types';

// Usage
import { LoginForm, useAuth } from '@/features/auth';
```

---

## Comments & Documentation

### When to Comment

- ✅ Complex business logic
- ✅ Non-obvious workarounds
- ✅ API integration notes
- ❌ Self-explanatory code

### JSDoc for Functions

```typescript
/**
 * Uploads an audio file and returns the track ID
 * @param file - Audio file (MP3 or WAV)
 * @param metadata - Track metadata (title, genre, etc.)
 * @returns Promise resolving to the created track ID
 * @throws {ValidationError} If file format is invalid
 */
export async function uploadTrack(
  file: File,
  metadata: TrackMetadata
): Promise<string> {
  // Implementation
}
```

### Component Documentation

```tsx
/**
 * AudioPlayer - Persistent audio player component
 * 
 * Features:
 * - Plays/pauses tracks
 * - Seek functionality
 * - Volume control
 * - Waveform visualization
 * 
 * @example
 * <AudioPlayer trackId="123" autoPlay={false} />
 */
export const AudioPlayer: FC<AudioPlayerProps> = ({ ... }) => {
  // Implementation
};
```

---

## Design Patterns

### 1. Service Layer Pattern

**Purpose:** Abstract API communication logic from components

```typescript
// services/api/trackService.ts
export class TrackService {
  async getTrack(id: string): Promise<Track> {
    const response = await apiClient.get(`/tracks/${id}`);
    return response.data;
  }
  
  async uploadTrack(file: File, metadata: TrackMetadata): Promise<Track> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return await apiClient.post('/tracks', formData);
  }
}

export const trackService = new TrackService();
```

### 2. Dependency Injection Pattern

**Purpose:** Switch between real and mock APIs seamlessly

```typescript
// services/api/index.ts
import { config } from '@/config';
import { RealTrackService } from './real/trackService';
import { MockTrackService } from './mocks/trackService';

export const trackService = config.useMockAPI 
  ? new MockTrackService()
  : new RealTrackService();
```

### 3. Repository Pattern

**Purpose:** Centralize data access logic

```typescript
// features/tracks/repository/trackRepository.ts
export class TrackRepository {
  constructor(private service: ITrackService) {}
  
  async fetchTrackById(id: string): Promise<Track> {
    return await this.service.getTrack(id);
  }
  
  async fetchUserTracks(userId: string): Promise<Track[]> {
    return await this.service.getUserTracks(userId);
  }
}
```

### 4. Container/Presenter Pattern

**Purpose:** Separate logic from presentation

```typescript
// Container (Logic)
export const UserProfileContainer = () => {
  const { userId } = useParams();
  const { data, isLoading } = useUserProfile(userId);
  
  return <UserProfileView user={data} isLoading={isLoading} />;
};

// Presenter (UI)
export const UserProfileView = ({ user, isLoading }) => {
  if (isLoading) return <LoadingSkeleton />;
  return <div>{user.name}</div>;
};
```

### 5. Custom Hook Pattern

**Purpose:** Reuse stateful logic across components

```typescript
// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue] as const;
};

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

---

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# ✅ CORRECT
feat(auth): implement Google OAuth login
fix(player): resolve seek bar jumping issue
docs(readme): update installation instructions
test(tracks): add unit tests for upload service

# ❌ INCORRECT
Update files
Fixed bug
WIP
```

### Rules

- Use imperative mood ("add feature" not "added feature")
- Lowercase subject line
- No period at the end
- Keep subject under 50 characters
---

## Checklist Before Pushing

- [ ] Code follows naming conventions
- [ ] TypeScript types are defined (no `any`)
- [ ] No ESLint errors or warnings
- [ ] Code is formatted with Prettier
- [ ] Unit tests written and passing
- [ ] Imports are organized correctly
- [ ] No commented-out code or debug logs
- [ ] Commit message follows convention

---

## Things to Avoid

❌ Console logs in production code  
❌ Hardcoded values (use constants or env variables)  
❌ Inline styles (use Tailwind or CSS modules)  
❌ Deeply nested ternaries (extract to functions)  
❌ Huge components (split into smaller components)  
❌ Inline anonymous functions in JSX  
❌ Mutations (use immutable patterns)  
❌ Magic numbers (use named constants)
