"use client";

import { useState } from "react";
import UnlockModal from "./UnlockModal";

export default function DonateButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-full border-2 border-gold bg-vermilion px-5 py-2 text-sm font-semibold tracking-wide text-parchment shadow-sm transition-colors hover:bg-[#7d0106] ${className}`}
      >
        Support the Project
      </button>
      {open && <UnlockModal target={{ type: "donate" }} onClose={() => setOpen(false)} />}
    </>
  );
}
