export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";

export default function GettingStarted() {
  return (
    <main className="container">
      <h1>시작하기</h1>
      <p className="muted">기존 프로젝트에 sh-ui을 도입하는 3단계. React와 Flutter 공통 흐름.</p>

      <p>
        <strong>새 Next.js 프로젝트부터 시작한다면</strong> <a href="/create">프로젝트 생성</a> 페이지에서
        <code> npx sh-ui-create</code> 로 FSD 구조 + sh-ui 설정 + 플러그인(Sentry, next-intl)이
        미리 구성된 템플릿을 쓸 수 있다. 이 페이지는 기존 프로젝트에 수동으로 도입하는 흐름.
      </p>

      <h2>1. 설정 파일 생성</h2>
      <p>프로젝트 루트에서:</p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui init`} />
      <p>
        대화형 프롬프트로 <code>platform</code>(react/flutter), <code>base</code>(neutral/zinc/slate), <code>radius</code>, <code>mode</code>를 선택하면 <code>sh-ui.config.json</code>이 만들어진다.
      </p>

      <h2>2. 토큰 + 기본 리셋 설치</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add tokens base`} />
      <p>
        설정 값으로 치환된 토큰 파일이 생성된다. React는 CSS 변수(<code>tokens.css</code>)와 <code>base.css</code>, Flutter는 Dart 상수(<code>sh_ui_tokens.dart</code>).
      </p>
      <p className="muted">
        <strong>base.css</strong>는 box-sizing·overflow·min-width 등 모바일에서 자주 발생하는 레이아웃 사고(자식 min-content가 뷰포트를 밀어 가로 스크롤이 생기는 현상 등)를 미연에 방지한다. tokens.css 바로 뒤에 import.
      </p>

      <h2>3. 컴포넌트 설치</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add button`} />
      <p>
        컴포넌트 소스가 <code>paths.components</code>로 복사된다. 이 시점부터 <strong>그 코드는 당신의 것</strong>이다 — 자유롭게 수정 가능.
      </p>

      <h2>플랫폼별 설정</h2>

      <h3>React</h3>
      <CodePanel
        language="json"
        filename="sh-ui.config.json"
        code={`{
  "platform": "react",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "app/styles/tokens.css",
    "components": "components/ui"
  }
}`}
      />
      <p>
        전역 CSS에서 <code>tokens.css</code>를 임포트하면 <code>--background</code>, <code>--primary</code>, <code>--space-*</code>, <code>--text-*</code> 등 모든 토큰이 전역에 노출된다.
      </p>
      <CodePanel
        language="css"
        code={`@import "./styles/tokens.css";
@import "./styles/base.css";`}
      />

      <h4>다크 모드</h4>
      <p>
        <code>mode: &quot;light-dark&quot;</code>로 설정하면 기본(light)은 <code>:root</code>에, 다크는 <code>.dark</code> 클래스에 정의된다. <code>&lt;html className=&quot;dark&quot;&gt;</code> 토글만으로 전환된다.
      </p>

      <h3>Flutter</h3>
      <CodePanel
        language="json"
        filename="sh-ui.config.json"
        code={`{
  "platform": "flutter",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "lib/foundation/sh_ui_tokens.dart",
    "components": "lib/widgets"
  }
}`}
      />

      <h4>MaterialApp 등록</h4>
      <p>
        <code>ShUiTheme</code>를 <code>ThemeData.extensions</code>에 끼워 넣으면 모든 하위 위젯에서 <code>Theme.of(context).extension&lt;ShUiTheme&gt;()</code>로 토큰에 접근할 수 있다.
      </p>
      <CodePanel
        language="dart"
        filename="main.dart"
        code={`import 'package:flutter/material.dart';
import 'foundation/sh_ui_tokens.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _mode = ThemeMode.light;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      themeMode: _mode,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: ShUiColorTokens.light.background,
        extensions: const [ShUiTheme.light],
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: ShUiColorTokens.dark.background,
        extensions: const [ShUiTheme.dark],
      ),
      home: const HomePage(),
    );
  }
}`}
      />

      <h4>위젯에서 토큰 사용</h4>
      <p>
        <code>shUi</code> 한 줄로 꺼내 쓰는 게 관례.
      </p>
      <CodeTabs
        items={[
          {
            value: "basic",
            label: "기본",
            language: "dart",
            filename: "my_widget.dart",
            code: `@override
