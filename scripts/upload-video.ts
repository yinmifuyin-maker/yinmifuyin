// Uploads an episode's video file to Vercel Blob as a private object, then
// records the resulting blob pathname on that episode's Sanity document
// (content.fullEpisode.videoPath).
//
// It only records the path. The video goes live once "Available" is switched
// on for the episode's Full Episode in Sanity Studio.
//
// Usage:
//   npm run upload-video -- <episode-slug> <path-to-video-file>
//
// Requires in .env.local:
//   BLOB_READ_WRITE_TOKEN  — from the Blob store's .env.local tab in the Vercel dashboard
//   SANITY_WRITE_TOKEN     — a Sanity API token with Editor rights (sanity.io/manage → API → Tokens)
//   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET

import { existsSync, readFileSync, createReadStream } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { createClient } from "next-sanity";

const repoRoot = path.resolve(path.dirname(process.argv[1]), "..");

function loadEnvLocal() {
  const envPath = path.join(repoRoot, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set. ${hint}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  loadEnvLocal();

  const [episodeSlug, filePath] = process.argv.slice(2);

  if (!episodeSlug || !filePath) {
    console.error("Usage: npm run upload-video -- <episode-slug> <path-to-video-file>");
    process.exit(1);
  }

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  requireEnv(
    "BLOB_READ_WRITE_TOKEN",
    "Add it to .env.local (copy it from the Blob store's .env.local tab in the Vercel dashboard) before uploading."
  );
  const sanityToken = requireEnv(
    "SANITY_WRITE_TOKEN",
    "Add a Sanity API token with Editor rights to .env.local (sanity.io/manage → API → Tokens) before uploading."
  );

  const sanity = createClient({
    projectId: requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "Add it to .env.local."),
    dataset: requireEnv("NEXT_PUBLIC_SANITY_DATASET", "Add it to .env.local."),
    apiVersion: "2026-09-02",
    token: sanityToken,
    useCdn: false,
    // Raw sees both the published episode and any unpublished draft of it.
    perspective: "raw",
  });

  // Both the published document and its draft (if one is open in Studio) get the
  // path, so publishing that draft later doesn't drop it.
  const ids = await sanity.fetch<string[]>(
    `*[_type == "episode" && slug.current == $slug]._id`,
    { slug: episodeSlug }
  );

  if (ids.length === 0) {
    console.error(`No episode found in Sanity with slug "${episodeSlug}"`);
    process.exit(1);
  }

  const extension = path.extname(filePath) || ".mp4";
  const blobPathname = `episodes/${episodeSlug}${extension}`;

  console.log(`Uploading ${path.basename(filePath)} for "${episodeSlug}" -> ${blobPathname} (private)...`);

  const result = await put(blobPathname, createReadStream(filePath), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    // Splits the file into parts uploaded in parallel with retries — Vercel
    // recommends this for anything over 100 MB.
    multipart: true,
  });

  console.log(`Uploaded. Blob pathname: ${result.pathname}`);

  const transaction = sanity.transaction();
  for (const id of ids) {
    transaction.patch(id, (patch) =>
      patch
        .setIfMissing({ content: {} })
        .setIfMissing({ "content.fullEpisode": { available: false } })
        .set({ "content.fullEpisode.videoPath": result.pathname })
    );
  }
  await transaction.commit();

  console.log(
    `Sanity updated: "${episodeSlug}" content.fullEpisode.videoPath = "${result.pathname}" ` +
      `(${ids.map((id) => (id.startsWith("drafts.") ? "draft" : "published")).join(" + ")}).`
  );
  console.log('Switch on "Available" under Full Episode in Sanity Studio when it should go live.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
