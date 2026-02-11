import { CopyButton } from "@/components/landing/CopyButton";

export type CodeBlockProps = {
  code: string;
  title?: string;
  language?: string;
};

export function CodeBlock({ code, title, language = "bash" }: CodeBlockProps) {
  return (
    <div className="panel-card-strong overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/12 bg-white/[0.04] px-4 py-3">
        <span className="font-mono text-[0.68rem] tracking-[0.16em] text-zinc-400 uppercase">
          {title ?? language}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-zinc-200 md:px-5 md:py-5 md:text-sm">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
