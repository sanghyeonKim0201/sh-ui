# Tauri Integration for vite Platform Preset — Design Doc

> **Status:** DRAFT — design discussion, not an implementation plan. Author wants user confirmation on the 5 open questions below before writing tasks.

**Goal:** Let `sh_ui_create_project platform=vite tauri=true` (and `sh-ui-cli create --platform vite --tauri`) scaffold a Vite SPA wrapped in a Tauri 2.x desktop shell, ready to `pnpm tauri dev` on first launch.

**Why:** ai-org (and adjacent "AI workers organized like a team" desktop apps) wants a local-first product. Vite SPA + Tauri shell is the cheapest path to a cross-platform native window with file-system + shell access. v0.86.0 ships the vite SPA half. This PR closes the loop by emitting the Tauri half at the same scaffold step — no manual `cargo tauri init` after.

---

## Open design questions (need user input)

### Q1. Rust toolchain assumption

`cargo tauri init` and `pnpm tauri dev` both require a working Rust toolchain (`cargo`, `rustc`). Three policy options:

- **(a) Assume installed** — scaffold emits `src-tauri/` files directly (Cargo.toml, tauri.conf.json, main.rs). If user has no Rust, first `pnpm tauri dev` fails with rustc not found, and we print a friendly link to `https://rustup.rs/`.
- **(b) Detect-and-prompt** — `create_project` runs `cargo --version` before emitting; if absent, prints rustup install instructions and asks confirmation to proceed. Interactive prompt only in TTY; non-TTY (MCP/agent) errors out.
- **(c) Shell-out to `cargo tauri-cli`** — run `cargo install tauri-cli` then `cargo tauri init` inside the scaffold. Most "automatic" but assumes cargo present AND adds 30–60s to scaffold time.

**Recommendation: (a).** Matches sh-ui-cli's existing posture (we don't check `node --version` either; we just emit `package.json` with `engines.node >= 20` and trust). Lowest scaffold-time overhead. Friendliest error UX is a single line in the success message: "Rust toolchain (rustc + cargo) 가 필요합니다 — 없으면 https://rustup.rs/ 참고".

### Q2. Where do Tauri files live in the scaffold?

Two layouts. **Pick one** and stick with it across all archs:

- **(a) `src-tauri/` sibling of `src/`** — Tauri 2.x default. Rust crate at `src-tauri/`, `src-tauri/tauri.conf.json` points at `frontendDist: "../dist"` and `devUrl: "http://localhost:5173"`.
- **(b) `apps/desktop/`** — moves Tauri into its own workspace (only when `platform=vite tauri=true structure=monorepo`). Vite app stays at `apps/web/`. Cleaner for monorepo but adds workspace member + tauri-build complexity.

**Recommendation: (a)** for both standalone and monorepo. (b) is over-architecture for v1; users who want monorepo Tauri can do `mv src-tauri ../desktop` themselves.

### Q3. What does `tauri.conf.json` declare out of the box?

Minimum viable config:
- `build.beforeDevCommand: "pnpm dev"`
- `build.beforeBuildCommand: "pnpm build"`
- `build.devUrl: "http://localhost:5173"`
- `build.frontendDist: "../dist"`
- `app.windows[0]`: title=`"{projectName}"`, width=`1200`, height=`800`
- `bundle.identifier: "app.{projectName}.dev"` (placeholder — user must change before shipping)

**Open question:** do we pre-populate any `permissions`/`allowlist` policies? Tauri 2.x ACL is granular (filesystem read, dialog, shell-open, etc.). Recommend: empty allowlist (most secure). User opts in via Tauri docs.

### Q4. Bundle identifier collision

`bundle.identifier` must be globally unique. We can't pick a real one for the user. Two paths:

- **(a) Emit `"app.{projectName}.dev"`** with a comment in `tauri.conf.json` telling the user to change before `tauri build`. Fast but easy to forget — if user ships under `app.my-app.dev`, that's a real bundle ID polluting Tauri's namespace.
- **(b) Refuse to emit** without `--bundle-id com.acme.myapp` flag. Forces the user to think about it. Friction at scaffold time but no foot-gun later.

**Recommendation: (a)** with a loud `TODO` sentinel comment. Match sh-ui's "scaffolders should not block on long-tail decisions" posture.

### Q5. Tauri 1.x vs 2.x

Tauri 2.0 stable shipped 2024-10. 2.x is the future, has mobile (iOS/Android) support, new ACL system. 1.x still ships security patches but no new features.

