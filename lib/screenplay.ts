// Turns the writing stored in Sanity (plain text, loosely screenplay-shaped)
// into A4 screenplay pages. Nothing in the text is changed: lines are only
// classified, cased for display and wrapped.
//
// The text conventions it reads, as written in Studio so far:
// - A scene heading starts with INT or EXT ("Ext. Day.", "Int.Teahouse ...").
//   When action follows on the same line, the heading is split off it.
// - Dialogue is "Name: line", or a name in capitals on its own line with the
//   speech under it. A cue on its own takes the next line as speech, then
//   any indented, quoted or bracketed lines after that.
// - A "Written by" line in the opening lines makes that opening a title page.
// - Everything else is action.
//
// Pages are laid out here, not by the browser, so every page holds exactly
// what a 12pt Courier A4 page holds: lines are pre-wrapped at 10 characters
// per inch and counted.

export type ElementType =
  | "scene"
  | "action"
  | "character"
  | "parenthetical"
  | "dialogue"
  | "transition";

export interface Block {
  type: ElementType;
  lines: string[];
  // Blank lines above this block when it isn't first on its page.
  spaceBefore: number;
}

export interface Screenplay {
  // The title page, if the writing opens with one: the title, any lines
  // under it, then the credit ("Written by" and the name).
  titlePage?: { title: string; subtitle: string[]; credit: string[] };
  pages: Block[][];
}

// Characters per line for each element, at 10 characters per inch with a
// 1.5in left margin on A4 (the action line is 6in).
const WIDTH: Record<ElementType, number> = {
  scene: 60,
  action: 60,
  character: 38,
  parenthetical: 25,
  dialogue: 35,
  transition: 60,
};

// A4 is 11.69in tall; with 1in top and bottom margins and 6 lines an inch
// that's 58 lines. A few are kept spare.
export const LINES_PER_PAGE = 55;

const SCENE_START = /^(?:int|ext|i\/e)(?![a-z])/i;
// Time-of-day and season words that belong to a heading even after a full stop
// ("Ext Night. Autumn. Enlian and Yimeng stand ...").
const HEADING_WORDS =
  /^(?:day|night|morning|afternoon|evening|dawn|dusk|sunset|sunrise|spring|summer|autumn|winter|present|past|later|continuous|same)\b/i;
const CUE_LINE = /^([A-Z][\p{L}'’.]*(?:[ -][A-Z][\p{L}'’.]*){0,2})\s*:\s*(.*)$/u;
const TRANSITION = /^(?:[A-Z ]+ TO:|FADE (?:IN|OUT)[:.]?|CUT TO BLACK[:.]?)$/;
const CREDIT = /^(?:written\s+)?by\b/i;

// A line wider than this is a heading with action after it.
const SHORT_HEADING = 60;

function splitSceneLine(line: string): { heading: string; rest?: string } {
  if (line.length <= SHORT_HEADING) return { heading: line };

  const prefix = line.match(/^(?:int|ext|i\/e)[.:]?\s*/i)?.[0].length ?? 0;
  // Boundaries: a full stop, colon or closing bracket followed by a space.
  const boundary = /[.:)]\s+/g;
  boundary.lastIndex = prefix;
  let m: RegExpExecArray | null;
  while ((m = boundary.exec(line))) {
    const after = line.slice(m.index + m[0].length);
    if (!/^[A-Z“"]/.test(after) || HEADING_WORDS.test(after)) continue;
    return { heading: line.slice(0, m.index + 1).trim(), rest: after };
  }
  return line.length <= 90 ? { heading: line } : { heading: "", rest: line };
}

// Columns a string takes: CJK and other full-width characters count as two,
// which is a little wider than they render, so lines never overrun.
function columns(s: string): number {
  let n = 0;
  for (const ch of s) n += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch) ? 2 : 1;
  return n;
}

