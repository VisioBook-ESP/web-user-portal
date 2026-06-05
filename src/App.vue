<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import ToastContainer from "@/components/common/ToastContainer.vue";
import AuthModals from "@/components/features/auth/AuthModals.vue";

const authStore = useAuthStore();
const uiStore = useUIStore();

onMounted(() => {
  // Initialize authentication state
  authStore.initializeAuth();
  // Initialize theme
  uiStore.initializeTheme();
});
</script>

<template>
  <v-app :theme="uiStore.theme">
    <router-view v-slot="{ Component }">
      <transition
        name="fade"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global toast notifications -->
    <ToastContainer />

    <!-- Auth Modals -->
    <AuthModals />

    <!-- Global loading overlay -->
    <v-overlay
      v-model="uiStore.isLoading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>
  </v-app>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
