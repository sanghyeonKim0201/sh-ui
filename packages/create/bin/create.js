#!/usr/bin/env node
// sh-ui-create — sh-ui-cli 의 `sh-ui create` 서브커맨드로 위임하는 호환 shim.
// 이 패키지는 v0.20.0 부터 deprecated. 신규 프로젝트는 직접 `npx sh-ui-cli create` 또는
// `npm create sh-ui` 사용 권장.

import { spawn } from 'node:child_process';

console.error(
  '⚠️  sh-ui-create 는 sh-ui-cli 에 통합됐습니다. ' +
  '앞으로는 `npx sh-ui-cli create [args]` 또는 `npm create sh-ui` 를 쓰세요.\n',
);

const args = ['-y', 'sh-ui-cli', 'create', ...process.argv.slice(2)];
const proc = spawn('npx', args, { stdio: 'inherit' });

proc.on('error', (err) => {
  console.error(`✗ npx sh-ui-cli create 위임 실패: ${err.message}`);
  process.exit(1);
});
proc.on('exit', (code) => process.exit(code ?? 0));
