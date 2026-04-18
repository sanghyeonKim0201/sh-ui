export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";

export default function GettingStarted() {
  return (
    <main className="container">
      <h1>시작하기</h1>
      <p className="muted">프로젝트에 sh-ui을 도입하는 3단계. React와 Flutter 공통 흐름.</p>

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

      <h2>다음 단계</h2>
      <ul>
        <li><a href="/tokens">토큰</a> — 전체 토큰 목록과 값</li>
        <li><a href="/playground">플레이그라운드</a> — 토큰 직접 편집 & 미리보기</li>
        <li><a href="/components/button">컴포넌트</a> — 설치 및 사용법</li>
      </ul>
    </main>
  );
}
