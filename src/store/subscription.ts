// src/store/subscription.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { paymentApi } from "@/services/api/paymentApi";
import type {
  Plan,
  Subscription,
  UserQuota,
  CheckoutRequest,
  PaymentIntentRequest,
  ChangePlanRequest,
} from "@/types";

export const useSubscriptionStore = defineStore("subscription", () => {
  // State
  const plans = ref<Plan[]>([]);
  const subscription = ref<Subscription | null>(null);
  const quotas = ref<UserQuota | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isPremium = computed(() => {
    return (
      subscription.value?.planId === "premium" ||
      subscription.value?.planId === "enterprise"
    );
  });

  const isEnterprise = computed(() => {
    return subscription.value?.planId === "enterprise";
  });

  const currentPlan = computed(() => {
    return plans.value.find((p) => p.id === subscription.value?.planId);
  });

  const generationsUsed = computed(() => {
    return quotas.value?.generations?.used ?? 0;
  });

  const generationsLimit = computed(() => {
    return quotas.value?.generations?.limit ?? 0;
  });

  const storageUsed = computed(() => {
    return quotas.value?.storage?.used ?? 0;
  });

  const storageLimit = computed(() => {
    return quotas.value?.storage?.limit ?? 0;
  });

  const generationsPercentage = computed(() => {
    if (generationsLimit.value === 0) return 0;
    return (generationsUsed.value / generationsLimit.value) * 100;
  });

  const storagePercentage = computed(() => {
    if (storageLimit.value === 0) return 0;
    return (storageUsed.value / storageLimit.value) * 100;
  });

  // Actions
  async function fetchPlans(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      plans.value = await paymentApi.getPlans();
    } catch (err: any) {
      error.value = err.message || "Failed to fetch plans";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSubscription(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      subscription.value = await paymentApi.getCurrentSubscription();
    } catch (err: any) {
      // It's okay if the user doesn't have a subscription yet
      if (err.code !== 404) {
        error.value = err.message || "Failed to fetch subscription";
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchQuotas(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      quotas.value = await paymentApi.getUserQuotas();
    } catch (err: any) {
      // It's okay if the user doesn't have quotas yet
      if (err.code !== 404) {
        error.value = err.message || "Failed to fetch quotas";
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function createCheckoutSession(
    request: CheckoutRequest,
  ): Promise<string> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await paymentApi.createCheckoutSession(request);
      return response.checkoutUrl;
    } catch (err: any) {
      error.value = err.message || "Failed to create checkout session";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createPaymentIntent(
    request: PaymentIntentRequest,
  ): Promise<any> {
    isLoading.value = true;
    error.value = null;
    try {
      return await paymentApi.createPaymentIntent(request);
    } catch (err: any) {
      error.value = err.message || "Failed to create payment intent";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function upgradePlan(request: ChangePlanRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      subscription.value = await paymentApi.upgradePlan(request);
    } catch (err: any) {
      error.value = err.message || "Failed to upgrade plan";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function downgradePlan(request: ChangePlanRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      subscription.value = await paymentApi.downgradePlan(request);
    } catch (err: any) {
      error.value = err.message || "Failed to downgrade plan";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function cancelSubscription(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      subscription.value = await paymentApi.cancelSubscription();
    } catch (err: any) {
      error.value = err.message || "Failed to cancel subscription";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshSubscriptionData(): Promise<void> {
    await Promise.all([fetchSubscription(), fetchQuotas()]);
  }

  return {
    // State
    plans,
    subscription,
    quotas,
    isLoading,
    error,

    // Getters
    isPremium,
    isEnterprise,
    currentPlan,
    generationsUsed,
    generationsLimit,
    storageUsed,
    storageLimit,
    generationsPercentage,
    storagePercentage,

    // Actions
    fetchPlans,
    fetchSubscription,
    fetchQuotas,
    createCheckoutSession,
    createPaymentIntent,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    refreshSubscriptionData,
  };
});
