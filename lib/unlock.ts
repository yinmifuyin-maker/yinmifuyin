import { SignJWT, jwtVerify } from "jose";

export type UnlockScope = "episode" | "gallery";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export function unlockCookieName(scope: UnlockScope, subjectId: string) {
  return scope === "gallery" ? `unlock_gallery_${subjectId}` : `unlock_${subjectId}`;
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
