// src/store/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/services/api/authApi";
import { userApi } from "@/services/api/userApi";
import { TokenService } from "@/services/auth/tokenService";
import type { User, UpdateUserDto } from "@/types";
import type { LoginCredentials, RegisterData } from "@/types";
import { userInitials as calcInitials, userDisplayName } from "@/types/user";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(
    () => !!user.value && TokenService.hasToken(),
  );
  const isAdmin = computed(() => user.value?.role === "admin");
  const userInitials = computed(() =>
    user.value ? calcInitials(user.value) : "",
  );
  const displayName = computed(() =>
    user.value ? userDisplayName(user.value) : "",
  );

  // Actions
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      // Step 1: get JWT
      await authApi.login(credentials);
      // Step 2: fetch the user profile with the new token
      user.value = await authApi.getCurrentUser();
    } catch (err: any) {
      error.value = err.message || "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterData): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await authApi.register(data);
      user.value = await authApi.getCurrentUser();
    } catch (err: any) {
      error.value = err.message || "Registration failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    authApi.logout();
    user.value = null;
    error.value = null;
  }

  async function fetchProfile(): Promise<void> {
    if (!TokenService.hasToken()) return;
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await authApi.getCurrentUser();
    } catch (err: any) {
      // Token is probably expired/invalid — clear it
      logout();
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: UpdateUserDto): Promise<void> {
    if (!user.value) return;
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await userApi.updateMe(data);
    } catch (err: any) {
      error.value = err.message || "Failed to update profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Call once on app start to restore session from stored token */
  function initializeAuth(): void {
    if (TokenService.hasToken()) {
      fetchProfile();
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    userInitials,
    displayName,
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    initializeAuth,
  };
});
