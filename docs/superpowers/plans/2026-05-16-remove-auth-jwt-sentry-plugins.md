# Remove auth-jwt + sentry Scaffolder Plugins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove the `auth-jwt` and `sentry` scaffolder integrations from the sh-ui CLI (Next *and* Vite paths), leaving zero half-states, while keeping the `i18n` / `next-intl` integration fully intact.

**Architecture:** "sentry" has **two independent surfaces**: (1) the Next `sentryPlugin` in `allPlugins` (selected via `--plugins sentry`), and (2) a Vite-only `observability` option (`--observability sentry`, its own mcp zod enum `OBSERVABILITY_PROVIDERS`, `emitSentry()`, `api.d.ts` type, and 4 docs `/create` components). Both must be ripped out end-to-end. `auth-jwt` is single-surface (`authJwtPlugin` + a `proxy.ts` merge block shared with `next-intl`). This mirrors the v0.97.0 Tauri removal precision ("반쪽 상태 없이 전부"). Everything `i18n` / `next-intl` stays untouched.

**Tech Stack:** Node ESM CLI (`packages/cli`), Zod MCP schemas (`mcp.mjs`), Next.js docs app (`apps/docs`), node:test smoke suites, pnpm workspace + Turbo.

**Chosen interpretation (no-clarifying-questions directive):** `observability` is removed *entirely* — flag, enum, type, mcp zod, generator threading, `emitSentry`, docs UI — not left as a vestigial `observability: 'none'`. Rationale: `sentry` is the only provider, so a sentry-less `observability` is dead weight; this matches the Tauri precedent and the user's maintenance-reduction intent. If the user wanted `observability` kept as a future extension point, this is the one decision to flag — but the stated goal is fewer plugins.

**Version:** `v0.98.0`, `feat(cli)!` (breaking, 0.x minor-bump convention — same as Tauri v0.97.0). `versions.json` prepend + `packages/cli/package.json` sync, single commit.

**Branch:** Already in worktree on `claude/exciting-yalow-5ff2de`. No new worktree needed.

**Line-number note:** Line numbers below are as-observed on 2026-05-16 and *will drift* as edits land. Every edit is anchored by a stable search string + a verifying `grep`. Locate by string, not by line number.

---

## Authoritative Removal Inventory (by mechanism)

| Surface | auth-jwt | sentry (plugin) | sentry (observability) | KEEP (i18n/next-intl) |
|---|---|---|---|---|
| Plugin file | `plugins/authJwt.js` (delete) | `plugins/sentry.js` (delete) | — | `plugins/nextIntl.js` |
| `plugins/index.js` | drop from `allPlugins` | drop from `allPlugins` | — | `nextIntlPlugin` stays |
| `generator.js` | proxy.ts merge block | (via plugin loop, auto) | guards + threading + `emitSentry` + 3 call sites | `i18n` threading stays |
| `constants.js` | — | — | `OBSERVABILITY_PROVIDERS` (delete) | `I18N_LIBRARIES`, `I18N_DEFAULT_LOCALES` |
| `cli-args.js` | — | — | `observability` in `VALUE_FLAGS` + validation | `i18n`,`locales` stay |
| `index.mjs` | — | — | help lines + `observability:` threading | `--i18n`/`--locales` stay |
| `describeTemplate.js` | — | — | `observability` param + JSDoc | `i18n` param stays |
| `api.d.ts` | — | — | `observability?:` field | `i18n?:` stays |
| `mcp.mjs` | (via PLUGIN_NAMES, auto) | (via PLUGIN_NAMES, auto) | 3 zod + 6 guards + 3 passthrough + import | `i18n`/`locales` zod stay |
| docs `/create` | — | — | `observability` state in 4 components + route.ts | `i18n` state stays |
| docs pages | `plugins/auth-jwt/` + refs | `plugins/sentry/` + refs | combo/example copy | `plugins/next-intl/` stays |
| tests | smoke/desc/css/cli-args cases | smoke/desc/css cases | smoke/desc/css cases | i18n cases stay |

---

## Task 1: Remove Next plugins from registry + delete plugin files

**Files:**
- Modify: `packages/cli/src/create/plugins/index.js`
- Delete: `packages/cli/src/create/plugins/sentry.js`
- Delete: `packages/cli/src/create/plugins/authJwt.js`

- [ ] **Step 1: Edit `plugins/index.js`** — remove the two imports and array members. Final file:

```js
import { nextIntlPlugin } from './nextIntl.js';
import { validatePlugins } from './pluginSchema.js';

export const allPlugins = [nextIntlPlugin];

// 모듈 로드 시점에 모든 플러그인 manifest 검증 — 잘못된 형태가 있으면 즉시 실패.
// 예: src/proxy.ts 같은 잘못된 경로, name 이 kebab-case 가 아닌 경우 등.
validatePlugins(allPlugins);

export function getPluginChoices() {
  return allPlugins.map((p) => ({
    name: p.label,
    value: p.name,
  }));
}

export function getPluginsByNames(names) {
  return allPlugins
    .filter((p) => names.includes(p.name))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}
```

- [ ] **Step 2: Delete the plugin files**

```bash
git rm packages/cli/src/create/plugins/sentry.js packages/cli/src/create/plugins/authJwt.js
```

