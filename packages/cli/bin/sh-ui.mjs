#!/usr/bin/env node
import { init } from "../src/init.mjs";
import { add } from "../src/add.mjs";

const [, , cmd, ...rest] = process.argv;

const usage = `사용법:
  sh-ui init                설정 파일(sh-ui.config.json) 생성
  sh-ui add <component...>  컴포넌트 소스를 프로젝트로 복사
                            특수값: tokens → 설정 기반 토큰 파일 생성
`;

try {
  switch (cmd) {
    case "init":
      await init({ cwd: process.cwd(), args: rest });
      break;
    case "add":
      if (rest.length === 0) {
        console.error("에러: 추가할 컴포넌트 이름이 필요합니다.\n");
        console.error(usage);
        process.exit(1);
      }
      await add({ cwd: process.cwd(), names: rest });
      break;
    case undefined:
    case "-h":
    case "--help":
      console.log(usage);
      break;
    default:
      console.error(`알 수 없는 명령: ${cmd}\n`);
      console.error(usage);
      process.exit(1);
  }
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
