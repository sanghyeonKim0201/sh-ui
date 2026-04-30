import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      // 레지스트리 컴포넌트가 사용자 프로젝트 alias 로 import 하는 placeholder.
      // CLI 가 add 시점에 사용자의 aliases.utils 로 치환하지만, 이 레포 안에서
      // 직접 컴포넌트 테스트를 돌릴 때는 lib/cn 을 직접 가리킨다.
      "@SH_UI_UTILS@": resolve(__dirname, "lib/cn.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["components/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
