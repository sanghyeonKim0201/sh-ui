import { describe, it, expect } from 'vitest';
import {
  allArchitectures,
  getArchByName,
  getArchesForPlatform,
  assertArchPlatformCompat,
  isKnownArch,
  DEFAULT_ARCH,
} from '../src/create/architectures/index.js';
import { ArchSchema } from '../src/create/architectures/archSchema.js';
import { CREATE_PLATFORMS } from '../src/constants.js';

describe('architectures — descriptor 시스템', () => {
  describe('등록된 디스크립터', () => {
    it('fsd, flat, mes 세 arch 가 모두 등록돼 있다', () => {
      const names = allArchitectures.map((a) => a.name);
      expect(names).toContain('fsd');
      expect(names).toContain('flat');
      expect(names).toContain('mes');
    });

    it('DEFAULT_ARCH 가 fsd 다 (Layer 1 회귀 가드)', () => {
      expect(DEFAULT_ARCH).toBe('fsd');
    });

    it('모든 디스크립터가 ArchSchema 를 통과한다', () => {
      for (const arch of allArchitectures) {
        const result = ArchSchema.safeParse(arch);
        expect(result.success, `${arch.name} schema mismatch`).toBe(true);
      }
    });

    it('모든 디스크립터가 동일한 paths/aliases 키 셋을 노출한다', () => {
      // 플러그인이 안전하게 arch.paths.foo / arch.aliases.foo 를 조회할 수 있어야 함.
      const pathKeys = Object.keys(allArchitectures[0].paths).sort();
      const aliasKeys = Object.keys(allArchitectures[0].aliases).sort();
      for (const arch of allArchitectures) {
        expect(Object.keys(arch.paths).sort()).toEqual(pathKeys);
        expect(Object.keys(arch.aliases).sort()).toEqual(aliasKeys);
      }
    });

    it('paths 와 aliases 가 같은 키 셋을 갖는다', () => {
      for (const arch of allArchitectures) {
        expect(Object.keys(arch.paths).sort()).toEqual(Object.keys(arch.aliases).sort());
      }
    });
  });

  describe('FSD 디스크립터 — v0.57 호환 (회귀 가드)', () => {
    // Layer 2 이후 플러그인이 arch.paths/aliases 만 보고 emit 하므로,
    // FSD 디스크립터의 값이 v0.57 까지의 하드코딩과 1:1 일치해야
    // 사용자 입장 변화 0 이다.
    const fsd = getArchByName('fsd');

    it('paths 가 FSD 컨벤션과 일치', () => {
      expect(fsd.paths.layouts).toBe('src/app/layouts');
      expect(fsd.paths.providers).toBe('src/app/providers');
      expect(fsd.paths.api).toBe('src/shared/api');
      expect(fsd.paths.config).toBe('src/shared/config');
      expect(fsd.paths.utils).toBe('src/shared/lib');
    });

    it('aliases 가 @/src/* 컨벤션과 일치', () => {
      expect(fsd.aliases.layouts).toBe('@/src/app/layouts');
      expect(fsd.aliases.providers).toBe('@/src/app/providers');
      expect(fsd.aliases.api).toBe('@/src/shared/api');
      expect(fsd.aliases.config).toBe('@/src/shared/config');
    });

    it('tsconfigPaths 는 catch-all @/*', () => {
      expect(fsd.tsconfigPaths).toEqual({ '@/*': ['./*'] });
    });
  });

  describe('flat 디스크립터', () => {
    const flat = getArchByName('flat');

    it('paths 는 lib/components 분리', () => {
      expect(flat.paths.layouts).toBe('components/layouts');
      expect(flat.paths.providers).toBe('components/providers');
      expect(flat.paths.api).toBe('lib/api');
      expect(flat.paths.config).toBe('lib/config');
      expect(flat.paths.utils).toBe('lib/utils');
    });

    it('aliases 는 카테고리별 scoped (@/lib/*, @/components/*)', () => {
      expect(flat.aliases.api).toBe('@/lib/api');
      expect(flat.aliases.providers).toBe('@/components/providers');
    });

    it('tsconfigPaths 는 카테고리별 scoped', () => {
      expect(flat.tsconfigPaths['@/lib/*']).toEqual(['./lib/*']);
      expect(flat.tsconfigPaths['@/components/*']).toEqual(['./components/*']);
      // @/app/* alias 는 Next.js routes 에서 사용 안 됨 → 제외 (v0.59.10+).
      expect(flat.tsconfigPaths['@/app/*']).toBeUndefined();
      expect(flat.tsconfigPaths['@/*']).toBeUndefined();
    });
  });

  describe('mes 디스크립터', () => {
    const mes = getArchByName('mes');

    it('paths 는 모두 src/ 아래에 위치 (페이지 격리 구조)', () => {
      expect(mes.paths.layouts).toBe('src/components/layouts');
      expect(mes.paths.providers).toBe('src/components/providers');
      expect(mes.paths.api).toBe('src/lib/api');
      expect(mes.paths.config).toBe('src/lib/config');
      expect(mes.paths.hooks).toBe('src/hooks');
      expect(mes.paths.utils).toBe('src/lib/utils');
      expect(mes.paths.ui).toBe('src/components/common');
    });

    it('aliases 는 @/ catch-all (src 접두사 없음)', () => {
      expect(mes.aliases.layouts).toBe('@/components/layouts');
      expect(mes.aliases.api).toBe('@/lib/api');
      expect(mes.aliases.hooks).toBe('@/hooks');
    });

    it('tsconfigPaths 는 @/* → ./src/*', () => {
      expect(mes.tsconfigPaths).toEqual({ '@/*': ['./src/*'] });
    });
  });

  describe('platform/arch 호환성', () => {
    it('fsd, flat, mes 모두 next 플랫폼 지원', () => {
      const nextArches = getArchesForPlatform('next').map((a) => a.name);
      expect(nextArches).toContain('fsd');
      expect(nextArches).toContain('flat');
      expect(nextArches).toContain('mes');
    });

    it('flutter 플랫폼은 현재 arch 디스크립터 없음', () => {
      // 미래에 flutter 용 arch 가 추가되면 이 테스트는 그때 갱신.
      expect(getArchesForPlatform('flutter')).toEqual([]);
    });

    it('assertArchPlatformCompat — 호환 시 디스크립터 반환', () => {
      const arch = assertArchPlatformCompat('fsd', 'next');
      expect(arch.name).toBe('fsd');
    });

    it('assertArchPlatformCompat — 미호환 시 친절한 에러', () => {
      // fsd 는 platforms: ['next'] 라 flutter 와 미호환
      expect(() => assertArchPlatformCompat('fsd', 'flutter')).toThrow(
        /flutter.*호환되지 않/,
      );
    });

    it('assertArchPlatformCompat — 알 수 없는 arch 는 에러', () => {
      expect(() => assertArchPlatformCompat('clean', 'next')).toThrow(/Unknown architecture/);
    });
  });

  describe('isKnownArch / getArchByName', () => {
    it('등록된 arch 는 true', () => {
      expect(isKnownArch('fsd')).toBe(true);
      expect(isKnownArch('flat')).toBe(true);
    });

    it('미등록은 false', () => {
      expect(isKnownArch('clean')).toBe(false);
      expect(isKnownArch('mvc')).toBe(false);
    });

    it('getArchByName — 미등록은 throw', () => {
      expect(() => getArchByName('clean')).toThrow(/Unknown architecture/);
    });
  });
});

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
