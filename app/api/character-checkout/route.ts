import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCharacterById } from "@/lib/content";
import { isFreeCharacter } from "@/lib/characterAccess";

const CHARACTER_UNLOCK_PRICE_USD = 15;

export async function POST(request: Request) {
  const { characterId } = (await request.json()) as { characterId?: string };

  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  if (isFreeCharacter(characterId)) {
    return NextResponse.json({ error: "This character's artwork is already free to view" }, { status: 400 });
  }

  const character = await getCharacterById(characterId);

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(request.url).origin;

  // Same $15 placeholder price point as the episode/gallery unlocks, but set via
  // price_data rather than a per-character Stripe priceId, since characters don't
  // (yet) have individually configured prices in Sanity.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: CHARACTER_UNLOCK_PRICE_USD * 100,
          product_data: {
            name: `Unlock ${character.name} artwork`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/api/character-unlock?session_id={CHECKOUT_SESSION_ID}&characterId=${characterId}`,
    cancel_url: `${origin}/characters/${characterId}`,
  });

  return NextResponse.json({ url: session.url });
}
