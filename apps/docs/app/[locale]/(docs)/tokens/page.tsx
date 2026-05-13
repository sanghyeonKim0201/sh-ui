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
    { name: "space-0", rem: "0",       px: 0 },
    { name: "space-1", rem: "0.25rem", px: 4 },
    { name: "space-2", rem: "0.5rem",  px: 8 },
    { name: "space-3", rem: "0.75rem", px: 12 },
    { name: "space-4", rem: "1rem",    px: 16 },
    { name: "space-5", rem: "1.25rem", px: 20 },
    { name: "space-6", rem: "1.5rem",  px: 24 },
    { name: "space-8", rem: "2rem",    px: 32 },
    { name: "space-10", rem: "2.5rem", px: 40 },
    { name: "space-12", rem: "3rem",   px: 48 },
    { name: "space-16", rem: "4rem",   px: 64 },
  ];

  const text = [
    { name: "text-xs",   rem: "0.75rem",  px: 12 },
    { name: "text-sm",   rem: "0.875rem", px: 14 },
    { name: "text-base", rem: "1rem",     px: 16 },
    { name: "text-lg",   rem: "1.125rem", px: 18 },
    { name: "text-xl",   rem: "1.25rem",  px: 20 },
    { name: "text-2xl",  rem: "1.5rem",   px: 24 },
    { name: "text-3xl",  rem: "1.875rem", px: 30 },
    { name: "text-4xl",  rem: "2.25rem",  px: 36 },
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
    { name: "shadow-menu" },
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
    { name: "control-sm", rem: "2rem",   px: 32 },
    { name: "control-md", rem: "2.5rem", px: 40 },
    { name: "control-lg", rem: "3rem",   px: 48 },
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
        Tailwind 호환 스케일. padding / margin / gap / inset 에 사용. v0.59.0 부터 <strong>rem</strong> 단위로
        정의되어 사용자 브라우저 글꼴 확대(접근성 / 시력 보조)에 비례 반응한다 — 옆의 px 값은 root font-size = 16px 기준 환산값.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {spacing.map(({ name, rem, px }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 140px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)", fontVariantNumeric: "tabular-nums" }}>
              {rem} · {px}px
            </span>
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
      <p className="muted">
        폰트 크기 스케일. CSS 에서는 <code>font-size</code>, Flutter 는 <code>shUi.text.*</code>. 본문 토큰은 rem 으로
        정의되어 사용자 글꼴 설정을 그대로 따른다 (WCAG 1.4.4).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", margin: "var(--space-4) 0" }}>
        {text.map(({ name, rem, px }) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 140px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <code style={{ fontSize: "var(--text-xs)" }}>--{name}</code>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)", fontVariantNumeric: "tabular-nums" }}>
              {rem} · {px}px
            </span>
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
      <p className="muted">
        카드 / 팝업 / 모달 레벨별 그림자. <code>shadow-menu</code> 는 dropdown / select / context-menu 전용 다층 그림자 (v0.59.7+).
      </p>
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

      <h3>Gradient</h3>
      <p className="muted">
        브랜드 표면용 슬롯 3개 (primary / surface / overlay). 컴포넌트별 inline 사용 대신 토큰
        하나로 묶어 Light/Dark 모드 전환 시에도 일관성 유지. CSS는 <code>linear-gradient(...)</code>
        문자열 그대로, Flutter는 <code>LinearGradient</code> 로 자동 변환된다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-6)",
          margin: "var(--space-4) 0 var(--space-8)",
        }}
      >
        {(["primary", "surface", "overlay"] as const).map((name) => (
          <div
            key={name}
            style={{
              padding: "var(--space-6) var(--space-3)",
              background: `var(--gradient-${name})`,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              textAlign: "center",
              minHeight: "5rem",
            }}
          >
            <code
              style={{
                fontSize: "var(--text-xs)",
                background: "var(--background)",
                padding: "0.125rem 0.375rem",
                borderRadius: "calc(var(--radius) - 4px)",
              }}
            >
              --gradient-{name}
            </code>
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
        Button / Input / Select 등 폼 컨트롤의 높이 스케일. Flutter 는 <code>shUi.control.*</code>.
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-4)", margin: "var(--space-4) 0" }}>
        {control.map(({ name, rem, px }) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
            <div
              style={{
                height: `var(--${name})`,
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
            <span style={{ fontSize: "var(--text-xs)", color: "var(--foreground-muted)", fontVariantNumeric: "tabular-nums" }}>
              {rem} · {px}px
            </span>
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
  --space-4: 1rem;            /* dimension 토큰은 rem (v0.59.0+) */
  --text-sm: 0.875rem;
  --weight-medium: 500;
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-menu: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --duration-fast: 120ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --control-md: 2.25rem;
  --border-width: 1px;        /* 1px 미만 정밀도가 의미 있는 값은 px 유지 */
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
