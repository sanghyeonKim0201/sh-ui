import { useMemo } from "react";

import type {
  CreatePlatform,
  CreateStructure,
  CssFrameworkSupported,
} from "sh-ui-cli/api";
import { CSS_FRAMEWORK_DEFAULT, DEFAULT_ARCH } from "sh-ui-cli/api";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Platform = CreatePlatform;
export type Structure = CreateStructure;
export type CssFramework = CssFrameworkSupported;

// 플러그인 이름과 arch 이름 모두 sh-ui-cli/api 의 manifest 배열 에서 derive (단일 진실).
// 폭 넓은 string 타입 — manifest 에 있는 값만 들어오면 OK.
export type Plugin = string;
export type Arch = string;

export type ComposerOptions = {
  projectName: string;
  platform: Platform;
  structure: Structure;
  plugins: ReadonlySet<Plugin>;
  arch: Arch;
  packageManager: PackageManager;
  themeBase64: string;
  cssFramework: CssFramework;
};

const packageManagerPrefix: Record<PackageManager, string> = {
  pnpm: "pnpm dlx sh-ui-cli create",
  npm: "npx sh-ui-cli create",
  yarn: "yarn dlx sh-ui-cli create",
  bun: "bunx sh-ui-cli create",
};

export const composeCommand = (opts: ComposerOptions): string => {
  const { projectName, platform, structure, plugins, arch, packageManager, themeBase64, cssFramework } = opts;

  const parts = [packageManagerPrefix[packageManager], projectName];
  parts.push("--platform", platform);

  if (platform === "next") {
    parts.push("--structure", structure);
    // arch 도 CSS 와 같은 정책 — 디폴트(fsd) 면 명령에서 생략 (노이즈 최소화).
    if (arch !== DEFAULT_ARCH) {
      parts.push("--arch", arch);
    }
    const pluginsArg = [...plugins].join(",");
    parts.push("--plugins", pluginsArg || "''");
  }

  // 기본값(plain) 이면 명령에 포함 안 함 — 디폴트라 노이즈만 늘림.
  // 사용자가 다른 값을 골랐을 때만 명시 (현재는 plain 만 선택 가능).
  if (cssFramework !== CSS_FRAMEWORK_DEFAULT) {
    parts.push("--css", cssFramework);
  }

  parts.push("--theme", `'${themeBase64}'`);
  parts.push("--yes");

  return parts.join(" ");
};

export const useCommandComposer = (opts: ComposerOptions): string =>
  useMemo(() => composeCommand(opts), [opts]);
