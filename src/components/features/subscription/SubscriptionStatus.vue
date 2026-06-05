<!-- src/components/features/subscription/SubscriptionStatus.vue -->
<template>
  <div class="subscription-status">
    <div
      v-if="subscription && currentPlan"
      class="status-card"
    >
      <div class="status-header">
        <h3 class="status-title">
          Your Current Subscription
        </h3>
        <span
          class="status-badge"
          :class="statusBadgeClass"
        >
          {{
            subscription.status.charAt(0).toUpperCase() +
              subscription.status.slice(1)
          }}
        </span>
      </div>

      <div class="status-details">
        <div class="detail-item">
          <span class="detail-label">Plan:</span>
          <span class="detail-value">{{ currentPlan.name }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Billing Interval:</span>
          <span class="detail-value">{{
            currentPlan.interval === "month" ? "Monthly" : "Yearly"
          }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Current Period:</span>
          <span class="detail-value">
            {{ formatDate(subscription.currentPeriodStart) }} to
            {{ formatDate(subscription.currentPeriodEnd) }}
          </span>
        </div>

        <div
          v-if="subscription.stripeSubscriptionId"
          class="detail-item"
        >
          <span class="detail-label">Stripe ID:</span>
          <span class="detail-value monospace">{{
            subscription.stripeSubscriptionId
          }}</span>
        </div>
      </div>

      <div class="status-actions">
        <button
          class="btn btn-secondary"
          @click="emit('upgrade')"
        >
          Upgrade Plan
        </button>
        <button
          class="btn btn-danger"
          @click="emit('cancel')"
        >
          Cancel Subscription
        </button>
      </div>
    </div>

    <div
      v-else
      class="no-subscription"
    >
      <p>You don't have an active subscription yet.</p>
      <button
        class="btn btn-primary"
        @click="emit('subscribe')"
      >
        Choose a Plan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSubscriptionStore } from "@/store";

const subscriptionStore = useSubscriptionStore();

const subscription = computed(() => subscriptionStore.subscription);
const currentPlan = computed(() => subscriptionStore.currentPlan);

const statusBadgeClass = computed(() => {
  if (!subscription.value) return "";
  return {
    "badge-active": subscription.value.status === "active",
    "badge-inactive": subscription.value.status === "inactive",
    "badge-past-due": subscription.value.status === "past_due",
    "badge-canceled": subscription.value.status === "canceled",
  };
});

const emit = defineEmits<{
  upgrade: [];
  cancel: [];
  subscribe: [];
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.subscription-status {
  width: 100%;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.no-subscription {
  background: #f5f5f5;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
}

.no-subscription p {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #666;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.status-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: rgba(255, 255, 255, 0.2);
}

.badge-active {
  background-color: rgba(76, 175, 80, 0.3) !important;
  color: #c8e6c9;
}

.badge-inactive {
  background-color: rgba(244, 67, 54, 0.3) !important;
  color: #ffcdd2;
}

.badge-past-due {
  background-color: rgba(255, 193, 7, 0.3) !important;
  color: #ffe082;
}

.badge-canceled {
  background-color: rgba(158, 158, 158, 0.3) !important;
  color: #f5f5f5;
}

.status-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  font-size: 14px;
  opacity: 0.9;
}

.detail-value {
  font-weight: 500;
  font-size: 14px;
}

.monospace {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  word-break: break-all;
}

.status-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.btn-danger {
  background-color: rgba(244, 67, 54, 0.8);
  color: white;
  border: 1px solid rgba(244, 67, 54, 1);
}

.btn-danger:hover {
  background-color: #f44336;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}
</style>
