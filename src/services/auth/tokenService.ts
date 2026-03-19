// src/services/auth/tokenService.ts
// core-user-service issues a single JWT (RS256) — no refresh token endpoint exists.

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'vb_access_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  static hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
