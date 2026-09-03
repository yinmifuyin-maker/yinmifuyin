import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/gallery-status/[artistId]">
) {
  const { artistId } = await ctx.params;
  const token = request.cookies.get(unlockCookieName("gallery", artistId))?.value;
  const unlocked = token ? await verifyUnlockToken(token, "gallery", artistId) : false;

  return NextResponse.json({ unlocked });
}
