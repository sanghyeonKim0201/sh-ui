export const dynamic = "force-static";

import {
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
  CSS_FRAMEWORK_DEFAULT,
} from "sh-ui-cli/api";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { PropsTable } from "@/components/props-table";

const SUPPORTED_TYPE = CSS_FRAMEWORKS_SUPPORTED.map((v) => `"${v}"`).join(" | ");
const PLANNED_LIST = CSS_FRAMEWORKS_PLANNED.join(", ");

export default function CssFrameworkPage() {
  return (
    <main className="container">
      <h1>CSS 프레임워크</h1>
      <p className="muted">
        sh-ui 컴포넌트가 어떤 형태의 CSS 로 들어올지 결정하는 옵션. <code>sh-ui.config.json</code> 의{" "}
        <code>cssFramework</code> 필드 한 줄로 전체 프로젝트가 한 모드로 통일된다.
      </p>

      <h2 id="overview">개요</h2>
      <p>
        sh-ui 는 컴포넌트를 <strong>소스로 복사하는 모델</strong>이다 (shadcn 방식). 그래서 같은 Button 컴포넌트라도{" "}
        <em>plain CSS 클래스</em>로 작성된 버전, <em>Tailwind utility class</em> 로 작성된 버전 등 여러 변종을 만들 수 있다 —{" "}
        <code>cssFramework</code> 가 어느 변종을 카피할지 결정한다.
      </p>
      <CodePanel
        language="json"
        filename="sh-ui.config.json"
        code={`{
  "platform": "react",
  "cssFramework": "${CSS_FRAMEWORK_DEFAULT}",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" }
}`}
      />
      <p className="muted">
        한 프로젝트는 한 모드만. 모드를 바꾸면 모든 컴포넌트를 그 모드로 다시{" "}
        <code>add</code> 해야 일관됨 (아래 <a href="#switching">모드 변경</a> 참고).
      </p>

      <h2 id="options">현재 옵션</h2>
      <PropsTable
        rows={[
          {
            prop: "plain",
            type: "지원 (default)",
            default: `"${CSS_FRAMEWORK_DEFAULT}"`,
            description:
              "CSS custom properties + 일반 .css 파일. 모든 컴포넌트가 이 변종을 갖춤. Tailwind 가 없는 환경에서도 동작 — 가장 단순한 기본값.",
          },
          {
            prop: "tailwind",
            type: "지원",
            description:
              "Tailwind v4 utility class TSX. class-variance-authority(cva) 기반 variant 매트릭스. 모든 styled 컴포넌트(43 개) 가 이 변종을 갖춤. styles.css 가 따라오지 않고 utility 만으로 스타일링.",
          },
          {
            prop: "css-modules",
            type: "지원",
            description:
              ".module.css 모듈 + styles.X 참조. 클래스 이름이 빌드 타임에 hash 되어 자동 격리됨. 모든 styled 컴포넌트(43 개) 가 이 변종을 갖춤.",
          },
          {
            prop: "vanilla-extract",
            type: "계획 중",
            description: `${PLANNED_LIST.includes("vanilla-extract") ? "" : "(현재 옵션 아님)"} 향후 추가 예정. 현재 시도하면 "곧 지원 예정" 친절 에러.`,
          },
        ]}
      />
      <p className="muted">
        타입 시그니처: <code>cssFramework: {SUPPORTED_TYPE}</code> (현재 지원 값). PLANNED 값은 CLI/MCP 가 인식하지만 거부하면서 안내한다.
      </p>

      <h2 id="plain">plain — CSS custom properties</h2>
      <p>
        가장 단순. 컴포넌트가 <code>.sh-ui-button</code> 같은 클래스를 쓰고 그 옆 <code>styles.css</code> 가 <code>var(--primary)</code> 토큰을 참조한다.
        Tailwind 가 없는 Vite/CRA/Remix 등 어떤 React 환경에서도 그대로 동작.
      </p>
      <CodeTabs
        items={[
          {
            value: "tsx",
            label: "index.tsx",
            language: "tsx",
            filename: "components/ui/button/index.tsx",
            code: `import "./styles.css";
export const Button = ({ variant = "primary", ...props }) => (
  <button className={\`sh-ui-button sh-ui-button--\${variant}\`} {...props} />
);`,
          },
          {
            value: "css",
            label: "styles.css",
            language: "css",
            filename: "components/ui/button/styles.css",
            code: `.sh-ui-button {
  border-radius: var(--radius);
  font-weight: var(--weight-medium);
  transition: background-color var(--duration-fast);
}
.sh-ui-button--primary {
  background: var(--primary);
  color: var(--primary-foreground);
}`,
          },
        ]}
      />
      <p>
        <strong>적합한 경우</strong>: Tailwind 를 쓰지 않거나 의존성을 최소화하고 싶을 때 / sh-ui 를 학습 곡선 0 으로 도입하고 싶을 때.
      </p>

      <h2 id="tailwind">tailwind — utility class TSX</h2>
      <p>
        shadcn/ui 와 동일한 느낌. <code>className</code> 안에 utility 가 직접 들어가고{" "}
        <code>class-variance-authority</code> 로 variant 를 구성한다. 별도 <code>styles.css</code> 없음 —{" "}
        Tailwind v4 의 <code>@theme inline</code> 이 sh-ui 토큰을 자동 매핑하므로 <code>bg-primary</code>{" "}
        같은 utility 가 그대로 동작.
      </p>
      <CodePanel
        language="tsx"
        filename="components/ui/button/index.tsx"
        code={`import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-background-muted text-foreground border-border",
        ghost: "bg-transparent hover:bg-background-muted",
        danger: "bg-danger text-danger-foreground",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: { sm: "h-9 px-3", md: "h-10 px-4", lg: "h-11 px-5" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export const Button = ({ variant, size, className, ...props }) => (
  <button className={[buttonVariants({ variant, size }), className].filter(Boolean).join(" ")} {...props} />
);`}
      />
      <p>
        <strong>토큰 브리지</strong>: <code>add tokens</code> 가 만든 <code>tokens.css</code> 끝에{" "}
        <code>@theme inline</code> 블록이 자동 포함된다 — 모든 sh-ui 색 토큰이 Tailwind 의{" "}
        <code>--color-*</code> 네임스페이스로 매핑되어 <code>bg-background</code>, <code>text-foreground-muted</code>{" "}
        같은 표준 utility 가 그대로 동작.
      </p>
      <CodePanel
        language="css"
        filename="src/styles/tokens.css (자동 생성)"
        code={`/* :root { --primary: #171717; ... } */

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... 나머지 색 토큰 */
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --radius-xl: calc(var(--radius) + 4px);
}`}
      />
      <p>
        <strong>적합한 경우</strong>: 이미 Tailwind v4 를 쓰는 프로젝트 / shadcn/ui 스타일의 utility-class TSX 를 선호 / 컴포넌트{" "}
        <code>className</code> 만 보고 스타일을 파악하고 싶을 때.
      </p>

      <h2 id="css-modules">css-modules — .module.css + styles.X</h2>
      <p>
        클래스 이름이 빌드 타임에 자동 hash 되어 다른 컴포넌트와 충돌하지 않게 격리된다. Next.js·Vite·Remix·CRA 모두 zero-config 로 동작 — 별도 플러그인 없이{" "}
        <code>*.module.css</code> 확장자만 알면 된다.
      </p>
      <CodeTabs
        items={[
          {
            value: "tsx",
            label: "index.tsx",
            language: "tsx",
            filename: "components/ui/button/index.tsx",
            code: `import styles from "./styles.module.css";
export const Button = ({ variant = "primary", ...props }) => (
  <button className={\`\${styles.button} \${styles[variant]}\`} {...props} />
);`,
          },
          {
            value: "css",
            label: "styles.module.css",
            language: "css",
            filename: "components/ui/button/styles.module.css",
            code: `.button {
  border-radius: var(--radius);
  font-weight: var(--weight-medium);
  transition: background-color var(--duration-fast);
}
.primary {
  background: var(--primary);
  color: var(--primary-foreground);
}`,
          },
        ]}
      />
      <p>
        <strong>적합한 경우</strong>: 이미 CSS Modules 컨벤션을 쓰는 프로젝트 / 클래스 이름 충돌 없이 컴포넌트별 스타일 격리를 원할 때 / Tailwind 의존을 피하고 싶을 때.
      </p>

      <h2 id="planned">계획 중 — vanilla-extract</h2>
      <p>
        같은 변종 시스템을 따라 추후 추가 예정. CLI 가 미리 인식하므로 시도하면 친절한 안내 에러:
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`$ sh-ui-cli init --cssFramework vanilla-extract
✗ --cssFramework='vanilla-extract'는 곧 지원 예정입니다. 현재는 plain, tailwind, css-modules 만 가능합니다.`}
      />
      <p className="muted">
        외부 컨트리뷰터: <code>packages/registry/react/components/&lt;name&gt;/index.&lt;framework&gt;.tsx</code>{" "}
        패턴으로 새 변종을 추가하고 <code>registry.json</code> 의 <code>frameworks: [...]</code> 배열에 등록하면 자동으로 인식됨.
      </p>

      <h2 id="switching">이미 만든 프로젝트에서 모드 변경</h2>
      <p>
        <code>sh-ui.config.json</code> 의 <code>cssFramework</code> 값을 바꾼 뒤, 사용 중인 컴포넌트를 다시{" "}
        <code>add</code> 하면 새 모드로 덮어쓴다 (사용자 수정 보존 옵션은{" "}
        <code>--keep</code>/<code>--overwrite</code>). 모드 전환 시 추가로:
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`# 1. 설정 변경
$ vim sh-ui.config.json   # "cssFramework": "tailwind"

# 2. 사용 중인 컴포넌트 재설치 (예시)
$ npx sh-ui-cli add button card dialog --overwrite

# 3. plain → tailwind 면 cva 자동 설치
#    tailwind → plain 이면 cva 가 더 이상 필요 없음 (수동 제거 가능)`}
      />
      <p className="muted">
        모드 전환 후 한동안 일부 컴포넌트가 두 모드 혼재 상태일 수 있다 — 일관성 위해 같은 모드로 다시 add 권장.
      </p>

      <h2 id="fallback">Fallback 동작</h2>
      <p>
        선택한 변종이 컴포넌트에 없으면 CLI 가 자동으로 plain 변종을 설치하고 한 줄 알림을 출력한다.
        plain CSS 는 <code>:root</code> 토큰만 의존하므로 어떤 환경(Tailwind v4·CSS Modules·vanilla CSS) 에서도 그대로 동작 — 깨지지 않는다.
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`$ npx sh-ui-cli add some-new-component
ℹ some-new-component — css-modules 변종 미제공, plain 변종으로 설치 (어떤 환경에서도 그대로 동작)
✓ some-new-component → src/components/ui/some-new-component/index.tsx`}
      />
      <p className="muted">
        v0.47.0 기준 모든 styled 컴포넌트(43 개) 가 plain · tailwind · css-modules 3 변종을 갖춰 실제 fallback 은 거의 발생하지 않음. 새 컴포넌트가 추가되거나 vanilla-extract 가 도입되면 같은 메커니즘으로 처리.
      </p>

      <h2 id="how-it-works">내부 동작 (선택)</h2>
      <p>
        registry.json 의 각 컴포넌트 엔트리는 file 단위로 <code>frameworks?: string[]</code> 옵션을 가진다 — 어떤 모드일 때 그 파일을 카피할지 결정. <code>add</code> 명령은 config 의 <code>cssFramework</code> 값을 보고 매칭되는 파일만 복사.
      </p>
      <CodePanel
        language="json"
        filename="packages/registry/react/registry.json (button 엔트리)"
        code={`{
  "button": {
    "files": [
      { "src": "components/button/index.tsx",            "dest": "{components}/button/index.tsx",          "frameworks": ["plain"] },
      { "src": "components/button/styles.css",           "dest": "{components}/button/styles.css",         "frameworks": ["plain"] },
      { "src": "components/button/index.tailwind.tsx",   "dest": "{components}/button/index.tsx",          "frameworks": ["tailwind"] },
      { "src": "components/button/index.module.tsx",     "dest": "{components}/button/index.tsx",          "frameworks": ["css-modules"] },
      { "src": "components/button/styles.module.css",    "dest": "{components}/button/styles.module.css",  "frameworks": ["css-modules"] }
    ],
    "dependencies": [
      { "name": "class-variance-authority", "frameworks": ["tailwind"] }
    ]
  }
}`}
      />
      <p className="muted">
        dependency 도 framework 단위로 분기 — plain 사용자에게 cva 가 install 되지 않음. 모든 frameworks 에 적용되는 의존성은{" "}
        <code>"react-hook-form"</code> 같은 string 형태로 그대로 두면 된다.
      </p>
    </main>
  );
}
