import { useMemo } from "react";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Platform = "next" | "flutter";
export type Structure = "standalone" | "monorepo";
export type Plugin = "sentry" | "next-intl";

export type ComposerOptions = {
  projectName: string;
  platform: Platform;
  structure: Structure;
  plugins: ReadonlySet<Plugin>;
  packageManager: PackageManager;
  themeBase64: string;
};

const packageManagerPrefix: Record<PackageManager, string> = {
  pnpm: "pnpm dlx sh-ui-create",
  npm: "npx sh-ui-create",
  yarn: "yarn dlx sh-ui-create",
  bun: "bunx sh-ui-create",
};

export const composeCommand = (opts: ComposerOptions): string => {
  const { projectName, platform, structure, plugins, packageManager, themeBase64 } = opts;

  const parts = [packageManagerPrefix[packageManager], projectName];
  parts.push("--platform", platform);

  if (platform === "next") {
    parts.push("--structure", structure);
    const pluginsArg = [...plugins].join(",");
    parts.push("--plugins", pluginsArg || "''");
  }

  parts.push("--theme", `'${themeBase64}'`);
  parts.push("--yes");

  return parts.join(" ");
};

export const useCommandComposer = (opts: ComposerOptions): string =>
  useMemo(() => composeCommand(opts), [opts]);