**Recommendation: 2.x only.** Don't carry 1.x baggage into a v0.87 feature. If a user is on a stale Tauri ecosystem, they shouldn't be scaffolding via sh-ui-cli.

---

## Implementation sketch (assuming the 5 recommendations above)

### Files to add

```
packages/cli/templates/vite-standalone/_tauri/
├── tauri.conf.json                         # devUrl 5173, frontendDist ../dist
├── Cargo.toml                              # tauri 2, tauri-build 2
├── build.rs                                # standard tauri build script
├── src/main.rs                             # standard tauri main + invoke handler skeleton
├── icons/                                  # generic icon set (icon.png + .ico + .icns)
│   └── icon.png                            # 512x512 placeholder
└── .gitignore                              # target/, gen/
```

These get copied to `<project>/src-tauri/` when `tauri=true`. Separate `_tauri/` subdirectory (not `_arch/` overlay) because Tauri lives in BOTH flat and fsd arches identically.

### Generator changes

```js
async function generateViteStandalone(targetDir, projectName, theme, css, arch, themeBase, { tauri = false } = {}) {
  // ... existing standalone scaffold
  if (tauri) {
    await emitTauri(targetDir, projectName);
    // patch package.json with tauri scripts + devDeps
    pkg.scripts.tauri = 'tauri';
    pkg.scripts['tauri:dev'] = 'tauri dev';
    pkg.scripts['tauri:build'] = 'tauri build';
    pkg.devDependencies['@tauri-apps/cli'] = '^2.0.0';
    pkg.dependencies['@tauri-apps/api'] = '^2.0.0';
  }
}

async function emitTauri(targetDir, projectName) {
  await fs.copy(path.join(TEMPLATES_DIR, 'vite-standalone', '_tauri'), path.join(targetDir, 'src-tauri'));
  // {{project_name}} replacement in Cargo.toml, tauri.conf.json
  await replaceInAllFiles(path.join(targetDir, 'src-tauri'), '{{project_name}}', projectName);
}
```

### MCP schema

Add `tauri: z.boolean().optional()` to `sh_ui_create_project` input schema. Update description to mention it.

### CLI args

Add `--tauri` flag (boolean, no value). Forward to `createProject({ tauri: true })`.

### Smoke tests

- `vite-standalone + tauri=true emits src-tauri/`
- `vite-standalone + tauri=true patches package.json scripts`
- structure assertion: `tauri.conf.json` contains the expected `devUrl: 5173`

NO actual `pnpm tauri build` in CI — Rust toolchain isn't guaranteed in CI containers and the build is slow (3-5 min cold).

### Tasks

If the design is approved, the implementation breaks into ~5 tasks:

1. Create `_tauri/` template files (Cargo.toml, tauri.conf.json, main.rs, build.rs, icons placeholders)
2. Extend `generateViteStandalone` signature to accept `{ tauri }` option + emit src-tauri/ + patch package.json
3. Wire `tauri` option through `createProject` + cli-args + MCP `sh_ui_create_project` schema
4. Smoke tests (3 cases above)
5. versions.json + version bump + release flow

**Estimated:** half-day of subagent work for the 5 tasks + manual verification (scaffold → `cargo --version` check → `pnpm tauri dev` smoke).

---

## Scope cuts

Things **out of scope** for the first Tauri PR:

- **Tauri sidecar binaries** — embedding a Rust binary in the bundle. Power-user feature.
- **Mobile (iOS/Android)** — Tauri 2.x supports it but cross-platform mobile is a separate project entirely.
- **`@tauri-apps/plugin-*`** auto-install — e.g. `plugin-dialog`, `plugin-fs`. Let users `pnpm add` what they need.
- **Vite-monorepo + Tauri** combo. Standalone only for v1. Monorepo + Tauri lands in a v0.88+ PR if requested.
- **Custom icon generation** — ship one generic placeholder `icon.png`; user replaces with their brand. No `tauri icon` invocation at scaffold time.

---

## User decision needed

Please confirm:

1. **Q1 Rust toolchain:** (a) assume / (b) detect / (c) auto-install? — *recommend (a)*
2. **Q2 layout:** `src-tauri/` sibling? — *recommend yes*
3. **Q3 ACL/permissions:** empty default? — *recommend yes*
4. **Q4 bundle identifier:** placeholder with TODO? — *recommend yes*
5. **Q5 Tauri 2.x only:** confirm? — *recommend yes*

If all five recommendations are accepted, this becomes a 5-task implementation plan that lands as `v0.88.0` (after v0.87 vite-monorepo). If any answers diverge, the affected tasks need re-design.
