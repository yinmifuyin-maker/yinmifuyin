// Uploads an episode's video file to Vercel Blob as a private object, then
// records the resulting blob pathname on that episode in lib/content.ts.
//
// Usage:
//   npm run upload-video -- <episodeId> <path-to-video-file>
//
// Requires BLOB_READ_WRITE_TOKEN (from the Blob store dashboard) in .env.local.

import { existsSync, readFileSync, writeFileSync, createReadStream } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { getEpisodeById } from "../lib/content";

const repoRoot = path.resolve(path.dirname(process.argv[1]), "..");
const contentPath = path.join(repoRoot, "lib", "content.ts");

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

// Finds the [start, end] character range (inclusive of both braces) of the
// `{ id: "<episodeId>", ... }` object literal, by brace-balance scanning rather
// than a regex — the object contains arbitrarily nested braces (content.synopsis,
// content.fullEpisode, etc.), which a non-recursive regex can't reliably span.
function findEpisodeObjectRange(source: string, episodeId: string): { start: number; end: number } {
  const idNeedle = `id: "${episodeId}"`;
  const idIndex = source.indexOf(idNeedle);
  if (idIndex === -1) {
    throw new Error(`Could not locate episode "${episodeId}" in lib/content.ts`);
  }

  const start = source.lastIndexOf("{", idIndex);
  if (start === -1) {
    throw new Error(`Could not find the opening brace for episode "${episodeId}"`);
  }

  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i };
      }
    }
  }

  throw new Error(`Could not find the closing brace for episode "${episodeId}"`);
}

// Replaces the value of a `<key>: <value>` field within objectText, where <value>
// is either a balanced `{ ... }` object literal or a bare reference (e.g. a shared
// NOT_AVAILABLE_VIDEO constant) ending at the next comma/newline.
function replaceField(objectText: string, key: string, newValue: string): string {
  const needle = `${key}:`;
  const keyIndex = objectText.indexOf(needle);
  if (keyIndex === -1) {
    throw new Error(`Could not find "${key}" field`);
  }

  let i = keyIndex + needle.length;
  while (/\s/.test(objectText[i])) i++;

  let valueEnd: number;
  if (objectText[i] === "{") {
    let depth = 0;
    let j = i;
    for (; j < objectText.length; j++) {
      if (objectText[j] === "{") depth++;
      else if (objectText[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    valueEnd = j;
  } else {
    let j = i;
    while (j < objectText.length && objectText[j] !== "," && objectText[j] !== "\n") j++;
    valueEnd = j;
  }

  return objectText.slice(0, i) + newValue + objectText.slice(valueEnd);
}

function updateEpisodeVideoPath(episodeId: string, videoPath: string) {
  const source = readFileSync(contentPath, "utf8");
  const { start, end } = findEpisodeObjectRange(source, episodeId);
  const episodeObjectText = source.slice(start, end + 1);

  const updatedObjectText = replaceField(
    episodeObjectText,
    "fullEpisode",
    `{ available: true, videoPath: "${videoPath}" }`
  );

  writeFileSync(contentPath, source.slice(0, start) + updatedObjectText + source.slice(end + 1));
}

async function main() {
  loadEnvLocal();

  const [episodeId, filePath] = process.argv.slice(2);

  if (!episodeId || !filePath) {
    console.error("Usage: npm run upload-video -- <episodeId> <path-to-video-file>");
    process.exit(1);
  }

  const episode = getEpisodeById(episodeId);
  if (!episode) {
    console.error(`No episode found with id "${episodeId}" in lib/content.ts`);
    process.exit(1);
  }

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local (copy it from the Blob store's " +
        ".env.local tab in the Vercel dashboard) before uploading."
    );
    process.exit(1);
  }

  const extension = path.extname(filePath) || ".mp4";
  const blobPathname = `episodes/${episodeId}${extension}`;

  console.log(`Uploading ${path.basename(filePath)} for "${episodeId}" -> ${blobPathname} (private)...`);

  const result = await put(blobPathname, createReadStream(filePath), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  updateEpisodeVideoPath(episodeId, result.pathname);

  console.log(`Uploaded. Blob pathname: ${result.pathname}`);
  console.log(
    `lib/content.ts updated: "${episodeId}".content.fullEpisode = { available: true, videoPath: "${result.pathname}" }`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
