import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEpisodeById } from "@/lib/content";
import { unlockCookieName, verifyUnlockToken } from "@/lib/unlock";

// storyboard is image panels in the real schema, not text -- not handled by this route yet.
const TEXT_CATEGORIES = ["synopsis", "sneakPeek", "fullScript"] as const;
type TextCategory = (typeof TEXT_CATEGORIES)[number];

function isTextCategory(value: string): value is TextCategory {
  return (TEXT_CATEGORIES as readonly string[]).includes(value);
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/episode-content/[episodeId]/[category]">
) {
  const { episodeId, category } = await ctx.params;

  if (!isTextCategory(category)) {
    return NextResponse.json({ error: "Unknown content category" }, { status: 400 });
  }

  const episode = await getEpisodeById(episodeId);
  const entry = episode?.content[category];

  if (!episode || !entry?.available || !entry.body) {
    return NextResponse.json({ error: "This content is not available yet" }, { status: 404 });
  }

  if (category !== "synopsis") {
    const token = request.cookies.get(unlockCookieName("episode", episodeId))?.value;
    const isUnlocked = token ? await verifyUnlockToken(token, "episode", episodeId) : false;

    if (!isUnlocked) {
      return NextResponse.json(
        { error: "You need to unlock this episode before you can view this" },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({ content: entry.body });
}
