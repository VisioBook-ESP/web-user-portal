import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import * as authApiModule from "@/services/api/authApi";
import { TokenService } from "@/services/auth/tokenService";

// Mock authApi
vi.mock("@/services/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock TokenService
vi.mock("@/services/auth/tokenService", () => ({
  TokenService: {
    setToken: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(() => null),
    hasToken: vi.fn(() => false),
  },
}));

describe("Auth Integration Tests", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    username: "testuser",
    first_name: "Test",
    last_name: "User",
  };

  const mockTokenResponse = {
    access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    token_type: "Bearer",
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Complete Login Flow", () => {
    it("should complete full login workflow: credential send → token storage → user fetch", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      const tokenService = TokenService as any;

      authApi.login.mockResolvedValue(mockTokenResponse);
      authApi.getCurrentUser.mockResolvedValue(mockUser);
      tokenService.hasToken.mockReturnValue(true);

      // Act
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };
      await store.login(credentials);

      // Assert - Step 1: API called with correct credentials
      expect(authApi.login).toHaveBeenCalledWith(credentials);

      // Assert - Step 2: User profile fetched
      expect(authApi.getCurrentUser).toHaveBeenCalled();

      // Assert - Step 3: User data available in store
      expect(store.user).toEqual(mockUser);

      // Assert - Step 4: User authenticated
      expect(store.isAuthenticated).toBe(true);

      // Assert - Step 5: No errors
      expect(store.error).toBeNull();

      // Assert - Step 6: No longer loading
      expect(store.isLoading).toBe(false);
    });

    it("should handle validation errors during login", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.login.mockRejectedValue(new Error("Invalid email or password"));

      // Act & Assert
      await expect(
        store.login({
          email: "invalid@example",
          password: "short",
        }),
      ).rejects.toThrow();

      // Assert state after error
      expect(store.user).toBeNull();
      expect(store.error).toBe("Invalid email or password");
      expect(store.isAuthenticated).toBe(false);
    });

    it("should handle network errors during login", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.login.mockRejectedValue(new Error("Network timeout"));

      // Act & Assert
      await expect(
        store.login({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow();

      // Assert state after error
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe("Network timeout");
    });

    it("should handle token expiry during profile fetch", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.login.mockResolvedValue(mockTokenResponse);
      authApi.getCurrentUser.mockRejectedValue(new Error("Token expired"));

      // Act & Assert
      await expect(
        store.login({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow();

      // Assert - should clear user data on error
      expect(store.user).toBeNull();
      expect(store.isLoading).toBe(false);
    });
  });

  describe("Complete Registration Flow", () => {
    it("should complete full registration workflow: form data → token storage → user fetch", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      const tokenService = TokenService as any;

      authApi.register.mockResolvedValue(mockTokenResponse);
      authApi.getCurrentUser.mockResolvedValue(mockUser);
      tokenService.hasToken.mockReturnValue(true);

      // Act
      const registerData = {
        email: "newuser@example.com",
        username: "newuser",
        password: "securePassword123!",
        first_name: "New",
        last_name: "User",
      };
      await store.register(registerData);

      // Assert - Step 1: API called with registration data
      expect(authApi.register).toHaveBeenCalledWith(registerData);

      // Assert - Step 2: User profile fetched
      expect(authApi.getCurrentUser).toHaveBeenCalled();

      // Assert - Step 3: User data in store
      expect(store.user).toEqual(mockUser);

      // Assert - Step 4: User is authenticated
      expect(store.isAuthenticated).toBe(true);
    });

    it("should handle registration validation errors", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.register.mockRejectedValue(new Error("Email already exists"));

      // Act & Assert
      await expect(
        store.register({
          email: "taken@example.com",
          username: "newuser",
          password: "password123",
        }),
      ).rejects.toThrow();

      // Assert state after error
      expect(store.user).toBeNull();
      expect(store.error).toBe("Email already exists");
    });

    it("should handle password validation errors", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.register.mockRejectedValue(
        new Error("Password must be at least 8 characters"),
      );

      // Act & Assert
      await expect(
        store.register({
          email: "newuser@example.com",
          username: "newuser",
          password: "short",
        }),
      ).rejects.toThrow();

      // Assert
      expect(store.error).toContain("Password");
    });
  });

  describe("Logout and Session Cleanup", () => {
    it("should clear all user data on logout", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      authApi.login.mockResolvedValue(mockTokenResponse);
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      // First login
      await store.login({
        email: "test@example.com",
        password: "password123",
      });
      expect(store.user).not.toBeNull();

      // Act - Logout
      store.logout();

      // Assert
      expect(store.user).toBeNull();
      expect(store.error).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(authApi.logout).toHaveBeenCalled();
    });
  });

  describe("Session Restoration", () => {
    it("should restore user session from stored token on app start", async () => {
      // Arrange
      const authApi = authApiModule.authApi as any;
      const tokenService = TokenService as any;

      // Setup: token exists in storage
      tokenService.hasToken.mockReturnValue(true);
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const store = useAuthStore();
      store.initializeAuth();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it("should handle session restoration with expired token", async () => {
      // Arrange
      const authApi = authApiModule.authApi as any;
      const tokenService = TokenService as any;

      // Setup: token exists but is expired
      tokenService.hasToken.mockReturnValue(true);
      authApi.getCurrentUser.mockRejectedValue(new Error("Token expired"));

      // Act
      const store = useAuthStore();
      store.initializeAuth();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert - should logout on error
      expect(store.user).toBeNull();
      expect(authApi.logout).toHaveBeenCalled();
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle loading state correctly for concurrent operations", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;
      let loginResolve: any;

      authApi.login.mockImplementation(
        () =>
          new Promise((resolve) => {
            loginResolve = resolve;
          }),
      );

      // Act - Start login but don't wait
      const loginPromise = store.login({
        email: "test@example.com",
        password: "password123",
      });

      // Assert - should be loading
      expect(store.isLoading).toBe(true);

      // Resolve the login
      loginResolve(mockTokenResponse);
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      await loginPromise;

      // Assert - should not be loading anymore
      expect(store.isLoading).toBe(false);
    });
  });

  describe("Error State Management", () => {
    it("should clear previous errors on retry", async () => {
      // Arrange
      const store = useAuthStore();
      const authApi = authApiModule.authApi as any;

      // First attempt - fails
      authApi.login.mockRejectedValueOnce(new Error("Invalid credentials"));
      await expect(
        store.login({
          email: "invalid@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow();
      expect(store.error).toBe("Invalid credentials");

      // Second attempt - succeeds
      authApi.login.mockResolvedValueOnce(mockTokenResponse);
      authApi.getCurrentUser.mockResolvedValueOnce(mockUser);

      // Act
      await store.login({
        email: "test@example.com",
        password: "correct",
      });

      // Assert - error should be cleared
      expect(store.error).toBeNull();
      expect(store.user).toEqual(mockUser);
    });
  });
});
