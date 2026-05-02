describe('services/index dependency resolution', () => {
  const originalUseMock = process.env.NEXT_PUBLIC_USE_MOCK;

  afterEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalUseMock;
    jest.resetModules();
  });

  it('resolves mock services when NEXT_PUBLIC_USE_MOCK=true', () => {
    process.env.NEXT_PUBLIC_USE_MOCK = 'true';

    jest.isolateModules(() => {
      const {
        trackService,
        authService,
        privacyService,
        discoveryService,
      } = require('@/services');
      const { MockTrackService } = require('@/services/mocks/trackService');
      const { MockAuthService } = require('@/services/mocks/authService');
      const { MockPrivacyService } = require('@/services/mocks/privacyService');
      const { MockDiscoveryService } = require('@/services/mocks/discoveryService');

      expect(trackService).toBeInstanceOf(MockTrackService);
      expect(authService).toBeInstanceOf(MockAuthService);
      expect(privacyService).toBeInstanceOf(MockPrivacyService);
      expect(discoveryService).toBeInstanceOf(MockDiscoveryService);
    });
  });

  it('resolves real services when NEXT_PUBLIC_USE_MOCK=false', () => {
    process.env.NEXT_PUBLIC_USE_MOCK = 'false';

    jest.isolateModules(() => {
      const {
        trackService,
        authService,
        privacyService,
        discoveryService,
      } = require('@/services');
      const { RealTrackService } = require('@/services/api/trackService');
      const { RealAuthService } = require('@/services/api/authService');
      const { RealPrivacyService } = require('@/services/api/privacyService');
      const { RealDiscoveryService } = require('@/services/api/discoveryService');

      expect(trackService).toBeInstanceOf(RealTrackService);
      expect(authService).toBeInstanceOf(RealAuthService);
      expect(privacyService).toBeInstanceOf(RealPrivacyService);
      expect(discoveryService).toBeInstanceOf(RealDiscoveryService);
    });
  });
});
