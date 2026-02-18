"use client";

import { type KeyboardEvent, useId, useRef } from "react";

import { CopyButton } from "@/components/landing/CopyButton";
import {
  PACKAGE_MANAGERS,
  PACKAGE_MANAGER_COMMANDS,
  type PackageManager,
} from "@/components/landing/package-managers";
import { usePackageManagerPreference } from "@/components/landing/use-package-manager-preference";

type InstallCommandsProps = {
  showHelpText?: boolean;
  includeRunOnce?: boolean;
};

function CommandCard({ command }: { command: string }) {
  return (
    <div className="panel-card-strong flex w-full min-w-0 flex-col gap-3 border border-white/10 px-4 py-3.5 transition-colors duration-150 focus-within:border-emerald-300/35 hover:border-white/18 motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:-translate-y-px sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-full min-w-0 flex-1">
        <div className="flex max-w-full min-w-0 items-center gap-2 overflow-x-auto font-mono text-sm text-zinc-100 md:text-base">
          <span className="text-zinc-500 select-none">$</span>
          <code className="min-w-max whitespace-nowrap">{command}</code>
        </div>
      </div>
      <div className="shrink-0 self-start sm:self-auto">
        <CopyButton text={command} />
      </div>
    </div>
  );
}

export function InstallCommands({
  showHelpText = true,
  includeRunOnce = true,
}: InstallCommandsProps) {
  const { packageManager, setPreferredPackageManager } =
    usePackageManagerPreference();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId().replace(/:/g, "");
  const panelId = `${id}-package-manager-panel`;

  const commandSet = PACKAGE_MANAGER_COMMANDS[packageManager];

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;
    const lastIndex = PACKAGE_MANAGERS.length - 1;

    if (event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    const nextPackageManager = PACKAGE_MANAGERS[nextIndex];
    setPreferredPackageManager(nextPackageManager);
    tabRefs.current[nextIndex]?.focus();
  };

  const getTabId = (manager: PackageManager) => `${id}-${manager}-tab`;

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        role="tablist"
        aria-label="Package managers"
        className="panel-card-strong flex gap-2 overflow-x-auto border border-white/12 bg-white/[0.04] p-2"
      >
        {PACKAGE_MANAGERS.map((manager, index) => {
          const commands = PACKAGE_MANAGER_COMMANDS[manager];
          const isSelected = packageManager === manager;

          return (
            <button
              key={manager}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={getTabId(manager)}
              tabIndex={isSelected ? 0 : -1}
              aria-selected={isSelected}
              aria-controls={panelId}
              onClick={() => setPreferredPackageManager(manager)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:-translate-y-px ${
                isSelected
                  ? "border-emerald-300/55 bg-emerald-300/12 text-emerald-200"
                  : "border-white/15 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400`}
            >
              {commands.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={getTabId(packageManager)}
        className="flex w-full flex-col gap-3"
      >
        <CommandCard command={commandSet.install} />
        {includeRunOnce ? <CommandCard command={commandSet.runOnce} /> : null}
        {showHelpText ? (
          <p className="pl-0.5 font-mono text-xs text-zinc-500">
            Use global install for repeated runs and one-off execution commands
            when needed.
          </p>
        ) : null}
      </div>
    </div>
  );
}
