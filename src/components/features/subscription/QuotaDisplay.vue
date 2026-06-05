<!-- src/components/features/subscription/QuotaDisplay.vue -->
<template>
  <div class="quota-display">
    <div class="quota-card">
      <div class="quota-header">
        <h4 class="quota-title">Generations</h4>
        <span class="quota-counter"
          >{{ generationsUsed }} / {{ generationsLimit }}</span
        >
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: generationsPercentage + '%' }"
        ></div>
      </div>
      <p class="quota-info">
        You have {{ generationsLimit - generationsUsed }} generations remaining
        this month
      </p>
    </div>

    <div class="quota-card">
      <div class="quota-header">
        <h4 class="quota-title">Storage</h4>
        <span class="quota-counter"
          >{{ (storageUsed / 1024).toFixed(1) }} / {{ storageLimit }}GB</span
        >
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: storagePercentage + '%' }"
        ></div>
      </div>
      <p class="quota-info">
        You have {{ (storageLimit - storageUsed / 1024).toFixed(1) }}GB storage
        remaining
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSubscriptionStore } from "@/store";

const subscriptionStore = useSubscriptionStore();

const generationsUsed = computed(() => subscriptionStore.generationsUsed);
const generationsLimit = computed(() => subscriptionStore.generationsLimit);
const storageUsed = computed(() => subscriptionStore.storageUsed);
const storageLimit = computed(() => subscriptionStore.storageLimit);
const generationsPercentage = computed(
  () => subscriptionStore.generationsPercentage,
);
const storagePercentage = computed(() => subscriptionStore.storagePercentage);
</script>

<style scoped>
.quota-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.quota-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s ease;
}

.quota-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quota-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.quota-counter {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #1565c0);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quota-info {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}
</style>
