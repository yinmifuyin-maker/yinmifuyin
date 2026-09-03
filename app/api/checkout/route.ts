import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getEpisodeById } from "@/lib/content";

export async function POST(request: Request) {
  const { episodeId } = (await request.json()) as { episodeId?: string };

  if (!episodeId) {
    return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
  }

  const episode = await getEpisodeById(episodeId);

  if (!episode || !episode.priceId) {
    return NextResponse.json(
      { error: "This episode is not available for purchase yet" },
      { status: 400 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Payments are not configured yet" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: episode.priceId, quantity: 1 }],
    success_url: `${origin}/api/unlock?session_id={CHECKOUT_SESSION_ID}&episodeId=${episodeId}`,
    cancel_url: `${origin}/episodes/${episodeId}`,
  });

  return NextResponse.json({ url: session.url });
}
