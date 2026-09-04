"use client";

import { useEffect, useState } from "react";
import { useDonateCheckout } from "@/hooks/useDonateCheckout";

const PRESET_AMOUNTS = [5, 15, 50];

export default function DonateModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<number | "custom">(15);
  const [customAmount, setCustomAmount] = useState("");
  const { loading, error, startCheckout } = useDonateCheckout();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const amount = selected === "custom" ? parseFloat(customAmount) : selected;
  const validAmount = typeof amount === "number" && Number.isFinite(amount) && amount >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validAmount) return;
    startCheckout(amount);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Support the Project"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />

      <div className="hairline relative w-full max-w-sm border bg-parchment p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-[family-name:var(--font-serif-display)] text-2xl">
            Support the Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hairline shrink-0 rounded-full border px-3 py-1 text-sm opacity-70 hover:opacity-100"
          >
            Close
          </button>
        </div>

        <p className="mt-2 text-sm opacity-70">
          Choose an amount to donate securely through Stripe.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Preset amounts">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelected(preset);
                  setCustomAmount("");
                }}
                aria-pressed={selected === preset}
                className={`hairline border px-3 py-2 text-sm font-medium tracking-wide transition-colors ${
                  selected === preset
                    ? "border-brass bg-brass/10"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <label className="mt-3 flex items-center gap-2">
            <span className="text-sm opacity-70">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step="1"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelected("custom");
              }}
              onFocus={() => setSelected("custom")}
              className={`hairline w-full border bg-white/60 px-3 py-2 text-sm tracking-wide focus-visible:outline-2 focus-visible:outline-ink ${
                selected === "custom" ? "border-brass" : ""
              }`}
            />
          </label>

          <button
            type="submit"
            disabled={!validAmount || loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Redirecting…" : `Donate${validAmount ? ` $${amount}` : ""}`}
          </button>

          {error && <p className="mt-3 text-sm opacity-70">{error}</p>}

          <p className="mt-4 text-xs opacity-60">
            Donations are processed securely through Stripe.
          </p>
        </form>
      </div>
    </div>
  );
}
