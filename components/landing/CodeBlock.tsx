import { CopyButton } from "@/components/landing/CopyButton";

export type CodeBlockProps = {
  code: string;
  title?: string;
  language?: string;
  showHeader?: boolean;
  allowCopy?: boolean;
  kind?: "default" | "strong";
};

export function CodeBlock({
  code,
  title,
  language = "bash",
  showHeader = true,
  allowCopy = true,
  kind = "strong",
}: CodeBlockProps) {
  const containerClass =
    kind === "default" ? "panel-card" : "panel-card-strong";

  return (
    <div
      className={`${containerClass} ui-interact-card w-full min-w-0 overflow-hidden`}
    >
      {showHeader ? (
        <div className="flex items-center justify-between border-b border-white/12 bg-white/[0.04] px-4 py-3">
          <span className="font-mono text-[0.68rem] tracking-[0.16em] text-zinc-400 uppercase">
            {title ?? language}
          </span>
          {allowCopy ? <CopyButton text={code} /> : null}
        </div>
      ) : null}
      <pre className="w-full max-w-full overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-zinc-200 md:px-5 md:py-5 md:text-sm">
        <code className="inline-block min-w-0 font-mono">{code}</code>
      </pre>
    </div>
  );
}
