import fs from "node:fs";
import path from "node:path";

/**
 * server (page.tsx) 에서 컴포넌트 페이지 한 줄로 sandbox 소스 묶음을 읽는 helper.
 *
 * 각 컴포넌트 페이지마다 fs.readFileSync 를 3-4 번 호출하는 boilerplate 제거.
 * Next.js 의 `force-static` 컴파일 시점에 한 번만 실행 — 사용자 요청마다 디스크 IO 없음.
 *
 *   const sources = loadComponentSources('badge');
 *   <ComponentSandbox {...sources} ... />
 */
export interface ComponentSources {
  componentName: string;
  source: string;
  styles: string;
  tokens: string;
}

export function loadComponentSources(componentName: string): ComponentSources {
  const docsRoot = process.cwd();
  const componentDir = path.join(docsRoot, "components", "ui", componentName);
  const source = fs.readFileSync(path.join(componentDir, "index.tsx"), "utf-8");
  // 일부 컴포넌트 (예: code-tabs) 는 styles.css 가 없을 수 있다 — 빈 문자열 fallback.
  const stylesPath = path.join(componentDir, "styles.css");
  const styles = fs.existsSync(stylesPath)
    ? fs.readFileSync(stylesPath, "utf-8")
    : "";
  const tokens = fs.readFileSync(
    path.join(docsRoot, "app", "styles", "tokens.css"),
    "utf-8",
  );
  return { componentName, source, styles, tokens };
}

/**
 * 의존성 컴포넌트만 (name + source + styles) — ComponentSandbox 의 extraComponents 에 직접 전달.
 * 토큰은 메인 컴포넌트 묶음에 이미 포함되므로 안 읽음.
 */
export function loadExtraComponent(name: string): {
  name: string;
  source: string;
  styles: string;
} {
  const docsRoot = process.cwd();
  const componentDir = path.join(docsRoot, "components", "ui", name);
  const source = fs.readFileSync(path.join(componentDir, "index.tsx"), "utf-8");
  const stylesPath = path.join(componentDir, "styles.css");
  const styles = fs.existsSync(stylesPath)
    ? fs.readFileSync(stylesPath, "utf-8")
    : "";
  return { name, source, styles };
}
