import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getEpisodeById, getCharacterById, getArtistById, getPrimaryArtwork } from "@/lib/content";
import { isFreeCharacter } from "@/lib/characterAccess";
import { getLocale } from "@/lib/locale";
import { minAmountFor, presetsFor, unlockScopeFor, type UnlockTarget } from "@/lib/unlockTarget";

const MAX_AMOUNT_USD = 10_000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { amountUsd?: number; target?: UnlockTarget }
    | null;

  const amountUsd = body?.amountUsd;
  const target = body?.target;

  if (!target?.type) {
    return NextResponse.json({ error: "Missing target" }, { status: 400 });
  }

  let productName: string;
  let successPath: string;
  let cancelPath: string;
  let subjectName: string | undefined;
  let attribution: { artistId: string; artistName: string } | undefined;

  if (target.type === "donate") {
    productName = "Donation to The Hidden Gospel";
    successPath = "/support?donated=1";
    cancelPath = "/support";
  } else if (target.type === "episode") {
    const episode = await getEpisodeById(target.episodeId);
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }
    productName = `Unlock ${episode.title}`;
    successPath = `/api/unlock?session_id={CHECKOUT_SESSION_ID}&episodeId=${target.episodeId}`;
    cancelPath = `/episodes/${target.episodeId}`;
    subjectName = episode.title;
  } else if (target.type === "character") {
    if (isFreeCharacter(target.characterId)) {
      return NextResponse.json(
        { error: "This character's artwork is already free to view" },
        { status: 400 }
      );
    }
    const character = await getCharacterById(target.characterId);
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    productName = `Unlock ${character.name} artwork`;
    successPath = `/api/character-unlock?session_id={CHECKOUT_SESSION_ID}&characterId=${target.characterId}`;
    cancelPath = `/characters/${target.characterId}`;
    subjectName = character.name;
    const primaryArtwork = getPrimaryArtwork(character);
    if (primaryArtwork) {
      attribution = { artistId: primaryArtwork.artistId, artistName: primaryArtwork.artistName };
    }
  } else if (target.type === "gallery") {
    const artist = await getArtistById(target.artistId);
    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }
    productName = `Unlock ${artist.name} gallery`;
    successPath = `/api/gallery-unlock?session_id={CHECKOUT_SESSION_ID}&artistId=${target.artistId}`;
    cancelPath = `/artists/${target.artistId}`;
    subjectName = artist.name;
    attribution = { artistId: artist.id, artistName: artist.name };
  } else {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const minAmount = minAmountFor(target);

  if (
    typeof amountUsd !== "number" ||
    !Number.isFinite(amountUsd) ||
    amountUsd < minAmount ||
    amountUsd > MAX_AMOUNT_USD
  ) {
    return NextResponse.json(
      { error: `Enter an amount of at least $${minAmount}` },
      { status: 400 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(request.url).origin;
  const scope = unlockScopeFor(target);

  // Reporting fields, so payments can be broken down in Stripe's dashboard.
  // amountType is inferred: a custom amount that equals a preset reads as "preset".
  const reporting: Record<string, string> = {
    unlockType: target.type,
    ...(scope && { itemId: scope.subjectId }),
    ...(subjectName && { subjectName }),
    ...attribution,
    locale: await getLocale(),
    amountType: presetsFor(minAmount).includes(amountUsd) ? "preset" : "custom",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amountUsd * 100),
          product_data: { name: productName },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}${successPath}`,
    cancel_url: `${origin}${cancelPath}`,
    // scope/subjectId are what the unlock routes verify; the rest is reporting.
    metadata: scope
      ? { scope: scope.scope, subjectId: scope.subjectId, ...reporting }
      : reporting,
    // Session metadata isn't copied to the PaymentIntent, which is what
    // Stripe's Payments view and exports show — so reporting fields go there too.
    payment_intent_data: { metadata: reporting },
  });

  return NextResponse.json({ url: session.url });
}
