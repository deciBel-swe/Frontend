type MockAccess = 'BLOCKED' | 'PREVIEW' | 'PLAYABLE';

const collapseHyphens = (value: string): string =>
  value.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

export const slugifyMockResource = (
  value: string,
  fallback: string
): string => {
  const normalized = collapseHyphens(
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
  );

  return normalized || fallback;
};

export const createUniqueMockSlug = (
  value: string,
  fallback: string,
  existingSlugs: Iterable<string>
): string => {
  const base = slugifyMockResource(value, fallback);
  const reserved = new Set(
    Array.from(existingSlugs)
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0)
  );

  let candidate = base;
  let suffix = 2;

  while (reserved.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

export const normalizeStoredMockSlug = (
  currentSlug: string | null | undefined,
  title: string,
  fallback: string
): string => {
  const normalizedCurrent = currentSlug?.trim();
  if (normalizedCurrent) {
    return slugifyMockResource(normalizedCurrent, fallback);
  }

  return slugifyMockResource(title, fallback);
};

export const normalizeMockSecretToken = (
  token: string | null | undefined
): string | null => {
  const normalized = token?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
};

export const hasMockSecretTokenAccess = (
  resourceToken: string | null | undefined,
  providedToken: string | null | undefined
): boolean => {
  const normalizedResourceToken = normalizeMockSecretToken(resourceToken);
  const normalizedProvidedToken = normalizeMockSecretToken(providedToken);

  return Boolean(
    normalizedResourceToken &&
      normalizedProvidedToken &&
      normalizedResourceToken === normalizedProvidedToken
  );
};

export const canAccessMockResource = (params: {
  isPrivate: boolean;
  ownerId: number;
  viewerId: number;
  resourceToken?: string | null;
  providedToken?: string | null;
}): boolean => {
  if (!params.isPrivate) {
    return true;
  }

  if (params.ownerId === params.viewerId) {
    return true;
  }

  return hasMockSecretTokenAccess(params.resourceToken, params.providedToken);
};

export const resolveMockResourceAccess = (params: {
  isPrivate: boolean;
  ownerId: number;
  viewerId: number;
  resourceToken?: string | null;
  providedToken?: string | null;
}): MockAccess => {
  return canAccessMockResource(params) ? 'PLAYABLE' : 'BLOCKED';
};
