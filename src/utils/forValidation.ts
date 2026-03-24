import { ProfileLink } from '@/types/user';

const SUPPORT_PLATFORM_DOMAINS = {
  PayPal: ['paypal.me', 'paypal.com'],
  'Cash app': ['cash.app'],
  Venmo: ['venmo.com'],
  Bandcamp: ['bandcamp.com'],
  Shopify: ['shopify.com', 'shop.app'],
  Kickstarter: ['kickstarter.com'],
  Patreon: ['patreon.com'],
  Gofundme: ['gofundme.com'],
};

export const isValidUrlOrEmail = (value: string): boolean => {
  const trimmed = value.trim();

  // Guard 1: Block XSS / malicious protocols immediately
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;

  // Guard 2: Stricter Email Check (Requires a TLD like .com)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(trimmed)) return true;
  if (
    trimmed.toLowerCase().startsWith('mailto:') &&
    emailRegex.test(trimmed.slice(7))
  )
    return true;

  // Guard 3: URL Check
  const urlToTest = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(urlToTest);

    //Enforce a dot in the hostname to prevent sth like "https://justaword"
    if (!parsed.hostname.includes('.')) return false;

    if (parsed.pathname.includes(parsed.hostname)) return false;

    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupportedPlatformUrl = (value: string): boolean => {
  const trimmed = value.trim();

  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;

  try {
    const urlToTest = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(urlToTest);

    if (parsed.pathname.includes(parsed.hostname)) return false;

    const hostname = parsed.hostname.toLowerCase();
    const normalized = hostname.startsWith('www.')
      ? hostname.slice(4)
      : hostname;
    const supportedDomains = Object.values(SUPPORT_PLATFORM_DOMAINS).flat();

    return supportedDomains.some(
      (domain) => normalized === domain || normalized.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

export const validateLinks = (items: ProfileLink[]): Record<number, string> => {
  const errors: Record<number, string> = {};

  items.forEach((item) => {
    const hasAnyInput =
      item.kind === 'support'
        ? item.url.trim().length > 0
        : item.url.trim().length > 0 || item.title.trim().length > 0;

    if (!hasAnyInput) {
      return;
    }

    if (item.kind === 'regular' && !isValidUrlOrEmail(item.url)) {
      errors[item.id] = 'Enter a valid URL or email address.';
      return;
    }

    if (item.kind === 'support' && !isSupportedPlatformUrl(item.url.trim())) {
      errors[item.id] =
        'Support link must match one of the supported platforms.';
    }
  });

  return errors;
};