- [ ] **Step 3: Verify no remaining importers of the deleted modules**

Run: `grep -rn -E "from '\./sentry\.js'|from '\./authJwt\.js'|sentryPlugin|authJwtPlugin" packages/cli/src`
Expected: **no output** (zero matches).

- [ ] **Step 4: Sanity — registry loads with one plugin**

Run: `node -e "import('./packages/cli/src/create/plugins/index.js').then(m=>console.log(m.allPlugins.map(p=>p.name)))"`
Expected: `[ 'next-intl' ]`

- [ ] **Step 5: Commit checkpoint** (stage; final single commit assembled in Task 9 — do NOT commit yet if executing inline as one squashed change. If committing per-task, use:)

```bash
git add packages/cli/src/create/plugins/index.js
git commit -m "refactor(cli): drop sentry/authJwt from plugin registry (WIP, squashed in v0.98.0)"
```

> If using subagent-driven execution with per-task commits, keep messages WIP-tagged; Task 9 reword/squashes into the final `feat(cli)!` commit. Inline executors may defer all commits to Task 9.

---

## Task 2: Remove the auth-jwt + next-intl proxy.ts merge block

**Context:** `generator.js` has a block that, when *both* `auth-jwt` and `next-intl` are active, overwrites `proxy.ts` with a merged middleware. With `auth-jwt` gone this branch is dead. `next-intl` alone already emits its own valid `proxy.ts` via `nextIntlPlugin.files` — the merge was an override only for the both-active case. Removing the block restores next-intl's standalone proxy.

**Files:**
- Modify: `packages/cli/src/create/generator.js` (block at ~2384–2456, anchor: `// auth-jwt + next-intl 동시 활성화 시 proxy.ts 병합`)

- [ ] **Step 1: Locate the exact block**

Run: `grep -n -E "auth-jwt \+ next-intl 동시 활성화|names\.has\('auth-jwt'\)|writeFile\(path\.join\(targetDir, 'proxy\.ts'\), mergedProxy\)" packages/cli/src/create/generator.js`
Expected: 3 anchors bounding the region (comment header ~2384, `if (names.has('auth-jwt') && names.has('next-intl'))` ~2389, `await fs.writeFile(... 'proxy.ts'), mergedProxy)` ~2456).

- [ ] **Step 2: Delete the entire block** — from the comment line `// auth-jwt + next-intl 동시 활성화 시 proxy.ts 병합` through and including the closing of the `if (names.has('auth-jwt') && names.has('next-intl')) { ... }` (the `await fs.writeFile(path.join(targetDir, 'proxy.ts'), mergedProxy);` and its closing `}`). Remove the JSDoc lines `* Next 16+ proxy.ts (구 middleware.ts).` / `* next-intl 라우팅 + auth-jwt 토큰 존재 체크 합성 버전.` only if they belong exclusively to the deleted `mergedProxy` template literal (read 30 lines of surrounding context first to confirm scope — do not remove a JSDoc that documents a still-live function).

- [ ] **Step 3: Verify auth-jwt is fully gone from generator.js**

Run: `grep -n -i "auth-jwt\|authjwt\|mergedProxy" packages/cli/src/create/generator.js`
Expected: **no output**.

- [ ] **Step 4: Verify next-intl standalone proxy still emits** — confirm `nextIntlPlugin` owns a `proxy.ts` in its `files()`:

Run: `grep -n "proxy.ts" packages/cli/src/create/plugins/nextIntl.js`
Expected: at least one match (next-intl emits its own `proxy.ts`). If **zero** matches, STOP — removing the merge block would leave `--plugins next-intl` without a `proxy.ts`; investigate and adjust before proceeding (this is the one genuine regression risk).

- [ ] **Step 5: Stage**

```bash
git add packages/cli/src/create/generator.js
```

---

## Task 3: Rip out the `observability` option from CLI core

**Files:**
- Modify: `packages/cli/src/constants.js` (remove `OBSERVABILITY_PROVIDERS`)
- Modify: `packages/cli/src/create/cli-args.js` (VALUE_FLAGS + validation + import)
- Modify: `packages/cli/src/create/index.mjs` (help text + threading)
- Modify: `packages/cli/src/create/generator.js` (guards 224/521, threading 353/361/579, `generateViteStandalone`/`generateViteApp`/`generateMonorepo` signatures + `if (observability === 'sentry')` at 877/1428/1617, `emitSentry` ~1225–1397)
- Modify: `packages/cli/src/create/describeTemplate.js` (param + JSDoc)
- Modify: `packages/cli/src/api.d.ts` (`observability?:` field)

- [ ] **Step 1: `constants.js` — delete the `OBSERVABILITY_PROVIDERS` export, keep i18n constants**

Run first: `grep -n -E "OBSERVABILITY_PROVIDERS|I18N_LIBRARIES|I18N_DEFAULT_LOCALES" packages/cli/src/constants.js`
Then remove only the `OBSERVABILITY_PROVIDERS` declaration/export line(s). Leave `I18N_LIBRARIES` and `I18N_DEFAULT_LOCALES` exactly as-is.
Verify: `grep -n "OBSERVABILITY_PROVIDERS" packages/cli/src/constants.js` → **no output**.

