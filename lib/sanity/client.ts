import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-09-02", // today's date — keep hard-coded, bump deliberately
  // Only published documents are ever queried — drafts never reach the live site.
  perspective: "published",
  // Freshness is driven by Next's Data Cache (see lib/sanity/queries.ts tags) plus the
  // publish webhook calling revalidateTag(). Sanity's own CDN cache would otherwise add
  // a second, independent staleness window on top of that, so it's disabled here.
  useCdn: false,
});
