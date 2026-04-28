# {{project_name}}

sh-ui 기반 Flutter 앱.

## 시작하기

```bash
flutter pub get
flutter run
```

## sh-ui 위젯 추가

```bash
npx sh-ui add button
npx sh-ui add card input
```

위젯은 `lib/sh_ui/widgets/` 아래로 복사됩니다. 설정은 `sh-ui.config.json` 을 참조하세요.

## 구조

```
lib/
├── main.dart                        # 앱 진입점
└── sh_ui/                           # sh-ui 자산 (건드리지 말 것 — sh-ui CLI 가 관리)
    ├── foundation/
    │   └── sh_ui_tokens.dart        # 디자인 토큰
    └── widgets/                     # sh-ui add 로 추가되는 위젯들
```

## 더 알아보기

- sh-ui 컴포넌트 목록 및 가이드: https://github.com/sanghyeonKim0201/sh-ui