Widget build(BuildContext context) {
  final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
  final colors = shUi.colors;

  return Container(
    height: shUi.control.md,
    padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
    decoration: BoxDecoration(
      color: colors.background,
      border: Border.all(color: colors.border, width: shUi.borderWidth.normal),
      borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
    ),
    child: Text(
      '안녕',
      style: TextStyle(
        color: colors.foreground,
        fontSize: shUi.text.sm,
        fontWeight: shUi.weight.medium,
      ),
    ),
  );
}`,
          },
          {
            value: "animated",
            label: "애니메이션",
            language: "dart",
            filename: "my_widget.dart",
            code: `AnimatedContainer(
  duration: shUi.duration.fast,           // 120ms
  curve: shUi.ease.standard,
  height: shUi.control.md,
  decoration: BoxDecoration(
    color: isOpen ? colors.primary : colors.background,
    boxShadow: isOpen ? shUi.shadow.md : null,
  ),
  child: ...,
)`,
          },
          {
            value: "disabled",
            label: "비활성",
            language: "dart",
            filename: "my_widget.dart",
            code: `Opacity(
  opacity: disabled ? shUi.opacity.disabled : 1,
  child: IgnorePointer(
    ignoring: disabled,
    child: button,
  ),
)`,
          },
        ]}
      />

      <h4>다크 모드 토글</h4>
      <p>
        <code>themeMode: ThemeMode.light / .dark / .system</code>으로 전환. 각 분기에 <code>ShUiTheme.light</code>와 <code>ShUiTheme.dark</code>를 사용한다.
      </p>

      <h4>SafeArea — 노치·홈 인디케이터 대응</h4>
      <p>
        iPhone의 노치 / Dynamic Island, Android의 gesture indicator 등 시스템 UI 영역에 콘텐츠가 걸치지 않도록 <strong>화면 템플릿 수준에서 처리</strong>한다. <code>Scaffold</code> + <code>AppBar</code> 조합은 상단 상태바를 자동으로 흡수하지만, 전체 화면 배경을 직접 그리거나 <code>AppBar</code>가 없을 때는 <code>SafeArea</code>로 감싼다.
      </p>
      <CodeTabs
        items={[
          {
            value: "scaffold",
            label: "표준 (Scaffold)",
            language: "dart",
            filename: "my_screen.dart",
            code: `// Scaffold + AppBar는 상단 시스템 영역 자동 처리.
// body만 SafeArea로 감싸면 하단 홈 인디케이터까지 대응.
Scaffold(
  appBar: AppBar(title: const Text('제목')),
  body: SafeArea(
    child: Padding(
      padding: EdgeInsets.all(shUi.spacing.s4),
      child: content,
    ),
  ),
);`,
          },
          {
            value: "edge-to-edge",
            label: "전체 배경",
            language: "dart",
            filename: "my_screen.dart",
            code: `// 배경은 화면 끝까지, 콘텐츠는 안전 영역 안으로.
Scaffold(
  extendBody: true,
  extendBodyBehindAppBar: true,
  body: Stack(children: [
    Positioned.fill(child: GradientBackground()),
    SafeArea(
      child: Padding(
        padding: EdgeInsets.all(shUi.spacing.s4),
        child: content,
      ),
    ),
  ]),
);`,
          },
          {
            value: "measure",
            label: "직접 측정",
            language: "dart",
            filename: "my_screen.dart",
            code: `// 안전 영역 수치를 직접 읽기
final padding = MediaQuery.paddingOf(context);
// padding.top      — 상태바/노치 (iOS ~44–59, Android ~24–48)
// padding.bottom   — 홈 인디케이터 (iOS 34, Android 0 or 16–24)
// padding.left / right — 가로 모드의 노치

Container(
  padding: EdgeInsets.only(
    top: padding.top + shUi.spacing.s2,
    bottom: padding.bottom,
  ),
  child: content,
);`,
          },
        ]}
      />

      <h4>반응형 — 태블릿 / 폴드</h4>
      <p>
        <code>shUi.breakpoint.sm/md/lg/xl</code> 토큰을 <code>MediaQuery</code> 또는 <code>LayoutBuilder</code>와 조합하면 화면 폭에 따라 레이아웃을 분기할 수 있다. sh-ui의 <code>ShUiSidebar.mode: auto</code>가 동일 패턴을 내부적으로 사용한다.
      </p>
      <CodePanel
        language="dart"
        code={`LayoutBuilder(
  builder: (context, c) {
    if (c.maxWidth >= shUi.breakpoint.lg) {
      return TabletLayout();   // 2-column, sidebar inline
    }
    if (c.maxWidth >= shUi.breakpoint.md) {
      return CompactLayout();  // sidebar drawer
    }
    return PhoneLayout();
  },
)`}
      />

      <h2>다음 단계</h2>
      <ul>
        <li><a href="/tokens">토큰</a> — 전체 토큰 목록과 값</li>
        <li><a href="/create">프로젝트 생성</a> — 토큰 직접 편집 + 그 디자인으로 새 프로젝트 스캐폴드</li>
        <li><a href="/components/button">컴포넌트</a> — 설치 및 사용법</li>
      </ul>
    </main>
  );
}
