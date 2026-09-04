import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signUnlockToken, unlockCookieName } from "@/lib/unlock";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const characterId = url.searchParams.get("characterId");

  if (!sessionId || !characterId) {
    return NextResponse.json({ error: "Missing session_id or characterId" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unlock signing is not configured yet" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.redirect(new URL(`/characters/${characterId}`, url.origin));
  }

  const token = await signUnlockToken("character", characterId);
  const response = NextResponse.redirect(new URL(`/characters/${characterId}`, url.origin));

  response.cookies.set(unlockCookieName("character", characterId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  return response;
}
