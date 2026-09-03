import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getArtistById } from "@/lib/content";

export async function POST(request: Request) {
  const { artistId } = (await request.json()) as { artistId?: string };

  if (!artistId) {
    return NextResponse.json({ error: "Missing artistId" }, { status: 400 });
  }

  const artist = await getArtistById(artistId);

  if (!artist || !artist.galleryPriceId) {
    return NextResponse.json(
      { error: "This gallery is not available for purchase yet" },
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
    line_items: [{ price: artist.galleryPriceId, quantity: 1 }],
    success_url: `${origin}/api/gallery-unlock?session_id={CHECKOUT_SESSION_ID}&artistId=${artistId}`,
    cancel_url: `${origin}/artists/${artistId}`,
  });

  return NextResponse.json({ url: session.url });
}
