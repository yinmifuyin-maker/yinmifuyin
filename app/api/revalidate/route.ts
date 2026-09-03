import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = { tags?: string[] };

// Configure this URL as a Sanity webhook (sanity.io/manage -> project -> API -> Webhooks):
//   URL: https://<your-domain>/api/revalidate
//   Dataset: production
//   Trigger on: Create, Update, Delete
//   Filter: _type in ["series","character","episode","artist","teamMember"]
//   Projection: {"tags": [_type]}
//   Secret: same value as SANITY_REVALIDATE_SECRET below
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (!Array.isArray(body?.tags) || body.tags.length === 0) {
      return new Response("Missing tags", { status: 400 });
    }

    for (const tag of body.tags) {
      revalidateTag(tag, { expire: 0 }); // immediate -- a CMS publish should go live right away
    }

    return NextResponse.json({ revalidated: body.tags });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
