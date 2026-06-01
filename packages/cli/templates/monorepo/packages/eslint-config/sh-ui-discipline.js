/**
 * sh-ui 컴포넌트 우선 — native JSX 요소 금지 ESLint config.
 *
 * 시안 HTML 의 raw `<button class="btn-primary">` 같은 패턴을 Tailwind 로
 * 그대로 옮기지 말고 `@workspace/ui-core` 의 sh-ui 컴포넌트를 사용한다.
 * AI 가 시안 mimic 으로 native 를 쓰는 패턴을 자동 차단 — 디자인 시스템의
 * 우회를 lint 단계에서 시끄럽게 실패시킨다.
 *
 * 사용 (앱의 eslint.config.js 에서):
 *   import { shUiDisciplineConfig } from "@workspace/eslint-config/sh-ui-discipline"
 *   export default [ ...otherConfigs, ...shUiDisciplineConfig ]
 *
 * 적용 범위: `**\/*.tsx` (앱 코드만 — `packages/ui/ui-core` 의 컴포넌트는
 * 정의상 native 를 감싸므로 자체 lint 또는 별도 설정으로 분리).
 *
 * 진짜 필요한 예외(file/hidden input, form action 등) 만 인라인 override:
 *   // eslint-disable-next-line no-restricted-syntax -- <구체적 이유>
 *   <button ...>
 *
 * severity: monorepo 기본 `eslint-plugin-only-warn` 이 error → warning
 * 다운그레이드한다. CI 에서 hard fail 하려면 lint 스크립트에 `--max-warnings 0`.
 *
 * Link 가 button 처럼 보여야 하면: sh-ui Button 의 `buttonVariants` cva 를
 * 재사용한 helper 컴포넌트를 만들어 `<Link>` 에 적용한다.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const shUiDisciplineConfig = [
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "native <button> 금지 — '@workspace/ui-core/components/button' 의 <Button> 사용. Link 가 button 처럼 보여야 하면 sh-ui Button 의 buttonVariants 를 재사용한 helper 컴포넌트. 예외 시 // eslint-disable-next-line no-restricted-syntax -- <이유> 주석.",
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message:
            "native <input> 금지 — '@workspace/ui-core/components/input' 의 <Input> 사용. type='hidden' 같은 예외는 // eslint-disable-next-line 주석.",
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            "native <select> 금지 — '@workspace/ui-core/components/select' 의 <Select> 사용.",
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message:
            "native <textarea> 금지 — '@workspace/ui-core/components/textarea' 의 <Textarea> 사용.",
        },
        {
          selector: "JSXOpeningElement[name.name='label']",
          message:
            "native <label> 금지 — '@workspace/ui-core/components/label' 의 <Label> 사용.",
        },
      ],
    },
  },
]
