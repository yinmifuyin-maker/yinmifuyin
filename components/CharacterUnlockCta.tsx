"use client";

import { useState } from "react";
import UnlockModal from "./UnlockModal";

export default function CharacterUnlockCta({
  characterId,
  characterName,
}: {
  characterId: string;
  characterName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10"
      >
        Donate to Unlock
      </button>
      {open && (
        <UnlockModal
          target={{ type: "character", characterId, characterName }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
