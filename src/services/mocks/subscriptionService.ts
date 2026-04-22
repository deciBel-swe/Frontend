import { SubscriptionService } from '../api/subscriptionService';
import type {
  CheckoutResponse,
  CancelSubscriptionResponse,
  SubscriptionStatusDTO,
  RenewSubscriptionResponse,
} from '@/types/subscription';

export class MockSubscriptionService implements SubscriptionService {
  async createCheckoutSession(): Promise<CheckoutResponse> {
    return {
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_mock123',
    };
  }

  async cancelSubscription(): Promise<CancelSubscriptionResponse> {
    return {
      message: 'Subscription cancelled successfully',
      cancelAtPeriodEnd: true,
    };
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatusDTO> {
    return {
      status: 'active',
      plan: 'pro',
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      cancelAtPeriodEnd: false,
    };
  }

  async renewSubscription(): Promise<RenewSubscriptionResponse> {
    return {
      message: 'Subscription renewed successfully',
      cancelAtPeriodEnd: false,
      status: 'active',
    };
  }
}
