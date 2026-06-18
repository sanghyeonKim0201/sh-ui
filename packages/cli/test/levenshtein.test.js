import { describe, it, expect } from 'vitest';

const { levenshtein, suggest } = await import('../src/levenshtein.mjs');

describe('levenshtein', () => {
  it('동일 문자열은 0', () => {
    expect(levenshtein('button', 'button')).toBe(0);
  });
  it('한 글자 삭제는 1', () => {
    expect(levenshtein('buton', 'button')).toBe(1);
  });
  it('치환 거리', () => {
    expect(levenshtein('cat', 'cot')).toBe(1);
  });
  it('빈 문자열은 상대 길이', () => {
    expect(levenshtein('', 'abc')).toBe(3);
  });
});

describe('suggest', () => {
  const components = ['button', 'badge', 'card', 'checkbox', 'select'];

  it('가까운 오타에 후보 1개', () => {
    expect(suggest('buton', components)).toEqual(['button']);
  });
  it('거리 초과면 빈 배열', () => {
    expect(suggest('zzzzzz', components)).toEqual([]);
  });
  it('여러 근접 후보는 거리 오름차순, 최대 max개', () => {
    expect(suggest('chekbox', components, { max: 3 })).toEqual(['checkbox']);
  });
  it('정확히 일치하면 그 자신 (거리 0)', () => {
    expect(suggest('card', components)).toEqual(['card']);
  });
});
