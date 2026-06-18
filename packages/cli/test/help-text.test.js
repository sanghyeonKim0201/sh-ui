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

describe('HELP_TEXT — 전체 명령', () => {
  const cases = [
    ['../src/add.mjs', ['sh-ui add', '--skip-install', '--diff', '--force', '--keep', '--app', 'tokens']],
    ['../src/list.mjs', ['sh-ui list', '--all']],
    ['../src/remove.mjs', ['sh-ui remove', '--force', '--dry-run']],
    ['../src/doctor.mjs', ['sh-ui doctor', 'config', 'tokens']],
    ['../src/tokens-cmd.mjs', ['sh-ui tokens', 'diff', 'upgrade', '--apply', '--replace']],
    ['../src/theme-extract.mjs', ['sh-ui theme', 'extract', '--out']],
    ['../src/migrate-v065.mjs', ['sh-ui migrate-v065', '--apply', '--dry-run']],
    ['../src/migrate-bundled.mjs', ['sh-ui migrate bundled', '--apply', '--bundle']],
    ['../src/rename-app.mjs', ['sh-ui rename-app', '<old>', '<new>', '--yes', '--dry-run', '--skip-install']],
    ['../src/upgrade-cli.mjs', ['sh-ui upgrade-cli', '--apply']],
    ['../src/mcp.mjs', ['sh-ui mcp', 'init', '--client']],
  ];

  it.each(cases)('%s 의 HELP_TEXT 가 핵심 토큰을 포함', async (mod, tokens) => {
    const { HELP_TEXT } = await import(mod);
    expect(HELP_TEXT, `${mod} 에 HELP_TEXT export 필요`).toBeTypeOf('string');
    for (const t of tokens) expect(HELP_TEXT).toContain(t);
  });
});
