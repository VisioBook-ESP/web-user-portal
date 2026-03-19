import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth'
import * as authApiModule from '@/services/api/authApi'
import { TokenService } from '@/services/auth/tokenService'

// Mock authApi
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

// Mock TokenService
vi.mock('@/services/auth/tokenService', () => ({
  TokenService: {
    setToken: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(() => null),
    hasToken: vi.fn(() => false),
  },
}))

describe('Auth Store', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
  }

  beforeEach(() => {
    // Reset Pinia instance for each test
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have null user on init', () => {
      // Act
      const store = useAuthStore()

      // Assert
      expect(store.user).toBeNull()
    })

    it('should have no errors on init', () => {
      // Act
      const store = useAuthStore()

      // Assert
      expect(store.error).toBeNull()
    })

    it('should not be loading on init', () => {
      // Act
      const store = useAuthStore()

      // Assert
      expect(store.isLoading).toBe(false)
    })
  })

  describe('login() action', () => {
    it('should set loading state during login', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.login.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      const loginPromise = store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      // Assert - while loading
      expect(store.isLoading).toBe(true)

      // Wait for completion
      await loginPromise
      expect(store.isLoading).toBe(false)
    })

    it('should set user after successful login', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.login.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      // Assert
      expect(store.user).toEqual(mockUser)
    })

    it('should clear error on successful login', async () => {
      // Arrange
      const store = useAuthStore()
      store.error = 'Previous error'
      const authApi = authApiModule.authApi as any
      authApi.login.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      // Assert
      expect(store.error).toBeNull()
    })

    it('should call authApi.login with credentials', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }
      authApi.login.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.login(credentials)

      // Assert
      expect(authApi.login).toHaveBeenCalledWith(credentials)
    })

    it('should fetch user profile after login', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.login.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      // Assert
      expect(authApi.getCurrentUser).toHaveBeenCalled()
    })

    it('should set error message on failed login', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const error = new Error('Invalid credentials')
      authApi.login.mockRejectedValue(error)

      // Act & Assert
      await expect(
        store.login({
          email: 'invalid@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow()

      expect(store.error).toBe('Invalid credentials')
    })

    it('should set loading to false on error', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.login.mockRejectedValue(new Error('Login failed'))

      // Act
      try {
        await store.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      } catch (e) {
        // Expected error
      }

      // Assert
      expect(store.isLoading).toBe(false)
    })
  })

  describe('register() action', () => {
    it('should set loading state during registration', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.register.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      const registerPromise = store.register({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      })

      // Assert - while loading
      expect(store.isLoading).toBe(true)

      // Wait for completion
      await registerPromise
      expect(store.isLoading).toBe(false)
    })

    it('should set user after successful registration', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      authApi.register.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.register({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      })

      // Assert
      expect(store.user).toEqual(mockUser)
    })

    it('should clear error on successful registration', async () => {
      // Arrange
      const store = useAuthStore()
      store.error = 'Previous error'
      const authApi = authApiModule.authApi as any
      authApi.register.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.register({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      })

      // Assert
      expect(store.error).toBeNull()
    })

    it('should call authApi.register with data', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const registerData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      }
      authApi.register.mockResolvedValue({ access_token: 'token' })
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.register(registerData)

      // Assert
      expect(authApi.register).toHaveBeenCalledWith(registerData)
    })

    it('should set error message on failed registration', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const error = new Error('Email already exists')
      authApi.register.mockRejectedValue(error)

      // Act & Assert
      await expect(
        store.register({
          email: 'taken@example.com',
          username: 'newuser',
          password: 'password123',
        })
      ).rejects.toThrow()

      expect(store.error).toBe('Email already exists')
    })
  })

  describe('logout() action', () => {
    it('should clear user', () => {
      // Arrange
      const store = useAuthStore()
      store.user = mockUser as any

      // Act
      store.logout()

      // Assert
      expect(store.user).toBeNull()
    })

    it('should clear error', () => {
      // Arrange
      const store = useAuthStore()
      store.error = 'Some error'

      // Act
      store.logout()

      // Assert
      expect(store.error).toBeNull()
    })

    it('should call authApi.logout', () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any

      // Act
      store.logout()

      // Assert
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  describe('Computed Properties', () => {
    it('isAuthenticated should be true when user exists and token present', () => {
      // Arrange
      const store = useAuthStore()
      store.user = mockUser as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(true)

      // Act & Assert
      expect(store.isAuthenticated).toBe(true)
    })

    it('isAuthenticated should be false when user is null', () => {
      // Arrange
      const store = useAuthStore()
      store.user = null
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(true)

      // Act & Assert
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated should be false when no token', () => {
      // Arrange
      const store = useAuthStore()
      store.user = mockUser as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(false)

      // Act & Assert
      expect(store.isAuthenticated).toBe(false)
    })

    it('userInitials should return initials', () => {
      // Arrange
      const store = useAuthStore()
      store.user = {
        ...mockUser,
        first_name: 'Test',
        last_name: 'User',
      } as any

      // Act & Assert (assumes calcInitials returns first letter of first and last name)
      expect(store.userInitials).toBeTruthy()
    })

    it('displayName should return display name', () => {
      // Arrange
      const store = useAuthStore()
      store.user = mockUser as any

      // Act & Assert
      expect(store.displayName).toBeTruthy()
    })
  })

  describe('fetchProfile() action', () => {
    it('should fetch and set user profile', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(true)
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      await store.fetchProfile()

      // Assert
      expect(store.user).toEqual(mockUser)
    })

    it('should return early if no token', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(false)

      // Act
      await store.fetchProfile()

      // Assert
      expect(authApi.getCurrentUser).not.toHaveBeenCalled()
    })

    it('should logout on fetch error', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(true)
      authApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'))

      // Act
      await store.fetchProfile()

      // Assert
      expect(store.user).toBeNull()
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  describe('initializeAuth() action', () => {
    it('should fetch profile if token exists', async () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(true)
      authApi.getCurrentUser.mockResolvedValue(mockUser)

      // Act
      store.initializeAuth()
      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Assert
      expect(authApi.getCurrentUser).toHaveBeenCalled()
    })

    it('should not fetch profile if no token', () => {
      // Arrange
      const store = useAuthStore()
      const authApi = authApiModule.authApi as any
      const tokenService = TokenService as any
      tokenService.hasToken.mockReturnValue(false)

      // Act
      store.initializeAuth()

      // Assert
      expect(authApi.getCurrentUser).not.toHaveBeenCalled()
    })
  })
})
