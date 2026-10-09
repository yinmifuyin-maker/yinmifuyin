import { unstable_cache } from "next/cache";
import Stripe from "stripe";

// Total raised so far, in whole USD: every succeeded USD charge (donations and unlocks alike),
// minus refunds, before Stripe fees. Cached for 10 minutes so page views don't hit Stripe.
// Returns undefined when Stripe isn't configured or the lookup fails, so callers can hide the
// progress bar rather than show a wrong number.
export const getTotalRaisedUsd = unstable_cache(
  async (): Promise<number | undefined> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return undefined;

    try {
      const stripe = new Stripe(secretKey);
      let cents = 0;
      for await (const charge of stripe.charges.list({ limit: 100 })) {
        if (charge.status !== "succeeded" || charge.currency !== "usd") continue;
        cents += charge.amount - charge.amount_refunded;
      }
      return Math.floor(cents / 100);
    } catch (err) {
      console.error("Failed to total Stripe charges", err);
      return undefined;
    }
  },
  ["stripe-total-raised"],
  { revalidate: 600, tags: ["stripeTotal"] }
);