- [ ] **Step 2: `cli-args.js`** — three edits:
  - Line ~17: remove `'observability'` from `VALUE_FLAGS` array. New: `const VALUE_FLAGS = ['platform', 'structure', 'plugins', 'theme', 'app', 'css', 'arch', 'port', 'i18n', 'locales'];`
  - Lines ~83–84: delete the validation block:
    ```js
    if (name === 'observability' && !OBSERVABILITY_PROVIDERS.includes(value)) {
      throw new Error(`--observability 는 ${OBSERVABILITY_PROVIDERS.join('/')} 중 하나여야 함 (받은 값: ${value})`);
    }
    ```
  - Remove the now-unused `OBSERVABILITY_PROVIDERS` from the import statement at the top of `cli-args.js` (keep any other constants imported on the same line).

  Verify: `grep -n "observability\|OBSERVABILITY" packages/cli/src/create/cli-args.js` → **no output**.

- [ ] **Step 3: `index.mjs`** — remove help/usage and threading:
  - Usage lines ~20–21: delete the ` [--observability <none|sentry>]` fragments.
  - Options line ~33: delete the entire `--observability <none|sentry> ...` help row.
  - Threading lines ~82 and ~the add-app block (~95 area): delete `observability: flags.observability,` from BOTH the create and add-app options objects.

  Verify: `grep -n -i "observability" packages/cli/src/create/index.mjs` → **no output**.

- [ ] **Step 4: `generator.js` — remove guards** at ~224 and ~521 (both are the identical block):
  ```js
  if (options.observability && options.observability !== 'none' && platform !== 'vite') {
    throw new Error(
      `observability='${options.observability}' 은 platform=vite 일 때만 지원합니다 (현재 platform=${platform}). --observability none 또는 --platform vite 사용.`,
    );
  }
  ```
  Also delete the preceding comment line `// observability 옵션도 vite preset 전용. v0.93.0+.`

- [ ] **Step 5: `generator.js` — remove threading**: delete the `observability: options.observability ?? 'none',` lines (~353, ~361, ~579) wherever options are forwarded into vite generators. Remove `observability` from the destructured option params of `generateViteStandalone` (~836), `generateViteApp` (~1552), `generateMonorepo` (~1399) — change `{ i18n = 'none', locales = 'ko,en', observability = 'none' }` → `{ i18n = 'none', locales = 'ko,en' }`. Remove `observability` from the call-through to `generateViteApp` inside `generateMonorepo` (~1451): `generateViteApp(appsDir, appName, port, arch, css, { i18n, locales })`.

