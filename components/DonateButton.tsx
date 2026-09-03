const FALLBACK_HREF = "#";

export default function DonateButton({ className = "" }: { className?: string }) {
  const href = process.env.STRIPE_DONATE_LINK || FALLBACK_HREF;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full border-2 border-brass px-5 py-2 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-brass/10 ${className}`}
    >
      Support the Project
    </a>
  );
}
