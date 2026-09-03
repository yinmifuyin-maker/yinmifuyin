"use client";

import { useState } from "react";

export function useGalleryCheckout(artistId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gallery-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });

      if (!res.ok) {
        throw new Error("Could not start checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch {
      setError("Checkout is not available yet. Please check back soon.");
      setLoading(false);
    }
  }

  return { loading, error, startCheckout };
}
