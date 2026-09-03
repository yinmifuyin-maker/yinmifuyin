import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/episode-status/[episodeId]">
) {
  const { episodeId } = await ctx.params;
  const token = request.cookies.get(unlockCookieName("episode", episodeId))?.value;
  const unlocked = token ? await verifyUnlockToken(token, "episode", episodeId) : false;

  return NextResponse.json({ unlocked });
}
