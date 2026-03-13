// src/services/api/authApi.ts
import { api } from './baseApi';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';
import { TokenService } from '@/services/auth/tokenService';

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    TokenService.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    TokenService.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      TokenService.clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    return api.post('/auth/password-reset/request', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post('/auth/password-reset/confirm', { token, newPassword });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    return api.post('/auth/verify-email', { token });
  },
};
