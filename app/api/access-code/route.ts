import { NextResponse } from "next/server";
import { signUnlockToken, unlockCookieName, type UnlockScope } from "@/lib/unlock";

function isScope(value: unknown): value is UnlockScope {
  return value === "episode" || value === "gallery";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { scope?: string; subjectId?: string; code?: string }
    | null;

  const { scope, subjectId, code } = body ?? {};

  if (!isScope(scope) || !subjectId || !code) {
    return NextResponse.json({ error: "Missing scope, subjectId, or code" }, { status: 400 });
  }

  const expected = process.env.ACCESS_CODE;

  if (!expected) {
    return NextResponse.json({ error: "Access codes are not configured yet" }, { status: 503 });
  }

  if (code.trim() !== expected) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await signUnlockToken(scope, subjectId);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(unlockCookieName(scope, subjectId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  return response;
}
