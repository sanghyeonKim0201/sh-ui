// sh-ui ShUiTree 위젯 동작 테스트.
//
// 확장 토글 / 선택 콜백 / 선택 노드 Semantics 플래그를 검증한다.

import 'package:flutter/material.dart';
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
}
