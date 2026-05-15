import { test, expect } from "@playwright/test";

/**
 * 컴포넌트 페이지의 Preview 영역 (`<Preview.Demo>` 가 렌더하는 박스) 을 캡쳐해
 * 시각적 회귀를 잡는다. 페이지 전체가 아닌 데모 영역만 — VariantSource 의 코드 탭이나
 * Examples 섹션이 변동돼도 회귀로 잡지 않도록.
 *
 * 추가하려면 COMPONENTS 배열에 슬러그만 더하면 됨.
 */
const COMPONENTS = [
  "accordion",
  "avatar",
  "badge",
  "breadcrumb",
  // "button" — v0.94 react-live LiveCode pilot. 첫 Preview 가 LiveCode 로 교체돼
  // .sh-ui-preview__demo selector 가 다른 element 를 잡음 (variants 섹션). 다른 페이지로 rollout
  // 후 selector 가 .sh-ui-preview__demo OR .sh-ui-live-code__preview 양쪽 지원하도록 업데이트 + baseline 재생성.
  "calendar",
  "card",
  "carousel",
  "checkbox",
  "code-panel",
  "code-tabs",
  "combobox",
  "context-menu",
  "date-picker",
  "dialog",
  "dropdown-menu",
  "file-upload",
  "header",
  "input",
  "label",
  "menubar",
  "numeric-input",
  "pagination",
  "popover",
  "progress",
  "radio",
  "select",
  "separator",
  "sidebar",
  "skeleton",
  "slider",
  "spinner",
  "switch",
  "tabs",
  "textarea",
  "toggle",
  "tooltip",
];

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
