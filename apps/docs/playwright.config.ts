import { defineConfig, devices } from "@playwright/test";

/**
 * sh-ui docs 의 컴포넌트 페이지 시각 회귀 테스트.
 * - 컴포넌트 페이지 (`/components/<name>`) 의 Preview 영역을 캡쳐.
 * - 기준 스냅샷은 `tests/visual/<name>.spec.ts-snapshots/` 에 commit.
 * - CI 에서 변경 검출 → PR 에 비교 결과 첨부.
 *
 * 실행:
 *   pnpm visual              # 변경 검출 (실패 시 diff 출력)
 *   pnpm visual:update       # 기준 스냅샷 갱신
 */
export default defineConfig({
  testDir: "./tests/visual",
  // 시각 비교 — 작은 픽셀 차이는 무시 (안티앨리어싱 등)
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "pnpm build && pnpm start --port 3000",
        url: "http://localhost:3000",
        timeout: 180_000,
        reuseExistingServer: false,
      }
    : {
        command: "pnpm dev --port 3000",
        url: "http://localhost:3000",
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
