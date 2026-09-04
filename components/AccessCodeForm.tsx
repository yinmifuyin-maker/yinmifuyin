"use client";

import { useState } from "react";

export default function AccessCodeForm({
  scope,
  subjectId,
}: {
  scope: "episode" | "gallery" | "character";
  subjectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 text-[11px] tracking-wide underline underline-offset-2 opacity-50 hover:opacity-80"
      >
        Have an access code?
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, subjectId, code }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Invalid code");
        setSubmitting(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1.5 flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          autoFocus
          className="hairline w-36 border bg-white/60 px-2 py-1 text-xs tracking-wide focus-visible:outline-2 focus-visible:outline-ink"
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="hairline border px-2 py-1 text-xs uppercase tracking-widest opacity-80 hover:opacity-100 disabled:opacity-40"
        >
          {submitting ? "Checking…" : "Submit"}
        </button>
      </div>
      {error && <p className="text-xs opacity-70">{error}</p>}
    </form>
  );
}
