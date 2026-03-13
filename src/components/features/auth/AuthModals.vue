<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '@/store/ui';
import LoginModal from './LoginModal.vue';
import RegisterModal from './RegisterModal.vue';

const uiStore = useUIStore();

const showLoginModal = computed(() => uiStore.authModal === 'login');
const showRegisterModal = computed(() => uiStore.authModal === 'register');
</script>

<template>
  <Teleport to="body">
    <LoginModal v-if="showLoginModal" />
    <RegisterModal v-if="showRegisterModal" />
  </Teleport>
</template>
