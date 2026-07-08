import { test, expect } from "@playwright/test";

/**
 * 컴포넌트 페이지의 Preview 영역 (`<Preview.Demo>` 가 렌더하는 박스) 을 캡쳐해
 * 시각적 회귀를 잡는다.
 *
 * Sandpack 롤아웃 이후 (v0.93+) 상단 데모는 라이브 sandbox (cross-origin iframe,
 * 스크린샷 불안정) 라 캡쳐 대상이 아니다. 대신 `.first()` 가 Examples 섹션의 첫
 * `<Preview>` 를 잡도록 한다 — 컴포넌트 본체의 시각 회귀는 그쪽에서도 동일하게
 * 검출된다.
 *
 * Examples 에 `<Preview>` 가 전혀 없는 페이지는 제외 (아래 EXCLUDED 참고).
 * 추가하려면 COMPONENTS 배열에 슬러그만 더하면 됨.
 */
const COMPONENTS = [
  "accordion",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "checkbox",
  "code-panel",
  "code-tabs",
  "combobox",
  "date-picker",
  "dialog",
  "dropdown-menu",
  "file-upload",
  "header",
  "input",
  "label",
  "numeric-input",
  "pagination",
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
  "time-picker",
  "toggle",
];

// 의도적으로 제외:
// - context-menu / menubar / popover / tooltip — Sandpack 롤아웃 후 페이지에
//   `<Preview>` 가 0개. 회귀 캡쳐 대상이 없음.
// - color-picker / code-editor / markdown-editor / rich-text-editor — 무거운 에디터/IME, 안정적 캡처 어려움
// - toast — viewport 가 fixed 라 Preview 데모 영역 캡쳐로 잡히지 않음
// - form / theme — non-styled 로직 컴포넌트, 시각 회귀 의미 없음
// - page-toc — 페이지 자체에 Preview 가 없음

// calendar / date-picker 등은 `new Date()` 로 "오늘" 을 렌더하므로 캡쳐 시점에 따라
// 그리드/선택일이 바뀌어 스냅샷이 비결정적이 된다 (월이 넘어가면 항상 실패).
// 시계를 고정 시각으로 박아 결정적으로 만든다. 시각은 기존 baseline 캡쳐 날짜에 맞춤
// (2026-05-15). noon UTC 라 KST(로컬)·UTC(CI) 어디서 돌려도 같은 날짜(5/15)를 렌더한다.
const FROZEN_NOW = new Date("2026-05-15T12:00:00Z");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FROZEN_NOW);
});

for (const name of COMPONENTS) {
  test(`/components/${name} preview snapshot`, async ({ page }) => {
    await page.goto(`/ko/components/${name}`);
    // Sandpack 롤아웃 후 .first() 는 Examples 섹션의 첫 Preview 를 잡는다.
    const demo = page.locator(".sh-ui-preview__demo").first();
    await demo.waitFor({ state: "visible", timeout: 10_000 });
    await expect(demo).toHaveScreenshot(`${name}.png`, {
      animations: "disabled",
    });
  });
}
