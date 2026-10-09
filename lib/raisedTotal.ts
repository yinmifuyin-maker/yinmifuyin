import { unstable_cache } from "next/cache";
import Stripe from "stripe";

// How long a computed total is reused before Stripe is asked again.
const REVALIDATE_SECONDS = 600;

// Total raised through the site, in USD cents: every paid Checkout Session (donations
// and unlocks alike — they all go through app/api/unlock-checkout), minus anything
// refunded. Stripe's own processing fees are not deducted.
async function sumPaidCheckoutSessions(): Promise<number> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(secretKey);
  let totalCents = 0;

  const sessions = stripe.checkout.sessions.list({
    status: "complete",
    limit: 100,
    expand: ["data.payment_intent.latest_charge"],
  });

  for await (const session of sessions) {
    if (session.payment_status !== "paid" || session.currency !== "usd") continue;

    const paymentIntent = session.payment_intent;
    const charge =
      paymentIntent && typeof paymentIntent !== "string" ? paymentIntent.latest_charge : null;
    const refundedCents = charge && typeof charge !== "string" ? charge.amount_refunded : 0;

    totalCents += (session.amount_total ?? 0) - refundedCents;
  }

  return totalCents;
}

const getCachedRaisedCents = unstable_cache(sumPaidCheckoutSessions, ["raised-total-usd-cents"], {
  revalidate: REVALIDATE_SECONDS,
});

// Returns undefined when Stripe is unreachable or not configured, so the page can
// simply omit the figure rather than show a wrong one. Failures are never cached.
export async function getRaisedTotalUSD(): Promise<number | undefined> {
  try {
    return (await getCachedRaisedCents()) / 100;
  } catch (err) {
    console.error("Could not load raised total from Stripe", err);
    return undefined;
  }
}
