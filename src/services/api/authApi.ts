// src/services/api/authApi.ts
// Endpoints provided by core-user-service
//   POST /api/v1/auth/login    → { access_token, token_type }
//   POST /api/v1/auth/register → { access_token, token_type }
//   GET  /api/v1/users/me      → User  (authenticated)

import { api } from "./baseApi";
import type {
  LoginCredentials,
  RegisterData,
  AuthTokenResponse,
} from "@/types";
import type { User } from "@/types";
import { TokenService } from "@/services/auth/tokenService";

export const authApi = {
  /**
   * Login — POST /api/v1/auth/login
   * The backend expects { email, password } (OAuth2-style form OR JSON body accepted).
   */
  async login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
    const response = await api.post<AuthTokenResponse>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    TokenService.setToken(response.access_token);
    return response;
  },

  /**
   * Register — POST /api/v1/auth/register
   */
  async register(data: RegisterData): Promise<AuthTokenResponse> {
    const response = await api.post<AuthTokenResponse>("/auth/register", data);
    TokenService.setToken(response.access_token);
    return response;
  },

  /**
   * Get the authenticated user — GET /api/v1/users/me
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>("/users/me");
  },

  /**
   * Logout — no server endpoint; just discards the local token.
   */
  logout(): void {
    TokenService.clearTokens();
  },
};
