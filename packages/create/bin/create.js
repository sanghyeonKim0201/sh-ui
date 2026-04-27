#!/usr/bin/env node

import { argv, exit } from 'node:process';
import { parseArgs } from '../src/cli-args.js';
import { createProject, addApp, addComponent } from '../src/generator.js';

const HELP_TEXT = `sh-ui-create — sh-ui 프로젝트 스캐폴드 (Next.js / Flutter)

사용법:
  sh-ui-create [name] [options]
  sh-ui-create add-app
  sh-ui-create add-component <name> [--app <name>]

옵션:
  --platform <next|flutter>          타겟 플랫폼
  --structure <standalone|monorepo>  Next.js 프로젝트 구조 (next 일 때)
  --plugins <a,b>                    플러그인 (sentry, next-intl). 미지정/"" → 없음
  --theme <base64>                   테마 JSON (base64). 선택
  --yes                              디렉토리 덮어쓰기 + 모노레포 기본값 자동 채택
  -h, --help                         이 도움말

예 (대화형):
  npm create sh-ui my-app
  npx sh-ui-create

예 (비대화형 / 에이전트 / CI):
  npx sh-ui-create my-app --platform next --structure standalone --yes
  npx sh-ui-create my-app --platform next --structure monorepo --plugins sentry,next-intl --yes
  npx sh-ui-create my-app --platform flutter --yes

비대화형 환경(TTY 없음)에서는 누락된 필수 인자가 있으면 prompt 대신 에러로 종료한다.
`;

let parsed;
try {
  parsed = parseArgs(argv);
} catch (e) {
  console.error(`❌ ${e.message}`);
  console.error(`\n도움말: sh-ui-create --help`);
  exit(1);
}

const { command, flags, positional } = parsed;

if (flags.help) {
  console.log(HELP_TEXT);
  exit(0);
}

try {
  if (command === 'add-app') {
    await addApp();
  } else if (command === 'add-component') {
    const componentName = positional[0];
    await addComponent(componentName, flags.app);
  } else {
    await createProject({
      name: positional[0],
      platform: flags.platform,
      structure: flags.structure,
      plugins: flags.plugins,
      theme: flags.theme,
      yes: flags.yes,
    });
  }
} catch (e) {
  console.error(`❌ ${e.message}`);
  exit(1);
}
