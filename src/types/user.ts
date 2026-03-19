// src/types/user.ts
// Matches the core-user-service API response shapes.

/** Shape returned by GET /api/v1/users/me and GET /api/v1/users/{id} */
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

// Convenience helpers so the rest of the UI can still use camelCase names.
export function userDisplayName(user: User): string {
  if (user.first_name || user.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }
  return user.username;
}

export function userInitials(user: User): string {
  const first = user.first_name?.[0] ?? user.username[0];
  const last  = user.last_name?.[0]  ?? user.username[1];
  return (first + (last ?? '')).toUpperCase();
}

/** DTO sent to PUT /api/v1/users/me */
export interface UpdateUserDto {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalVisioBooks: number;
  storageUsed: number;
  storageLimit: number;
}
