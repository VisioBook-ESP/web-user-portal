import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TokenService } from "@/services/auth/tokenService";

describe("TokenService", () => {
  const mockToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mockPayload.mockSignature";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("setToken()", () => {
    it("should store token in localStorage", () => {
      // Act
      TokenService.setToken(mockToken);

      // Assert
      const stored = localStorage.getItem("vb_access_token");
      expect(stored).toBe(mockToken);
    });

    it("should overwrite existing token", () => {
      // Arrange
      TokenService.setToken("old-token");

      // Act
      TokenService.setToken("new-token");

      // Assert
      const stored = localStorage.getItem("vb_access_token");
      expect(stored).toBe("new-token");
    });
  });

  describe("getAccessToken()", () => {
    it("should return stored token", () => {
      // Arrange
      localStorage.setItem("vb_access_token", mockToken);

      // Act
      const token = TokenService.getAccessToken();

      // Assert
      expect(token).toBe(mockToken);
    });

    it("should return null when no token is stored", () => {
      // Act
      const token = TokenService.getAccessToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe("hasToken()", () => {
    it("should return true when token exists", () => {
      // Arrange
      TokenService.setToken(mockToken);

      // Act
      const hasToken = TokenService.hasToken();

      // Assert
      expect(hasToken).toBe(true);
    });

    it("should return false when token does not exist", () => {
      // Act
      const hasToken = TokenService.hasToken();

      // Assert
      expect(hasToken).toBe(false);
    });

    it("should return false after token is cleared", () => {
      // Arrange
      TokenService.setToken(mockToken);

      // Act
      TokenService.clearTokens();
      const hasToken = TokenService.hasToken();

      // Assert
      expect(hasToken).toBe(false);
    });
  });

  describe("clearTokens()", () => {
    it("should remove token from localStorage", () => {
      // Arrange
      TokenService.setToken(mockToken);
      expect(TokenService.hasToken()).toBe(true);

      // Act
      TokenService.clearTokens();

      // Assert
      const stored = localStorage.getItem("vb_access_token");
      expect(stored).toBeNull();
      expect(TokenService.hasToken()).toBe(false);
    });

    it("should be safe to call when no token exists", () => {
      // Act & Assert (should not throw)
      expect(() => {
        TokenService.clearTokens();
      }).not.toThrow();

      expect(TokenService.hasToken()).toBe(false);
    });
  });

  describe("Token Lifecycle", () => {
    it("should complete token lifecycle: set → get → clear", () => {
      // Step 1: No token
      expect(TokenService.hasToken()).toBe(false);

      // Step 2: Set token
      TokenService.setToken(mockToken);
      expect(TokenService.hasToken()).toBe(true);

      // Step 3: Get token
      const token = TokenService.getAccessToken();
      expect(token).toBe(mockToken);

      // Step 4: Clear token
      TokenService.clearTokens();
      expect(TokenService.hasToken()).toBe(false);
      expect(TokenService.getAccessToken()).toBeNull();
    });
  });
});
