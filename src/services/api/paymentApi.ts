// src/services/api/paymentApi.ts
// Endpoints provided by core-payment-service (port 8087)
//   GET    /api/v1/subscriptions/plans           → Plan[]
//   GET    /api/v1/subscriptions/current         → Subscription (authenticated)
//   POST   /api/v1/subscriptions/checkout        → CheckoutResponse (authenticated)
//   POST   /api/v1/subscriptions/payment-intent  → PaymentIntentResponse (authenticated)
//   POST   /api/v1/subscriptions/upgrade         → Subscription (authenticated)
//   POST   /api/v1/subscriptions/downgrade       → Subscription (authenticated)
//   POST   /api/v1/subscriptions/cancel          → Subscription (authenticated)
//   GET    /api/v1/quotas                        → UserQuota (authenticated)

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types";
import { TokenService } from "@/services/auth/tokenService";
import type {
  Plan,
  Subscription,
  UserQuota,
  CheckoutRequest,
  CheckoutResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  ChangePlanRequest,
} from "@/types";

class PaymentApiService {
  private instance: AxiosInstance;

  private getUserIdFromToken(token: string): string | null {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return null;

      // Convert base64url -> base64 before decoding
      const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded)) as { sub?: string };

      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  constructor() {
    const paymentServiceUrl =
      import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8087/api/v1";

    this.instance = axios.create({
      baseURL: paymentServiceUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Attach Bearer token to every request when present
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenService.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          const userId = this.getUserIdFromToken(token);
          if (userId) {
            config.headers["x-user-id"] = userId;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Normalise error shape; on 401 clear auth and go home
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          TokenService.clearTokens();
          window.location.href = "/";
        }

        const data = error.response?.data as any;
        const apiError: ApiError = {
          code: error.response?.status || 500,
          message:
            (typeof data?.detail === "string" ? data.detail : null) ||
            data?.message ||
            "An unexpected error occurred",
          details: data?.detail,
        };

        return Promise.reject(apiError);
      },
    );
  }

  get<T = any>(url: string, config = {}) {
    return this.instance.get<T, T>(url, config);
  }

  post<T = any>(url: string, data?: any, config = {}) {
    return this.instance.post<T, T>(url, data, config);
  }
}

const api = new PaymentApiService();

export const paymentApi = {
  /**
   * Get all available plans — GET /api/v1/subscriptions/plans
   */
  async getPlans(): Promise<Plan[]> {
    return api.get<Plan[]>("/subscriptions/plans");
  },

  /**
   * Get current user subscription — GET /api/v1/subscriptions/current
   */
  async getCurrentSubscription(): Promise<Subscription> {
    return api.get<Subscription>("/subscriptions/current");
  },

  /**
   * Create checkout session (web redirect) — POST /api/v1/subscriptions/checkout
   */
  async createCheckoutSession(
    request: CheckoutRequest,
  ): Promise<CheckoutResponse> {
    return api.post<CheckoutResponse>("/subscriptions/checkout", request);
  },

  /**
   * Create payment intent (mobile Payment Sheet) — POST /api/v1/subscriptions/payment-intent
   */
  async createPaymentIntent(
    request: PaymentIntentRequest,
  ): Promise<PaymentIntentResponse> {
    return api.post<PaymentIntentResponse>(
      "/subscriptions/payment-intent",
      request,
    );
  },

  /**
   * Upgrade subscription — POST /api/v1/subscriptions/upgrade
   */
  async upgradePlan(request: ChangePlanRequest): Promise<Subscription> {
    return api.post<Subscription>("/subscriptions/upgrade", request);
  },

  /**
   * Downgrade subscription — POST /api/v1/subscriptions/downgrade
   */
  async downgradePlan(request: ChangePlanRequest): Promise<Subscription> {
    return api.post<Subscription>("/subscriptions/downgrade", request);
  },

  /**
   * Cancel subscription — POST /api/v1/subscriptions/cancel
   */
  async cancelSubscription(): Promise<Subscription> {
    return api.post<Subscription>("/subscriptions/cancel", {});
  },

  /**
   * Get user quotas — GET /api/v1/quotas
   */
  async getUserQuotas(): Promise<UserQuota> {
    return api.get<UserQuota>("/quotas");
  },
};
