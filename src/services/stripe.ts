// src/services/stripe.ts
// Stripe.js singleton — initialized lazily with the publishable key from env.
// Only the publishable key lives in the frontend; secret key and webhook
// secret are configured exclusively in core-payment-service.

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | undefined;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as
      | string
      | undefined;
    if (!publishableKey) {
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
