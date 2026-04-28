import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // sh-ui-cli 자체 테스트만 — data/ 안의 컴포넌트 테스트(번들 출고용)는 제외
    include: ["test/**/*.test.{js,mjs,ts}"],
  },
});
