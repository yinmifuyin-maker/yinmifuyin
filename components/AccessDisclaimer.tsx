export default function AccessDisclaimer({ compact = false }: { compact?: boolean }) {
  const body = (
    <>
      Unlocking is tied to this browser for 90 days. If you clear your cookies, switch
      devices, or use a different browser, you may need to unlock again. We don&rsquo;t
      currently store accounts or purchase history — if you run into an issue, contact us
      at{" "}
      <a
        href="mailto:yinmifuyin@gmail.com"
        className="underline underline-offset-2 opacity-90 hover:opacity-100"
      >
        yinmifuyin@gmail.com
      </a>{" "}
      and we&rsquo;ll sort it out.
    </>
  );

  if (compact) {
    return <p className="mt-2 text-[11px] leading-snug opacity-60">{body}</p>;
  }

  return (
    <div className="hairline mt-6 border p-4 text-xs leading-relaxed opacity-70">{body}</div>
  );
}
