// Uploads a video to Vercel Blob as a private object, then records the blob
// pathname on the matching Sanity document. Three kinds of video:
//
//   episode     the full episode         → episode content.fullEpisode.videoPath
//   storyboard  an episode's storyboard  → episode content.storyboard.videoPath / previewPath
//   sketch      an artist's sketch video → artist sketchVideos[_key == <sketch-id>].videoPath / previewPath
//
// Storyboards and sketches can take a short preview clip (--preview), which
// visitors who haven't donated see instead of the full video.
//
// It only records paths. A video goes live once "Available" is switched on for
// it in Sanity Studio (and, for a new sketch, once it has a title there).
//
// Usage:
//   npm run upload-video -- episode <episode-slug> <video-file>
//   npm run upload-video -- storyboard <episode-slug> <video-file> [--preview <clip-file>]
//   npm run upload-video -- sketch <artist-slug> <sketch-id> <video-file> [--preview <clip-file>]
//
// <sketch-id> is a short name you pick for the sketch, e.g. "warmups-1". Uploading
// again with the same id replaces that sketch's video.
//
// Requires in .env.local:
//   BLOB_READ_WRITE_TOKEN  — from the Blob store's .env.local tab in the Vercel dashboard
//   SANITY_WRITE_TOKEN     — a Sanity API token with Editor rights (sanity.io/manage → API → Tokens)
//   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET

import { existsSync, readFileSync, createReadStream } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { createClient, type SanityClient } from "next-sanity";

const USAGE = `Usage:
  npm run upload-video -- episode <episode-slug> <video-file>
  npm run upload-video -- storyboard <episode-slug> <video-file> [--preview <clip-file>]
  npm run upload-video -- sketch <artist-slug> <sketch-id> <video-file> [--preview <clip-file>]`;

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

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function requireEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (!value) fail(`${name} is not set. ${hint}`);
  return value;
}

function requireFile(filePath: string | undefined, what: string): string {
  if (!filePath) fail(`Missing ${what}.\n\n${USAGE}`);
  if (!existsSync(filePath)) fail(`File not found: ${filePath}`);
  return filePath;
}

type Job =
  | { kind: "episode"; slug: string; video: string }
  | { kind: "storyboard"; slug: string; video: string; preview?: string }
  | { kind: "sketch"; artistSlug: string; sketchId: string; video: string; preview?: string };

function parseArgs(argv: string[]): Job {
  const args = [...argv];
  let preview: string | undefined;
  const previewFlag = args.indexOf("--preview");
  if (previewFlag !== -1) {
    preview = requireFile(args[previewFlag + 1], "preview clip after --preview");
    args.splice(previewFlag, 2);
  }

  const [kind, ...rest] = args;
  switch (kind) {
    case "episode":
      if (preview) fail("Full episodes don't take a preview clip.");
      return { kind, slug: rest[0] ?? fail(USAGE), video: requireFile(rest[1], "video file") };
    case "storyboard":
      return { kind, slug: rest[0] ?? fail(USAGE), video: requireFile(rest[1], "video file"), preview };
    case "sketch": {
      const sketchId = rest[1] ?? fail(USAGE);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(sketchId)) {
        fail(`Sketch id "${sketchId}" should be lowercase letters, numbers and dashes, e.g. warmups-1.`);
      }
      return {
        kind,
        artistSlug: rest[0] ?? fail(USAGE),
        sketchId,
        video: requireFile(rest[2], "video file"),
        preview,
      };
    }
    default:
      fail(USAGE);
  }
}

async function upload(filePath: string, pathnameWithoutExtension: string): Promise<string> {
  const pathname = pathnameWithoutExtension + (path.extname(filePath) || ".mp4");
  console.log(`Uploading ${path.basename(filePath)} -> ${pathname} (private)...`);

  const result = await put(pathname, createReadStream(filePath), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    // Splits the file into parts uploaded in parallel with retries — Vercel
    // recommends this for anything over 100 MB.
    multipart: true,
  });

  console.log(`Uploaded. Blob pathname: ${result.pathname}`);
  return result.pathname;
}

