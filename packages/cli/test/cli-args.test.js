import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/create/cli-args.js';

describe('parseArgs', () => {
  it('플래그 없음 → 빈 flags', () => {
    expect(parseArgs(['node', 'create.js'])).toEqual({
      command: 'create',
      flags: {},
      positional: [],
    });
  });

  it('positional name + --platform', () => {
    const r = parseArgs(['node', 'create.js', 'my-app', '--platform', 'next']);
    expect(r.positional).toEqual(['my-app']);
    expect(r.flags.platform).toBe('next');
  });

  it('--structure / --plugins (콤마 분리) / --theme / --yes', () => {
    const r = parseArgs([
      'node', 'create.js', 'x',
      '--platform', 'next',
      '--structure', 'standalone',
      '--plugins', 'next-intl',
      '--theme', 'eyJsaWdodCI6e30=',
      '--yes',
    ]);
    expect(r.flags).toEqual({
      platform: 'next',
      structure: 'standalone',
      plugins: ['next-intl'],
      theme: 'eyJsaWdodCI6e30=',
      yes: true,
    });
  });

  // v0.98.0 — sentry / auth-jwt 플러그인 + --observability 옵션 제거 (breaking).
  // 거부 경로 회귀 가드: 제거된 표면이 다시 통과되면 즉시 실패한다.
  it('--observability 는 제거된 플래그 → 알 수 없는 플래그 에러', () => {
    expect(() =>
      parseArgs(['node', 'create.js', 'x', '--observability', 'sentry']),
    ).toThrow(/알 수 없는 플래그: --observability/);
  });

  it('--plugins sentry 는 거부 (sentry 플러그인 제거됨)', () => {
    expect(() =>
      parseArgs(['node', 'create.js', 'x', '--plugins', 'sentry']),
    ).toThrow(/알 수 없는 플러그인: sentry/);
  });

  it('--plugins auth-jwt 는 거부 (auth-jwt 플러그인 제거됨)', () => {
    expect(() =>
      parseArgs(['node', 'create.js', 'x', '--plugins', 'auth-jwt']),
    ).toThrow(/알 수 없는 플러그인: auth-jwt/);
  });

  it('--plugins next-intl 은 계속 허용', () => {
    const r = parseArgs(['node', 'create.js', 'x', '--plugins', 'next-intl']);
    expect(r.flags.plugins).toEqual(['next-intl']);
  });

  it('add-app / add-component 서브커맨드 인식', () => {
    expect(parseArgs(['node', 'create.js', 'add-app']).command).toBe('add-app');
    expect(parseArgs(['node', 'create.js', 'add-component', 'button']).command).toBe('add-component');
  });

  it('--plugins 빈 문자열 → 빈 배열', () => {
    const r = parseArgs(['node', 'create.js', '--plugins', '']);
    expect(r.flags.plugins).toEqual([]);
  });

  it('알 수 없는 플래그 → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--unknown', 'x']))
      .toThrow(/알 수 없는 플래그/);
  });

  it('--platform 값 누락 → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--platform']))
      .toThrow(/--platform 값 필요/);
  });

  it('--platform 값이 잘못된 enum → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--platform', 'django']))
      .toThrow(/--platform/);
  });

  it('--help / -h → flags.help = true', () => {
    expect(parseArgs(['node', 'create.js', '--help']).flags.help).toBe(true);
    expect(parseArgs(['node', 'create.js', '-h']).flags.help).toBe(true);
  });

  it('--css plain → flags.css = "plain"', () => {
    const r = parseArgs(['node', 'create.js', '--css', 'plain']);
    expect(r.flags.css).toBe('plain');
  });

  it('--css tailwind → flags.css = "tailwind" (SUPPORTED 승격)', () => {
    const r = parseArgs(['node', 'create.js', '--css', 'tailwind']);
    expect(r.flags.css).toBe('tailwind');
  });

  it('--css css-modules → flags.css = "css-modules" (SUPPORTED 승격)', () => {
    const r = parseArgs(['node', 'create.js', '--css', 'css-modules']);
    expect(r.flags.css).toBe('css-modules');
  });

  it('--css vanilla-extract → "곧 지원 예정" 친절 에러 (PLANNED 로 후퇴, button/card/input 파일럿만)', () => {
    expect(() => parseArgs(['node', 'create.js', '--css', 'vanilla-extract']))
      .toThrow(/곧 지원 예정/);
  });

  it('--css garbage → 일반 enum 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--css', 'garbage']))
      .toThrow(/--css/);
  });

  // ─── arch ───

  it('--arch fsd → flags.arch = "fsd"', () => {
    const r = parseArgs(['node', 'create.js', '--arch', 'fsd']);
    expect(r.flags.arch).toBe('fsd');
  });

  it('--arch flat → flags.arch = "flat"', () => {
    const r = parseArgs(['node', 'create.js', '--arch', 'flat']);
    expect(r.flags.arch).toBe('flat');
  });

  it('--arch 미지정 시 flags.arch undefined (generator 가 default fsd 적용)', () => {
    const r = parseArgs(['node', 'create.js', '--platform', 'next']);
    expect(r.flags.arch).toBeUndefined();
  });

  it('--arch 알 수 없는 값 → 친절한 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--arch', 'clean']))
      .toThrow(/--arch/);
  });

  // ─── git-init / no-git-init (v0.102.0+) ───

  it('--no-git-init → flags.gitInit = false', () => {
    const r = parseArgs(['node', 'create.js', '--no-git-init']);
    expect(r.flags.gitInit).toBe(false);
  });

  it('--git-init → flags.gitInit = true', () => {
    const r = parseArgs(['node', 'create.js', '--git-init']);
    expect(r.flags.gitInit).toBe(true);
  });

  it('git-init 플래그 없음 → flags.gitInit undefined (auto 모드)', () => {
    const r = parseArgs(['node', 'create.js', '--platform', 'next']);
    expect(r.flags.gitInit).toBeUndefined();
  });
});
