# Vite Platform Preset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `vite` as a third `sh_ui_create_project` platform so that `npx sh-ui-cli create my-app --platform vite --structure standalone` (or `--structure monorepo`) scaffolds a Vite 5 + React 19 + TypeScript + Tailwind v4 project with sh-ui tokens, theme system, and (in monorepo mode) shared `packages/ui/ui-core`.

**Architecture:** Mirror the existing `nextjs-standalone` + `nextjs-app` template + `generateStandalone` / `generateMonorepo` pattern. Reuse `injectCssTheme`, `applyCssFrameworkVariant`, theme presets, plugins-pipeline, arch overlay (`flat` / `fsd` extended to vite). Replace Next-specific pieces: `next.config.ts` → `vite.config.ts`, `next-themes` → self-rolled `useTheme` hook + context, App Router routing → SPA entry (`index.html` + `src/main.tsx`). Tailwind v4 via official `@tailwindcss/vite` plugin (not postcss).

**Tech Stack:** Vite 5+, React 19+, TypeScript 5+, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest 4+, ESLint 9+ flat config, pnpm 10+. Test runner: existing vitest config in `packages/cli/test/`.

**Target version:** v0.86.0 (MINOR — neue platform).

**Scope phases (cut points if implementation overruns):**
- **Phase 1 (must ship):** Tasks 1-10 — vite-standalone with flat + fsd archs, MCP + CLI + describeTemplate parity, smoke tests for standalone.
- **Phase 2 (this PR if budget allows, else v0.87):** Tasks 11-13 — vite-monorepo via `generateMonorepo` platform branch + `vite-app` template + monorepo smoke test.
- **Always:** Tasks 14-15 — versions.json bump, typecheck/lint pass, dev push, PR to live, tag from live.

---

## File Structure

### New files

```
packages/cli/templates/vite-standalone/                       # Phase 1
├── CLAUDE.md                                                  # short, points at sh-ui rules
├── README.md                                                  # vite-flavored quickstart
├── gitignore                                                  # `dist/`, `node_modules/`, etc.
├── package.json                                               # vite, react, @tailwindcss/vite, sh-ui-cli, vitest
├── index.html                                                 # vite entry; FOUC theme script inline
├── vite.config.ts                                             # react + tailwindcss plugins
├── vitest.config.ts                                           # extends vite.config; jsdom env
├── vitest.setup.ts                                            # @testing-library/jest-dom
├── eslint.config.js                                           # flat config, no @next/eslint-plugin-next
├── tsconfig.json                                              # references app + node tsconfigs
├── tsconfig.app.json                                          # for src/
├── tsconfig.node.json                                         # for vite.config.ts
├── src/
│   ├── main.tsx                                               # ReactDOM.createRoot, mounts <App />
│   ├── App.tsx                                                # `<RootLayout><Home /></RootLayout>`
│   └── Home.tsx                                               # placeholder "Hello World"
└── _arch/
    ├── flat/
    │   ├── sh-ui.config.json                                  # paths point at lib/* + components/*
    │   ├── tsconfig.app.json                                  # paths: @/lib/* + @/components/*
    │   ├── eslint.config.js                                   # flat overlay (boundaries plugin scoped to flat)
    │   ├── src/
    │   │   ├── main.tsx                                       # imports './components/layouts/RootLayout'
    │   │   ├── App.tsx                                        # uses @/components/layouts/RootLayout
    │   │   ├── components/
    │   │   │   ├── layouts/RootLayout.tsx                     # html class toggle via useTheme
    │   │   │   ├── providers/index.tsx                        # re-exports GlobalProvider
    │   │   │   ├── providers/GlobalProvider/index.tsx         # wraps QueryClientProvider + ThemeProvider
    │   │   │   └── providers/theme/ThemeProvider.tsx          # self-rolled, no next-themes
    │   │   └── lib/
    │   │       ├── styles/tokens.css                          # COPIED from nextjs-standalone/_arch/flat/lib/styles/tokens.css
    │   │       ├── styles/globals.css                         # `@import 'tailwindcss'` + `../styles/tokens.css`
    │   │       ├── hooks/useTheme.ts                          # context + setTheme + localStorage
    │   │       ├── utils/utils.ts                             # `cn()` helper (clsx + tailwind-merge)
    │   │       └── api/queryClient.ts                         # tanstack-query client factory
    └── fsd/
        ├── sh-ui.config.json                                  # paths point at src/shared/styles/*
        ├── tsconfig.app.json                                  # paths: @/*
        ├── eslint.config.js                                   # fsd overlay (boundaries layers)
        ├── src/
        │   ├── main.tsx                                       # imports from app layer
        │   ├── App.tsx
        │   ├── app/
        │   │   ├── providers/GlobalProvider/index.tsx
        │   │   ├── providers/theme/ThemeProvider.tsx
        │   │   └── layouts/RootLayout.tsx
        │   └── shared/
        │       ├── styles/tokens.css                          # COPIED from nextjs-standalone/_arch/fsd/src/shared/styles/tokens.css
        │       ├── styles/globals.css
        │       ├── hooks/useTheme.ts
        │       ├── lib/utils.ts
        │       └── api/queryClient.ts

packages/cli/templates/vite-app/                              # Phase 2 (monorepo)
├── package.json                                               # vite app inside workspace
├── index.html
├── vite.config.ts                                             # plus @workspace/ui-core alias
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── eslint.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── Home.tsx
└── _arch/flat/, _arch/fsd/                                    # same shape as vite-standalone overlays
```

### Modified files

- `packages/cli/src/constants.js:11` — `CREATE_PLATFORMS = ['next', 'flutter', 'vite']`
- `packages/cli/src/create/architectures/archSchema.js:38` — extend `platforms` enum: `z.enum(['next', 'flutter', 'vite'])`
- `packages/cli/src/create/architectures/flat.js:22` — `platforms: ['next', 'vite']`
- `packages/cli/src/create/architectures/fsd.js` — `platforms: ['next', 'vite']`
- `packages/cli/src/create/generator.js` — new `generateViteStandalone` fn; platform branch in `createProject`; `generateMonorepo` platform branch; `generateViteApp`; `injectCssTheme` candidates += vite paths
- `packages/cli/src/create/describeTemplate.js` — `platform === 'vite'` branch (mirror nextjs paths with templateKey `'vite-standalone'`)
- `packages/cli/src/create/cli-args.js` — `platform === 'vite'` validation parity with next
- `packages/cli/src/mcp.mjs` — `sh_ui_create_project` description + structure-required guard for vite; `sh_ui_describe_template` parity
- `packages/cli/package.json` — version bump to `0.86.0`
- `packages/changelog/versions.json` — prepend v0.86.0 entry
- `packages/cli/test/smoke.test.js` — vite-standalone (flat+fsd) + vite-monorepo scenarios

### Untouched (verified)

- Theme presets / encode / decode — vite uses the same CSS injection path
- Plugins pipeline — vite ignores Next plugins for now (sentry/next-intl/auth-jwt). Plugin compatibility for vite is **out of scope** of this PR (see task notes).
- `scripts/build-template-manifest.mjs` — auto-discovers new templates; no edit needed.

---

## Task 1: Add `vite` to platform constants + archSchema

**Files:**
- Modify: `packages/cli/src/constants.js:11`
- Modify: `packages/cli/src/create/architectures/archSchema.js:38`
- Test: `packages/cli/test/architectures.test.js` (extend)

- [ ] **Step 1: Write the failing test**

