import { CopyButton } from "@/components/landing/CopyButton";

export type CodeBlockProps = {
  code: string;
  title?: string;
  language?: string;
};

export function CodeBlock({ code, title, language = "bash" }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="font-mono text-xs tracking-[0.18em] text-zinc-400 uppercase">
          {title ?? language}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-zinc-200 md:p-5 md:text-sm">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
