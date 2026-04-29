import { useMemo } from "react";

import type {
  CreatePlatform,
  CreateStructure,
} from "sh-ui-cli/api";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Platform = CreatePlatform;
export type Structure = CreateStructure;

// 플러그인 이름은 sh-ui-cli/api 의 allPlugins 에서 derive (단일 진실).
// import 한 plugin manifest 의 name 필드만 사용하므로 string 으로 폭 넓게.
export type Plugin = string;

export type ComposerOptions = {
  projectName: string;
  platform: Platform;
  structure: Structure;
  plugins: ReadonlySet<Plugin>;
  packageManager: PackageManager;
  themeBase64: string;
};

const packageManagerPrefix: Record<PackageManager, string> = {
  pnpm: "pnpm dlx sh-ui-cli create",
  npm: "npx sh-ui-cli create",
  yarn: "yarn dlx sh-ui-cli create",
  bun: "bunx sh-ui-cli create",
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
