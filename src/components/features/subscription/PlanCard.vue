<!-- src/components/features/subscription/PlanCard.vue -->
<template>
  <div
    class="plan-card"
    :class="{ 'is-current': isCurrent, 'is-popular': isPopular }"
  >
    <div class="plan-header">
      <h3 class="plan-name">
        {{ plan.name }}
      </h3>
      <div
        v-if="isCurrent"
        class="badge badge-current"
      >
        Current Plan
      </div>
      <div
        v-if="isPopular"
        class="badge badge-popular"
      >
        Most Popular
      </div>
    </div>

    <div class="plan-price">
      <span class="price">${{ plan.price }}</span>
      <span class="period">/{{ plan.interval === "month" ? "month" : "year" }}</span>
    </div>

    <ul class="features-list">
      <li
        v-for="feature in plan.features"
        :key="feature"
        class="feature-item"
      >
        <span class="feature-check">✓</span>
        {{ feature }}
      </li>
    </ul>

    <div class="quota-info">
      <div class="quota-item">
        <span class="quota-label">Generations/month:</span>
        <span class="quota-value">
          {{
            plan.limits.generationsPerMonth === -1
              ? "Unlimited"
              : plan.limits.generationsPerMonth
          }}
        </span>
      </div>
      <div class="quota-item">
        <span class="quota-label">Storage:</span>
        <span class="quota-value">{{ plan.limits.storageGB }}GB</span>
      </div>
      <div class="quota-item">
        <span class="quota-label">Export Quality:</span>
        <span class="quota-value">{{ plan.limits.exportQuality }}</span>
      </div>
      <div class="quota-item">
        <span class="quota-label">Watermark:</span>
        <span class="quota-value">{{
          plan.limits.watermark ? "Yes" : "No"
        }}</span>
      </div>
    </div>

    <button
      v-if="!isCurrent && plan.id !== 'free'"
      class="btn btn-primary"
      :disabled="disabled"
      @click="emit('select')"
    >
      {{ buttonText }}
    </button>
    <button
      v-else-if="isCurrent && plan.id !== 'free'"
      class="btn btn-secondary"
      disabled
    >
      Current Plan
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from "@/types";

interface Props {
  plan: Plan;
  isCurrent?: boolean;
  isPopular?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  isPopular: false,
  disabled: false,
});

const emit = defineEmits<{
  select: [];
}>();

const buttonText = computed(() => {
  if (!props.isCurrent) {
    return "Upgrade to " + props.plan.name;
  }
  return "Current Plan";
});

import { computed } from "vue";
</script>

<style scoped>
.plan-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.plan-card.is-popular {
  border-color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.plan-card.is-current {
  background-color: #f5f5f5;
  border-color: #4caf50;
}

.plan-header {
  position: relative;
  margin-bottom: 16px;
}

.plan-name {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.badge-current {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.badge-popular {
  background-color: #bbdefb;
  color: #1565c0;
}

.plan-price {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.period {
  font-size: 14px;
  color: #666;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  flex-grow: 1;
}

.feature-item {
  padding: 8px 0;
  color: #555;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-check {
  color: #4caf50;
  font-weight: 600;
}

.quota-info {
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  color: #666;
}

.quota-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px 0;
}

.quota-label {
  font-weight: 500;
}

.quota-value {
  color: #333;
  font-weight: 600;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
