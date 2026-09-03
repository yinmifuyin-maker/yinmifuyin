import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signUnlockToken, unlockCookieName } from "@/lib/unlock";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const episodeId = url.searchParams.get("episodeId");

  if (!sessionId || !episodeId) {
    return NextResponse.json({ error: "Missing session_id or episodeId" }, { status: 400 });
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
    return NextResponse.redirect(new URL(`/episodes/${episodeId}`, url.origin));
  }

  const token = await signUnlockToken("episode", episodeId);
  const response = NextResponse.redirect(new URL(`/episodes/${episodeId}`, url.origin));

  response.cookies.set(unlockCookieName("episode", episodeId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  return response;
}
