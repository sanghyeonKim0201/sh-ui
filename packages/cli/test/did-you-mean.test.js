import { describe, it, expect } from 'vitest';

const { buildNotFoundMessage } = await import('../src/add.mjs');

describe('buildNotFoundMessage (add)', () => {
  const names = ['button', 'badge', 'card', 'select'];

  it('가까운 오타면 추천 포함', () => {
    const msg = buildNotFoundMessage('buton', 'react', names);
    expect(msg).toContain("'buton'");
    expect(msg).toContain('button');
    expect(msg).toContain('sh-ui list --all');
  });

  it('후보 없으면 목록 안내만', () => {
    const msg = buildNotFoundMessage('zzzz', 'react', names);
    expect(msg).toContain("'zzzz'");
    expect(msg).not.toMatch(/혹시/);
    expect(msg).toContain('sh-ui list --all');
  });
});

describe('명령 추천', () => {
  it('KNOWN_COMMANDS 가 노출되고 add 를 포함', async () => {
    const { KNOWN_COMMANDS } = await import('../src/commands.mjs');
    expect(KNOWN_COMMANDS).toContain('add');
    expect(KNOWN_COMMANDS).toContain('create');
  });

  it('오타 명령에 가까운 후보를 제안', async () => {
    const { suggest } = await import('../src/levenshtein.mjs');
    const { KNOWN_COMMANDS } = await import('../src/commands.mjs');
    expect(suggest('ad', KNOWN_COMMANDS)).toContain('add');
  });
});
