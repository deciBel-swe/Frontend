import {
  isValidUrlOrEmail,
  isSupportedPlatformUrl,
  validateLinks,
} from '@/utils/forValidation';
import { ProfileLink } from '@/types/user';

describe('Profile Validation Guardrails', () => {
  describe('isValidUrlOrEmail (Layer 3 Sanitization)', () => {
    it.each([
      // 1. Standard valid inputs
      ['Standard email', 'youssef@decibel.test', true],
      ['Mailto link', 'mailto:hello@decibel.test', true],
      ['Standard secure URL', 'https://decibel.com/youssef', true],
      ['Protocol-less URL (Shorthand)', 'decibel.com/youssef', true],

      // 2. The missing TLD / Invalid domain structure
      ['Missing TLD (Localhost style)', 'https://mywebsite', false],
      ['Just a random word', 'invalidstring', false],

      // 3. XSS and Malicious Injection Vectors
      ['XSS Injection (javascript)', 'javascript:alert("hacked")', false],
      [
        'XSS Injection (data URI)',
        'data:text/html,<script>alert(1)</script>',
        false,
      ],
      ['XSS Injection (vbscript)', 'vbscript:msgbox("hello")', false],

      // 4. The Copy-Paste Stutter Edge Cases
      [
        'Double paste with protocol',
        'https://decibel.comhttps://decibel.com',
        false,
      ],
      ['Double paste without protocol', 'decibel.com/userdecibel.com', false],
    ])('evaluates %s (%s) as %s', (_, input, expected) => {
      expect(isValidUrlOrEmail(input)).toBe(expected);
    });
  });

  describe('isSupportedPlatformUrl (Strict Domain Matching)', () => {
    it.each([
      // Valid platforms
      ['Valid Patreon', 'patreon.com/artist', true],
      ['Valid PayPal with protocol', 'https://paypal.me/artist', true],
      ['Valid WWW subdomain', 'www.bandcamp.com/music', true],

      // Invalid / Scams / Hacks
      ['Lookalike scam domain', 'paypal.com.scam.com', false],
      ['Unsupported platform', 'onlyfans.com/artist', false],
      [
        'XSS payload disguised as link',
        'javascript:fetch("patreon.com")',
        false,
      ],
      ['Protocol-less double paste', 'paypal.me/userpaypal.me', false],
    ])('evaluates %s (%s) as %s', (_, input, expected) => {
      expect(isSupportedPlatformUrl(input)).toBe(expected);
    });
  });

  describe('validateLinks pipeline', () => {
    it('catches invalid regular and support links in a batch payload', () => {
      const mockPayload: ProfileLink[] = [
        {
          id: 1,
          title: 'My Site',
          url: 'javascript:alert(1)',
          kind: 'regular',
        },
        {
          id: 2,
          title: 'Support',
          url: 'paypal.me/userpaypal.me',
          kind: 'support',
        },
        { id: 3, title: 'Valid', url: 'https://decibel.com', kind: 'regular' },
      ];

      const errors = validateLinks(mockPayload);

      // Should flag the XSS link
      expect(errors[1]).toBe('Enter a valid URL or email address.');
      // Should flag the double-pasted support link
      expect(errors[2]).toBe(
        'Support link must match one of the supported platforms.'
      );
      // Should NOT flag the valid link
      expect(errors[3]).toBeUndefined();
    });
  });
});
