import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authApi } from '@/services/api/authApi'
import { TokenService } from '@/services/auth/tokenService'
import * as baseApiModule from '@/services/api/baseApi'

// Mock the api instance from baseApi
vi.mock('@/services/api/baseApi', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

// Mock TokenService
vi.mock('@/services/auth/tokenService', () => ({
  TokenService: {
    setToken: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
    hasToken: vi.fn(),
  },
}))

describe('authApi', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
  }

  const mockTokenResponse = {
    access_token: 'mock-jwt-token-12345',
    token_type: 'Bearer',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login()', () => {
    it('should send login credentials to API', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' }
      const api = baseApiModule.api as any
      api.post.mockResolvedValue(mockTokenResponse)

      // Act
      const result = await authApi.login(credentials)

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should store token after successful login', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' }
      const api = baseApiModule.api as any
      api.post.mockResolvedValue(mockTokenResponse)

      // Act
      await authApi.login(credentials)

      // Assert
      expect(TokenService.setToken).toHaveBeenCalledWith('mock-jwt-token-12345')
    })

    it('should return token response', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' }
      const api = baseApiModule.api as any
      api.post.mockResolvedValue(mockTokenResponse)

      // Act
      const result = await authApi.login(credentials)

      // Assert
      expect(result).toEqual(mockTokenResponse)
    })

    it('should throw error on failed login', async () => {
      // Arrange
      const credentials = { email: 'invalid@example.com', password: 'wrong' }
      const api = baseApiModule.api as any
      const error = new Error('Invalid credentials')
      api.post.mockRejectedValue(error)

      // Act & Assert
      await expect(authApi.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register()', () => {
    it('should send registration data to API', async () => {
      // Arrange
      const registerData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      }
      const api = baseApiModule.api as any
      api.post.mockResolvedValue(mockTokenResponse)

      // Act
      await authApi.register(registerData)

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData)
    })

    it('should store token after successful registration', async () => {
      // Arrange
      const registerData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      }
      const api = baseApiModule.api as any
      api.post.mockResolvedValue(mockTokenResponse)

      // Act
      await authApi.register(registerData)

      // Assert
      expect(TokenService.setToken).toHaveBeenCalledWith('mock-jwt-token-12345')
    })

    it('should throw error on failed registration', async () => {
      // Arrange
      const registerData = {
        email: 'test@example.com', // Email already exists
        username: 'testuser',
        password: 'password123',
      }
      const api = baseApiModule.api as any
      const error = new Error('Email already exists')
      api.post.mockRejectedValue(error)

      // Act & Assert
      await expect(authApi.register(registerData)).rejects.toThrow('Email already exists')
    })
  })

  describe('getCurrentUser()', () => {
    it('should fetch current user from API', async () => {
      // Arrange
      const api = baseApiModule.api as any
      api.get.mockResolvedValue(mockUser)

      // Act
      const result = await authApi.getCurrentUser()

      // Assert
      expect(api.get).toHaveBeenCalledWith('/users/me')
    })

    it('should return user data', async () => {
      // Arrange
      const api = baseApiModule.api as any
      api.get.mockResolvedValue(mockUser)

      // Act
      const result = await authApi.getCurrentUser()

      // Assert
      expect(result).toEqual(mockUser)
    })

    it('should throw error on failed fetch', async () => {
      // Arrange
      const api = baseApiModule.api as any
      const error = new Error('Unauthorized')
      api.get.mockRejectedValue(error)

      // Act & Assert
      await expect(authApi.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('logout()', () => {
    it('should clear tokens', () => {
      // Act
      authApi.logout()

      // Assert
      expect(TokenService.clearTokens).toHaveBeenCalled()
    })
  })
})
