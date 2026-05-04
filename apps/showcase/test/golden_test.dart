// sh-ui Flutter 위젯 시각 회귀 테스트.
//
// 각 위젯의 기본 상태를 ShUiTheme 적용된 상태로 렌더해 골든 이미지로 비교.
// 기준 이미지는 `test/goldens/` 에 commit. 변경 검출 시 fail —
// 의도된 변경이면 `flutter test --update-goldens` 로 갱신.
//
// 새 위젯 추가: import 후 testWidgets 한 줄 추가.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sh_ui_showcase/foundation/sh_ui_tokens.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_button.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_card.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_checkbox.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_input.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_label.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_radio.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_skeleton.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_slider.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_switch.dart';

/// 모든 위젯을 동일한 ShUiTheme 환경 + 고정 크기로 감싸서 일관된 렌더 보장.
Widget _frame(Widget child, {Size size = const Size(220, 80)}) {
  return MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      extensions: const [ShUiTheme.light],
    ),
    home: Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SizedBox(
          width: size.width,
          height: size.height,
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Center(child: child),
          ),
        ),
      ),
    ),
  );
}

void main() {
  group('Golden — sh-ui widgets', () {
    testWidgets('button — primary', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiButton(onPressed: () {}, child: const Text('저장')),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/button.png'),
      );
    });

    testWidgets('button — secondary', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiButton(
          onPressed: () {},
          variant: ShUiButtonVariant.secondary,
          child: const Text('취소'),
        ),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/button-secondary.png'),
      );
    });

    testWidgets('card', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiCard(
          children: const [
            ShUiCardHeader(
              title: ShUiCardTitle('제목'),
              description: ShUiCardDescription('설명입니다'),
            ),
            ShUiCardContent(child: Text('본문')),
          ],
        ),
        size: const Size(280, 180),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/card.png'),
      );
    });

    testWidgets('input', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiInput(
          controller: TextEditingController(),
          placeholder: '검색',
        ),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/input.png'),
      );
    });

    testWidgets('checkbox — checked', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiCheckbox(checked: true, onChanged: (_) {}),
        size: const Size(80, 80),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/checkbox.png'),
      );
    });

    testWidgets('radio — selected', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiRadio<String>(value: 'a', groupValue: 'a', onChanged: (_) {}),
        size: const Size(80, 80),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/radio.png'),
      );
    });

    testWidgets('switch — on', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiSwitch(checked: true, onChanged: (_) {}),
        size: const Size(80, 80),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/switch.png'),
      );
    });

    testWidgets('skeleton', (tester) async {
      await tester.pumpWidget(_frame(
        const ShUiSkeleton(width: 160, height: 16),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/skeleton.png'),
      );
    });

    testWidgets('slider', (tester) async {
      await tester.pumpWidget(_frame(
        ShUiSlider(value: 60, onChanged: (_) {}),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/slider.png'),
      );
    });

    testWidgets('label', (tester) async {
      await tester.pumpWidget(_frame(
        const ShUiLabel(child: ShUiLabelTitle('이메일')),
      ));
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('goldens/label.png'),
      );
    });
  });
}
