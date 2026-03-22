import type { LoginUserDTO } from '@/types';

type MockAuthAccount = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  password: string;
  emailVerified: boolean;
  tier: LoginUserDTO['tier'];
};

const seedAccounts: MockAuthAccount[] = [
  {
    id: 1,
    email: 'mockuser@email.com',
    username: 'mockuser',
    password: 'Password1',
    emailVerified: true,
    tier: 'ARTIST',
  },
  {
    id: 2,
    email: 'listenertwo@email.com',
    username: 'listenertwo',
    password: 'Password1',
    emailVerified: true,
    tier: 'FREE',
  },
  {
    id: 3,
    email: 'beatpilot@email.com',
    username: 'beatpilot',
    password: 'Password1',
    emailVerified: false,
    tier: 'ARTIST_PRO',
  },
  {
    id: 4,
    email: 'artist@decibel.test',
    username: 'mockartist',
    password: 'Password1',
    emailVerified: true,
    tier: 'ARTIST',
  },
  {
    id: 5,
    email: 'listener@decibel.test',
    username: 'mocklistener',
    password: 'Password1',
    emailVerified: true,
    tier: 'FREE',
  },
];

const accountsByEmail = new Map<string, MockAuthAccount>(
  seedAccounts.map((account) => [account.email.toLowerCase(), account])
);

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createFallbackPassword = (): string => {
  const runtimeCrypto = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;

  if (runtimeCrypto?.randomUUID) {
    return runtimeCrypto.randomUUID();
  }

  return `mock-pass-${Math.random().toString(36).slice(2)}`;
};

const getNextId = (): number => {
  let maxId = 0;
  for (const account of accountsByEmail.values()) {
    if (account.id > maxId) {
      maxId = account.id;
    }
  }
  return maxId + 1;
};

export const getMockAuthAccountByEmail = (
  email: string
): MockAuthAccount | undefined => {
  return accountsByEmail.get(normalizeEmail(email));
};

export const getAllMockAuthAccounts = (): MockAuthAccount[] => {
  return Array.from(accountsByEmail.values());
};

export const createMockAuthAccount = (params: {
  email: string;
  username: string;
  avatarUrl?: string;
  password: string;
  emailVerified?: boolean;
  tier?: LoginUserDTO['tier'];
}): MockAuthAccount => {
  const normalizedEmail = normalizeEmail(params.email);

  const existing = accountsByEmail.get(normalizedEmail);
  if (existing) {
    throw new Error('Email already registered. Please sign in instead.');
  }

  const newAccount: MockAuthAccount = {
    id: getNextId(),
    email: normalizedEmail,
    username: params.username.trim(),
    avatarUrl: params.avatarUrl,
    password: params.password,
    emailVerified: params.emailVerified ?? false,
    tier: params.tier ?? 'FREE',
  };

  accountsByEmail.set(normalizedEmail, newAccount);
  return newAccount;
};

export const upsertMockAuthAccount = (params: {
  email: string;
  username: string;
  avatarUrl?: string;
  password?: string;
  emailVerified?: boolean;
  tier?: LoginUserDTO['tier'];
}): MockAuthAccount => {
  const normalizedEmail = normalizeEmail(params.email);
  const existing = accountsByEmail.get(normalizedEmail);

  if (existing) {
    existing.username = params.username.trim() || existing.username;
    if (params.avatarUrl !== undefined) {
      existing.avatarUrl = params.avatarUrl;
    }
    if (params.password) {
      existing.password = params.password;
    }
    if (typeof params.emailVerified === 'boolean') {
      existing.emailVerified = params.emailVerified;
    }
    if (params.tier) {
      existing.tier = params.tier;
    }
    return existing;
  }

  const created: MockAuthAccount = {
    id: getNextId(),
    email: normalizedEmail,
    username: params.username.trim(),
    avatarUrl: params.avatarUrl,
    password: params.password ?? createFallbackPassword(),
    emailVerified: params.emailVerified ?? true,
    tier: params.tier ?? 'FREE',
  };

  accountsByEmail.set(normalizedEmail, created);
  return created;
};

export const updateMockAuthEmailVerification = (
  email: string,
  verified: boolean
): boolean => {
  const account = accountsByEmail.get(normalizeEmail(email));
  if (!account) {
    return false;
  }

  account.emailVerified = verified;
  return true;
};
