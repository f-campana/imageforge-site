import { IMAGEFORGE_CLI_PACKAGE_SPEC } from "@/lib/release";

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
    install: `npm install --save-dev --save-exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    runOnce: `npx ${IMAGEFORGE_CLI_PACKAGE_SPEC} ./public/images --dry-run`,
  },
  pnpm: {
    label: "pnpm",
    install: `pnpm add --save-dev --save-exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    runOnce: `pnpm dlx ${IMAGEFORGE_CLI_PACKAGE_SPEC} ./public/images --dry-run`,
  },
  yarn: {
    label: "yarn",
    install: `yarn add --dev --exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    runOnce: `yarn dlx ${IMAGEFORGE_CLI_PACKAGE_SPEC} ./public/images --dry-run`,
  },
  bun: {
    label: "bun",
    install: `bun add --dev --exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    runOnce: `bunx ${IMAGEFORGE_CLI_PACKAGE_SPEC} ./public/images --dry-run`,
  },
};

const PACKAGE_MANAGER_SET = new Set<PackageManager>(PACKAGE_MANAGERS);

export function isPackageManager(value: string): value is PackageManager {
  return PACKAGE_MANAGER_SET.has(value as PackageManager);
}