// Both the published document and its draft (if one is open in Studio) get the
// paths, so publishing that draft later doesn't drop them.
async function documentIds(sanity: SanityClient, type: "episode" | "artist", slug: string) {
  const ids = await sanity.fetch<string[]>(`*[_type == $type && slug.current == $slug]._id`, {
    type,
    slug,
  });
  if (ids.length === 0) fail(`No ${type} found in Sanity with slug "${slug}"`);
  return ids;
}

function describe(ids: string[]) {
  return ids.map((id) => (id.startsWith("drafts.") ? "draft" : "published")).join(" + ");
}

async function recordEpisodeVideo(
  sanity: SanityClient,
  ids: string[],
  category: "fullEpisode" | "storyboard",
  paths: { videoPath: string; previewPath?: string }
) {
  const fields: Record<string, string> = { [`content.${category}.videoPath`]: paths.videoPath };
  if (paths.previewPath) fields[`content.${category}.previewPath`] = paths.previewPath;

  const transaction = sanity.transaction();
  for (const id of ids) {
    transaction.patch(id, (patch) =>
      patch
        .setIfMissing({ content: {} })
        .setIfMissing({ [`content.${category}`]: { available: false } })
        .set(fields)
    );
  }
  await transaction.commit();
}

async function recordSketchVideo(
  sanity: SanityClient,
  ids: string[],
  sketchId: string,
  paths: { videoPath: string; previewPath?: string }
) {
  const existing = await sanity.fetch<{ _id: string; hasSketch: boolean }[]>(
    `*[_id in $ids]{ _id, "hasSketch": count(sketchVideos[_key == $sketchId]) > 0 }`,
    { ids, sketchId }
  );

  const transaction = sanity.transaction();
  for (const { _id, hasSketch } of existing) {
    if (hasSketch) {
      const item = `sketchVideos[_key == "${sketchId}"]`;
      const fields: Record<string, string> = { [`${item}.videoPath`]: paths.videoPath };
      if (paths.previewPath) fields[`${item}.previewPath`] = paths.previewPath;
      transaction.patch(_id, (patch) => patch.set(fields));
    } else {
      // A new sketch starts hidden and untitled; it needs a title and "Available"
      // switched on in Studio before the site shows it.
      transaction.patch(_id, (patch) =>
        patch.setIfMissing({ sketchVideos: [] }).append("sketchVideos", [
          { _key: sketchId, _type: "sketchVideo", available: false, ...paths },
        ])
      );
    }
  }
  await transaction.commit();
}

async function main() {
  loadEnvLocal();

  const job = parseArgs(process.argv.slice(2));

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
    // Raw sees both the published document and any unpublished draft of it.
    perspective: "raw",
  });

  if (job.kind === "sketch") {
    const ids = await documentIds(sanity, "artist", job.artistSlug);
    const base = `sketches/${job.artistSlug}/${job.sketchId}`;
    const paths = {
      videoPath: await upload(job.video, base),
      ...(job.preview && { previewPath: await upload(job.preview, `${base}-preview`) }),
    };
    await recordSketchVideo(sanity, ids, job.sketchId, paths);

    console.log(`Sanity updated: artist "${job.artistSlug}" sketch "${job.sketchId}" (${describe(ids)}).`);
    console.log('In Studio, give the sketch a title and switch on "Available" when it should go live.');
    return;
  }

  const ids = await documentIds(sanity, "episode", job.slug);

  if (job.kind === "episode") {
    const videoPath = await upload(job.video, `episodes/${job.slug}`);
    await recordEpisodeVideo(sanity, ids, "fullEpisode", { videoPath });
    console.log(`Sanity updated: "${job.slug}" full episode video (${describe(ids)}).`);
    console.log('Switch on "Available" under Full Episode in Sanity Studio when it should go live.');
    return;
  }

  const base = `storyboards/${job.slug}`;
  const paths = {
    videoPath: await upload(job.video, base),
    ...(job.preview && { previewPath: await upload(job.preview, `${base}-preview`) }),
  };
  await recordEpisodeVideo(sanity, ids, "storyboard", paths);
  console.log(`Sanity updated: "${job.slug}" storyboard video (${describe(ids)}).`);
  console.log('Switch on "Available" under Storyboard in Sanity Studio when it should go live.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
