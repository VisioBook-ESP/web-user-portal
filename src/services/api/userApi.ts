// src/services/api/userApi.ts
import { api } from './baseApi';
import type { User, UserStats } from '@/types';

export const userApi = {
  /**
   * Get user profile by ID
   */
  async getUser(userId: string): Promise<User> {
    return api.get<User>(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return api.patch<User>(`/users/${userId}`, data);
  },

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    return api.upload(`/users/${userId}/avatar`, file);
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    return api.get<UserStats>(`/users/${userId}/stats`);
  },

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    return api.delete(`/users/${userId}`);
  },

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    return api.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  },
};
