export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";

export default function TokensPage() {
  const semanticColors = [
    "background", "background-subtle", "background-muted", "background-inverse",
    "foreground", "foreground-muted", "foreground-subtle", "foreground-inverse",
    "border", "border-strong",
    "primary", "primary-foreground", "primary-hover",
    "danger", "danger-foreground",
  ];

  return (
    <main className="container">
      <h1>토큰</h1>
      <p className="muted">
        sh-ui은 <strong>primitive → semantic → component</strong> 3계층을 가진다.
        컴포넌트는 오직 semantic 계층만 참조한다.
      </p>

      <h2>1. Primitive — 실제 값</h2>
      <p>
        색 팔레트(<code>neutral.950 = #0A0A0A</code>), spacing 스케일, radius, 타이포그래피. 테마/플랫폼 무관.
      </p>

      <h2>2. Semantic — 의미 단위</h2>
      <p>
        <code>background.default</code>, <code>foreground.muted</code>, <code>primary.default</code> 처럼 <strong>용도</strong>로 이름 붙은 참조. 다크모드 분기도 여기서 발생.
      </p>

      <h3>색 (현재 테마)</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "0.5rem",
          margin: "1rem 0",
        }}
      >
        {semanticColors.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: `var(--${name})`,
                border: "1px solid var(--border)",
                flexShrink: 0,
              }}
            />
            <code style={{ fontSize: "0.75rem" }}>--{name}</code>
          </div>
        ))}
      </div>

      <h2>3. Component (선택)</h2>
      <p>
        <code>button.primary.background</code> 처럼 컴포넌트 단위로 한 번 더 의미를 부여. 컴포넌트가 복잡해질 때만 도입.
      </p>

      <h2>설정 가능한 축</h2>
      <ul>
        <li><code>theme.base</code> — <code>neutral</code> / <code>zinc</code> / <code>slate</code></li>
        <li><code>theme.radius</code> — <code>none</code> / <code>sm</code> / <code>md</code> / <code>lg</code> / <code>xl</code> / <code>full</code></li>
        <li><code>theme.mode</code> — <code>light</code> / <code>dark</code> / <code>light-dark</code></li>
      </ul>

      <h2>플랫폼 출력</h2>
      <p>같은 소스에서 두 파일이 생성된다.</p>
      <h3>React — <code>tokens.css</code></h3>
      <CodePanel
        language="css"
        filename="tokens.css"
        code={`:root {
  --background: #FFFFFF;
  --foreground: #0A0A0A;
  --primary: #171717;
  --radius: 0.5rem;
}
.dark {
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  --primary: #FAFAFA;
}`}
      />

      <h3>Flutter — <code>sh_ui_tokens.dart</code></h3>
      <CodeTabs
        items={[
          {
            value: "highlight",
            label: "강조",
            language: "dart",
            filename: "sh_ui_tokens.dart",
            code: `ShUiColorTokens.light = ShUiColorTokens(
  background: Color(0xFFFFFFFF),
  foreground: Color(0xFF0A0A0A),
  primary: Color(0xFF171717),
  ...
);`,
          },
          {
            value: "full",
            label: "전체",
            language: "dart",
            filename: "sh_ui_tokens.dart",
            code: `ShUiColorTokens.light = ShUiColorTokens(
  background: Color(0xFFFFFFFF),
  foregroundSubtle: Color(0xFF737373),
  foregroundMuted: Color(0xFF404040),
  foreground: Color(0xFF0A0A0A),
  border: Color(0xFFE5E5E5),
  borderStrong: Color(0xFFA3A3A3),
  primary: Color(0xFF171717),
  primaryForeground: Color(0xFFFAFAFA),
  danger: Color(0xFFDC2626),
  dangerForeground: Color(0xFFFAFAFA),
);

ShUiColorTokens.dark = ShUiColorTokens(
  background: Color(0xFF0A0A0A),
  foreground: Color(0xFFFAFAFA),
  primary: Color(0xFFFAFAFA),
  // ...
);`,
          },
        ]}
      />
    </main>
  );
}