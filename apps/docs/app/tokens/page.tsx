export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";

export default function TokensPage() {
  const semanticColors = [
    "background", "background-subtle", "background-muted", "background-inverse",
    "foreground", "foreground-muted", "foreground-subtle", "foreground-inverse",
    "border", "border-strong",
    "primary", "primary-foreground", "primary-hover",
    "danger", "danger-foreground",
  ];

  const spacing = [
    { name: "space-0", px: 0 },
    { name: "space-1", px: 4 },
    { name: "space-2", px: 8 },
    { name: "space-3", px: 12 },
    { name: "space-4", px: 16 },
    { name: "space-5", px: 20 },
    { name: "space-6", px: 24 },
    { name: "space-8", px: 32 },
    { name: "space-10", px: 40 },
    { name: "space-12", px: 48 },
    { name: "space-16", px: 64 },
  ];

  const text = [
    { name: "text-xs", px: 12 },
    { name: "text-sm", px: 14 },
    { name: "text-base", px: 16 },
    { name: "text-lg", px: 18 },
    { name: "text-xl", px: 20 },
    { name: "text-2xl", px: 24 },
    { name: "text-3xl", px: 30 },
    { name: "text-4xl", px: 36 },
  ];

  const weights = [
    { name: "weight-regular", value: 400 },
    { name: "weight-medium", value: 500 },
    { name: "weight-semibold", value: 600 },
    { name: "weight-bold", value: 700 },
  ];

  const shadows = [
    { name: "shadow-sm" },
    { name: "shadow-md" },
    { name: "shadow-lg" },
    { name: "shadow-xl" },
  ];

  const durations = [
    { name: "duration-fast", value: "120ms" },
    { name: "duration-base", value: "160ms" },
    { name: "duration-slow", value: "200ms" },
  ];

  const eases = [
    { name: "ease-standard", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
    { name: "ease-emphasized", value: "cubic-bezier(0.2, 0, 0, 1)" },
  ];

  const control = [
    { name: "control-sm", px: 32 },
    { name: "control-md", px: 40 },
    { name: "control-lg", px: 48 },
  ];

  const borderWidth = [
    { name: "border-width", px: 1 },
    { name: "border-width-strong", px: 2 },
  ];

  const zIndex = [
    { name: "z-base", value: 0 },
    { name: "z-sticky", value: 100 },
    { name: "z-dropdown", value: 200 },
    { name: "z-overlay", value: 300 },
    { name: "z-modal", value: 400 },
    { name: "z-popover", value: 500 },
    { name: "z-toast", value: 600 },
    { name: "z-tooltip", value: 700 },
  ];

  return (
    <main className="container">
      <h1>토큰</h1>
      <p className="muted">
        sh-ui는 <strong>primitive → semantic → component</strong> 3계층을 가진다.
        컴포넌트는 오직 semantic 계층만 참조한다.
      </p>

      <h2>1. Primitive — 실제 값</h2>
      <p>
        색 팔레트(<code>neutral.950 = #0A0A0A</code>), spacing 스케일, radius, typography, shadow, duration, easing 등 원시 값. 테마/플랫폼 무관.
      </p>

      <h2>2. Semantic — 의미 단위</h2>
      <p>
        <code>background.default</code>, <code>primary.hover</code>처럼 <strong>용도</strong>로 이름 붙은 참조. 다크모드 분기도 여기서 발생.
      </p>

      <h3>색 (현재 테마)</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-2)",
          margin: "var(--space-4) 0",
        }}
      >
        {semanticColors.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2)",
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
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
          </div>
        ))}
      </div>

      <h3>Spacing</h3>
      <p className="muted">
        4px 기반 Tailwind 호환 스케일. padding / margin / gap / inset에 사용.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {spacing.map(({ name, px }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 80px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{px}px</span>
            <span
              style={{
                display: "inline-block",
                height: 12,
                width: px || 1,
                background: "var(--foreground)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>

      <h3>Typography</h3>
      <p className="muted">폰트 크기 스케일. CSS에서는 <code>font-size</code>, Flutter는 <code>shUi.text.*</code>.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {text.map(({ name, px }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 80px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{px}px</span>
            <span style={{ fontSize: `var(--${name})`, lineHeight: 1 }}>Aa 다람쥐</span>
          </div>
        ))}
      </div>

      <h4>Font weight</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {weights.map(({ name, value }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 80px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{value}</span>
            <span style={{ fontWeight: `var(--${name})`, fontSize: "var(--text-base)" }}>담백하게 설계된</span>
          </div>
        ))}
      </div>

      <h3>Shadow</h3>
      <p className="muted">카드 / 팝업 / 모달 레벨별 그림자.</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-6)",
          margin: "var(--space-4) 0 var(--space-8)",
        }}
      >
        {shadows.map(({ name }) => (
          <div
            key={name}
            style={{
              padding: "var(--space-6) var(--space-3)",
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: `var(--${name})`,
              textAlign: "center",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
          </div>
        ))}
      </div>

      <h3>Motion</h3>
      <h4>Duration</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {durations.map(({ name, value }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 80px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{value}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-subtle)" }}>
              {name === "duration-fast" && "마이크로 인터랙션 (hover, focus)"}
              {name === "duration-base" && "일반 전환 (tab, expand)"}
              {name === "duration-slow" && "레이아웃 이동 (dialog, sidebar)"}
            </span>
          </div>
        ))}
      </div>

      <h4>Easing</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {eases.map(({ name, value }) => (
          <div
            key={name}
            style={{
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)", marginTop: "var(--space-1)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <h3>Control height</h3>
      <p className="muted">
        Button / Input / Select 등 폼 컨트롤의 높이 스케일. Flutter는 <code>shUi.control.*</code>.
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-4)", margin: "var(--space-4) 0" }}>
        {control.map(({ name, px }) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
            <div
              style={{
                height: px,
                padding: "0 var(--space-4)",
                display: "flex",
                alignItems: "center",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                borderRadius: "var(--radius)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              Button
            </div>
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{px}px</span>
          </div>
        ))}
      </div>

      <h3>Border width</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {borderWidth.map(({ name, px }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 60px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{px}px</span>
            <span
              style={{
                display: "inline-block",
                height: 16,
                width: 120,
                border: `${px}px solid var(--foreground)`,
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>

      <h3>Opacity</h3>
      <p className="muted"><code>:disabled</code>, <code>[data-disabled]</code> 선택자에 일관되게 적용.</p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-2) var(--space-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          margin: "var(--space-4) 0",
        }}
      >
        <code style={{ fontSize: "var(--text-xs)" }}>--opacity-disabled</code>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>0.5</span>
        <span style={{ opacity: "var(--opacity-disabled)" }}>비활성 미리보기</span>
      </div>

      <h3>Z-index</h3>
      <p className="muted">레이어 충돌 방지를 위한 의미적 스택 순서.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {zIndex.map(({ name, value }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 80px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)" }}>{value}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-subtle)" }}>
              {name === "z-base" && "기본"}
              {name === "z-sticky" && "sticky header, sidebar"}
              {name === "z-dropdown" && "select, menu 팝업"}
              {name === "z-overlay" && "modal/sheet 배경 dimmer"}
              {name === "z-modal" && "modal/dialog/sheet 본체"}
              {name === "z-popover" && "popover 컨테이너"}
              {name === "z-toast" && "알림"}
              {name === "z-tooltip" && "tooltip"}
            </span>
          </div>
        ))}
      </div>

      <h2>3. Component (선택)</h2>
      <p>
        <code>button.primary.background</code>처럼 컴포넌트 단위로 한 번 더 의미를 부여. 컴포넌트가 복잡해질 때만 도입.
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
  --space-4: 16px;
  --text-sm: 14px;
  --weight-medium: 500;
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --duration-fast: 120ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --control-md: 40px;
  --border-width: 1px;
  --opacity-disabled: 0.5;
  --z-modal: 400;
  /* ... */
}
.dark {
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  --primary: #FAFAFA;
}`}
      />

      <h3>Flutter — <code>sh_ui_tokens.dart</code></h3>
      <p className="muted">
        색·radius와 함께 spacing / text / weight / shadow / duration / ease / control / borderWidth / opacity 토큰이 <code>ShUiTheme</code> 하위 클래스로 생성된다. <code>Theme.of(context).extension&lt;ShUiTheme&gt;()</code>로 접근.
      </p>
      <CodeTabs
        items={[
          {
            value: "usage",
            label: "사용",
            language: "dart",
            filename: "my_widget.dart",
            code: `final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;

Container(
  height: shUi.control.md,                              // 40.0
  padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3), // 12.0
  decoration: BoxDecoration(
    color: shUi.colors.background,
    border: Border.all(
      color: shUi.colors.border,
      width: shUi.borderWidth.normal,                   // 1.0
    ),
    borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
    boxShadow: shUi.shadow.sm,
  ),
  child: Text(
    '라벨',
    style: TextStyle(
      fontSize: shUi.text.sm,                           // 14.0
      fontWeight: shUi.weight.medium,                   // FontWeight.w500
      color: shUi.colors.foreground,
    ),
  ),
);`,
          },
          {
            value: "classes",
            label: "클래스",
            language: "dart",
            filename: "sh_ui_tokens.dart",
            code: `class ShUiTheme extends ThemeExtension<ShUiTheme> {
  final ShUiColorTokens colors;
  final ShUiRadiusTokens radius;
  final ShUiSpacingTokens spacing;       // s0..s16
  final ShUiTextTokens text;             // xs/sm/base/lg/xl/xl2/xl3/xl4
  final ShUiWeightTokens weight;         // regular/medium/semibold/bold
  final ShUiShadowTokens shadow;         // sm/md/lg/xl
  final ShUiDurationTokens duration;     // fast/base/slow
  final ShUiEaseTokens ease;             // standard/emphasized
  final ShUiControlTokens control;       // sm/md/lg
  final ShUiBorderWidthTokens borderWidth; // normal/strong
  final ShUiOpacityTokens opacity;       // disabled
  // ...
}`,
          },
        ]}
      />
    </main>
  );
}
