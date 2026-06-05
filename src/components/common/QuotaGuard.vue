<!-- src/components/common/QuotaGuard.vue -->
<template>
  <div class="quota-guard">
    <!-- Content when quota is available -->
    <template v-if="hasQuota">
      <slot />
    </template>

    <!-- Content when quota is not available -->
    <template v-else>
      <div class="quota-warning">
        <div class="warning-icon">
          ⚠️
        </div>
        <div class="warning-content">
          <h4>{{ warningTitle }}</h4>
          <p>{{ warningMessage }}</p>
          <button
            class="btn btn-primary"
            @click="navigateToSubscription"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSubscription } from "@/composables/useSubscription";

interface Props {
  type: "generation" | "storage";
  required?: number; // Amount required (default: 1)
}

const props = withDefaults(defineProps<Props>(), {
  required: 1,
});

const router = useRouter();
const { canGenerate, canStore, generationsRemaining, storageRemaining } =
  useSubscription();

const hasQuota = computed(() => {
  if (props.type === "generation") {
    return canGenerate(props.required);
  } else {
    return canStore(props.required);
  }
});

const warningTitle = computed(() => {
  if (props.type === "generation") {
    return "Generation Limit Reached";
  } else {
    return "Storage Limit Reached";
  }
});

const warningMessage = computed(() => {
  if (props.type === "generation") {
    return `You have no more generations available this month. You have used your entire quota of ${generationsRemaining.value} generations.`;
  } else {
    return `You have no more storage space available. Upgrade your plan to increase your storage limit.`;
  }
});

const navigateToSubscription = () => {
  router.push("/subscription");
};
</script>

<style scoped>
.quota-guard {
  width: 100%;
}

.quota-warning {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.warning-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #856404;
}

.warning-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #856404;
  line-height: 1.5;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #ffc107;
  color: #333;
}

.btn-primary:hover {
  background-color: #ffb300;
}
</style>
