"use client";

import { useState } from "react";

export type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ui-interact-control ui-focus-ring inline-flex h-8 items-center rounded-lg border border-white/18 bg-white/[0.03] px-2.5 font-mono text-[0.68rem] tracking-[0.08em] text-zinc-300 uppercase hover:border-emerald-300/70 hover:bg-emerald-300/10 hover:text-zinc-100"
      aria-live="polite"
      aria-label="Copy code to clipboard"
    >
      {copied ? "Copied" : failed ? "Unavailable" : label}
    </button>
  );
}
