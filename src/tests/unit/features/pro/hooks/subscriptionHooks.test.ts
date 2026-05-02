import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { subscriptionService } from '@/services';
import { useCancelSubscription } from '@/features/pro/hooks/useCancelSubscription';
import { useCreateCheckoutSession } from '@/features/pro/hooks/useCreateCheckoutSession';
import { useRenewSubscription } from '@/features/pro/hooks/useRenewSubscription';
import { useSubscriptionStatus } from '@/features/pro/hooks/useSubscriptionStatus';

jest.mock('@/services', () => ({
  subscriptionService: {
    createCheckoutSession: jest.fn(),
    cancelSubscription: jest.fn(),
    getSubscriptionStatus: jest.fn(),
    renewSubscription: jest.fn(),
  },
}));

const mockedSubscriptionService = subscriptionService as {
  createCheckoutSession: jest.Mock;
  cancelSubscription: jest.Mock;
  getSubscriptionStatus: jest.Mock;
  renewSubscription: jest.Mock;
};

describe('subscription hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useCreateCheckoutSession calls the service and stores the response', async () => {
    const response = { checkoutUrl: 'https://checkout.example.com/session' };
    mockedSubscriptionService.createCheckoutSession.mockResolvedValue(response);

    const { result } = renderHook(() => useCreateCheckoutSession());

    let returned:
      | Awaited<ReturnType<typeof result.current.createCheckoutSession>>
      | undefined;
    await act(async () => {
      returned = await result.current.createCheckoutSession();
    });

    await waitFor(() =>
      expect(result.current.checkoutSession).toEqual(response)
    );
    expect(returned).toEqual(response);
    expect(
      mockedSubscriptionService.createCheckoutSession
    ).toHaveBeenCalledTimes(1);
  });

  it('useCancelSubscription calls the service and stores the response', async () => {
    const response = {
      message: 'Subscription cancelled successfully',
      cancelAtPeriodEnd: true,
    };
    mockedSubscriptionService.cancelSubscription.mockResolvedValue(response);

    const { result } = renderHook(() => useCancelSubscription());

    let returned:
      | Awaited<ReturnType<typeof result.current.cancelSubscription>>
      | undefined;
    await act(async () => {
      returned = await result.current.cancelSubscription();
    });

    await waitFor(() =>
      expect(result.current.cancelResponse).toEqual(response)
    );
    expect(returned).toEqual(response);
    expect(mockedSubscriptionService.cancelSubscription).toHaveBeenCalledTimes(
      1
    );
  });

  it('useRenewSubscription calls the service and stores the response', async () => {
    const response = {
      message: 'Subscription renewed successfully',
      cancelAtPeriodEnd: false,
      status: 'active',
    };
    mockedSubscriptionService.renewSubscription.mockResolvedValue(response);

    const { result } = renderHook(() => useRenewSubscription());

    let returned:
      | Awaited<ReturnType<typeof result.current.renewSubscription>>
      | undefined;
    await act(async () => {
      returned = await result.current.renewSubscription();
    });

    await waitFor(() => expect(result.current.renewResponse).toEqual(response));
    expect(returned).toEqual(response);
    expect(mockedSubscriptionService.renewSubscription).toHaveBeenCalledTimes(
      1
    );
  });

  it('useSubscriptionStatus loads the current status on mount', async () => {
    const response = {
      status: 'active',
      plan: 'pro',
      currentPeriodEnd: 1748736000,
      cancelAtPeriodEnd: false,
    };
    mockedSubscriptionService.getSubscriptionStatus.mockResolvedValue(response);

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subscriptionStatus).toEqual(response);
    expect(
      mockedSubscriptionService.getSubscriptionStatus
    ).toHaveBeenCalledTimes(1);
  });

  it('useSubscriptionStatus does not auto-load when disabled', async () => {
    const { result } = renderHook(() =>
      useSubscriptionStatus({ enabled: false })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subscriptionStatus).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(
      mockedSubscriptionService.getSubscriptionStatus
    ).not.toHaveBeenCalled();
  });
});
