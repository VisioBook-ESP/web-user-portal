// src/composables/useSubscription.ts
import { computed, ref } from "vue";
import { useSubscriptionStore } from "@/store";
import type { Plan } from "@/types";
import { buildCheckoutReturnUrl } from "@/utils/helpers";

/**
 * Composable for subscription management operations
 * Provides reactive subscription data and common operations
 */
export function useSubscription() {
  const subscriptionStore = useSubscriptionStore();
  const isProcessing = ref(false);
  const operationError = ref<string | null>(null);

  // Reactive subscription data
  const subscription = computed(() => subscriptionStore.subscription);
  const plans = computed(() => subscriptionStore.plans);
  const quotas = computed(() => subscriptionStore.quotas);
  const isLoading = computed(() => subscriptionStore.isLoading);
  const error = computed(() => subscriptionStore.error);

  // Subscription status getters
  const currentPlanId = computed(() => subscription.value?.planId);
  const currentPlanName = computed(() => subscriptionStore.currentPlan?.name);
  const isPremium = computed(() => subscriptionStore.isPremium);
  const isEnterprise = computed(() => subscriptionStore.isEnterprise);
  const subscriptionStatus = computed(() => subscription.value?.status);
  const isSubscriptionActive = computed(
    () => subscription.value?.status === "active",
  );

  // Quota getters
  const generationsUsed = computed(() => subscriptionStore.generationsUsed);
  const generationsLimit = computed(() => subscriptionStore.generationsLimit);
  const generationsRemaining = computed(() =>
    Math.max(0, generationsLimit.value - generationsUsed.value),
  );
  const storageUsed = computed(() => subscriptionStore.storageUsed);
  const storageLimit = computed(() => subscriptionStore.storageLimit);
  const storageRemaining = computed(() =>
    Math.max(0, storageLimit.value - storageUsed.value),
  );
  const generationsPercentage = computed(
    () => subscriptionStore.generationsPercentage,
  );
  const storagePercentage = computed(() => subscriptionStore.storagePercentage);

  // Quota check functions
  const canGenerate = (count: number = 1): boolean => {
    return generationsRemaining.value >= count;
  };

  const canStore = (sizeGB: number): boolean => {
    return storageRemaining.value >= sizeGB;
  };

  const getAvailablePlans = (exclude?: string): Plan[] => {
    return plans.value.filter((p) => !exclude || p.id !== exclude);
  };

  const getPlan = (planId: string): Plan | undefined => {
    return plans.value.find((p) => p.id === planId);
  };

  // Operations
  const refreshSubscription = async (): Promise<void> => {
    operationError.value = null;
    try {
      await subscriptionStore.refreshSubscriptionData();
    } catch (err: any) {
      operationError.value = err.message || "Failed to refresh subscription";
    }
  };

  const checkout = async (planId: string): Promise<void> => {
    isProcessing.value = true;
    operationError.value = null;
    try {
      const successUrl = buildCheckoutReturnUrl("/subscription?success=true");
      const cancelUrl = buildCheckoutReturnUrl("/subscription?canceled=true");

      const checkoutUrl = await subscriptionStore.createCheckoutSession({
        planId: planId as any,
        successUrl,
        cancelUrl,
      });

      window.location.href = checkoutUrl;
    } catch (err: any) {
      operationError.value = err.message || "Failed to create checkout session";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  const upgradePlan = async (planId: string): Promise<void> => {
    isProcessing.value = true;
    operationError.value = null;
    try {
      await subscriptionStore.upgradePlan({ planId: planId as any });
    } catch (err: any) {
      operationError.value = err.message || "Failed to upgrade plan";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  const downgradePlan = async (planId: string): Promise<void> => {
    isProcessing.value = true;
    operationError.value = null;
    try {
      await subscriptionStore.downgradePlan({ planId: planId as any });
    } catch (err: any) {
      operationError.value = err.message || "Failed to downgrade plan";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  const cancel = async (): Promise<void> => {
    isProcessing.value = true;
    operationError.value = null;
    try {
      await subscriptionStore.cancelSubscription();
    } catch (err: any) {
      operationError.value = err.message || "Failed to cancel subscription";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    // State
    subscription,
    plans,
    quotas,
    isLoading,
    error,
    isProcessing,
    operationError,

    // Subscription info
    currentPlanId,
    currentPlanName,
    isPremium,
    isEnterprise,
    subscriptionStatus,
    isSubscriptionActive,

    // Quota info
    generationsUsed,
    generationsLimit,
    generationsRemaining,
    storageUsed,
    storageLimit,
    storageRemaining,
    generationsPercentage,
    storagePercentage,

    // Quota checks
    canGenerate,
    canStore,

    // Plan queries
    getAvailablePlans,
    getPlan,

    // Operations
    refreshSubscription,
    checkout,
    upgradePlan,
    downgradePlan,
    cancel,
  };
}