Append to `packages/cli/test/architectures.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { CREATE_PLATFORMS } from '../src/constants.js';
import { ArchSchema } from '../src/create/architectures/archSchema.js';

describe('vite platform — constants + schema', () => {
  it('CREATE_PLATFORMS includes vite', () => {
    expect(CREATE_PLATFORMS).toContain('vite');
  });

  it('ArchSchema accepts platforms: [vite]', () => {
    const result = ArchSchema.safeParse({
      name: 'demo',
      label: 'Demo',
      description: 'test arch',
      platforms: ['vite'],
      paths: { layouts:'', providers:'', api:'', config:'', hooks:'', utils:'', ui:'', test:'' },
      aliases: { layouts:'', providers:'', api:'', config:'', hooks:'', utils:'', ui:'', test:'' },
      tsconfigPaths: {},
    });
    // paths/aliases must be non-empty per schema — expect failure but for a different reason
    expect(result.success).toBe(false);
    const msgs = result.error.issues.map((i) => i.message).join(' ');
    expect(msgs).not.toMatch(/platforms.*Invalid enum/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sh-ui-cli test architectures.test.js`
Expected: FAIL — "CREATE_PLATFORMS does not contain 'vite'" / schema rejects platforms: ['vite'] for enum mismatch.

- [ ] **Step 3: Implement constants change**

Edit `packages/cli/src/constants.js:11`:

```js
export const CREATE_PLATFORMS = ['next', 'flutter', 'vite'];
```

Edit `packages/cli/src/create/architectures/archSchema.js:38`:

```js
  platforms: z.array(z.enum(['next', 'flutter', 'vite'])).min(1),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter sh-ui-cli test architectures.test.js`
Expected: PASS for both new cases.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/constants.js packages/cli/src/create/architectures/archSchema.js packages/cli/test/architectures.test.js
git commit -m "feat(cli): add 'vite' to CREATE_PLATFORMS + archSchema enum"
```

---

## Task 2: Extend `flat` and `fsd` arch descriptors to support vite

**Files:**
- Modify: `packages/cli/src/create/architectures/flat.js:22`
- Modify: `packages/cli/src/create/architectures/fsd.js` (find `platforms:` line)
- Test: `packages/cli/test/architectures.test.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/cli/test/architectures.test.js`:

```js
import { getArchesForPlatform, assertArchPlatformCompat } from '../src/create/architectures/index.js';

