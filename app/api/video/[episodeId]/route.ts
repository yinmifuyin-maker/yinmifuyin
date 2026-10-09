import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEpisodeById } from "@/lib/content";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";
import { presignVideoUrl } from "@/lib/videoAccess";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/video/[episodeId]">
) {
  const { episodeId } = await ctx.params;
  const episode = await getEpisodeById(episodeId);
  const videoPath = episode?.content.fullEpisode?.videoPath;

  if (!episode || !episode.content.fullEpisode?.available || !videoPath) {
    return NextResponse.json({ error: "This content is not available yet" }, { status: 404 });
  }

  const token = request.cookies.get(unlockCookieName("episode", episodeId))?.value;
  const isUnlocked = token ? await verifyUnlockToken(token, "episode", episodeId) : false;

  if (!isUnlocked) {
    return NextResponse.json(
      { error: "You need to unlock this episode before you can watch it" },
      { status: 401 }
    );
  }

  return NextResponse.json({ url: await presignVideoUrl(videoPath) });
}