- [ ] **Step 6: `generator.js` — remove the 3 emit call sites + `emitSentry`**:
  - ~877 (`generateViteStandalone`): delete `if (observability === 'sentry') { await emitSentry(targetDir, { arch, i18nActive: i18n === 'react-i18next' }); }`
  - ~1617 (`generateViteApp`): delete the identical `if (observability === 'sentry') { await emitSentry(...); }`
  - ~1427–1428 (`generateMonorepo`): delete the comment `// sentry observability 는 플러그인 turboEnvVars 훅을 안 타므로 직접 선언.` and the `if (observability === 'sentry') { ... }` turbo globalEnv injection block (read 25 lines of context to capture the full `if` body).
  - Delete the entire `async function emitSentry(targetDir, { arch, i18nActive = false }) { ... }` (anchor start: JSDoc `* Sentry observability 셋업 emit (v0.93.0+)` ~1225; anchor end: the function's closing brace before the next `function`/`async function` — confirm with `grep -n "^async function \|^function " packages/cli/src/create/generator.js` to find the next sibling).

  Verify: `grep -n -i "observability\|emitSentry\|sentry" packages/cli/src/create/generator.js` → **no output**.

- [ ] **Step 7: `describeTemplate.js`** — remove the `observability` JSDoc `@property` line and the `observability = 'none',` destructure default; remove any `observability`-conditional groups if present (anchor: `grep -n "observability" packages/cli/src/create/describeTemplate.js`). Leave the `i18n` / `locales` handling intact.

  Verify: `grep -n -i "observability\|sentry" packages/cli/src/create/describeTemplate.js` → **no output**.

- [ ] **Step 8: `api.d.ts`** — delete lines:
  ```ts
  /** vite 전용 — Sentry observability opt-in. v0.93.0+ */
  observability?: 'none' | 'sentry';
  ```
  Verify: `grep -n -i "observability\|sentry" packages/cli/src/api.d.ts` → **no output**.

- [ ] **Step 9: Smoke-check the CLI parses**

Run: `node packages/cli/src/index.mjs create --help 2>&1 | grep -i observability || echo "CLEAN"`
Expected: `CLEAN`

- [ ] **Step 10: Stage**
```bash
git add packages/cli/src/constants.js packages/cli/src/create/cli-args.js packages/cli/src/create/index.mjs packages/cli/src/create/generator.js packages/cli/src/create/describeTemplate.js packages/cli/src/api.d.ts
```

---

## Task 4: Rip out `observability` from the MCP server

**Files:**
- Modify: `packages/cli/src/mcp.mjs` (import ~51; 3 zod schemas ~473/597/994; 6 guard blocks ~517–522/621–626 + describe-template guard; 3 passthrough ~553/640/1009; descriptions)

- [ ] **Step 1: Remove the import** — line ~51, drop `OBSERVABILITY_PROVIDERS` from the constants import block (keep `I18N_LIBRARIES`, `I18N_DEFAULT_LOCALES`).

- [ ] **Step 2: Remove the 3 zod schema fields** — at ~473 (`sh_ui_create_project`), ~597 (`sh_ui_add_app`), ~994 (`sh_ui_describe_template`). Each looks like:
  ```js
  observability: z.enum(OBSERVABILITY_PROVIDERS).optional()
    .describe("observability provider — platform=vite 일 때만 의미. ...")
  ```
  Delete the whole `observability: ...` property (including its `.describe(...)` continuation). Leave the adjacent `i18n:` / `locales:` zod fields untouched.

- [ ] **Step 3: Remove the platform guards** — the paired guard appears in `create_project` (~517–522) and `add_app` (~621–626) and possibly `describe_template`:
  ```js
  if (input.observability && input.observability !== "none" && input.platform !== "vite") {
    return { ... text: `observability='${input.observability}' 은 platform=vite 일 때만 지원합니다 ...` };
  }
  ```
  Delete each occurrence. Keep the structurally-identical `i18n` guard right next to it.

- [ ] **Step 4: Remove passthrough** — delete `observability: input.observability,` from the 3 options objects forwarded to the generator/describeTemplate (~553, ~640, ~1009).

- [ ] **Step 5: Scrub residual mentions in tool description prose** — line ~436 and any tool-description string that enumerates options; remove `observability` references but keep `plugins`/`i18n`. Run `grep -n -i "observability\|sentry" packages/cli/src/mcp.mjs` and resolve every hit (description text included).

  Expected after: `grep -n -i "observability\|sentry" packages/cli/src/mcp.mjs` → **no output**.

- [ ] **Step 6: MCP server boots**

Run: `node -e "import('./packages/cli/src/mcp.mjs').then(()=>console.log('MCP OK')).catch(e=>{console.error(e);process.exit(1)})"`
Expected: `MCP OK` (no Zod/reference errors). If the entrypoint auto-starts a stdio server and hangs, instead run `node --check packages/cli/src/mcp.mjs && echo "SYNTAX OK"`.

- [ ] **Step 7: Stage**
```bash
git add packages/cli/src/mcp.mjs
```

---

## Task 5: docs `/create` UI + template-content route

**Files:**
- Modify: `apps/docs/components/create/CreateProjectDialog.tsx`
- Modify: `apps/docs/components/create/ProjectOptionsForm.tsx`
- Modify: `apps/docs/components/create/useCommandComposer.ts`
- Modify: `apps/docs/components/create/TemplatePreview.tsx`
- Modify: `apps/docs/app/api/template-content/route.ts`

**Pattern reference:** the v0.97.0 Tauri commit removed the analogous `tauri` state from these exact components — follow the same shape (remove `useState`, the `Props` field, the destructure, the form control JSX, the `ComposerOptions` field, the composer branch, the `params.set` call, the route searchParam + preview branch).

- [ ] **Step 1: `useCommandComposer.ts`** — remove `observability: 'none' | 'sentry';` from `ComposerOptions`, remove `observability` from the `composeCommand` destructure, and delete the command-emit branch:
  ```ts
  if (observability && observability !== 'none') {
    parts.push("--observability", observability);
  }
  ```
  (locate via `grep -n observability apps/docs/components/create/useCommandComposer.ts`).

- [ ] **Step 2: `ProjectOptionsForm.tsx`** — remove the `observability` + `onObservabilityChange` `Props` fields, the destructure, and the entire observability form control JSX block (the vite-only toggle row, sibling of the i18n control). Keep the i18n control.

- [ ] **Step 3: `CreateProjectDialog.tsx`** — remove `const [observability, setObservability] = useState<'none' | 'sentry'>('none');`, the `observability,` entry in the `ComposerOptions` memo object + its dependency array entry, and the `observability={observability} onObservabilityChange={setObservability}` props passed to `ProjectOptionsForm`.

- [ ] **Step 4: `TemplatePreview.tsx`** — same removals as Step 3 (it has a parallel `observability` `useState` + props pass + the describeTemplate options object). Also remove any `params.set("observability", ...)` in its `ContentViewer` URL builder.

- [ ] **Step 5: `route.ts`** — remove:
  - line ~216 `const observability = (searchParams.get("observability") ?? "none") as "none" | "sentry";`
  - the preview block ~245–262 (anchor `// observability 파일은 emitSentry 가 런타임에 emit`) that special-cases `/observability/sentry.ts` / `/observability/index.ts`
  - the comment at ~264 referencing "sentry 의 observability.ts" (reword to drop the sentry example, or remove if it only documents the deleted branch)
  - any `observability` argument forwarded into `describeTemplate(...)` / `resolveDiskFile(...)` lower in the file.

  Verify: `grep -rn -i "observability" apps/docs/components/create apps/docs/app/api/template-content/route.ts` → **no output**.

- [ ] **Step 6: docs typecheck (scoped, fast feedback)**

Run: `pnpm --filter @sh-ui/docs typecheck`
Expected: PASS (0 errors). Fix any `observability`/`Plugin` type fallout before continuing.

- [ ] **Step 7: Stage**
```bash
git add apps/docs/components/create apps/docs/app/api/template-content/route.ts
```

---

## Task 6: Delete docs plugin pages + scrub all references

**Files:**
- Delete dir: `apps/docs/app/[locale]/(docs)/plugins/sentry/`
- Delete dir: `apps/docs/app/[locale]/(docs)/plugins/auth-jwt/`
- Modify: `apps/docs/app/[locale]/(docs)/plugins/page.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/plugins/next-intl/page.tsx` (cross-refs only — page stays)
- Modify: `apps/docs/app/[locale]/(docs)/cli/page.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/architectures/page.tsx`, `architectures/flat/page.tsx`, `architectures/fsd/page.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/recipes/page.tsx`, `recipes/api-layer/page.tsx`, `recipes/tanstack-query/page.tsx`, `recipes/async-boundary/page.tsx`, `recipes/data-fetching/page.tsx`
- Modify: `packages/cli/README.md`, `packages/cli/ARCHITECTURE.md`

- [ ] **Step 1: Delete the two plugin doc directories**
```bash
git rm -r "apps/docs/app/[locale]/(docs)/plugins/sentry" "apps/docs/app/[locale]/(docs)/plugins/auth-jwt"
```

- [ ] **Step 2: Remove nav/registry links to the deleted pages.** Find every internal link first:
```bash
grep -rn -E "plugins/sentry|plugins/auth-jwt|/plugins/sentry|/plugins/auth-jwt" "apps/docs/app/[locale]/(docs)"
```
For each hit (sidebar/nav config, `plugins/page.tsx` cards, `recipes/*` `<Link href="/plugins/auth-jwt">`, `cli/page.tsx` plugin section, architecture pages' `<strong>auth-jwt</strong>` descriptions), remove the link/section. In `plugins/page.tsx`, if a fallback like `PLUGIN_NAMES[0] ?? "auth-jwt"` exists, change the literal fallback to `"next-intl"`. In example command strings that read `--plugins sentry,next-intl,auth-jwt`, reduce to `--plugins next-intl`.

- [ ] **Step 3: Scrub prose mentions** that are not links — combination examples ("sentry + auth-jwt", "auth-jwt + next-intl 같이 켜면…"), the `next-intl/page.tsx` cross-references to auth-jwt, `TemplatePreview` plugin-base conditions like `if (base === "plugin-auth-jwt")` (becomes unreachable — delete the branch). Iterate until clean:
```bash
grep -rn -i -E "auth-jwt|authjwt|sentry|observability" "apps/docs/app" | grep -v "versions.json"
```
Resolve every line. The `next-intl` plugin page itself stays — only its auth-jwt/sentry cross-references are removed.

- [ ] **Step 4: `packages/cli/README.md` + `ARCHITECTURE.md`** — update example commands and the `sentry/next-intl/auth-jwt` enumerations to `next-intl` only:
```bash
grep -n -i -E "auth-jwt|sentry|observability" packages/cli/README.md packages/cli/ARCHITECTURE.md
```
Edit each hit to reflect the single remaining plugin + no `--observability`.

- [ ] **Step 5: Repo-wide residue check (excluding immutable history)**
```bash
grep -rn -i -E "auth-jwt|authjwt|emitSentry|OBSERVABILITY_PROVIDERS|--observability|plugin-auth-jwt|plugins/sentry" \
  --include='*.js' --include='*.mjs' --include='*.ts' --include='*.tsx' --include='*.md' \
  packages apps . 2>/dev/null | grep -v -E "versions\.json|docs/superpowers/plans|docs/solutions"
```
Expected: **no output** (history files and this plan/solutions docs are intentionally excluded — they are immutable records). `sentry` *string* may still legitimately appear only inside `packages/changelog/versions.json` historical entries — those stay.

- [ ] **Step 6: Stage**
```bash
git add "apps/docs/app" packages/cli/README.md packages/cli/ARCHITECTURE.md
```

---

## Task 7: Update test suites (the CI gate)

**Context:** CI (`.github/workflows/ci.yml`) runs `pnpm -r --if-present test` → these suites. No matrix in the workflow file itself, so "CI/CD work" = curating scenarios + adding rejection assertions. Mirror Tauri's "delete tauri scenarios, reduce all-options guard" approach.

**Files:**
- Modify: `packages/cli/test/smoke.test.js`
- Modify: `packages/cli/test/describe-template.test.js`
- Modify: `packages/cli/test/css-framework-variant.test.js`
- Modify: `packages/cli/test/cli-args.test.js`

- [ ] **Step 1: Inventory every test referencing the removed surfaces**
```bash
grep -n -i -E "auth-jwt|authjwt|sentry|observability" packages/cli/test/smoke.test.js packages/cli/test/describe-template.test.js packages/cli/test/css-framework-variant.test.js packages/cli/test/cli-args.test.js
```
Record each `it(...)`/scenario id and its line span.

- [ ] **Step 2: Delete sentry/auth-jwt-only scenarios** — in `smoke.test.js` the vite `observability=sentry` scenarios (e.g. V18, V21 vite+monorepo+observability) and the auth-jwt proxy / `sentry+auth-jwt+next-intl` / flat-standalone-auth-jwt cases; in `describe-template.test.js` the sentry / auth-jwt+next-intl / sentry-overwrite cases; in `css-framework-variant.test.js` the `+ sentry` error.tsx cases and the `plugins:["auth-jwt"]` / `["sentry","next-intl","auth-jwt"]` cases. Delete whole `it(...)` blocks, not partial.

- [ ] **Step 3: Reduce mixed scenarios to i18n/next-intl-only.** Any scenario that bundled sentry/auth-jwt *with* next-intl/i18n as an "all options" guard (the analog of Tauri's V20a "reduced to i18n+sentry") must now drop sentry/auth-jwt and assert the `--plugins next-intl` + `--i18n react-i18next` path. In `cli-args.test.js`, change `plugins: ['sentry', 'next-intl']` → `plugins: ['next-intl']` and remove any `observability` arg assertions.

- [ ] **Step 4: Add rejection assertions** (the failing→passing safety net). Add to `cli-args.test.js` (or the closest existing arg-parsing suite):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/create/cli-args.js'; // adjust to the actual exported parser name

test('--observability is now an unknown flag (removed in v0.98.0)', () => {
  assert.throws(
    () => parseArgs(['myapp', '--observability', 'sentry']),
    /알 수 없는|unknown|observability/i,
  );
});

test('--plugins sentry is rejected — sentry plugin removed', () => {
  assert.throws(
    () => parseArgs(['myapp', '--plugins', 'sentry']),
    /sentry|유효하지 않은|invalid plugin/i,
  );
});

test('--plugins auth-jwt is rejected — auth-jwt plugin removed', () => {
  assert.throws(
    () => parseArgs(['myapp', '--plugins', 'auth-jwt']),
    /auth-jwt|유효하지 않은|invalid plugin/i,
  );
});

test('--plugins next-intl still accepted', () => {
  const flags = parseArgs(['myapp', '--plugins', 'next-intl']);
  assert.ok(String(flags.plugins).includes('next-intl'));
});
```

> Before finalizing: open `cli-args.js` and confirm the exact exported parser name + how invalid plugins are surfaced (does `parseArgs` reject unknown plugin names, or does `generator.js`/`cli-args` validate against `VALID_PLUGINS`?). Adjust the import and the rejection assertions to match the real validation point — the assertion must exercise the actual rejection path, not a hypothetical one. If plugin-name validation happens in `generator.js` rather than `cli-args.js`, place the `--plugins sentry|auth-jwt` rejection tests in `smoke.test.js`/`describe-template.test.js` against that path instead.

- [ ] **Step 5: Run the full CLI test suite**

Run: `pnpm --filter sh-ui-cli test` (or `cd packages/cli && node --test`)
Expected: **all green**, scenario count reduced, the 4 new rejection tests PASS. Zero references to sentry/auth-jwt/observability remain:
`grep -rn -i -E "auth-jwt|sentry|observability" packages/cli/test | grep -v "removed in v0.98.0\|rejected — \|now an unknown"` → **no output**.

- [ ] **Step 6: Stage**
```bash
git add packages/cli/test
```

---

## Task 8: Full verification (release-grade)

Mirror the Tauri v0.97.0 verification bar: suites green, removed flags rejected, clean scaffold installs/builds/typechecks on **both** platforms with the *kept* options, docs build green (Vercel-safe), drift clean.

- [ ] **Step 1: Whole-workspace test + lint**
```bash
pnpm -r --if-present test && pnpm --filter @sh-ui/docs typecheck && pnpm lint:drift
```
Expected: all PASS. (`lint:drift` guards registry/dual-copy — plugin files are CLI-only so no dual-copy impact expected, but confirm.)

- [ ] **Step 2: Removed surfaces are hard-rejected**
```bash
node packages/cli/src/index.mjs create tmp-x --platform vite --observability sentry --yes 2>&1 | head -3
node packages/cli/src/index.mjs create tmp-y --platform next --plugins sentry --yes 2>&1 | head -3
node packages/cli/src/index.mjs create tmp-z --platform next --plugins auth-jwt --yes 2>&1 | head -3
```
Expected: each errors out (unknown flag / invalid plugin) and creates **no** project dir. Clean up any partial dirs: `rm -rf tmp-x tmp-y tmp-z`.

- [ ] **Step 3: Clean Next scaffold with the kept plugin builds**
```bash
TMP=$(mktemp -d); node packages/cli/src/index.mjs create app --cwd "$TMP" --platform next --structure standalone --plugins next-intl --yes \
  && cd "$TMP/app" && (pnpm install || npm install) && (pnpm build || npm run build) && (pnpm typecheck || npx tsc --noEmit) ; cd - ; echo "EXIT=$?"
```
Expected: install + build + typecheck succeed; a valid `proxy.ts` exists (`ls "$TMP/app"/*proxy.ts "$TMP/app"/src/proxy.ts 2>/dev/null` — confirm next-intl alone still emits one). Remove `$TMP`.

- [ ] **Step 4: Clean Vite scaffold with kept i18n builds**
```bash
TMP=$(mktemp -d); node packages/cli/src/index.mjs create app --cwd "$TMP" --platform vite --structure standalone --i18n react-i18next --locales ko,en --yes \
  && cd "$TMP/app" && (pnpm install || npm install) && (pnpm build || npm run build) && (pnpm typecheck || npx tsc --noEmit) ; cd - ; echo "EXIT=$?"
```
Expected: success, no `src/lib/observability/` or `src/shared/observability/` dir emitted (`find "$TMP/app" -path '*observability*'` → empty). Remove `$TMP`.

- [ ] **Step 5: docs production build (Vercel deploy safety)**
```bash
pnpm --filter @sh-ui/docs build
```
Expected: build PASS, no broken-link/route errors for the deleted `/plugins/sentry` `/plugins/auth-jwt` pages (404 pages removed cleanly; nav has no dangling entries).

- [ ] **Step 6: Final residue gate**
```bash
grep -rn -i -E "auth-jwt|authjwt|emitSentry|OBSERVABILITY_PROVIDERS|--observability|sentryPlugin|authJwtPlugin" \
  --include='*.js' --include='*.mjs' --include='*.ts' --include='*.tsx' --include='*.md' packages apps 2>/dev/null \
  | grep -v -E "versions\.json|docs/superpowers/plans|docs/solutions"
```
Expected: **no output**. Any hit ⇒ go back and finish the removal (no half-states).

---

## Task 9: versions.json + package.json + single commit

**Files:**
- Modify: `packages/changelog/versions.json` (prepend v0.98.0 — newest first)
- Modify: `packages/cli/package.json` (`version` → `0.98.0`)

- [ ] **Step 1: Prepend the changelog entry** as the first element of `versions[]` in `packages/changelog/versions.json`:

```json
{
  "version": "0.98.0",
  "date": "2026-05-16",
  "title": "auth-jwt · sentry 플러그인 제거 — 스캐폴더에서 두 통합 완전 삭제 (breaking)",
  "type": "minor",
  "highlights": [
    "**`sentry` 플러그인 + `--observability` 옵션 제거 (breaking)** — Next 의 `--plugins sentry` 와 vite 전용 `--observability sentry` 를 둘 다 삭제. `sh_ui_create_project` · `sh_ui_add_app` · `sh_ui_describe_template` 의 `observability` 인자, `DescribeTemplateOptions.observability` 타입, `emitSentry()` 도 함께 제거. 이제 `--observability` 는 '알 수 없는 플래그', `--plugins sentry` 는 '유효하지 않은 플러그인' 으로 거부된다.",
    "**`auth-jwt` 플러그인 제거 (breaking)** — `--plugins auth-jwt` 및 auth-jwt+next-intl proxy.ts 병합 로직 삭제. `next-intl` 단독 scaffold 는 자체 proxy.ts 를 그대로 emit (회귀 가드 smoke 추가).",
    "**유지: i18n / next-intl** — `--plugins next-intl` 과 vite `--i18n react-i18next` / `--locales` 는 그대로. 스캐폴더 플러그인은 이제 `next-intl` 단일. 유지보수 표면을 줄이려는 의도적 축소 (Sentry/JWT 는 프로젝트마다 설정이 갈려 baked-in scaffold 가치가 낮음).",
    "**마이그레이션** — Sentry 가 필요하면 생성 후 공식 `@sentry/nextjs` 또는 `@sentry/react` 를 직접 추가. 인증은 프로젝트 백엔드 명세에 맞춰 직접 구성. docs `/plugins/sentry`·`/plugins/auth-jwt` 페이지 및 `/create` UI 토글 제거, smoke 시나리오 정리."
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.98.0"
}
```

- [ ] **Step 2: Bump CLI package version** — `packages/cli/package.json` `"version": "0.97.0"` → `"0.98.0"`.

- [ ] **Step 3: Validate changelog JSON**
```bash
node -e "const v=require('./packages/changelog/versions.json');if(v.versions[0].version!=='0.98.0')throw new Error('not prepended');console.log('versions.json OK, head =',v.versions[0].version)"
```
Expected: `versions.json OK, head = 0.98.0`

- [ ] **Step 4: Re-run the full gate once more** (post-version-bump regression):
```bash
pnpm -r --if-present test && pnpm --filter @sh-ui/docs typecheck && pnpm lint:drift
```
Expected: all PASS.

- [ ] **Step 5: Single conventional commit** (squash any per-task WIP commits into this one — `git reset --soft` to the pre-Task-1 ref if needed, then one commit):

```bash
git add packages/cli packages/changelog apps/docs docs/superpowers/plans
git commit -m "$(cat <<'EOF'
feat(cli)!: remove auth-jwt + sentry plugins from scaffolder (v0.98.0)

BREAKING CHANGE: --plugins sentry / --plugins auth-jwt / --observability
플래그 + MCP observability 인자 + DescribeTemplateOptions.observability
제거. 스캐폴더 플러그인은 next-intl 단일.

사용자 요청 — sentry/auth-jwt 는 프로젝트 성격마다 설정이 갈려
baked-in scaffold 가치가 낮고, 특히 sentry 의 Next 통합은 버전 churn
유지보수 부채. i18n(next-intl) 은 "설정이 귀찮다 + 프로젝트마다 안
변한다" 둘 다 만족해 유지.

제거 범위 (반쪽 상태 없이 전부 — v0.97.0 Tauri 제거와 동일 기준):
- plugins/sentry.js · plugins/authJwt.js 삭제, allPlugins 에서 제외
- generator.js: emitSentry, observability 가드/스레딩(create·addApp·
  generateVite{Standalone,App}·Monorepo), auth-jwt+next-intl proxy.ts
  병합 블록 삭제
- constants.js OBSERVABILITY_PROVIDERS, cli-args.js VALUE_FLAGS+검증,
  index.mjs help/스레딩, describeTemplate.js param, api.d.ts 필드
- mcp.mjs: create_project·add_app·describe_template 의 observability
  zod·가드·passthrough·description
- apps/docs: /plugins/sentry · /plugins/auth-jwt 페이지, /create UI 의
  observability 토글(4 컴포넌트), template-content route observability
  분기, cli/architectures/recipes 교차참조, README·ARCHITECTURE
- smoke/describe-template/css-framework/cli-args 시나리오 정리 +
  --observability/--plugins sentry|auth-jwt 거부 가드 추가

유지: next-intl 플러그인, vite --i18n/--locales 전 경로 무변경.
next-intl 단독 proxy.ts emit 회귀 가드 smoke 추가.

검증: pnpm -r test green, --observability/--plugins sentry|auth-jwt 거부,
clean next(next-intl) + vite(i18n) scaffold install/build/typecheck OK,
docs build green (Vercel deploy 안전), lint:drift clean.

versions.json 0.98.0 (minor — 0.x breaking 관례) prepend +
packages/cli/package.json 동기화.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Confirm working tree clean & one commit ahead**
```bash
git status --short && git log --oneline -1
```
Expected: clean tree, HEAD = the `feat(cli)!: remove auth-jwt + sentry plugins ...` commit.

---

## Task 10: Release flow (USER-GATED — per CLAUDE.md `dev → live PR → tag`)

> Do NOT self-merge or self-tag. CLAUDE.md: tags are cut from `live` only, after PR. Pause for the user at the merge gate if self-merge is blocked.

- [ ] **Step 1: Push the working branch**
```bash
git push origin claude/exciting-yalow-5ff2de
```

- [ ] **Step 2: Open PR into `live`** (release PR — body = the `highlights` from versions.json):
```bash
gh pr create --base live --head claude/exciting-yalow-5ff2de \
  --title "release: v0.98.0 — auth-jwt · sentry 플러그인 제거 (breaking)" \
  --body "$(node -e "console.log(require('./packages/changelog/versions.json').versions[0].highlights.map(h=>'- '+h).join('\n'))")"
```

- [ ] **Step 3: Wait for CI green**, then ask the user to confirm the merge (or merge if authorized — repo convention is **merge commit**, NOT squash, per release-flow memory):
```bash
gh pr checks --watch
# after green + user OK:
gh pr merge --merge
```

- [ ] **Step 4: Tag from `live`** (this triggers publish.yml + release.yml):
```bash
git checkout live && git pull && git tag v0.98.0 && git push origin v0.98.0
```

- [ ] **Step 5: (optional) sync dev**
```bash
git checkout dev && git merge live
```

- [ ] **Step 6: Verify** the tag triggered `publish.yml` (npm) + `release.yml` (GH Release auto-generated from versions.json highlights):
```bash
gh run list --limit 5
gh release view v0.98.0
```

---

## Self-Review

**Spec coverage:** auth-jwt removal (T1,T2,T6,T7) ✓ · sentry-plugin removal (T1,T6,T7) ✓ · sentry-observability removal (T3,T4,T5,T7) ✓ · Next path (T1,T2) ✓ · Vite path (T3,T5) ✓ · docs (T5,T6) ✓ · cli (T1–T3) ✓ · mcp (T4) ✓ · CI/CD (T7 — the test suites ARE the CI gate; ci.yml file itself needs no edit, verified) ✓ · i18n preserved (explicit KEEP column + verification steps that scaffold *with* next-intl/i18n) ✓ · Tauri-pattern parity (T5/T9 reference the v0.97.0 commit) ✓ · release flow (T9,T10) ✓.

**Placeholder scan:** No "TBD"/"handle edge cases". Large mechanical regions are anchored by exact observed code + verifying `grep` + expected post-state (robust against line drift — not a placeholder). Two explicit STOP-conditions flagged (next-intl proxy.ts existence in T2S4; real validation point for rejection tests in T7S4) where reality must be confirmed before proceeding — these are correctness gates, not vague instructions.

**Type/name consistency:** `OBSERVABILITY_PROVIDERS` (constants.js, removed everywhere it's imported: mcp.mjs, cli-args.js) · `observability` field name consistent across api.d.ts/describeTemplate/generator/mcp/docs · `allPlugins`/`getPluginsByNames` unchanged signatures (generic, correctly preserved) · version string `0.98.0` consistent across versions.json/package.json/tag/PR.

**Open risk (single):** T2 — removing the proxy.ts merge block assumes `nextIntlPlugin` emits its own `proxy.ts`. T2S4 hard-gates this with a STOP if the grep returns zero. This is the only place reality could diverge from the plan; it is explicitly guarded.
