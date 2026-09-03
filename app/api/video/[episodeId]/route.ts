import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { getEpisodeById } from "@/lib/content";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";

const SIGNED_URL_TTL_MS = 8 * 60 * 1000;

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

  const signedToken = await issueSignedToken({
    pathname: videoPath,
    operations: ["get"],
    validUntil: Date.now() + SIGNED_URL_TTL_MS,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname: videoPath,
    access: "private",
  });

  return NextResponse.json({ url: presignedUrl });
}
