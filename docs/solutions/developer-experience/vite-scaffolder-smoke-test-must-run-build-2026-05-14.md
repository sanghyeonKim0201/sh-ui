---
module: cli/smoke-tests
date: 2026-05-14
problem_type: developer_experience
component: testing_framework
severity: medium
related_components:
  - cli/templates
  - cli/create
applies_when:
  - "Scaffolders emit projects that depend on bundler-specific path resolution (Vite/Rollup, Webpack aliases, esbuild)"
  - "Smoke tests assert file structure but skip running the project's own build"
  - "A tsconfig `paths` entry is the implicit contract between TS type-checking and the bundler"
  - "Adding a new platform preset to sh-ui-cli (next, flutter, vite, future astro/remix/qwik)"
symptoms:
  - "60 green smoke tests on the vite preset, yet `pnpm build` failed in the scaffolded project"
  - "Rollup: `Could not resolve '@/shared/styles/globals.css' from src/main.tsx`"
  - "Bug landed at Task 7, caught at Task 10 manual verification — three task-cycles of drift"
root_cause: incomplete_setup
resolution_type: test_fix
tags:
  - vite
  - scaffolder
  - smoke-tests
  - tsconfig-paths
  - test-coverage
---

# Vite 스캐폴더 smoke test 는 빌드도 돌려야 한다 — 파일 존재만 확인하면 번들러 경로 해석 누수를 못 잡는다

## Context

v0.86.0 릴리즈에서 `sh-ui-cli` 에 세 번째 플랫폼 프리셋(`vite`)을 추가하면서 60 개의 vite 전용 smoke 테스트를 새로 작성했다. 모든 테스트가 그린이었고 태스크별 spec-compliance / code-quality 리뷰도 통과했다. 그러나 Task 10 의 manual verification — 스캐폴드된 프로젝트에서 실제로 `pnpm install && pnpm build` 를 돌려보는 단계 — 에서 `src/main.tsx` 의 `import '@/shared/styles/globals.css'` 가 Rollup 의 모듈 해석에 실패했다. `tsconfig.app.json` 은 `"@/*": ["./src/*"]` 를 선언하고 있어 `tsc -b --noEmit` 은 통과했지만, Vite/Rollup 은 tsconfig paths 를 자동으로 읽지 않는다.

핵심: smoke 테스트가 `fs.pathExists` / `fs.readJson` 만 확인하면 **파일 형태**는 검증되지만 **번들러 측 계약**은 검증되지 않는다. 두 계약(tsc 와 번들러)이 같은 입력(tsconfig)을 다르게 강제하는 지점이 정확히 사각지대였다.

## Guidance

스캐폴더 smoke 스위트에는 **빌드 사이클 시나리오**를 플랫폼별로 추가한다. 완전한 형태는 실제로 빌드를 실행하는 것:

```js
it('scenario V-build — scaffolded vite project actually builds', async () => {
  await createProject({
    name: 'v-build', platform: 'vite', structure: 'standalone',
    arch: 'fsd', css: 'tailwind', yes: true,
  });
  const projectDir = path.join(tmpDir, 'v-build');
  await execa('pnpm', ['install', '--silent'], { cwd: projectDir });
  await execa('pnpm', ['build'], { cwd: projectDir });
});
```

CI smoke 에 `pnpm install + pnpm build` 가 너무 느리면 **싼 구조 단언**으로 번들러측 계약을 핀고정:

```js
it('vite.config.ts wires tsconfig path aliases', async () => {
  await createProject({ name: 'v-paths', platform: 'vite', /* ... */ yes: true });
  const viteCfg = await fs.readFile(
    path.join(tmpDir, 'v-paths/vite.config.ts'), 'utf-8',
  );
  expect(viteCfg).toContain('tsconfigPaths'); // import + plugin call
  // alternative: assert a resolve.alias block mirroring tsconfig "@/*"
});
```

두 형태 모두 drift 를 잡는다. hot-path CI 에는 proxy 단언을, nightly 나 release 브랜치에는 실제 빌드를 돌린다.

## Why This Matters

`tsc --noEmit` 와 번들러의 모듈 리졸버는 **다른 계약**을 강제한다. 같은 입력(`tsconfig.app.json`)을 공유하지만 enforcement path 가 분리돼 있다. TypeScript 는 `compilerOptions.paths` 를 네이티브로 읽지만 Vite/Rollup 은 안 읽는다 — `vite-tsconfig-paths` 또는 동등한 `resolve.alias` 를 `vite.config.ts` 안에 명시해야 한다.

파일 존재만 확인하거나 타입 체커만 돌리는 smoke 스위트는 정확히 이 분기 지점에 사각지대가 생긴다. 슬립 비용이 크다: 사용자가 `sh-ui-cli create my-app` 직후 첫 `pnpm build` 에서 Rollup 에러를 본다 — 본인이 작성하지 않은 에러를. 첫 인상에서 신뢰를 잃는 최악의 타이밍.

## When to Apply

- `sh-ui-cli` 템플릿에 새 번들러/tsconfig 결합을 도입할 때마다 (vite, esbuild, parcel, rspack)
- 템플릿의 `vite.config.ts` / `webpack.config.js` / `rspack.config.ts` 가 alias 를 추가하거나 의존하는데 그 alias 가 번들러 config 자체에 다시 명시돼 있지 않을 때
- **새 플랫폼 프리셋을 추가할 때** (vite 가 세 번째였음; 추후 astro/remix/qwik 가 네 번째) — 릴리즈 태그 전에 smoke 매트릭스에 `pnpm build` 시나리오를 그 플랫폼에 대해 확장
- 번들러 메이저 버전 업그레이드 시 — alias 해석 동작은 major 간에 조용히 바뀔 수 있는 부류

## Examples

**Manual verification 에서 잡힌 실패 스캐폴드 출력 (Task 10):**

```
[vite:build] Could not resolve "@/shared/styles/globals.css" from "src/main.tsx"
error during build: RollupError: Could not resolve "@/shared/styles/globals.css"
```

**수정 (커밋 `0a95bcc` — `packages/cli/templates/vite-standalone/vite.config.ts`):**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: { port: 5173 },
});
```

…plus `vite-tsconfig-paths: ^5.1.4` in `devDependencies`.

**누락된 가드** — V1 시나리오(`scenario V1 — vite standalone, fsd arch`)는 존재했고 통과했다. V1 에 없었던 것은 **빌드 invocation** 또는 **`vite.config.ts` 가 tsconfig alias 를 실제로 와이어링하고 있는지 확인하는 구조 단언**. 둘 중 어느 형태든 manual verification 이전에 잡았을 것이고, 새 플랫폼 프리셋마다 추가하는 비용이 싸다.

## Related Commits

- `0a95bcc` — fix(cli): add vite-tsconfig-paths so vite resolves @ aliases at build
- `eac1ed7` — feat(cli): wire generateViteStandalone + platform branch in createProject (the commit that introduced the latent bug)
- `b3f2256` — feat(cli): add vite-standalone arch-neutral base template (original `vite.config.ts` without the plugin)

## Reference

- 계획 문서: [docs/superpowers/plans/2026-05-14-vite-platform-preset.md](../../superpowers/plans/2026-05-14-vite-platform-preset.md) (Task 10 verification section 참조)
- 릴리즈: [v0.86.0](https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.86.0)
