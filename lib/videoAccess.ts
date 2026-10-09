import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";

const SIGNED_URL_TTL_MS = 8 * 60 * 1000;

/** A short-lived URL the browser can stream a private Blob video from. */
export async function presignVideoUrl(pathname: string): Promise<string> {
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil: Date.now() + SIGNED_URL_TTL_MS,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
  });

  return presignedUrl;
}

/**
 * Response for a video with a free preview: supporters get the full video,
 * everyone else the preview clip, flagged so the player can ask them to donate.
 * Without a preview clip, non-supporters get a 401 like the full episode does.
 */
export async function gatedVideoResponse({
  videoPath,
  previewPath,
  unlocked,
}: {
  videoPath: string;
  previewPath?: string;
  unlocked: boolean;
}) {
  if (unlocked) {
    return NextResponse.json({ url: await presignVideoUrl(videoPath), preview: false });
  }

  if (previewPath) {
    return NextResponse.json({ url: await presignVideoUrl(previewPath), preview: true });
  }

  return NextResponse.json({ error: "Donate to unlock this video" }, { status: 401 });
}
