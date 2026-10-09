import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSketchVideoPaths } from "@/lib/content";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";
import { gatedVideoResponse } from "@/lib/videoAccess";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/sketch-video/[artistId]/[sketchKey]">
) {
  const { artistId, sketchKey } = await ctx.params;
  const sketch = await getSketchVideoPaths(artistId, sketchKey);

  if (!sketch) {
    return NextResponse.json({ error: "This content is not available yet" }, { status: 404 });
  }

  // Sketches unlock with the artist's gallery donation.
  const token = request.cookies.get(unlockCookieName("gallery", artistId))?.value;
  const unlocked = token ? await verifyUnlockToken(token, "gallery", artistId) : false;

  return gatedVideoResponse({ ...sketch, unlocked });
}
