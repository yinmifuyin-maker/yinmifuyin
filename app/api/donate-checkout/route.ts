import { NextResponse } from "next/server";
import Stripe from "stripe";

const MIN_AMOUNT_USD = 1;
const MAX_AMOUNT_USD = 10_000;

export async function POST(request: Request) {
  const { amountUsd } = (await request.json().catch(() => null)) as
    | { amountUsd?: number }
    | null ?? {};

  if (
    typeof amountUsd !== "number" ||
    !Number.isFinite(amountUsd) ||
    amountUsd < MIN_AMOUNT_USD ||
    amountUsd > MAX_AMOUNT_USD
  ) {
    return NextResponse.json({ error: "Enter an amount between $1 and $10,000" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(request.url).origin;

  // Donation amount is chosen by the visitor at checkout time, so this uses price_data
  // with a runtime-set unit_amount rather than a fixed Stripe priceId.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amountUsd * 100),
          product_data: {
            name: "Donation to The Hidden Gospel",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/support?donated=1`,
    cancel_url: `${origin}/support`,
  });

  return NextResponse.json({ url: session.url });
}
