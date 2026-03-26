// src/types/auth.ts
// Matches the core-user-service API request/response shapes.

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** POST /api/v1/auth/register body */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/** Response from POST /api/v1/auth/login and /api/v1/auth/register */
export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}
