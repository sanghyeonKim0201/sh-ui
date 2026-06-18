// sh-ui ShUiTree 위젯 동작 테스트.
//
// 확장 토글 / 선택 콜백 / 선택 노드 Semantics 플래그를 검증한다.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sh_ui_showcase/foundation/sh_ui_tokens.dart';
import 'package:sh_ui_showcase/widgets/sh_ui_tree.dart';

Widget _frame(Widget child) {
  return MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      extensions: const [ShUiTheme.light],
    ),
    home: Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SizedBox(width: 320, child: child),
      ),
    ),
  );
}

const _nodes = [
  ShUiTreeNode(
    id: 'src',
    label: 'src',
    children: [
      ShUiTreeNode(id: 'btn', label: 'button.tsx'),
      ShUiTreeNode(id: 'tree', label: 'tree.tsx'),
    ],
  ),
  ShUiTreeNode(id: 'pkg', label: 'package.json'),
];

void main() {
  group('ShUiTree', () {
    testWidgets('확장 토글: 부모 탭 → 자식이 나타난다', (tester) async {
      await tester.pumpWidget(_frame(const ShUiTree(nodes: _nodes)));

      // 접힌 상태: 자식 라벨이 없다.
      expect(find.text('button.tsx'), findsNothing);

      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();

      // 확장 후: 자식 라벨이 보인다.
      expect(find.text('button.tsx'), findsOneWidget);
      expect(find.text('tree.tsx'), findsOneWidget);
    });

    testWidgets('축소 토글: 확장된 부모 재탭 → 자식이 사라진다', (tester) async {
      await tester.pumpWidget(
        _frame(const ShUiTree(nodes: _nodes, defaultExpandedIds: {'src'})),
      );

      expect(find.text('button.tsx'), findsOneWidget);

      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();

      expect(find.text('button.tsx'), findsNothing);
    });

    testWidgets('선택: 노드 탭 → onSelect가 해당 id로 호출된다', (tester) async {
      String? selected;
      await tester.pumpWidget(
        _frame(ShUiTree(
          nodes: _nodes,
          onSelect: (id) => selected = id,
        )),
      );

      await tester.tap(find.text('package.json'));
      await tester.pumpAndSettle();

      expect(selected, 'pkg');
    });

    testWidgets('disabled 노드: 탭해도 onSelect가 호출되지 않는다', (tester) async {
      String? selected;
      const nodes = [
        ShUiTreeNode(id: 'locked', label: 'secret', disabled: true),
        ShUiTreeNode(id: 'ok', label: 'public'),
      ];
      await tester.pumpWidget(
        _frame(ShUiTree(
          nodes: nodes,
          onSelect: (id) => selected = id,
        )),
      );

      await tester.tap(find.text('secret'));
      await tester.pumpAndSettle();
      expect(selected, isNull);

      await tester.tap(find.text('public'));
      await tester.pumpAndSettle();
      expect(selected, 'ok');
    });

    testWidgets('Semantics: 선택된 노드에 selected 플래그가 선다', (tester) async {
      await tester.pumpWidget(
        _frame(const ShUiTree(
          nodes: _nodes,
          defaultSelectedId: 'pkg',
        )),
      );
      await tester.pumpAndSettle();

      expect(
        tester.getSemantics(find.text('package.json')),
        isSemantics(isSelected: true),
      );
    });

    testWidgets('Semantics: 부모 노드에 expanded 상태가 반영된다', (tester) async {
      await tester.pumpWidget(
        _frame(const ShUiTree(
          nodes: _nodes,
          defaultExpandedIds: {'src'},
        )),
      );
      await tester.pumpAndSettle();

      expect(
        tester.getSemantics(find.text('src')),
        isSemantics(isExpanded: true),
      );
    });
  });

  group('ShUiTree 키보드 네비게이션', () {
    testWidgets('ArrowDown → 다음 보이는 행으로 포커스 이동 후 Enter로 선택', (tester) async {
      // 부모 'src'가 펼쳐진 상태: 보이는 순서 = src, button.tsx, tree.tsx, package.json
      String? selected;
      await tester.pumpWidget(
        _frame(ShUiTree(
          nodes: _nodes,
          defaultExpandedIds: const {'src'},
          onSelect: (id) => selected = id,
        )),
      );

      // 리프 'button.tsx'를 탭해 포커스+선택을 시드한다(리프는 토글 없이 선택만 —
      // 부모를 탭하면 확장 상태가 토글되어 시드가 어긋난다).
      await tester.tap(find.text('button.tsx'));
      await tester.pumpAndSettle();
      expect(selected, 'btn');

      // ArrowDown 한 번 → 'tree.tsx'로 포커스 이동.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();

      // Enter → 포커스된 노드가 선택된다.
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(selected, 'tree');
    });

    testWidgets('ArrowDown 두 번 → 한 칸씩 이동(package.json 선택)', (tester) async {
      String? selected;
      await tester.pumpWidget(
        _frame(ShUiTree(
          nodes: _nodes,
          defaultExpandedIds: const {'src'},
          onSelect: (id) => selected = id,
        )),
      );

      // 리프 'button.tsx' 시드 → 보이는 순서: src, button.tsx, tree.tsx, package.json
      await tester.tap(find.text('button.tsx'));
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown); // → tree.tsx
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown); // → package.json
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(selected, 'pkg');
    });

    testWidgets('ArrowRight → 접힌 부모를 펼친다(자식 행 등장)', (tester) async {
      await tester.pumpWidget(_frame(const ShUiTree(nodes: _nodes)));

      // 접힌 상태.
      expect(find.text('button.tsx'), findsNothing);

      // 첫 행 'src'를 탭 → 자식이 보이게 된다(탭은 부모면 토글). 다시 탭해 접고
      // ArrowRight로 펼치는 경로를 검증하기 위해, 포커스만 시드하도록
      // 리프 노드 대신 부모를 탭한 뒤 ArrowLeft로 먼저 접는다.
      await tester.tap(find.text('src'));
      await tester.pumpAndSettle();
      expect(find.text('button.tsx'), findsOneWidget); // 탭으로 펼쳐짐

      // ArrowLeft → 다시 접는다(포커스는 'src' 유지).
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(find.text('button.tsx'), findsNothing);

      // ArrowRight → 다시 펼쳐져 자식 행이 등장한다.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(find.text('button.tsx'), findsOneWidget);
      expect(find.text('tree.tsx'), findsOneWidget);
    });

    testWidgets('ArrowUp → 이전 행으로 포커스 이동', (tester) async {
      String? selected;
      await tester.pumpWidget(
        _frame(ShUiTree(
          nodes: _nodes,
          defaultExpandedIds: const {'src'},
          onSelect: (id) => selected = id,
        )),
      );

      // 'tree.tsx'를 탭해 포커스 시드.
      await tester.tap(find.text('tree.tsx'));
      await tester.pumpAndSettle();
      expect(selected, 'tree');

      // ArrowUp → 'button.tsx'로 이동.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(selected, 'btn');
    });
  });
}
