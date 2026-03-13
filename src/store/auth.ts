// src/store/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, userApi } from '@/services/api';
import { TokenService } from '@/services/auth/tokenService';
import type { User, LoginCredentials, RegisterData } from '@/types';

// Mock user for development (remove when backend is connected)
const MOCK_USER: User = {
  id: '1',
  email: 'user@visiobook.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAuthStore = defineStore('auth', () => {
  // State - Initialize with mock user for development
  const user = ref<User | null>(MOCK_USER);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters - Simplified for development (mock always authenticated)
  const isAuthenticated = computed(() => !!user.value);
  const userInitials = computed(() => {
    if (!user.value) return '';
    const first = user.value.firstName?.[0] || user.value.email[0];
    const last = user.value.lastName?.[0] || user.value.email[1];
    return (first + last).toUpperCase();
  });

  // Actions
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.login(credentials);
      user.value = response.user;

      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterData): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.register(data);
      user.value = response.user;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true;

    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state
      user.value = null;
      error.value = null;

      // Clear storage
      localStorage.removeItem('rememberMe');

      isLoading.value = false;
    }
  }

  async function fetchProfile(): Promise<void> {
    if (!TokenService.getAccessToken()) return;

    isLoading.value = true;
    error.value = null;

    try {
      const profile = await authApi.getCurrentUser();
      user.value = profile;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: Partial<User>): Promise<void> {
    if (!user.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const updatedUser = await userApi.updateUser(user.value.id, data);
      user.value = updatedUser;
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function initializeAuth(): void {
    if (TokenService.hasValidTokens()) {
      fetchProfile().catch(() => logout());
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userInitials,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    initializeAuth,
  };
});
