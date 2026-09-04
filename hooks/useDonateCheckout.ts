"use client";

import { useState } from "react";

export function useDonateCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(amountUsd: number) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/donate-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not start checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout is not available yet. Please check back soon.");
      setLoading(false);
    }
  }

  return { loading, error, startCheckout };
}
