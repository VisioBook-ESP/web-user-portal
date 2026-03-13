// src/store/ui.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Toast } from '@/types';

export type AuthModalType = 'login' | 'register' | null;

export const useUIStore = defineStore('ui', () => {
  // State
  const isLoading = ref(false);
  const toasts = ref<Toast[]>([]);
  const sidebarOpen = ref(true);
  const theme = ref<'visiobookLight' | 'visiobookDark'>('visiobookLight');
  const authModal = ref<AuthModalType>(null);

  // Auth Modal Actions
  function openLoginModal(): void {
    authModal.value = 'login';
  }

  function openRegisterModal(): void {
    authModal.value = 'register';
  }

  function closeAuthModal(): void {
    authModal.value = null;
  }

  function switchAuthModal(): void {
    authModal.value = authModal.value === 'login' ? 'register' : 'login';
  }

  // Actions
  function showToast(
    message: string,
    type: Toast['type'] = 'info',
    duration = 5000
  ): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      type,
      message,
      duration,
    };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }

  function removeToast(id: string): void {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'visiobookLight' ? 'visiobookDark' : 'visiobookLight';
    localStorage.setItem('theme', theme.value);
  }

  function initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'visiobookLight' || savedTheme === 'visiobookDark') {
      theme.value = savedTheme;
    }
  }

  // Toast shortcuts
  function showSuccess(message: string, duration = 5000): void {
    showToast(message, 'success', duration);
  }

  function showError(message: string, duration = 5000): void {
    showToast(message, 'error', duration);
  }

  function showWarning(message: string, duration = 5000): void {
    showToast(message, 'warning', duration);
  }

  function showInfo(message: string, duration = 5000): void {
    showToast(message, 'info', duration);
  }

  return {
    // State
    isLoading,
    toasts,
    sidebarOpen,
    theme,
    authModal,

    // Auth Modal Actions
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    switchAuthModal,

    // Actions
    showToast,
    removeToast,
    toggleSidebar,
    toggleTheme,
    initializeTheme,
    
    // Toast shortcuts
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});