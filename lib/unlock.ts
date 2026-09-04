import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UnlockScope = "episode" | "gallery" | "character";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export function unlockCookieName(scope: UnlockScope, subjectId: string) {
  if (scope === "gallery") return `unlock_gallery_${subjectId}`;
  if (scope === "character") return `unlock_character_${subjectId}`;
  return `unlock_${subjectId}`;
}

export async function signUnlockToken(
  scope: UnlockScope,
  subjectId: string
): Promise<string> {
  return new SignJWT({ scope, subjectId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(getSecretKey());
}

export async function verifyUnlockToken(
  token: string,
  scope: UnlockScope,
  subjectId: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.scope === scope && payload.subjectId === subjectId;
  } catch {
    return false;
  }
}

/** Server-component-side unlock check, reading the cookie directly via next/headers. */
export async function isUnlocked(scope: UnlockScope, subjectId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(unlockCookieName(scope, subjectId))?.value;
  return token ? verifyUnlockToken(token, scope, subjectId) : false;
}
