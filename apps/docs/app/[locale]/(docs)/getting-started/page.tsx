export const dynamic = "force-static";

import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Link } from "@/i18n/navigation";

const richTags = {
  strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
  code: (chunks: React.ReactNode) => <code>{chunks}</code>,
};

export default function GettingStarted({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("gettingStarted");

  return (
    <main className="container">
      <h1>{t("title")}</h1>
      <p className="muted">{t("subtitle")}</p>

      <p>
        {t.rich("intro", {
          ...richTags,
          createLink: (chunks) => <Link href="/create">{chunks}</Link>,
        })}
      </p>

      <h2>{t("step1.heading")}</h2>
      <p>{t("step1.lead")}</p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli init`} />
      <p>{t.rich("step1.after", richTags)}</p>

      <h2>{t("step2.heading")}</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add tokens base`} />
      <p>{t.rich("step2.after", richTags)}</p>
      <p className="muted">{t.rich("step2.note", richTags)}</p>

      <h2>{t("step3.heading")}</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add button`} />
      <p>{t.rich("step3.after", richTags)}</p>

      <h2>{t("platformHeading")}</h2>

      <h3>{t("react.heading")}</h3>
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
      <p>{t.rich("react.globalImport", richTags)}</p>
      <CodePanel
        language="css"
        code={`@import "./styles/tokens.css";
@import "./styles/base.css";`}
      />

      <h4>{t("react.darkModeHeading")}</h4>
      <p>{t.rich("react.darkMode", richTags)}</p>

      <h3>{t("flutter.heading")}</h3>
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

      <h4>{t("flutter.materialAppHeading")}</h4>
      <p>{t.rich("flutter.materialApp", richTags)}</p>
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

      <h4>{t("flutter.tokensInWidgetHeading")}</h4>
      <p>{t.rich("flutter.tokensInWidget", richTags)}</p>
      <CodeTabs
        items={[
          {
            value: "basic",
            label: t("flutter.tabs.basic"),
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
            label: t("flutter.tabs.animated"),
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
            label: t("flutter.tabs.disabled"),
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

      <h4>{t("flutter.darkToggleHeading")}</h4>
      <p>{t.rich("flutter.darkToggle", richTags)}</p>

      <h4>{t("flutter.safeAreaHeading")}</h4>
      <p>{t.rich("flutter.safeArea", richTags)}</p>
      <CodeTabs
        items={[
          {
            value: "scaffold",
            label: t("flutter.safeAreaTabs.scaffold"),
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
            label: t("flutter.safeAreaTabs.edgeToEdge"),
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
            label: t("flutter.safeAreaTabs.measure"),
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

      <h4>{t("flutter.responsiveHeading")}</h4>
      <p>{t.rich("flutter.responsive", richTags)}</p>
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

      <h2>{t("next.heading")}</h2>
      <ul>
        <li>
          {t.rich("next.tokens", {
            tokensLink: (chunks) => <Link href="/tokens">{chunks}</Link>,
          })}
        </li>
        <li>
          {t.rich("next.create", {
            createLink: (chunks) => <Link href="/create">{chunks}</Link>,
          })}
        </li>
        <li>
          {t.rich("next.components", {
            componentsLink: (chunks) => <Link href="/components/button">{chunks}</Link>,
          })}
        </li>
      </ul>
    </main>
  );
}
