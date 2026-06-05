<!-- src/components/common/ToastContainer.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useUIStore } from "@/store/ui";

const uiStore = useUIStore();

const toastIcon = computed(() => (type: string) => {
  switch (type) {
    case "success":
      return "mdi-check-circle";
    case "error":
      return "mdi-alert-circle";
    case "warning":
      return "mdi-alert";
    case "info":
      return "mdi-information";
    default:
      return "mdi-information";
  }
});

const toastColor = computed(() => (type: string) => {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
    default:
      return "info";
  }
});
</script>

<template>
  <div class="toast-container">
    <transition-group
      name="toast"
      tag="div"
    >
      <v-alert
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :type="toast.type"
        :color="toastColor(toast.type)"
        :icon="toastIcon(toast.type)"
        class="toast-item"
        elevation="4"
        closable
        @click:close="uiStore.removeToast(toast.id)"
      >
        {{ toast.message }}
      </v-alert>
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  width: 100%;
}

// Toast animations
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
