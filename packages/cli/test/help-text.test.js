import { describe, it, expect } from 'vitest';

describe('HELP_TEXT — init', () => {
  it('핵심 플래그를 포함', async () => {
    const { HELP_TEXT } = await import('../src/init.mjs');
    expect(HELP_TEXT).toContain('sh-ui init');
    for (const flag of ['--platform', '--base', '--radius', '--mode', '--cssFramework', '--force', '--yes']) {
      expect(HELP_TEXT).toContain(flag);
    }
  });
});
