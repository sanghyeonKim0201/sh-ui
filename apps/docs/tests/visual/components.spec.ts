import { test, expect } from "@playwright/test";

/**
 * 컴포넌트 페이지의 Preview 영역 (`<Preview.Demo>` 가 렌더하는 박스) 을 캡쳐해
 * 시각적 회귀를 잡는다. 페이지 전체가 아닌 데모 영역만 — VariantSource 의 코드 탭이나
 * Examples 섹션이 변동돼도 회귀로 잡지 않도록.
 *
 * 추가하려면 COMPONENTS 배열에 슬러그만 더하면 됨.
 */
const COMPONENTS = [
  "button",
  "card",
  "input",
  "badge",
  "checkbox",
  "switch",
  "radio",
  "label",
  "separator",
  "spinner",
  "skeleton",
  "progress",
  "avatar",
  "tooltip",
  "textarea",
];

for (const name of COMPONENTS) {
  test(`/components/${name} preview snapshot`, async ({ page }) => {
    await page.goto(`/components/${name}`);
    // 첫 Preview 데모 — preview-demo 클래스 또는 data-testid 가 없으므로
    // h2 직전의 첫 .preview 영역으로 셀렉트. sh-ui-preview__demo 클래스 사용.
    const demo = page.locator(".sh-ui-preview__demo").first();
    await demo.waitFor({ state: "visible", timeout: 10_000 });
    await expect(demo).toHaveScreenshot(`${name}.png`, {
      animations: "disabled",
    });
  });
}
