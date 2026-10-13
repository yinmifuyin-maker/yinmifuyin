import { NextResponse } from "next/server";
import { getShortStoryText, SHORT_STORY_PARTS, type ShortStoryPart } from "@/lib/content";

function isPart(value: string): value is ShortStoryPart {
  return SHORT_STORY_PARTS.some((p) => p.key === value);
}

// Short stories and their synopses are free, so there is no unlock check here.
export async function GET(_request: Request, ctx: RouteContext<"/api/short-story-content/[id]/[part]">) {
  const { id, part } = await ctx.params;

  if (!isPart(part)) {
    return NextResponse.json({ error: "Unknown part" }, { status: 400 });
  }

  const content = await getShortStoryText(id, part);
  if (!content) {
    return NextResponse.json({ error: "This content is not available yet" }, { status: 404 });
  }

  return NextResponse.json({ content });
}
