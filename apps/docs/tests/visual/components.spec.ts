import { test, expect } from "@playwright/test";

/**
 * 컴포넌트 페이지의 Preview 영역 (`<Preview.Demo>` 가 렌더하는 박스) 을 캡쳐해
 * 시각적 회귀를 잡는다. 페이지 전체가 아닌 데모 영역만 — VariantSource 의 코드 탭이나
 * Examples 섹션이 변동돼도 회귀로 잡지 않도록.
 *
 * **현재 비활성** — v0.93 ~ v0.95 에서 모든 컴포넌트 페이지 상단 데모를 Sandpack
 * (Monaco + 라이브 프리뷰) 으로 교체. `.sh-ui-preview__demo` 셀렉터가 더 이상 1차
 * 데모 영역을 가리키지 않고, Sandpack 의 cross-origin iframe 은 스크린샷이 불안정.
 *
 * 재활성화하려면 (1) 페이지 상단 ComponentSandbox 외곽 박스를 안정 캡쳐할 수 있는
 * 셀렉터를 정하거나 (2) screenshot 대신 DOM/aria assertion 으로 전환할 것.
 *
 * 일단 빈 배열로 두면 Playwright 가 0 tests passed 로 통과 — CI 게이트는 유지.
 */
const COMPONENTS: string[] = [];

// 의도적으로 제외:
// - color-picker / code-editor / markdown-editor / rich-text-editor — 무거운 에디터/IME, 안정적 캡처 어려움
// - toast — viewport 가 fixed 라 Preview 데모 영역 캡쳐로 잡히지 않음
// - form / theme — non-styled 로직 컴포넌트, 시각 회귀 의미 없음
// - page-toc — 페이지 자체에 Preview 가 없음

for (const name of COMPONENTS) {
  test(`/components/${name} preview snapshot`, async ({ page }) => {
    await page.goto(`/ko/components/${name}`);
    // 첫 Preview 데모 — preview-demo 클래스 또는 data-testid 가 없으므로
    // h2 직전의 첫 .preview 영역으로 셀렉트. sh-ui-preview__demo 클래스 사용.
    const demo = page.locator(".sh-ui-preview__demo").first();
    await demo.waitFor({ state: "visible", timeout: 10_000 });
    await expect(demo).toHaveScreenshot(`${name}.png`, {
      animations: "disabled",
    });
  });
}
