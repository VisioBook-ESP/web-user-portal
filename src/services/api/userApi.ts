// src/services/api/userApi.ts
// Endpoints provided by core-user-service
//   GET    /api/v1/users/me         → User
//   PUT    /api/v1/users/me         → User  (update own profile)
//   DELETE /api/v1/users/me         → 204   (delete own account)
//   GET    /api/v1/users/{id}       → User  (own profile or admin)
//   PUT    /api/v1/users/{id}       → User  (own profile or admin)
//   DELETE /api/v1/users/{id}       → 204   (admin only)

import { api } from './baseApi';
import type { User, UpdateUserDto } from '@/types';

export const userApi = {
  /** Get the authenticated user's own profile */
  async getMe(): Promise<User> {
    return api.get<User>('/users/me');
  },

  /** Update the authenticated user's own profile */
  async updateMe(data: UpdateUserDto): Promise<User> {
    return api.put<User>('/users/me', data);
  },

  /** Delete the authenticated user's own account */
  async deleteMe(): Promise<void> {
    return api.delete('/users/me');
  },

  /** Get any user by ID (own profile or admin) */
  async getUser(userId: number): Promise<User> {
    return api.get<User>(`/users/${userId}`);
  },

  /** Update any user by ID (own profile or admin) */
  async updateUser(userId: number, data: UpdateUserDto): Promise<User> {
    return api.put<User>(`/users/${userId}`, data);
  },

  /** Delete any user by ID (admin only) */
  async deleteUser(userId: number): Promise<void> {
    return api.delete(`/users/${userId}`);
  },
};