describe('vite arch compat', () => {
  it('getArchesForPlatform("vite") includes flat + fsd', () => {
    const names = getArchesForPlatform('vite').map((a) => a.name);
    expect(names).toContain('flat');
    expect(names).toContain('fsd');
  });

  it('assertArchPlatformCompat("flat", "vite") returns flat descriptor', () => {
    const arch = assertArchPlatformCompat('flat', 'vite');
    expect(arch.name).toBe('flat');
  });

  it('assertArchPlatformCompat("mes", "vite") rejects (mes is next-only)', () => {
    expect(() => assertArchPlatformCompat('mes', 'vite')).toThrow(/vite/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sh-ui-cli test architectures.test.js`
Expected: FAIL on all three (flat/fsd currently `platforms: ['next']` only).

- [ ] **Step 3: Implement arch platform extension**

Edit `packages/cli/src/create/architectures/flat.js`:

```js
  platforms: ['next', 'vite'],
```

Edit `packages/cli/src/create/architectures/fsd.js` (same line — find `platforms: ['next']`):

```js
  platforms: ['next', 'vite'],
```

Leave `mes.js` alone (`platforms: ['next']` — mes is Next-specific because it relies on App Router segment colocation).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter sh-ui-cli test architectures.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/create/architectures/flat.js packages/cli/src/create/architectures/fsd.js packages/cli/test/architectures.test.js
git commit -m "feat(cli): extend flat + fsd archs to support vite platform"
```

---

## Task 3: Create vite-standalone base template (arch-neutral files)

**Files:**
- Create: `packages/cli/templates/vite-standalone/package.json`
- Create: `packages/cli/templates/vite-standalone/index.html`
- Create: `packages/cli/templates/vite-standalone/vite.config.ts`
- Create: `packages/cli/templates/vite-standalone/vitest.config.ts`
- Create: `packages/cli/templates/vite-standalone/vitest.setup.ts`
- Create: `packages/cli/templates/vite-standalone/eslint.config.js`
- Create: `packages/cli/templates/vite-standalone/tsconfig.json`
- Create: `packages/cli/templates/vite-standalone/tsconfig.node.json`
- Create: `packages/cli/templates/vite-standalone/gitignore`
- Create: `packages/cli/templates/vite-standalone/CLAUDE.md`
- Create: `packages/cli/templates/vite-standalone/README.md`
- Create: `packages/cli/templates/vite-standalone/src/main.tsx`
- Create: `packages/cli/templates/vite-standalone/src/App.tsx`
- Create: `packages/cli/templates/vite-standalone/src/Home.tsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "my-app",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@base-ui/react": "^1.4.1",
    "@tanstack/react-query": "^5.90.21",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.563.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "@tailwindcss/vite": "^4.1.18",
    "@tanstack/react-query-devtools": "^5.91.3",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16",
    "@testing-library/user-event": "^14",
    "@types/node": "^25.1.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@typescript-eslint/eslint-plugin": "^8.54.0",
    "@typescript-eslint/parser": "^8.54.0",
    "@vitejs/plugin-react": "^5.0.0",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-boundaries": "^5.4.0",
    "eslint-plugin-check-file": "^3.3.1",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.1",
    "jsdom": "^29.0.0",
    "prettier": "^3.8.1",
    "prettier-plugin-tailwindcss": "^0.6.13",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.54.0",
    "vite": "^5.4.0",
    "vitest": "^4.1.0"
  },
  "packageManager": "pnpm@10.4.1",
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="ko" suppressHydrationWarning>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>sh-ui app</title>
    <script>
      // FOUC 차단 — ThemeProvider mount 전에 첫 paint 에 dark class 박기.
      // matrix: 'dark' → .dark, 'light' → (none), 'system'/unset → system pref.
      try {
        var t = localStorage.getItem('theme');
        var d = t === 'dark' || ((!t || t === 'system') && matchMedia('(prefers-color-scheme:dark)').matches);
        if (d) document.documentElement.classList.add('dark');
      } catch (e) {}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  }),
);
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Create `tsconfig.json` (root, references-only)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

> Note: `tsconfig.app.json` is per-arch (overlay), so it lives in `_arch/{flat,fsd}/tsconfig.app.json` and is NOT created here.

- [ ] **Step 7: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts", "vitest.setup.ts"]
}
```

- [ ] **Step 8: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  { plugins: { onlyWarn } },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react: pluginReact, 'react-hooks': pluginReactHooks },
    languageOptions: { globals: { ...globals.browser } },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
];
```

- [ ] **Step 9: Create `gitignore`**

```
node_modules/
dist/
.DS_Store
*.log
.env.local
.env.*.local
.vite/
coverage/
```

> Filename is `gitignore` (no leading dot) — the generator renames to `.gitignore` at scaffold time, matching how `nextjs-standalone` does it.

- [ ] **Step 10: Create `CLAUDE.md`** (1 short paragraph pointing at sh-ui rules)

```markdown
# sh-ui app

sh-ui 컴포넌트는 `npx sh-ui-cli add <name>` 으로 추가합니다. 토큰은
`src/lib/styles/tokens.css` (flat) 또는 `src/shared/styles/tokens.css` (fsd) 입니다.

`vite.config.ts` 의 `@tailwindcss/vite` 플러그인이 Tailwind v4 를 처리하므로 PostCSS
설정 파일이 없습니다.
```

- [ ] **Step 11: Create `README.md`**

```markdown
# my-app

Vite + React + sh-ui 스캐폴드.

## 개발

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
pnpm build
pnpm preview
```

## 컴포넌트 추가

```bash
npx sh-ui-cli add button card input dialog
```
```

- [ ] **Step 12: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 13: Create `src/App.tsx`**

```tsx
import Home from './Home';

export default function App() {
  return <Home />;
}
```

> Note: This base `App.tsx` is replaced by the arch overlay (which wraps in `<RootLayout><GlobalProvider>...`).

- [ ] **Step 14: Create `src/Home.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </main>
  );
}
```

- [ ] **Step 15: Commit**

```bash
git add packages/cli/templates/vite-standalone
git commit -m "feat(cli): add vite-standalone arch-neutral base template"
```

---

## Task 4: Create vite-standalone `_arch/flat` overlay

**Files:**
- Create: `packages/cli/templates/vite-standalone/_arch/flat/sh-ui.config.json`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/tsconfig.app.json`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/App.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/components/layouts/RootLayout.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/components/providers/index.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/components/providers/GlobalProvider/index.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/components/providers/theme/ThemeProvider.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/lib/hooks/useTheme.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/lib/utils/utils.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/lib/api/queryClient.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/lib/styles/tokens.css` (copy of `packages/cli/templates/nextjs-standalone/_arch/flat/lib/styles/tokens.css`)
- Create: `packages/cli/templates/vite-standalone/_arch/flat/src/lib/styles/globals.css`

- [ ] **Step 1: Create `_arch/flat/sh-ui.config.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/sanghyeonKim0201/sh-ui/live/packages/cli/sh-ui.schema.json",
  "platform": "react",
  "cssFramework": "tailwind",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "src/lib/styles/tokens.css",
    "cssEntry": "src/lib/styles/globals.css",
    "styles": "src/lib/styles",
    "components": "src/components/common",
    "utils": "src/lib/utils/utils.ts"
  },
  "aliases": {
    "components": "@/components/common",
    "utils": "@/lib/utils/utils",
    "ui": "@/components/common"
  }
}
```

> Compared to next/flat: `paths.tokens` is now under `src/` (vite convention). `cssEntry` moves to `src/lib/styles/globals.css` (no Next `app/globals.css`). Components live at `src/components/common` for now (`components/` namespace inherited from next/flat).

- [ ] **Step 2: Create `_arch/flat/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/lib/*": ["./src/lib/*"],
      "@/components/*": ["./src/components/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `_arch/flat/src/App.tsx`** (overlay replaces base App.tsx)

```tsx
import { RootLayout } from '@/components/layouts/RootLayout';
import { GlobalProvider } from '@/components/providers';
import Home from './Home';

export default function App() {
  return (
    <GlobalProvider>
      <RootLayout>
        <Home />
      </RootLayout>
    </GlobalProvider>
  );
}
```

- [ ] **Step 4: Create `RootLayout.tsx`**

```tsx
import type { ReactNode } from 'react';

export function RootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
```

> Note: vite doesn't own `<html>` (that lives in `index.html`), so RootLayout is just a styled container. The `<html class="dark">` toggle happens via `useTheme()` mutating `document.documentElement`, not via RootLayout.

- [ ] **Step 5: Create `providers/index.tsx`**

```tsx
export { GlobalProvider } from './GlobalProvider';
```

- [ ] **Step 6: Create `GlobalProvider/index.tsx`**

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from '@/lib/api/queryClient';
import { ThemeProvider } from '../theme/ThemeProvider';

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Create `theme/ThemeProvider.tsx`** (self-rolled, no next-themes)

```tsx
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme));

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 8: Create `lib/hooks/useTheme.ts`**

```ts
import { useContext } from 'react';
import { ThemeContext } from '@/components/providers/theme/ThemeProvider';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```

- [ ] **Step 9: Create `lib/utils/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 10: Create `lib/api/queryClient.ts`**

```ts
import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
```

- [ ] **Step 11: Copy tokens.css from nextjs/flat**

Run:

```bash
cp packages/cli/templates/nextjs-standalone/_arch/flat/lib/styles/tokens.css \
   packages/cli/templates/vite-standalone/_arch/flat/src/lib/styles/tokens.css
```

> Reasoning: tokens are platform-neutral. Keeping a file copy (not a symlink) matches the existing dual-copy convention in this repo.

- [ ] **Step 12: Create `lib/styles/globals.css`**

```css
/* sh-ui:external-imports-start
 *   외부 폰트 / 아이콘셋 / 디자인시스템 URL @import 는 반드시 이 블록 안에 둘 것. */
/* sh-ui:external-imports-end */

@import 'tailwindcss';
@import './tokens.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-background-subtle: var(--background-subtle);
  --color-background-muted: var(--background-muted);
  --color-background-inverse: var(--background-inverse);
  --color-foreground: var(--foreground);
  --color-foreground-muted: var(--foreground-muted);
  --color-foreground-subtle: var(--foreground-subtle);
  --color-foreground-inverse: var(--foreground-inverse);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-ring: var(--ring);
  --color-danger: var(--danger);
  --color-danger-hover: var(--danger-hover);
  --color-danger-foreground: var(--danger-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-sidebar-bg: var(--sidebar-bg);
}
```

> Then update `main.tsx` import (in `Task 4 Step 13` below) to load this CSS file.

- [ ] **Step 13: Create `_arch/flat/src/main.tsx`** (overlay — replaces base main.tsx)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './lib/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 14: Run manifest build to sanity-check**

```bash
pnpm --filter sh-ui-cli build:manifest
```

Expected: `vite-standalone` entry appears in `packages/cli/src/create/templateManifest.js` with `arches: { flat: [...] }`.

- [ ] **Step 15: Commit**

```bash
git add packages/cli/templates/vite-standalone/_arch/flat packages/cli/src/create/templateManifest.js
git commit -m "feat(cli): add vite-standalone flat arch overlay"
```

---

## Task 5: Create vite-standalone `_arch/fsd` overlay

**Files:**
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/sh-ui.config.json`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/tsconfig.app.json`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/main.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/App.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/app/providers/GlobalProvider/index.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/app/providers/theme/ThemeProvider.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/app/layouts/RootLayout.tsx`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/shared/hooks/useTheme.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/shared/lib/utils.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/shared/api/queryClient.ts`
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/shared/styles/tokens.css` (copy from `packages/cli/templates/nextjs-standalone/_arch/fsd/src/shared/styles/tokens.css` if it exists; otherwise copy from the same source as Task 4 Step 11)
- Create: `packages/cli/templates/vite-standalone/_arch/fsd/src/shared/styles/globals.css`

- [ ] **Step 1: Check nextjs/fsd tokens.css location**

Run: `find packages/cli/templates/nextjs-standalone/_arch/fsd -name tokens.css`
Use whichever path it returns (likely `src/shared/styles/tokens.css`) as the source to copy.

- [ ] **Step 2: Create `_arch/fsd/sh-ui.config.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/sanghyeonKim0201/sh-ui/live/packages/cli/sh-ui.schema.json",
  "platform": "react",
  "cssFramework": "tailwind",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "src/shared/styles/tokens.css",
    "cssEntry": "src/shared/styles/globals.css",
    "styles": "src/shared/styles",
    "components": "src/shared/ui",
    "utils": "src/shared/lib/utils.ts"
  },
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/ui"
  }
}
```

- [ ] **Step 3: Create `_arch/fsd/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `_arch/fsd/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/shared/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Create `_arch/fsd/src/App.tsx`**

```tsx
import { GlobalProvider } from '@/app/providers/GlobalProvider';
import { RootLayout } from '@/app/layouts/RootLayout';
import Home from './Home';

export default function App() {
  return (
    <GlobalProvider>
      <RootLayout>
        <Home />
      </RootLayout>
    </GlobalProvider>
  );
}
```

- [ ] **Step 6: Create `app/providers/GlobalProvider/index.tsx`**

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from '@/shared/api/queryClient';
import { ThemeProvider } from '../theme/ThemeProvider';

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Create `app/providers/theme/ThemeProvider.tsx`**

Identical content to flat overlay's ThemeProvider (Task 4 Step 7). Copy the exact same code.

- [ ] **Step 8: Create `app/layouts/RootLayout.tsx`**

```tsx
import type { ReactNode } from 'react';

export function RootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
```

- [ ] **Step 9: Create `shared/hooks/useTheme.ts`**

```ts
import { useContext } from 'react';
import { ThemeContext } from '@/app/providers/theme/ThemeProvider';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```

- [ ] **Step 10: Create `shared/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 11: Create `shared/api/queryClient.ts`**

Identical to Task 4 Step 10. Copy the exact same code.

- [ ] **Step 12: Copy tokens.css**

```bash
cp packages/cli/templates/nextjs-standalone/_arch/fsd/src/shared/styles/tokens.css \
   packages/cli/templates/vite-standalone/_arch/fsd/src/shared/styles/tokens.css
```

(Use the path returned by Task 5 Step 1 if it differs.)

- [ ] **Step 13: Create `shared/styles/globals.css`**

Identical content to flat's globals.css (Task 4 Step 12), except the `@import './tokens.css'` line stays as-is (relative path resolves correctly because globals.css and tokens.css live in the same `shared/styles/` directory).

- [ ] **Step 14: Run manifest build**

```bash
pnpm --filter sh-ui-cli build:manifest
```

Expected: `vite-standalone.arches` now has both `flat` and `fsd`.

- [ ] **Step 15: Commit**

```bash
git add packages/cli/templates/vite-standalone/_arch/fsd packages/cli/src/create/templateManifest.js
git commit -m "feat(cli): add vite-standalone fsd arch overlay"
```

---

## Task 6: Add `generateViteStandalone` and wire platform branch

**Files:**
- Modify: `packages/cli/src/create/generator.js` (around line 309 for branch, around line 646 for new fn)

- [ ] **Step 1: Write the failing test**

Append to `packages/cli/test/smoke.test.js`:

```js
  it('scenario V1 — vite standalone, fsd arch, tailwind, no theme', async () => {
    await createProject({
      name: 'my-vite-app',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-app');
    expect(await fs.pathExists(projectDir)).toBe(true);

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('my-vite-app');
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.devDependencies['@tailwindcss/vite']).toBeDefined();
    expect(pkg.devDependencies.next).toBeUndefined();

    expect(await fs.pathExists(path.join(projectDir, 'index.html'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'vite.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'next.config.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/main.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/shared/styles/tokens.css'))).toBe(true);

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.platform).toBe('react');
    expect(cfg.cssFramework).toBe('tailwind');
    expect(cfg.paths.tokens).toBe('src/shared/styles/tokens.css');
  });

  it('scenario V2 — vite standalone, flat arch', async () => {
    await createProject({
      name: 'my-vite-flat',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-flat');
    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.paths.tokens).toBe('src/lib/styles/tokens.css');
    expect(await fs.pathExists(path.join(projectDir, 'src/lib/styles/tokens.css'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/components/layouts/RootLayout.tsx'))).toBe(true);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sh-ui-cli test smoke.test.js -t "scenario V1"`
Expected: FAIL — "platform === 'vite' not handled" (falls through to next path) or template lookup errors.

- [ ] **Step 3: Add `generateViteStandalone` function**

In `packages/cli/src/create/generator.js`, add immediately AFTER `generateStandalone` (around line 691, before `generateMonorepo`):

```js
async function generateViteStandalone(targetDir, projectName, theme, css, arch, themeBase) {
  // 베이스 (arch-neutral) + arch 오버레이 — generateStandalone 과 같은 패턴.
  await fs.copy(path.join(TEMPLATES_DIR, 'vite-standalone'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'vite-standalone', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  await assertArchOverlayApplied(targetDir, arch);

  // package.json — name + dep sort
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: false, plugins: [], arch });
  await injectCssTheme(targetDir, theme);
  await patchShUiConfig(path.join(targetDir, 'sh-ui.config.json'), css, themeBase);
}
```

- [ ] **Step 4: Wire platform branch in `createProject`**

In `packages/cli/src/create/generator.js`, find the block starting at `if (platform === 'flutter') {` (around line 310). Insert immediately AFTER its closing `}` and BEFORE `// platform === 'next' 경로`:

```js
  if (platform === 'vite') {
    // vite 는 next 와 동일하게 structure 옵션을 받지만 Phase 1 에서는 standalone 만 처리.
    // monorepo 는 후속 task 에서 generateMonorepo 의 platform 분기로 연결.
    const projectType = options.structure ?? await select({
      message: '프로젝트 구조:',
      choices: [
        { name: '단독 (Vite standalone)', value: 'standalone' },
        { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
      ],
    });

    if (projectType === 'standalone') {
      await generateViteStandalone(targetDir, projectName, theme, cssFramework, arch, themeBase);
    } else {
      await generateMonorepo(targetDir, projectName, [], { yes: options.yes, theme, css: cssFramework, arch, themeBase, platform: 'vite' });
    }

    await finalizeProject(targetDir, { dryRun: options.dryRun });

    if (options.dryRun) {
      const files = await listAllFiles(targetDir);
      console.log(`\n[DRY RUN] ${projectName} 스캐폴드 시 작성될 파일 (${files.length}개):\n`);
      for (const f of files.sort()) console.log(`  ${f}`);
      await fs.remove(targetDir);
      console.log(`\n실제 스캐폴드: --dry-run 제거 후 같은 명령 실행.`);
      return;
    }

    console.log(`\n✅ ${projectName} Vite 프로젝트가 생성되었습니다!`);
    console.log(`\n  cd ${projectName}`);
    console.log('  pnpm install');
    console.log('  pnpm dev\n');

    if (projectType === 'monorepo') {
      console.log('다음 단계 — 베이스 컴포넌트 추가 (예시):');
      console.log(`  cd ${projectName}/packages/ui/ui-core`);
      console.log('  npx sh-ui-cli add button card input dialog\n');
    } else {
      console.log('다음 단계 — 베이스 컴포넌트 추가 (예시):');
      console.log('  npx sh-ui-cli add button card input dialog\n');
    }
    return;
  }
```

- [ ] **Step 5: Update `arch` resolution above the new branch**

In the `createProject` function, find the block (around line 200):

```js
  let arch = null;
  if (platform === 'next') {
    const archName = options.arch ?? DEFAULT_ARCH;
    arch = assertArchPlatformCompat(archName, 'next');
  } else if (platform === 'flutter' && options.arch) {
    arch = assertArchPlatformCompat(options.arch, 'flutter');
  }
```

Replace with:

```js
  let arch = null;
  if (platform === 'next') {
    const archName = options.arch ?? DEFAULT_ARCH;
    arch = assertArchPlatformCompat(archName, 'next');
  } else if (platform === 'vite') {
    const archName = options.arch ?? DEFAULT_ARCH;  // 'fsd' default — flat 도 호환
    arch = assertArchPlatformCompat(archName, 'vite');
  } else if (platform === 'flutter' && options.arch) {
    arch = assertArchPlatformCompat(options.arch, 'flutter');
  }
```

- [ ] **Step 6: Update non-TTY guard**

Find `if (platform === 'next') { assertNoTtyFlag(options.structure, '--structure'); }` (around line 200). Replace with:

```js
    if (options.platform === 'next' || options.platform === 'vite') {
      assertNoTtyFlag(options.structure, '--structure');
    }
```

- [ ] **Step 7: Update the platform `select` prompt to include vite**

In `createProject`, around line 209, modify the `platform` select choices:

```js
  const platform = options.platform ?? await select({
    message: '플랫폼:',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'Vite (SPA)', value: 'vite' },
      { name: 'Flutter', value: 'flutter' },
    ],
  });
```

- [ ] **Step 8: Update CSS framework prompt gate**

Find the block (around line 232):

```js
  if (
    options.css == null &&
    platform !== 'flutter' &&
    process.stdin.isTTY &&
    !options.yes
  ) {
```

This is already correct (vite is NOT flutter, so it enters the CSS prompt path). Verify by reading. No change needed.

- [ ] **Step 9: Run test to verify it passes**

Run: `pnpm --filter sh-ui-cli test smoke.test.js -t "scenario V"`
Expected: PASS for V1 and V2.

- [ ] **Step 10: Commit**

```bash
git add packages/cli/src/create/generator.js packages/cli/test/smoke.test.js
git commit -m "feat(cli): wire generateViteStandalone + platform branch in createProject"
```

---

## Task 7: Extend `injectCssTheme` candidates for vite paths

**Files:**
- Modify: `packages/cli/src/create/generator.js:1755-1779` (function `injectCssTheme`)
- Test: `packages/cli/test/smoke.test.js` (theme scenario)

- [ ] **Step 1: Write the failing test**

Append to smoke.test.js:

```js
  it('scenario V3 — vite standalone, fsd, with rose theme', async () => {
    await createProject({
      name: 'my-vite-themed',
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      css: 'tailwind',
      theme: 'rose',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-themed');
    const tokens = await fs.readFile(
      path.join(projectDir, 'src/shared/styles/tokens.css'),
      'utf-8',
    );
    // rose preset 의 primary 색은 #E11D48
    expect(tokens).toContain('#E11D48');

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.theme.base).toBe('rose');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter sh-ui-cli test smoke.test.js -t "scenario V3"`
Expected: FAIL — `injectCssTheme` throws "theme 주입 실패: tokens.css 파일을 찾을 수 없음" (the candidate list doesn't yet include vite paths).

Wait — actually, the fsd candidate `src/shared/styles/tokens.css` is already in the list (line 1759 — that path is shared between next-fsd and vite-fsd). So this test may pass on its own. Check first:

```bash
grep -A 6 "candidates = \[" packages/cli/src/create/generator.js | head -10
```

If `src/shared/styles/tokens.css` is in the list, the fsd vite case is covered. The flat vite case needs `src/lib/styles/tokens.css` (note the `src/` prefix — different from next-flat which uses bare `lib/styles/tokens.css`).

- [ ] **Step 3: Add the vite-flat path to candidates**

In `packages/cli/src/create/generator.js`, modify `injectCssTheme` (around line 1757):

```js
async function injectCssTheme(projectDir, theme) {
  if (!theme) return;
  const candidates = [
    'src/shared/styles/tokens.css',  // FSD standalone (next + vite)
    'src/styles/tokens.css',          // monorepo ui-app-template (arch-neutral)
    'src/lib/styles/tokens.css',      // flat standalone (vite)
    'lib/styles/tokens.css',          // flat standalone (next)
  ];
  // ...rest unchanged
```

- [ ] **Step 4: Add the flat-vite theme test**

Append to smoke.test.js:

```js
  it('scenario V4 — vite standalone, flat, with violet theme', async () => {
    await createProject({
      name: 'my-vite-flat-themed',
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      css: 'tailwind',
      theme: 'violet',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-flat-themed');
    const tokens = await fs.readFile(
      path.join(projectDir, 'src/lib/styles/tokens.css'),
      'utf-8',
    );
    // violet preset 의 primary 색은 #7C3AED
    expect(tokens).toContain('#7C3AED');
  });
```

- [ ] **Step 5: Run test to verify both V3 and V4 pass**

Run: `pnpm --filter sh-ui-cli test smoke.test.js -t "scenario V"`
Expected: PASS for V1-V4.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/create/generator.js packages/cli/test/smoke.test.js
git commit -m "feat(cli): inject theme into vite-flat tokens.css path"
```

---

## Task 8: Extend `describeTemplate` for vite platform

**Files:**
- Modify: `packages/cli/src/create/describeTemplate.js` (around line 65-100, the platform branching block)
- Test: `packages/cli/test/describe-template.test.js`

- [ ] **Step 1: Re-read the existing platform branches**

Run: `sed -n '60,170p' packages/cli/src/create/describeTemplate.js`

Confirm the function takes `platform` ∈ `'next' | 'flutter'` and branches via `if (platform === 'flutter')`, then defaults to `'next'` for the standalone/monorepo paths.

- [ ] **Step 2: Write the failing test**

Append to `packages/cli/test/describe-template.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { describeTemplate } from '../src/create/describeTemplate.js';

describe('describeTemplate — vite', () => {
  it('vite + standalone + fsd returns files from vite-standalone manifest', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      cssFramework: 'tailwind',
    });
    expect(result.files.some((f) => f === 'vite.config.ts')).toBe(true);
    expect(result.files.some((f) => f === 'index.html')).toBe(true);
    expect(result.files.some((f) => f.endsWith('src/shared/styles/tokens.css'))).toBe(true);
    expect(result.files.some((f) => f === 'next.config.ts')).toBe(false);
    const baseGroup = result.groups.find((g) => g.id === 'base');
    expect(baseGroup.paths.length).toBeGreaterThan(0);
  });

  it('vite + standalone + flat uses flat overlay paths', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'standalone',
      arch: 'flat',
      cssFramework: 'tailwind',
    });
    expect(result.files.some((f) => f.endsWith('src/lib/styles/tokens.css'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter sh-ui-cli test describe-template.test.js -t "vite"`
Expected: FAIL — describeTemplate currently treats anything not `'flutter'` as next, so it looks up `nextjs-standalone` manifest and returns wrong file list.

- [ ] **Step 4: Add a vite branch**

In `packages/cli/src/create/describeTemplate.js`, locate the platform branch (around line 65). Read the existing code first:

```bash
sed -n '60,130p' packages/cli/src/create/describeTemplate.js
```

Then add a `platform === 'vite'` branch that mirrors the next-standalone path, swapping `templateKey: 'nextjs-standalone'` → `'vite-standalone'`. Skip the next-specific bits: no `plugin.files` for next-only plugins (vite has no plugins yet), no `app/[locale]` transforms.

Concrete insert AFTER the flutter branch and BEFORE the next-default branch:

```js
  if (platform === 'vite') {
    // standalone only in Phase 1. monorepo is added in Task 11.
    const templateKey = 'vite-standalone';
    const tpl = TEMPLATE_MANIFEST[templateKey];
    if (!tpl) {
      throw new Error(`Template manifest missing entry for '${templateKey}'.`);
    }
    const archName = arch && isKnownArch(arch) ? arch : DEFAULT_ARCH;
    const archDescriptor = getArchByName(archName);
    if (!archDescriptor.platforms.includes('vite')) {
      throw new Error(`Arch '${archName}' is not compatible with vite.`);
    }
    const baseFiles = tpl.base.slice();
    const archFiles = (tpl.arches?.[archName] ?? []).slice();
    const files = [...new Set([...baseFiles, ...archFiles])].sort();
    return {
      files,
      groups: [
        { id: 'base', label: '베이스 (vite-standalone)', paths: baseFiles.sort() },
        { id: 'arch', label: `Arch (${archName})`, paths: archFiles.sort() },
      ],
    };
  }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter sh-ui-cli test describe-template.test.js -t "vite"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/create/describeTemplate.js packages/cli/test/describe-template.test.js
git commit -m "feat(cli): describeTemplate supports platform=vite"
```

---

## Task 9: Update `cli-args.js` + MCP schema for vite

**Files:**
- Modify: `packages/cli/src/create/cli-args.js`
- Modify: `packages/cli/src/mcp.mjs` (around line 366-446)

- [ ] **Step 1: Confirm cli-args validation requires no change**

Run: `grep -n "VALID_PLATFORMS\|structure" packages/cli/src/create/cli-args.js`

`VALID_PLATFORMS = CREATE_PLATFORMS` already pulls `vite` in via the constant change in Task 1. Confirm there is no hardcoded check like `if (platform === 'next' && !structure)`. If there is, extend it to also require structure for vite. If there isn't, this step is a no-op — proceed to MCP.

- [ ] **Step 2: Write the failing MCP test**

Add a new test file at `packages/cli/test/mcp-create-vite.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { CREATE_PLATFORMS, CREATE_STRUCTURES } from '../src/constants.js';

describe('MCP sh_ui_create_project — vite acceptance', () => {
  it('CREATE_PLATFORMS exposes vite to MCP schema', () => {
    const schema = z.enum(CREATE_PLATFORMS);
    expect(schema.safeParse('vite').success).toBe(true);
  });

  it('structure enum accepts standalone and monorepo for vite', () => {
    const schema = z.enum(CREATE_STRUCTURES);
    expect(schema.safeParse('standalone').success).toBe(true);
    expect(schema.safeParse('monorepo').success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm --filter sh-ui-cli test mcp-create-vite.test.js`
Expected: PASS (constants already changed in Task 1; this test locks in the contract).

- [ ] **Step 4: Update MCP `sh_ui_create_project` description string**

In `packages/cli/src/mcp.mjs` line 369:

```js
        "빈 폴더에 sh-ui 프로젝트 스캐폴드 — Next.js (standalone/monorepo) | Vite (standalone/monorepo) | Flutter. " +
```

- [ ] **Step 5: Update MCP `structure` requirement guard**

In `packages/cli/src/mcp.mjs` around line 400, find:

```js
      if (input.platform === "next" && !input.structure) {
```

Change to:

```js
      if ((input.platform === "next" || input.platform === "vite") && !input.structure) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `platform=${input.platform} 일 때 structure ('standalone' | 'monorepo') 가 필요합니다.`,
            },
          ],
        };
      }
```

(Delete the old `next`-only error message — the templated one above covers both.)

- [ ] **Step 6: Update `sh_ui_describe_template` description if needed**

In `packages/cli/src/mcp.mjs` around line 816-823, the `structure` describe field. Mirror the standalone | monorepo description for vite. If the existing text says "platform=next 일 때 의미", expand to "platform=next | vite 일 때 의미".

- [ ] **Step 7: Run all CLI tests to make sure nothing regressed**

Run: `pnpm --filter sh-ui-cli test`
Expected: all green, including new vite tests + all prior next/flutter tests.

- [ ] **Step 8: Commit**

```bash
git add packages/cli/src/mcp.mjs packages/cli/test/mcp-create-vite.test.js packages/cli/src/create/cli-args.js
git commit -m "feat(cli): MCP sh_ui_create_project + describe_template accept vite"
```

---

## Task 10: Phase 1 verification — full standalone smoke

**Files:** none new

- [ ] **Step 1: Run full CLI test suite**

Run: `pnpm --filter sh-ui-cli test`
Expected: ALL pass. Note any unexpected failures and fix root cause before moving on.

- [ ] **Step 2: Manual scaffold + dev test**

```bash
cd /tmp && rm -rf vite-smoke && \
  node /Users/gimsanghyeon/development/PROJECT/sh-ui/packages/cli/bin/sh-ui.mjs \
  create vite-smoke --platform vite --structure standalone --arch fsd --css tailwind --yes
cd vite-smoke && pnpm install && pnpm typecheck && pnpm build
```

Expected: install succeeds, `tsc -b` passes, `vite build` produces `dist/` with `index.html` and bundled assets.

- [ ] **Step 3: Dev server smoke**

```bash
cd /tmp/vite-smoke && pnpm dev &
sleep 4 && curl -s http://localhost:5173/ | grep -q 'sh-ui app' && echo OK || echo FAIL
kill %1
```

Expected: `OK` — vite server returns `index.html` with the title.

- [ ] **Step 4: Commit any fixes from step 1-3**

If steps 1-3 surface bugs, fix them in the relevant template/generator file and commit with `fix(cli): <what>`. If clean, skip the commit.

---

## Task 11: vite-app template for monorepo (Phase 2)

**Note:** Phase 2 begins. If implementation budget is tight, stop here and ship v0.86.0 with Phase 1 only — defer Phase 2 to v0.87.

**Files:**
- Create: `packages/cli/templates/vite-app/` (parallel to `nextjs-app/`)
- The directory structure mirrors `vite-standalone/` exactly. Key differences from `vite-standalone`:
  - `package.json` name uses workspace alias `@workspace/ui-{name}` for the CSS import
  - `vite.config.ts` adds an alias for `@workspace/ui-core/*`
  - tokens.css is NOT in this template — it lives in `packages/ui/ui-apps/ui-{name}/src/styles/tokens.css` (just like next-app)

- [ ] **Step 1: Copy vite-standalone as starting point**

```bash
cp -R packages/cli/templates/vite-standalone packages/cli/templates/vite-app
```

- [ ] **Step 2: Modify `vite-app/package.json`** to use workspace deps:

Replace direct deps like `"react": "^19.2.4"` with workspace-aware references. Mirror `packages/cli/templates/nextjs-app/package.json` shape. Run `cat packages/cli/templates/nextjs-app/package.json` first to see the exact shape, then apply the same pattern.

- [ ] **Step 3: Modify `vite-app/vite.config.ts`** to add workspace alias:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@workspace/ui-core': path.resolve(__dirname, '../../packages/ui/ui-core/src'),
      '@workspace/ui-{{app_name}}': path.resolve(__dirname, '../../packages/ui/ui-apps/ui-{{app_name}}/src'),
    },
  },
  server: { port: 3000 },
});
```

`{{app_name}}` is replaced by `replaceInAllFiles` at scaffold time.

- [ ] **Step 4: Modify `_arch/{flat,fsd}/src/main.tsx`** to import tokens from ui-app:

For fsd overlay:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@workspace/ui-{{app_name}}/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Same change for flat overlay (path differs only in alias suffix).

- [ ] **Step 5: Remove tokens.css from vite-app overlays**

```bash
rm packages/cli/templates/vite-app/_arch/flat/src/lib/styles/tokens.css
rm packages/cli/templates/vite-app/_arch/fsd/src/shared/styles/tokens.css
```

(They live in `packages/ui/ui-apps/ui-{name}/src/styles/tokens.css` instead — emitted by the existing `ui-app-template` infrastructure.)

- [ ] **Step 6: Rebuild manifest**

```bash
pnpm --filter sh-ui-cli build:manifest
```

- [ ] **Step 7: Commit**

```bash
git add packages/cli/templates/vite-app packages/cli/src/create/templateManifest.js
git commit -m "feat(cli): add vite-app template for monorepo workspace"
```

---

## Task 12: Wire `generateMonorepo` to support `platform: 'vite'`

**Files:**
- Modify: `packages/cli/src/create/generator.js:693` (function `generateMonorepo`)
- Modify: `packages/cli/src/create/generator.js:764` (function `generateApp`)

- [ ] **Step 1: Write the failing test**

Append to smoke.test.js:

```js
  it('scenario V5 — vite monorepo, fsd, web app', async () => {
    await createProject({
      name: 'my-vite-mono',
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      css: 'tailwind',
      yes: true,
    });

    const projectDir = path.join(tmpDir, 'my-vite-mono');
    expect(await fs.pathExists(path.join(projectDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/vite.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'apps/web/next.config.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-core/src'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'packages/ui/ui-apps/ui-web/src/styles/tokens.css'))).toBe(true);

    const appPkg = await fs.readJson(path.join(projectDir, 'apps/web/package.json'));
    expect(appPkg.devDependencies.vite).toBeDefined();
  });
```

- [ ] **Step 2: Add `platform` parameter to `generateMonorepo` signature**

In `packages/cli/src/create/generator.js` line 693, change:

```js
async function generateMonorepo(targetDir, projectName, plugins, { yes = false, theme, css, arch, themeBase } = {}) {
```

to:

```js
async function generateMonorepo(targetDir, projectName, plugins, { yes = false, theme, css, arch, themeBase, platform = 'next' } = {}) {
```

- [ ] **Step 3: Branch `generateApp` call by platform**

In `generateMonorepo`, find the line `await generateApp(appsDir, appName, port, plugins, arch, css);` (around line 719). Replace with:

```js
  if (platform === 'vite') {
    await generateViteApp(appsDir, appName, port, arch, css);
  } else {
    await generateApp(appsDir, appName, port, plugins, arch, css);
  }
```

- [ ] **Step 4: Add `generateViteApp` function**

Insert immediately after `generateApp` (around line 870) in `packages/cli/src/create/generator.js`:

```js
async function generateViteApp(targetDir, appName, port, arch, css = 'tailwind') {
  // 베이스 (arch-neutral) + arch 오버레이 — generateApp 과 동일 패턴.
  await fs.copy(path.join(TEMPLATES_DIR, 'vite-app'), targetDir, {
    filter: (src) => !src.includes(`${path.sep}_arch${path.sep}`) && !src.endsWith(`${path.sep}_arch`),
  });
  await ensureArchCleanup(targetDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, 'vite-app', '_arch', arch.name),
    targetDir,
    { overwrite: true },
  );
  await assertArchOverlayApplied(targetDir, arch);

  await replaceInAllFiles(targetDir, '{{app_name}}', appName);
  await replaceInAllFiles(targetDir, '{{port}}', port);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = appName;
  if (pkg.dependencies) pkg.dependencies = sortObjectKeys(pkg.dependencies);
  if (pkg.devDependencies) pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // vite-app 도 ui-app-template 기반의 ui-{name} 패키지를 emit해야 토큰 + 스타일 진입점이
  // workspace 로부터 import 가능. emitUiAppPackage 는 next/vite 양쪽이 공유하는 헬퍼.
  const uiAppDir = path.resolve(targetDir, '..', '..', 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  await emitUiAppPackage(uiAppDir, appName);

  await applyCssFrameworkVariant(targetDir, css, { isMonorepo: true, plugins: [], arch });
}
```

> Note: `emitUiAppPackage` doesn't yet exist as an extracted helper — the existing `generateApp` and post-call `injectCssTheme(uiAppDir, theme)` in `generateMonorepo` handles ui-app creation indirectly via the `ui-app-template` copy. Easier path: don't extract; instead reuse the existing post-`generateApp` block in `generateMonorepo` that copies `ui-app-template` and writes `sh-ui.config.json`. See Step 5.

- [ ] **Step 5: Reuse existing ui-app-template emit in generateMonorepo**

Look at `generateMonorepo` (line 720-740). The existing code:

```js
  const uiAppDir = path.join(targetDir, 'packages', 'ui', 'ui-apps', `ui-${appName}`);
  await injectCssTheme(uiAppDir, theme);
  await patchShUiConfig(path.join(uiAppDir, 'sh-ui.config.json'), css, themeBase);
```

This assumes `generateApp` (or `generateViteApp`) has already copied the `ui-app-template` directory to `packages/ui/ui-apps/ui-${appName}`. Check whether `generateApp` does this copy. Run:

```bash
grep -n "ui-app-template\|ui-apps" packages/cli/src/create/generator.js | head -20
```

If `generateApp` copies `ui-app-template`, REMOVE the corresponding code from `generateViteApp` above (it's redundant). If it does NOT (i.e. `generateMonorepo` itself does it), then `generateViteApp` does not need to emit the ui-app — `generateMonorepo` handles it. Adjust `generateViteApp` accordingly: remove the `emitUiAppPackage` call.

(This is a "find and adapt" step — the actual edit depends on what the grep reveals. Either way, the goal is: ui-{name} package emit happens exactly once per monorepo create.)

- [ ] **Step 6: Run the monorepo test**

Run: `pnpm --filter sh-ui-cli test smoke.test.js -t "scenario V5"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/create/generator.js packages/cli/test/smoke.test.js
git commit -m "feat(cli): generateMonorepo + generateViteApp for vite monorepo"
```

---

## Task 13: Update `describeTemplate` for vite monorepo + final test sweep

**Files:**
- Modify: `packages/cli/src/create/describeTemplate.js` (extend vite branch)

- [ ] **Step 1: Extend vite branch to handle monorepo structure**

In the vite branch added in Task 8, change the early `const templateKey = 'vite-standalone';` to:

```js
    if (structure === 'monorepo') {
      // Mirror next-monorepo path: aggregate base + ui-app-template + vite-app + arch overlay
      const baseFiles = TEMPLATE_MANIFEST['monorepo'].base.slice();
      const uiAppFiles = TEMPLATE_MANIFEST['ui-app-template'].base.map(
        (p) => `packages/ui/ui-apps/ui-${appName ?? 'web'}/${p}`,
      );
      const viteAppTpl = TEMPLATE_MANIFEST['vite-app'];
      if (!viteAppTpl) throw new Error("Template manifest missing 'vite-app'.");
      const archName = arch && isKnownArch(arch) ? arch : DEFAULT_ARCH;
      const viteAppBase = viteAppTpl.base.map((p) => `apps/${appName ?? 'web'}/${p}`);
      const viteAppArch = (viteAppTpl.arches?.[archName] ?? []).map(
        (p) => `apps/${appName ?? 'web'}/${p}`,
      );
      const files = [...new Set([...baseFiles, ...uiAppFiles, ...viteAppBase, ...viteAppArch])].sort();
      return {
        files,
        groups: [
          { id: 'base', label: '베이스 (monorepo)', paths: baseFiles.sort() },
          { id: 'ui-app', label: `ui-${appName ?? 'web'}`, paths: uiAppFiles.sort() },
          { id: `app-${appName ?? 'web'}`, label: `apps/${appName ?? 'web'}`, paths: [...viteAppBase, ...viteAppArch].sort() },
        ],
      };
    }
    // standalone fallthrough — code from Task 8 stays
```

- [ ] **Step 2: Add monorepo test**

Append to describe-template.test.js:

```js
  it('vite + monorepo + fsd returns vite-app paths under apps/web/', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      cssFramework: 'tailwind',
      appName: 'web',
    });
    expect(result.files.some((f) => f.startsWith('apps/web/'))).toBe(true);
    expect(result.files.some((f) => f.startsWith('packages/ui/ui-apps/ui-web/'))).toBe(true);
    expect(result.files.some((f) => f === 'apps/web/vite.config.ts')).toBe(true);
  });
```

- [ ] **Step 3: Run all tests**

Run: `pnpm --filter sh-ui-cli test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/create/describeTemplate.js packages/cli/test/describe-template.test.js
git commit -m "feat(cli): describeTemplate handles vite monorepo"
```

---

## Task 14: versions.json + version bump + docs

**Files:**
- Modify: `packages/changelog/versions.json` (prepend)
- Modify: `packages/cli/package.json` (`"version": "0.86.0"`)
- Modify: `packages/cli/src/api.js` (if it has a `VERSION` constant — search first)

- [ ] **Step 1: Bump CLI version**

In `packages/cli/package.json`, change `"version": "0.85.1"` to `"version": "0.86.0"`.

- [ ] **Step 2: Check for version constants elsewhere**

```bash
grep -rn "0\.85\.1" packages/cli/src/ packages/cli/bin/ 2>/dev/null
```

If any other file hardcodes the version (e.g. `--version` output), update to `0.86.0`.

- [ ] **Step 3: Prepend versions.json entry**

In `packages/changelog/versions.json`, add at the top of the `versions` array:

```json
{
  "version": "0.86.0",
  "date": "2026-05-14",
  "title": "Vite 플랫폼 프리셋 — sh_ui_create_project platform=vite",
  "type": "minor",
  "highlights": [
    "sh-ui-cli create --platform vite — Vite 5 + React 19 + Tailwind v4 SPA 스캐폴드 (Tauri 셸 wrap 대비)",
    "standalone + monorepo 둘 다 지원, flat / fsd arch 호환",
    "self-rolled useTheme 훅 + ThemeProvider (next-themes 무관) + FOUC-free 초기 색상 결정",
    "MCP sh_ui_create_project / sh_ui_describe_template 둘 다 platform=vite 인식"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.86.0"
}
```

- [ ] **Step 4: Run final typecheck across workspace**

```bash
pnpm typecheck
```

Expected: green.

- [ ] **Step 5: Commit (release commit — bundled per repo convention)**

```bash
git add packages/cli/package.json packages/changelog/versions.json
git commit -m "release: v0.86.0 — Vite 플랫폼 프리셋"
```

---

## Task 15: Push, PR to live, merge, tag

**Files:** none — git workflow only.

- [ ] **Step 1: Push dev**

```bash
git push origin dev
```

- [ ] **Step 2: Create PR to live**

```bash
gh pr create --base live --head dev \
  --title "release: v0.86.0 — Vite 플랫폼 프리셋" \
  --body "$(cat <<'EOF'
## Summary

- `sh-ui-cli create --platform vite` 추가 — Vite 5 + React 19 + Tailwind v4
- standalone + monorepo 둘 다 지원, flat / fsd arch 호환
- self-rolled `useTheme` 훅 + ThemeProvider (next-themes 무관)
- MCP `sh_ui_create_project` / `sh_ui_describe_template` platform=vite 인식

## Test plan

- [x] `pnpm --filter sh-ui-cli test` — vite standalone (flat/fsd), monorepo, theme injection
- [x] 수동 scaffold + `pnpm dev` 으로 5173 응답 확인
- [x] `pnpm typecheck` 워크스페이스 전역 그린

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Wait for CI to pass**

Run: `gh pr checks --watch`
Expected: all green.

- [ ] **Step 4: Merge PR (merge commit, NOT squash)**

```bash
gh pr merge --merge
```

> Critical: merge commit only. Squash breaks the publish.yml ancestor guard (memory: [sh-ui release 함정]).

- [ ] **Step 5: Pull live + tag from live**

```bash
git checkout live && git pull origin live
git log -1 --oneline  # confirm HEAD is the release merge commit
git tag v0.86.0 && git push origin v0.86.0
```

- [ ] **Step 6: Verify publish.yml + release.yml fired**

```bash
gh run list --workflow=publish.yml --limit 3
gh run list --workflow=release.yml --limit 3
```

Expected: most recent run on tag v0.86.0 is in_progress or completed.

- [ ] **Step 7: Sync dev with live merge commit**

```bash
git checkout dev && git merge live && git push origin dev
```

- [ ] **Step 8: Confirm npm publish**

```bash
npm view sh-ui-cli version
```

Expected: `0.86.0`.

---

## Self-Review

### Spec coverage check

| Spec item | Covered by |
|---|---|
| Vite 5+ / React 18+ / TypeScript 5+ | Task 3 package.json — actually React 19 (matches existing repo, no React 18 compat needed) |
| Tailwind v4, same version + config pattern as next | Task 3 (`@tailwindcss/vite` plugin in vite.config.ts; `tailwindcss@^4.1.18`) |
| `sh-ui.config.json` | Tasks 4 + 5 (per-arch) |
| Token emit (globals.css + tailwind config) | Tasks 4 (flat) + 5 (fsd); reuses tokens.css from next equivalents |
| structure: standalone + monorepo | Tasks 6 (standalone) + 12 (monorepo) |
| monorepo: ui-core (no tokens-only marker) | Reuses existing monorepo template; ui-core is unchanged |
| monorepo: `apps/{name}/` (Vite app dir) | Task 11 + 12 |
| theme: self-rolled useTheme (no next-themes) | Task 4 Step 7 + Task 5 Step 7 (ThemeProvider); Task 4 Step 8 + Task 5 Step 9 (useTheme) |
| MCP `platform` enum + CLI parity | Tasks 1, 9 |
| `@source` paths for ui-core in monorepo Tailwind config | Inherited from existing nextjs-app template via `ui-app-template` — not re-emitted in vite-app since shared infrastructure |
| Registry has no theme | Theme lives only in app's `ThemeProvider.tsx` (Task 4 Step 7); registry components consume tokens, no theme provider in registry |
| Base UI render-prop slots, no nested button | No new Base UI usage in template — Home.tsx is a stub div. Compliance is enforced by sh-ui registry which is unchanged |
| One-shot rule | Theme/css/arch all locked at create time; no post-create patching |
| release procedure (PR merge → tag from live) | Task 15 |
| merge_commit only (not squash) | Task 15 Step 4 (`--merge`, not `--squash`) |

### Placeholder scan

- No "TBD" / "implement later" / "fill in details" / "similar to Task N" / undefined types — verified.
- Task 11 Step 2 ("see nextjs-app shape") is a "find-and-adapt" instruction, not a placeholder — the exact file is named and the modification rule is concrete.
- Task 12 Step 5 ("find and adapt") similarly — explicit grep + decision rule.

### Type/name consistency

- `generateViteStandalone` referenced in Task 6 Step 4 + defined in Task 6 Step 3 ✓
- `generateViteApp` referenced in Task 12 Step 3 + defined in Task 12 Step 4 ✓
- `useTheme` exports a hook returning `{ theme, resolvedTheme, setTheme }` — consistent in flat (Task 4 Step 7-8) and fsd (Task 5 Step 7+9) ✓
- `ThemeContext` defined in `ThemeProvider.tsx` and consumed in `useTheme.ts` ✓
- `cn` from `utils.ts` not referenced in this plan's tasks — but consistent with sh-ui registry convention ✓
- `createQueryClient` defined in `queryClient.ts`, consumed in `GlobalProvider/index.tsx` ✓

### Scope guardrails

- **Out of scope (intentional):** Tauri integration, vite-specific plugins (sentry/auth-jwt parity), css-modules variant tests for vite, FOUC script behavior unit tests, vite-app monorepo support if Phase 2 deferred.
- **Phase cut:** If Task 11-13 prove painful, ship Phase 1 only with versions.json title updated to "Vite 플랫폼 프리셋 (standalone)" and a follow-up issue for monorepo.

---
