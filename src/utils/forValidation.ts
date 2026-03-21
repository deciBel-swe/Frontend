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

export const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupportedPlatformUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const normalized =
      hostname.startsWith('www.') && hostname.length > 4
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

    if (!isValidUrl(item.url.trim())) {
      errors[item.id] = 'Enter a valid URL (include http:// or https://).';
      return;
    }

    if (item.kind === 'support' && !isSupportedPlatformUrl(item.url.trim())) {
      errors[item.id] =
        'Support link must match one of the supported platforms.';
    }
  });

  return errors;
};
