export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type PackageManagerCommands = {
  label: string;
  install: string;
  runOnce: string;
};

export const PACKAGE_MANAGERS: PackageManager[] = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = "npm";

export const PACKAGE_MANAGER_STORAGE_KEY = "imageforge.preferredPackageManager";

export const PACKAGE_MANAGER_CHANGE_EVENT = "imageforge:package-manager-change";

export const PACKAGE_MANAGER_COMMANDS: Record<
  PackageManager,
  PackageManagerCommands
> = {
  npm: {
    label: "npm",
    install: "npm install -g @imageforge/cli",
    runOnce: "npx @imageforge/cli ./public/images",
  },
  pnpm: {
    label: "pnpm",
    install: "pnpm add -g @imageforge/cli",
    runOnce: "pnpm dlx @imageforge/cli ./public/images",
  },
  yarn: {
    label: "yarn",
    install: "yarn global add @imageforge/cli",
    runOnce: "yarn dlx @imageforge/cli ./public/images",
  },
  bun: {
    label: "bun",
    install: "bun add -g @imageforge/cli",
    runOnce: "bunx @imageforge/cli ./public/images",
  },
};

const PACKAGE_MANAGER_SET = new Set<PackageManager>(PACKAGE_MANAGERS);

export function isPackageManager(value: string): value is PackageManager {
  return PACKAGE_MANAGER_SET.has(value as PackageManager);
}
