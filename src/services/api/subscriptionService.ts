import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CheckoutResponse,
  CancelSubscriptionResponse,
  SubscriptionStatusDTO,
  RenewSubscriptionResponse,
} from '@/types/subscription';

export interface SubscriptionService {
  createCheckoutSession(): Promise<CheckoutResponse>;
  cancelSubscription(): Promise<CancelSubscriptionResponse>;
  getSubscriptionStatus(): Promise<SubscriptionStatusDTO>;
  renewSubscription(): Promise<RenewSubscriptionResponse>;
}

export class RealSubscriptionService implements SubscriptionService {
  async createCheckoutSession(): Promise<CheckoutResponse> {
    try {
      return await apiRequest(API_CONTRACTS.SUBSCRIPTION_CHECKOUT);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async cancelSubscription(): Promise<CancelSubscriptionResponse> {
    try {
      return await apiRequest(API_CONTRACTS.SUBSCRIPTION_CANCEL);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatusDTO> {
    try {
      return await apiRequest(API_CONTRACTS.SUBSCRIPTION_STATUS);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async renewSubscription(): Promise<RenewSubscriptionResponse> {
    try {
      return await apiRequest(API_CONTRACTS.SUBSCRIPTION_RENEW);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