export function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  // Split on spaces, but also allow a break between full-width characters,
  // since Chinese has no spaces.
  const tokens = text.split(/(\s+)/).flatMap((t) => (/\s/.test(t) ? [" "] : t.match(/[⺀-꓏＀-￯][　-〿，：；！？」』）]*|[^⺀-꓏＀-￯]+/g) ?? []));

  for (const token of tokens) {
    if (token === " ") {
      if (line) line += " ";
      continue;
    }
    if (columns(line + token) <= width) {
      line += token;
      continue;
    }
    if (line.trim()) lines.push(line.trimEnd());
    line = "";
    // A single word longer than the line is cut where it overflows.
    let rest = token;
    while (columns(rest) > width) {
      let cut = 0;
      let used = 0;
      for (const ch of rest) {
        const w = columns(ch);
        if (used + w > width) break;
        used += w;
        cut += ch.length;
      }
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    line = rest;
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines.length ? lines : [""];
}

interface Element {
  type: ElementType;
  text: string;
}

function isSpeechLine(raw: string): boolean {
  const t = raw.trim();
  return /^\s/.test(raw) || /^[(（“"「]/.test(t);
}

// A cue on its own line in capitals ("GOGO", "GIRL 2 (CONT’D)"), as in a
// typed screenplay.
const CAPS_CUE = /^(?=(?:.*[A-Z]){2})[A-Z0-9][A-Z0-9 .'’()\-#]*$/;

function parseBody(lines: string[]): Element[] {
  const out: Element[] = [];
  // After a cue with no speech on its line: "first" takes the next line as
  // speech whatever its shape; "more" takes only indented, quoted or
  // bracketed lines after that.
  let speaking: "no" | "first" | "more" = "no";

  const nextLine = (i: number) => lines.slice(i + 1).find((l) => l.trim())?.trim() ?? "";

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      speaking = "no";
      return;
    }

    if (speaking === "first" || (speaking === "more" && isSpeechLine(raw))) {
      out.push({ type: /^[(（].*[)）]$/.test(line) ? "parenthetical" : "dialogue", text: line });
      speaking = "more";
      return;
    }
    speaking = "no";

    if (SCENE_START.test(line)) {
      const { heading, rest } = splitSceneLine(line);
      if (heading) out.push({ type: "scene", text: heading });
      if (rest) out.push({ type: "action", text: rest });
      return;
    }

    if (TRANSITION.test(line)) {
      out.push({ type: "transition", text: line });
      return;
    }

    const cue = line.match(CUE_LINE);
    if (cue && cue[1].length <= 30) {
      out.push({ type: "character", text: cue[1] });
      if (cue[2].trim()) out.push({ type: "dialogue", text: cue[2].trim() });
      else speaking = "first";
      return;
    }

    const next = nextLine(i);
    if (CAPS_CUE.test(line) && line.length <= 38 && next && !SCENE_START.test(next)) {
      out.push({ type: "character", text: line });
      speaking = "first";
      return;
    }

    out.push({ type: "action", text: line });
  });
  return out;
}

function toBlocks(elements: Element[]): Block[] {
  return elements.map((el, i) => {
    const prev = elements[i - 1]?.type;
    const inSpeech = el.type === "dialogue" || el.type === "parenthetical";
    const spaceBefore =
      el.type === "scene" && i > 0 ? 2 : inSpeech && (prev === "character" || prev === "dialogue" || prev === "parenthetical") ? 0 : 1;
    const text = el.type === "scene" || el.type === "character" || el.type === "transition" ? el.text.toUpperCase() : el.text;
    return { type: el.type, lines: wrap(text, WIDTH[el.type]), spaceBefore };
  });
}

function paginate(blocks: Block[]): Block[][] {
  const pages: Block[][] = [[]];
  let used = 0;
  let cue = ""; // the speaker, for (CONT'D) when a speech runs over a page

  const newPage = () => {
    pages.push([]);
    used = 0;
  };
  const place = (block: Block) => {
    const space = used === 0 ? 0 : block.spaceBefore;
    pages[pages.length - 1].push({ ...block, spaceBefore: space });
    used += space + block.lines.length;
  };
  const room = (block: Block) => LINES_PER_PAGE - used - (used === 0 ? 0 : block.spaceBefore);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "character") cue = block.lines.join(" ");

    // Headings and cues never sit alone at the foot of a page.
    if (block.type === "scene" || block.type === "character") {
      const next = blocks[i + 1];
      const nextSpace = next ? next.spaceBefore : 0;
      const need = block.lines.length + (next ? nextSpace + Math.min(2, next.lines.length) : 0);
      if (used > 0 && room(block) < need) newPage();
      place(block);
      continue;
    }

    let rest = block;
    while (rest.lines.length > room(rest)) {
      const fits = room(rest);
      const speech = rest.type === "dialogue" || rest.type === "parenthetical";
      // Split a long block, leaving at least two lines on each side.
      const keep = speech ? fits - 1 : fits;
      if (used === 0 || (keep >= 2 && rest.lines.length - keep >= 2)) {
        const take = Math.max(1, used === 0 ? fits - (speech ? 1 : 0) : keep);
        place({ ...rest, lines: rest.lines.slice(0, take) });
        if (speech) place({ type: "character", lines: ["(MORE)"], spaceBefore: 0 });
        rest = { ...rest, lines: rest.lines.slice(take), spaceBefore: 0 };
      }
      newPage();
      if (speech && cue) place({ type: "character", lines: [`${cue} (CONT'D)`], spaceBefore: 0 });
    }
    place(rest);
  }

  return pages.filter((p) => p.length);
}

export function parseScreenplay(text: string): Screenplay {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");

  // A title page: the opening lines up to the first blank, when they hold a
  // "Written by" credit.
  let titlePage: Screenplay["titlePage"];
  let start = 0;
  while (start < lines.length && !lines[start].trim()) start++;
  let end = start;
  while (end < lines.length && lines[end].trim()) end++;
  const opening = lines.slice(start, end).map((l) => l.trim());
  const creditAt = opening.findIndex((l) => CREDIT.test(l));
  if (opening.length <= 8 && creditAt > 0) {
    titlePage = {
      title: opening[0],
      subtitle: opening.slice(1, creditAt),
      credit: opening.slice(creditAt),
    };
    start = end;
  }

  return { titlePage, pages: paginate(toBlocks(parseBody(lines.slice(start)))) };
}
