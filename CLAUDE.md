@AGENTS.md

# Content rules

- Never invent or write placeholder creative content — scripts, bios, synopsis text,
  character names — to make a fix or feature work. If real content is missing or a
  field is empty, stop and explicitly tell the user what's missing rather than
  filling it in.
- Before committing any change that touches files in `content/` or `public/images/`,
  show a summary of what changed and wait for explicit confirmation before running
  `git commit`. Code changes elsewhere can follow the normal workflow.

# Content history

- Content was originally file-based (scripts in `content/`), migrated to Sanity CMS
  on 2026-09-03 — Sanity is now the sole source of truth for all content.
