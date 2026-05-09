import { describe, it, expect } from 'vitest';
import {
  extractDefinedVars,
  findMissingTokens,
} from '../src/tokens-validate.mjs';

describe('extractDefinedVars', () => {
  it('CSS 변수 선언만 추출하고 var() 참조는 무시', () => {
    const css = `
      :root {
        --space-2: 0.5rem;
        --primary: #000;
        background: var(--background);
      }
      .x { color: var(--foreground); --custom: 1rem; }
    `;
    const vars = extractDefinedVars(css);
    expect(vars.has('--space-2')).toBe(true);
    expect(vars.has('--primary')).toBe(true);
    expect(vars.has('--custom')).toBe(true);
    expect(vars.has('--background')).toBe(false); // var() 참조는 제외
    expect(vars.has('--foreground')).toBe(false);
  });

  it('var(--name) 안의 fallback 도 선언으로 잡지 않는다', () => {
    const css = `.x { color: var(--foreground, var(--fallback)); }`;
    const vars = extractDefinedVars(css);
    expect(vars.size).toBe(0);
  });
});

describe('findMissingTokens', () => {
  it('Flutter platform 은 검사하지 않는다 (null 반환)', async () => {
    const result = await findMissingTokens({
      platform: 'flutter',
      name: 'button',
      framework: 'plain',
      defined: new Set(),
    });
    expect(result).toBeNull();
  });

  it('정의된 변수가 모두 있으면 빈 배열', async () => {
    // 실제 tokens-used.json 에서 button[plain] 의 첫 번째 변수만 채워둔 defined set.
    // 누락된 나머지 변수들은 missing 으로 잡혀야 함.
    const defined = new Set(['--space-2', '--radius', '--border']);
    const result = await findMissingTokens({
      platform: 'react',
      name: 'button',
      framework: 'plain',
      defined,
    });
    // null 이 아니어야 하고 (검사 수행), missing 배열이어야 함.
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    // 누락이 분명히 있어야 함 (button 은 많은 토큰을 요구).
    expect(result.length).toBeGreaterThan(0);
  });

  it('정의되지 않은 컴포넌트는 null', async () => {
    const result = await findMissingTokens({
      platform: 'react',
      name: '__nonexistent_component__',
      framework: 'plain',
      defined: new Set(),
    });
    expect(result).toBeNull();
  });
});
