import { describe, it, expect } from 'vitest';
import {
  parseBlocks,
  diffBlocks,
  applyAdditions,
} from '../src/tokens-diff.mjs';

describe('parseBlocks', () => {
  it('단순 :root 블록의 변수 추출', () => {
    const css = ':root { --x: 1; --y: 2; }';
    const blocks = parseBlocks(css);
    expect(blocks).toEqual([{ key: ':root', vars: { '--x': '1', '--y': '2' } }]);
  });

  it('주석 안 변수 무시', () => {
    const css = `:root {
      --x: 1;
      /* --ignored: 9; */
      --y: 2;
    }`;
    const blocks = parseBlocks(css);
    expect(blocks[0].vars).toEqual({ '--x': '1', '--y': '2' });
  });

  it('var(--a, var(--b)) 의 ; 처리 — 위 변수 끝 정확히 인식', () => {
    const css = ':root { --a: var(--b, 1rem); --c: 2; }';
    const blocks = parseBlocks(css);
    expect(blocks[0].vars).toEqual({
      '--a': 'var(--b, 1rem)',
      '--c': '2',
    });
  });

  it('@media 안의 nested selector 도 키로 평탄화', () => {
    const css =
      '@media (prefers-color-scheme: dark) { :root:not(.dark) { --x: 1; } }';
    const blocks = parseBlocks(css);
    expect(blocks).toEqual([
      {
        key: '@media (prefers-color-scheme: dark) > :root:not(.dark)',
        vars: { '--x': '1' },
      },
    ]);
  });
});

describe('diffBlocks', () => {
  it('added / removed / changed / unchanged 분류', () => {
    const cur = parseBlocks(':root { --x: 1; --y: 2; --keep: 9; }');
    const exp = parseBlocks(':root { --x: 1; --y: 3; --new: 4; --keep: 9; }');
    const d = diffBlocks(cur, exp);
    expect(d.added).toEqual([{ selector: ':root', name: '--new', value: '4' }]);
    expect(d.changed).toEqual([
      { selector: ':root', name: '--y', expected: '3', current: '2' },
    ]);
    expect(d.removed).toEqual([]);
    expect(d.unchangedCount).toBe(2); // --x, --keep
  });

  it('current 에만 있는 변수는 removed', () => {
    const cur = parseBlocks(':root { --custom: 1; --x: 9; }');
    const exp = parseBlocks(':root { --x: 9; }');
    const d = diffBlocks(cur, exp);
    expect(d.removed).toEqual([
      { selector: ':root', name: '--custom', value: '1' },
    ]);
  });

  it('같은 selector 가 여러 번 나오면 vars 병합', () => {
    const cur = parseBlocks(':root { --a: 1; } :root { --b: 2; }');
    const exp = parseBlocks(':root { --a: 1; --b: 2; --c: 3; }');
    const d = diffBlocks(cur, exp);
    // 병합 안 됐으면 --a 가 removed (두 번째 :root 가 첫 번째를 덮어서 --b만 남았을 것).
    // 병합되면 --c 만 added.
    expect(d.added).toEqual([{ selector: ':root', name: '--c', value: '3' }]);
    expect(d.removed).toEqual([]);
    expect(d.unchangedCount).toBe(2);
  });
});

describe('applyAdditions', () => {
  it('매칭 selector 가 있으면 닫는 } 직전에 삽입', () => {
    const current = `:root {
  --a: 1;
}`;
    const next = applyAdditions(current, [
      { selector: ':root', name: '--b', value: '2' },
    ]);
    expect(next).toContain('--a: 1;');
    expect(next).toContain('--b: 2;');
    // 삽입이 닫는 } 직전에 들어갔는지
    const aIdx = next.indexOf('--a:');
    const bIdx = next.indexOf('--b:');
    const closeIdx = next.lastIndexOf('}');
    expect(aIdx).toBeLessThan(bIdx);
    expect(bIdx).toBeLessThan(closeIdx);
  });

  it('매칭 selector 가 없으면 새 블록을 끝에 append', () => {
    const current = `:root { --a: 1; }`;
    const next = applyAdditions(current, [
      { selector: '.dark', name: '--b', value: '2' },
    ]);
    expect(next).toContain('--a: 1;');
    expect(next).toMatch(/sh-ui upgrade — added/);
    expect(next).toMatch(/\.dark\s*\{/);
    expect(next).toContain('--b: 2;');
  });

  it('@theme inline 같은 단순 @rule 도 nested 가 아닌 단일 블록으로 처리', () => {
    const current = `:root { --a: 1; }`;
    const next = applyAdditions(current, [
      { selector: '@theme inline', name: '--color-x', value: 'var(--x)' },
    ]);
    // 중첩 @theme inline { @theme inline { ... } } 가 아니어야 함
    const matches = next.match(/@theme inline/g) || [];
    expect(matches.length).toBe(1);
    expect(next).toMatch(/@theme inline\s*\{/);
    expect(next).toContain('--color-x: var(--x);');
  });

  it('빈 added 배열은 원본 그대로', () => {
    const css = ':root { --a: 1; }';
    expect(applyAdditions(css, [])).toBe(css);
  });
});
