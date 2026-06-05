<!-- src/views/SubscriptionView.vue -->
<template>
  <div class="subscription-view">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1>Subscription & Billing</h1>
        <p class="subtitle">Manage your plan, quotas, and billing settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner" />
        <p>Loading subscription data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="loadData">Retry</button>
      </div>

      <!-- Main Content -->
      <div v-else class="content">
        <!-- Current Subscription Status -->
        <section class="section">
          <SubscriptionStatus
            @upgrade="scrollToPlans"
            @cancel="showCancelDialog = true"
            @subscribe="scrollToPlans"
          />
        </section>

        <!-- Quotas Display -->
        <section v-if="subscription" class="section">
          <h2 class="section-title">Your Quota Usage</h2>
          <QuotaDisplay />
        </section>

        <!-- Available Plans -->
        <section class="section">
          <h2 class="section-title">Available Plans</h2>
          <div ref="plansRef" class="plans-grid">
            <PlanCard
              v-for="plan in plans"
              :key="plan.id"
              :plan="plan"
              :is-current="plan.id === subscription?.planId"
              :is-popular="plan.id === 'premium'"
              @select="selectPlan(plan)"
            />
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="section faq-section">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div class="faq-list">
            <details class="faq-item">
              <summary>Can I change my plan anytime?</summary>
              <p>
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately for upgrades, and will be applied at the
                end of your billing cycle for downgrades.
              </p>
            </details>

            <details class="faq-item">
              <summary>What happens if I exceed my quota?</summary>
              <p>
                Once you reach your generation or storage limit, you won't be
                able to perform new generations until the quota resets or you
                upgrade your plan.
              </p>
            </details>

            <details class="faq-item">
              <summary>How do I get my invoice?</summary>
              <p>
                All invoices are automatically sent to your email address
                associated with your account. You can also contact our support
                team if you need a copy of a previous invoice.
              </p>
            </details>

            <details class="faq-item">
              <summary>Is there a free trial?</summary>
              <p>
                Yes! You can use our free plan to get started and explore all
                features. Upgrade to a paid plan anytime to unlock more
                generations and storage.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>

    <!-- Cancel Subscription Dialog -->
    <CancelSubscriptionDialog
      v-if="showCancelDialog"
      :loading="isLoading"
      @confirm="confirmCancel"
      @close="showCancelDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSubscriptionStore, useUIStore } from "@/store";
import SubscriptionStatus from "@/components/features/subscription/SubscriptionStatus.vue";
import QuotaDisplay from "@/components/features/subscription/QuotaDisplay.vue";
import PlanCard from "@/components/features/subscription/PlanCard.vue";
import CancelSubscriptionDialog from "@/components/features/subscription/CancelSubscriptionDialog.vue";
import type { Plan } from "@/types";
import { buildCheckoutReturnUrl } from "@/utils/helpers";

const route = useRoute();
const router = useRouter();
const subscriptionStore = useSubscriptionStore();
const uiStore = useUIStore();
const plansRef = ref<HTMLElement>();
const showCancelDialog = ref(false);

// Computed
const isLoading = computed(() => subscriptionStore.isLoading);
const error = computed(() => subscriptionStore.error);
const plans = computed(() => subscriptionStore.plans);
const subscription = computed(() => subscriptionStore.subscription);

// Methods
const loadData = async () => {
  await Promise.all([
    subscriptionStore.fetchPlans(),
    subscriptionStore.fetchSubscription(),
    subscriptionStore.fetchQuotas(),
  ]);
};

const scrollToPlans = () => {
  plansRef.value?.scrollIntoView({ behavior: "smooth" });
};

const handleStripeReturn = () => {
  const { success, canceled } = route.query;
  if (success === "true") {
    uiStore.showSuccess(
      "Payment successful! Your subscription has been activated.",
    );
    router.replace({ name: "subscription" });
  } else if (canceled === "true") {
    uiStore.showInfo("Checkout was canceled. Your plan has not changed.");
    router.replace({ name: "subscription" });
  }
};

const selectPlan = async (plan: Plan) => {
  try {
    if (plan.id === "free") {
      await subscriptionStore.downgradePlan({ planId: "free" });
      uiStore.showSuccess("Downgraded to Free plan.");
      return;
    }

    const successUrl = buildCheckoutReturnUrl("/subscription?success=true");
    const cancelUrl = buildCheckoutReturnUrl("/subscription?canceled=true");

    const checkoutUrl = await subscriptionStore.createCheckoutSession({
      planId: plan.id as "premium" | "enterprise",
      successUrl,
      cancelUrl,
    });

    window.location.href = checkoutUrl;
  } catch (err: any) {
    uiStore.showError(
      err?.message || "Failed to process plan selection. Please try again.",
    );
  }
};

const confirmCancel = async () => {
  try {
    await subscriptionStore.cancelSubscription();
    showCancelDialog.value = false;
    uiStore.showSuccess(
      "Subscription canceled. It remains active until the end of the billing period.",
    );
    await loadData();
  } catch (err: any) {
    uiStore.showError(
      err?.message || "Failed to cancel subscription. Please try again.",
    );
  }
};

// Lifecycle
onMounted(async () => {
  handleStripeReturn();
  await loadData();
});
</script>

<style scoped>
.subscription-view {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: white;
  font-size: 16px;
}

.error-message {
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 8px;
  padding: 20px;
  color: #c62828;
  margin-bottom: 24px;
  text-align: center;
}

.error-message p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.faq-section {
  background: white;
  border-radius: 8px;
  padding: 32px;
}

.faq-section .section-title {
  color: #333;
  text-shadow: none;
  margin-bottom: 24px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.faq-item summary {
  padding: 16px 20px;
  background-color: #f9f9f9;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  transition: background-color 0.2s ease;
  user-select: none;
}

.faq-item summary:hover {
  background-color: #f0f0f0;
}

.faq-item[open] summary {
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.faq-item p {
  margin: 0;
  padding: 16px 20px;
  color: #666;
  line-height: 1.6;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

@media (max-width: 768px) {
  .subscription-view {
    padding: 20px 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .section-title {
    font-size: 20px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .faq-section {
    padding: 20px;
  }
}
</style>
