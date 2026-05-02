import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import { RealSubscriptionService } from '@/services/api/subscriptionService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CheckoutResponse,
  CancelSubscriptionResponse,
  SubscriptionStatusDTO,
  RenewSubscriptionResponse,
} from '@/types/subscription';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  normalizeApiError: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

describe('RealSubscriptionService', () => {
  let service: RealSubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealSubscriptionService();
  });

  it('createCheckoutSession calls SUBSCRIPTION_CHECKOUT', async () => {
    const response: CheckoutResponse = {
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_live_123',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.createCheckoutSession();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.SUBSCRIPTION_CHECKOUT
    );
  });

  it('cancelSubscription calls SUBSCRIPTION_CANCEL', async () => {
    const response: CancelSubscriptionResponse = {
      message: 'Subscription cancelled successfully',
      cancelAtPeriodEnd: true,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.cancelSubscription();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.SUBSCRIPTION_CANCEL
    );
  });

  it('getSubscriptionStatus calls SUBSCRIPTION_STATUS', async () => {
    const response: SubscriptionStatusDTO = {
      status: 'active',
      plan: 'pro',
      currentPeriodEnd: 1748736000,
      cancelAtPeriodEnd: false,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getSubscriptionStatus();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.SUBSCRIPTION_STATUS
    );
  });

  it('renewSubscription calls SUBSCRIPTION_RENEW', async () => {
    const response: RenewSubscriptionResponse = {
      message: 'Subscription renewed successfully',
      cancelAtPeriodEnd: false,
      status: 'active',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.renewSubscription();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.SUBSCRIPTION_RENEW
    );
  });

  it('normalizes and rethrows errors', async () => {
    const requestError = new Error('network fail');
    const normalizedError = {
      statusCode: 401,
      message: 'Access token has expired',
      error: 'Unauthorized',
    };
    mockedApiRequest.mockRejectedValue(requestError);
    mockedNormalizeApiError.mockReturnValue(normalizedError);

    await expect(service.getSubscriptionStatus()).rejects.toEqual(
      normalizedError
    );
    expect(mockedNormalizeApiError).toHaveBeenCalledWith(requestError);
  });
});
