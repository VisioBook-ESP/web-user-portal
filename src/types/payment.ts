// src/types/payment.ts
// Types for core-payment-service integration

/** Available subscription plans */
export type PlanType = "free" | "premium" | "enterprise";

/** Features and limits for a plan */
export interface PlanLimits {
  generationsPerMonth: number;
  storageGB: number;
  maxProjectSize: number;
  exportQuality: "720p" | "1080p" | "4k";
  watermark: boolean;
}

/** Subscription plan definition */
export interface Plan {
  id: PlanType;
  name: string;
  stripePriceId: string | null;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  limits: PlanLimits;
}

/** User's current subscription */
export interface Subscription {
  id: string;
  userId: string;
  planId: PlanType;
  status: "active" | "inactive" | "canceled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

/** User's quota usage */
export interface UserQuota {
  userId: string;
  plan: PlanType;
  generations: {
    used: number;
    limit: number;
    resetDate: string;
  };
  storage: {
    used: number;
    limit: number;
  };
}

/** Checkout session creation request */
export interface CheckoutRequest {
  planId: PlanType;
  successUrl?: string;
  cancelUrl?: string;
}

/** Checkout session response */
export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

/** Payment intent request for mobile (flutter_stripe) */
export interface PaymentIntentRequest {
  planId: Exclude<PlanType, "free">;
  interval?: "month" | "year";
}

/** Payment intent response for mobile */
export interface PaymentIntentResponse {
  clientSecret: string;
  customerId: string;
  ephemeralKey: string;
  subscriptionId: string;
}

/** Plan upgrade/downgrade request */
export interface ChangePlanRequest {
  planId: PlanType;
  interval?: "month" | "year";
}

/** Quota consumption request (service-to-service) */
export interface ConsumeQuotaRequest {
  type: "generation" | "storage";
  amount: number;
}

/** Subscription cancellation request */
export interface CancelSubscriptionRequest {
  reason?: string;
}
