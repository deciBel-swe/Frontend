import { MockSubscriptionService } from '@/services/mocks/subscriptionService';

describe('MockSubscriptionService', () => {
  let service: MockSubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MockSubscriptionService();
  });

  it('createCheckoutSession returns mock checkout URL', async () => {
    const response = await service.createCheckoutSession();

    expect(response.checkoutUrl).toBe(
      'https://checkout.stripe.com/pay/cs_test_mock123'
    );
  });

  it('cancelSubscription returns success message and cancellation state', async () => {
    const response = await service.cancelSubscription();

    expect(response).toEqual({
      message: 'Subscription cancelled successfully',
      cancelAtPeriodEnd: true,
    });
  });

  it('getSubscriptionStatus returns active mock subscription state', async () => {
    const response = await service.getSubscriptionStatus();

    expect(response.status).toBe('active');
    expect(response.plan).toBe('pro');
    expect(typeof response.currentPeriodEnd).toBe('number');
    expect(response.cancelAtPeriodEnd).toBe(false);
  });

  it('renewSubscription returns success message and updated state', async () => {
    const response = await service.renewSubscription();

    expect(response).toEqual({
      message: 'Subscription renewed successfully',
      cancelAtPeriodEnd: false,
      status: 'active',
    });
  });
});
