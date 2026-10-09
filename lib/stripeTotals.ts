import { unstable_cache } from "next/cache";
import Stripe from "stripe";

// Total donated so far, in whole USD, after Stripe fees and refunds. Only donation checkouts
// count (unlock checkouts carry a `scope` in their metadata; donations carry none). Cached for
// 10 minutes so page views don't hit Stripe. Returns undefined when Stripe isn't configured or
// the lookup fails, so callers can hide the progress bar rather than show a wrong number.
export const getTotalRaisedUsd = unstable_cache(
  async (): Promise<number | undefined> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return undefined;

    try {
      const stripe = new Stripe(secretKey);
      let cents = 0;
      const sessions = stripe.checkout.sessions.list({
        status: "complete",
        limit: 100,
        expand: ["data.payment_intent.latest_charge.balance_transaction"],
      });
      for await (const session of sessions) {
        if (session.payment_status !== "paid" || session.metadata?.scope) continue;

        const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
        const charge = paymentIntent?.latest_charge as Stripe.Charge | null | undefined;
        const balance = charge?.balance_transaction as Stripe.BalanceTransaction | null | undefined;
        if (!charge || !balance || balance.currency !== "usd") continue;

        cents += balance.net - charge.amount_refunded;
      }
      return Math.max(0, Math.floor(cents / 100));
    } catch (err) {
      console.error("Failed to total Stripe donations", err);
      return undefined;
    }
  },
  ["stripe-total-donated"],
  { revalidate: 600, tags: ["stripeTotal"] }
);
