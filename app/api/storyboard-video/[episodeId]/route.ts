import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEpisodeById } from "@/lib/content";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";
import { gatedVideoResponse } from "@/lib/videoAccess";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/storyboard-video/[episodeId]">
) {
  const { episodeId } = await ctx.params;
  const episode = await getEpisodeById(episodeId);
  const storyboard = episode?.content.storyboard;

  if (!episode || !storyboard?.available || !storyboard.videoPath) {
    return NextResponse.json({ error: "This content is not available yet" }, { status: 404 });
  }

  const token = request.cookies.get(unlockCookieName("episode", episodeId))?.value;
  const unlocked = token ? await verifyUnlockToken(token, "episode", episodeId) : false;

  return gatedVideoResponse({
    videoPath: storyboard.videoPath,
    previewPath: storyboard.previewPath,
    unlocked,
  });
}
