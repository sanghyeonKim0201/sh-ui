import { describe, it, expect } from 'vitest';
import { describeTemplate } from '../src/create/describeTemplate.js';

describe('describeTemplate — 옵션 조합 → 파일 트리 사전 계산', () => {
  describe('flutter', () => {
    it('platform=flutter 면 Flutter 베이스만 반환', () => {
      const r = describeTemplate({ platform: 'flutter' });
      expect(r.groups).toHaveLength(1);
      expect(r.groups[0].id).toBe('base');
      expect(r.files).toContain('pubspec.yaml');
      expect(r.files).toContain('lib/main.dart');
    });

    it('flutter 결과는 .ts/.tsx 파일을 포함하지 않는다', () => {
      const r = describeTemplate({ platform: 'flutter' });
      expect(r.files.some((p) => p.endsWith('.tsx'))).toBe(false);
    });
  });

  describe('next standalone — 베이스 + arch', () => {
    it('fsd 기본 — src/shared 슬라이스 경로가 나온다', () => {
      const r = describeTemplate({ platform: 'next', structure: 'standalone' });
      expect(r.files).toContain('app/page.tsx');
      expect(r.files.some((p) => p.startsWith('src/shared/'))).toBe(true);
    });

    it('flat — components/lib 폴더 구조', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        arch: 'flat',
      });
      expect(r.files.some((p) => p.startsWith('components/'))).toBe(true);
      expect(r.files.some((p) => p.startsWith('lib/'))).toBe(true);
      expect(r.files.some((p) => p.startsWith('src/shared/'))).toBe(false);
    });

    it('mes — src/components, src/lib 폴더 구조', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        arch: 'mes',
      });
      expect(r.files.some((p) => p.startsWith('src/components/'))).toBe(true);
      expect(r.files.some((p) => p.startsWith('src/lib/'))).toBe(true);
      expect(r.files.some((p) => p.startsWith('src/shared/'))).toBe(false);
    });

    it('알 수 없는 arch 는 fsd 로 fallback', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        arch: 'totally-bogus',
      });
      expect(r.files.some((p) => p.startsWith('src/shared/'))).toBe(true);
    });
  });

  describe('plugin.files — sentry/next-intl/auth-jwt', () => {
    it('sentry 플러그인 활성화 시 sentry config 파일들이 추가된다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry'],
      });
      expect(r.files).toContain('sentry.server.config.ts');
      expect(r.files).toContain('sentry.edge.config.ts');
      expect(r.files).toContain('instrumentation.ts');
      expect(r.files).toContain('app/error.tsx');
      const sentryGroup = r.groups.find((g) => g.id === 'plugin-sentry');
      expect(sentryGroup).toBeDefined();
      expect(sentryGroup.paths.length).toBeGreaterThan(0);
    });

    it('next-intl 플러그인 활성화 시 i18n 라우팅 파일들이 추가된다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['next-intl'],
      });
      expect(
        r.files.some((p) => p.includes('i18n/routing.ts')),
      ).toBe(true);
    });
  });

  describe('plugin.transforms — 이동(move)', () => {
    it('next-intl + sentry 면 page.tsx / error.tsx 가 [locale]/ 로 이동', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['next-intl', 'sentry'],
      });
      expect(r.files).not.toContain('app/page.tsx');
      expect(r.files).toContain('app/[locale]/page.tsx');
      expect(r.files).not.toContain('app/error.tsx');
      expect(r.files).toContain('app/[locale]/error.tsx');
      // layout.tsx 도 옮겨진다 (next-intl 의 다섯 번째 move)
      expect(r.files).not.toContain('app/layout.tsx');
      expect(r.files).toContain('app/[locale]/layout.tsx');
    });

    it('next-intl 만 활성 (sentry 없음) 이면 error.tsx 이동이 silent skip', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['next-intl'],
      });
      expect(r.files).toContain('app/[locale]/page.tsx');
      // error.tsx 는 sentry 가 emit 하는데 비활성이라 [locale]/error.tsx 도 없어야
      expect(r.files).not.toContain('app/[locale]/error.tsx');
      expect(r.files).not.toContain('app/error.tsx');
    });

    it('auth-jwt + next-intl 이면 sign-in/page.tsx 도 [locale]/ 안으로 이동', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['auth-jwt', 'next-intl'],
      });
      expect(r.files).not.toContain('app/sign-in/page.tsx');
      expect(r.files).toContain('app/[locale]/sign-in/page.tsx');
    });
  });

  describe('cssFramework 분기', () => {
    it('css-modules 면 page.module.css 가 추가된다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        cssFramework: 'css-modules',
      });
      expect(r.files).toContain('app/page.module.css');
    });

    it('css-modules + next-intl 이면 [locale]/page.module.css', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        cssFramework: 'css-modules',
        plugins: ['next-intl'],
      });
      expect(r.files).toContain('app/[locale]/page.module.css');
      expect(r.files).not.toContain('app/page.module.css');
    });

    it('tailwind 기본은 .module.css 를 추가하지 않는다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        cssFramework: 'tailwind',
      });
      expect(r.files.some((p) => p.endsWith('.module.css'))).toBe(false);
    });
  });

  describe('monorepo — 루트 + apps/{name} + ui-app', () => {
    it('monorepo 구조면 apps/web/ 와 packages/ui/ui-apps/ui-web/ prefix 가 박힌다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'monorepo',
        appName: 'web',
      });
      expect(r.files.some((p) => p.startsWith('apps/web/'))).toBe(true);
      expect(
        r.files.some((p) => p.startsWith('packages/ui/ui-apps/ui-web/')),
      ).toBe(true);
      expect(r.files).toContain('pnpm-workspace.yaml');
    });

    it('appName 변경하면 prefix 도 따라간다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'monorepo',
        appName: 'admin',
      });
      expect(r.files.some((p) => p.startsWith('apps/admin/'))).toBe(true);
      expect(
        r.files.some((p) => p.startsWith('packages/ui/ui-apps/ui-admin/')),
      ).toBe(true);
      expect(r.files.some((p) => p.startsWith('apps/web/'))).toBe(false);
    });

    it('monorepo + sentry — sentry 파일들이 apps/{name}/ 아래 들어간다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'monorepo',
        appName: 'web',
        plugins: ['sentry'],
      });
      expect(r.files).toContain('apps/web/sentry.server.config.ts');
      expect(r.files).toContain('apps/web/app/error.tsx');
    });
  });

  describe('출력 형태 보장', () => {
    it('files 는 정렬되어 있다', () => {
      const r = describeTemplate({ platform: 'next', structure: 'standalone' });
      const sorted = [...r.files].sort();
      expect(r.files).toEqual(sorted);
    });

    it('groups 는 빈 그룹을 포함하지 않는다', () => {
      const r = describeTemplate({ platform: 'next', structure: 'standalone' });
      for (const g of r.groups) {
        expect(g.paths.length).toBeGreaterThan(0);
      }
    });

    it('파일 경로는 dedupe 되어 있다 (그룹 간 중복 제거)', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry'],
      });
      // sentry 가 베이스의 observability.ts 를 덮어쓰는데, 트리에는 한 번만 나와야
      const obs = r.files.filter((p) => p.endsWith('/observability.ts'));
      expect(obs.length).toBe(1);
    });

    it('files 는 그룹 paths 의 합집합과 같다', () => {
      const r = describeTemplate({
        platform: 'next',
        structure: 'standalone',
        plugins: ['sentry', 'next-intl'],
      });
      const union = new Set();
      for (const g of r.groups) for (const p of g.paths) union.add(p);
      expect(new Set(r.files)).toEqual(union);
    });

    it('gitignore 는 .gitignore 로 mock-rename (피드백 #3 buglet — finalizeProject 실제 emit 과 1:1)', () => {
      // next monorepo — 루트 template 의 gitignore 가 .gitignore 로.
      const nextMono = describeTemplate({ platform: 'next', structure: 'monorepo' });
      expect(nextMono.files).toContain('.gitignore');
      expect(nextMono.files.some((p) => p.endsWith('/gitignore') || p === 'gitignore')).toBe(false);

      // vite monorepo — 루트 + apps/{name} 둘 다 (vite-app template 도 gitignore 보유).
      const viteMono = describeTemplate({ platform: 'vite', structure: 'monorepo', arch: 'fsd' });
      expect(viteMono.files).toContain('.gitignore');
      expect(viteMono.files).toContain('apps/web/.gitignore');
      expect(viteMono.files.some((p) => p.endsWith('/gitignore') || p === 'gitignore')).toBe(false);

      // vite standalone + tauri — tauri-shell 의 src-tauri/.gitignore 는 이미 점 있음 (보존).
      const viteTauri = describeTemplate({
        platform: 'vite', structure: 'standalone', arch: 'fsd', tauri: true,
      });
      expect(viteTauri.files).toContain('.gitignore');
      expect(viteTauri.files).toContain('src-tauri/.gitignore');
    });
  });
});

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

  it('vite + monorepo + fsd returns monorepo + apps/web + ui-app groups', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'monorepo',
      arch: 'fsd',
      cssFramework: 'tailwind',
      appName: 'web',
    });
    // monorepo 루트
    expect(result.files.some((f) => f === 'pnpm-workspace.yaml')).toBe(true);
    // vite-app 베이스
    expect(result.files.some((f) => f === 'apps/web/vite.config.ts')).toBe(true);
    expect(result.files.some((f) => f === 'apps/web/index.html')).toBe(true);
    // arch 오버레이
    expect(result.files.some((f) => f === 'apps/web/src/main.tsx')).toBe(true);
    // ui-app 패키지
    expect(result.files.some((f) => f === 'packages/ui/ui-apps/ui-web/sh-ui.config.json')).toBe(true);
    expect(result.files.some((f) => f === 'packages/ui/ui-apps/ui-web/src/styles/tokens.css')).toBe(true);
    // next 흔적 없어야 함
    expect(result.files.some((f) => f.includes('next.config.ts'))).toBe(false);

    const groupIds = result.groups.map((g) => g.id);
    expect(groupIds).toContain('monorepo');
    expect(groupIds).toContain('app-base');
    expect(groupIds).toContain('app-arch');
    expect(groupIds).toContain('ui-app');
  });
});

describe('describeTemplate — vite + tauri', () => {
  it('vite + standalone + fsd + tauri:true includes src-tauri/ files', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      cssFramework: 'tailwind',
      tauri: true,
    });
    expect(result.files.some((f) => f === 'src-tauri/Cargo.toml')).toBe(true);
    expect(result.files.some((f) => f === 'src-tauri/tauri.conf.json')).toBe(true);
    expect(result.files.some((f) => f === 'src-tauri/src/main.rs')).toBe(true);
    expect(result.files.some((f) => f.startsWith('src-tauri/'))).toBe(true);

    const tauriGroup = result.groups.find((g) => g.id === 'tauri');
    expect(tauriGroup).toBeDefined();
    expect(tauriGroup.paths.length).toBeGreaterThan(0);
  });

  it('vite + standalone + fsd + tauri:false (default) excludes src-tauri/', () => {
    const result = describeTemplate({
      platform: 'vite',
      structure: 'standalone',
      arch: 'fsd',
      cssFramework: 'tailwind',
    });
    expect(result.files.some((f) => f.startsWith('src-tauri/'))).toBe(false);
    const tauriGroup = result.groups.find((g) => g.id === 'tauri');
    expect(tauriGroup).toBeUndefined();
  });
});
