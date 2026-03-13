// src/types/user.ts

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalVisioBooks: number;
  storageUsed: number;
  storageLimit: number;
}
