"use client";

import { useEffect, useState } from "react";
import {
  minAmountFor,
  presetsFor,
  titleFor,
  unlockScopeFor,
  type UnlockTarget,
} from "@/lib/unlockTarget";

export default function UnlockModal({
  target,
  onClose,
}: {
  target: UnlockTarget;
  onClose: () => void;
}) {
  const minAmount = minAmountFor(target);
  const presets = presetsFor(minAmount);
  const scope = unlockScopeFor(target);

  const [selected, setSelected] = useState<number | "custom">(presets[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const amount = selected === "custom" ? parseFloat(customAmount) : selected;
  const validAmount = typeof amount === "number" && Number.isFinite(amount) && amount >= minAmount;

  async function handlePay() {
    if (!validAmount) return;
    setPayLoading(true);
    setPayError(null);

    try {
      const res = await fetch("/api/unlock-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: amount, target }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not start checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setPayLoading(false);
      }
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Checkout is not available yet. Please check back soon."
      );
      setPayLoading(false);
    }
  }

  async function handleCodeSubmit() {
    if (!scope || !code.trim()) return;
    setCodeSubmitting(true);
    setCodeError(null);

    try {
      const res = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: scope.scope, subjectId: scope.subjectId, code }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setCodeError(data?.error ?? "Invalid code");
        setCodeSubmitting(false);
        return;
      }

      window.location.reload();
    } catch {
      setCodeError("Something went wrong. Please try again.");
      setCodeSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titleFor(target)}
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
            {titleFor(target)}
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
          {target.type === "donate"
            ? "Choose an amount to donate securely through Stripe."
            : `Choose an amount (min $${minAmount}) to unlock this, processed securely through Stripe.`}
        </p>

        <div className="mt-6">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Preset amounts">
            {presets.map((preset) => (
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
              min={minAmount}
              step="1"
              placeholder={`Custom amount (min $${minAmount})`}
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

          {scope && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCodeSubmit();
                    }
                  }}
                  placeholder="Access code"
                  className="hairline w-full border bg-white/60 px-3 py-2 text-sm tracking-wide focus-visible:outline-2 focus-visible:outline-ink"
                />
                <button
                  type="button"
                  onClick={handleCodeSubmit}
                  disabled={codeSubmitting || !code.trim()}
                  className="hairline shrink-0 border px-3 py-2 text-xs uppercase tracking-widest opacity-80 hover:opacity-100 disabled:opacity-40"
                >
                  {codeSubmitting ? "Checking…" : "Apply"}
                </button>
              </div>
              {codeError && <p className="mt-1.5 text-xs opacity-70">{codeError}</p>}
            </div>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={!validAmount || payLoading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {payLoading ? "Redirecting…" : `Donate${validAmount ? ` $${amount}` : ""}`}
          </button>

          {payError && <p className="mt-3 text-sm opacity-70">{payError}</p>}

          <p className="mt-4 text-xs opacity-60">
            Donations are processed securely through Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
