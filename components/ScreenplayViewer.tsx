"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";
import { parseScreenplay, type Block } from "@/lib/screenplay";

const courier = Courier_Prime({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"] });

type State = { status: "loading" } | { status: "ready"; text: string } | { status: "error" };

// The writing as A4 screenplay pages, opened over the page. The text comes
// from `endpoint` (an API route that answers { content }), which keeps the
// paid categories behind their unlock check.
export default function ScreenplayViewer({
  endpoint,
  kicker,
  title,
  onClose,
}: {
  endpoint: string;
  kicker: string;
  title: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { content: string }) => {
        if (!cancelled) setState({ status: "ready", text: data.content });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  useEffect(() => {
    // Captured first so Escape closes only this viewer, not the episode
    // dialog underneath it.
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    }
    document.addEventListener("keydown", handleKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const screenplay = useMemo(
    () => (state.status === "ready" ? parseScreenplay(state.text) : undefined),
    [state]
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${kicker}: ${title}`}
      className="fixed inset-0 z-[60] flex flex-col bg-ink/95"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-gold bg-ink px-4 py-3 text-parchment sm:px-6">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-soft">{kicker}</p>
          <p className="truncate font-[family-name:var(--font-serif-display)] text-xl font-semibold">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="shrink-0 rounded-full border border-gold-soft/70 px-4 py-1.5 text-sm hover:bg-vermilion"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {state.status === "loading" && <p className="mt-10 text-center text-sm text-parchment/80">Loading…</p>}
        {state.status === "error" && (
          <p className="mt-10 text-center text-sm text-parchment/80">
            This couldn&rsquo;t be loaded right now. Please try again shortly.
          </p>
        )}
        {screenplay && (
          <div className={`${courier.className} mx-auto flex flex-col items-center gap-6`}>
            {screenplay.titlePage && (
              <Sheet>
                <div className="sp-title">
                  <p className="sp-title__name">{screenplay.titlePage.title}</p>
                  {screenplay.titlePage.subtitle.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <div className="sp-title__credit">
                    {screenplay.titlePage.credit.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </Sheet>
            )}
            {screenplay.pages.map((page, i) => (
              <Sheet key={i} number={i + 1}>
                {page.map((block, j) => (
                  <BlockLines key={j} block={block} />
                ))}
              </Sheet>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// One A4 sheet (210 × 297). Everything inside is sized from the sheet's width,
// so the page keeps its layout at any size on screen.
function Sheet({ number, children }: { number?: number; children: ReactNode }) {
  return (
    <section className="sp-sheet" aria-label={number ? `Page ${number}` : "Title page"}>
      <div className="sp-page">
        {/* Screenplays number every page but the first. */}
        {number && number > 1 && <span className="sp-page__number">{number}.</span>}
        <div className="sp-page__body">{children}</div>
      </div>
    </section>
  );
}

// Text between asterisks (a direction like *he pauses*) is set in italics,
// when the block's asterisks pair up. A span may run across wrapped lines.
function emphasis(lines: string[]): { text: string; italic: boolean }[][] {
  const paired = (lines.join("").match(/\*/g)?.length ?? 0) % 2 === 0;
  if (!paired) return lines.map((text) => [{ text, italic: false }]);
  let italic = false;
  return lines.map((line) =>
    line.split("*").map((text, k) => {
      if (k > 0) italic = !italic;
      return { text, italic };
    })
  );
}

function BlockLines({ block }: { block: Block }) {
  return (
    <div className={`sp-${block.type}`} style={{ marginTop: `${block.spaceBefore}em` }}>
      {emphasis(block.lines).map((parts, i) => (
        <span key={i} className="sp-line">
          {parts.map((part, k) =>
            part.text ? (
              <Fragment key={k}>{part.italic ? <em>{part.text}</em> : part.text}</Fragment>
            ) : null
          )}
        </span>
      ))}
    </div>
  );
}
