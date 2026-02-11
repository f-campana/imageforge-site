import { CopyButton } from "@/components/landing/CopyButton";

type InstallCommandsProps = {
  showHelpText?: boolean;
};

const INSTALL_COMMAND = "pnpm add -g @imageforge/cli";
const RUN_ONCE_COMMAND = "npx @imageforge/cli ./public/images";

function CommandCard({ command, label }: { command: string; label: string }) {
  return (
    <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl border border-white/12 bg-black/55 px-4 py-3">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
          {label}
        </p>
        <div className="flex items-center gap-2 font-mono text-sm text-zinc-200 md:text-base">
          <span className="text-zinc-500 select-none">$</span>
          <code className="truncate">{command}</code>
        </div>
      </div>
      <CopyButton text={command} />
    </div>
  );
}

export function InstallCommands({ showHelpText = true }: InstallCommandsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <CommandCard label="Install globally" command={INSTALL_COMMAND} />
      <CommandCard label="Run once" command={RUN_ONCE_COMMAND} />
      {showHelpText ? (
        <p className="pl-0.5 font-mono text-xs text-zinc-500">
          Use global install for repeated runs, npx for one-off execution.
        </p>
      ) : null}
    </div>
  );
}
