import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_tree.dart';

const _fileTree = <ShUiTreeNode>[
  ShUiTreeNode(
    id: 'src',
    label: 'src',
    icon: Icons.folder_outlined,
    children: [
      ShUiTreeNode(
        id: 'components',
        label: 'components',
        icon: Icons.folder_outlined,
        children: [
          ShUiTreeNode(id: 'button', label: 'button.dart', icon: Icons.description_outlined),
          ShUiTreeNode(id: 'table', label: 'table.dart', icon: Icons.description_outlined),
          ShUiTreeNode(id: 'tree', label: 'tree.dart', icon: Icons.description_outlined),
        ],
      ),
      ShUiTreeNode(
        id: 'lib',
        label: 'lib',
        icon: Icons.folder_outlined,
        children: [
          ShUiTreeNode(id: 'utils', label: 'utils.dart', icon: Icons.description_outlined),
          ShUiTreeNode(id: 'theme', label: 'theme.dart', icon: Icons.description_outlined, disabled: true),
        ],
      ),
    ],
  ),
  ShUiTreeNode(id: 'readme', label: 'README.md', icon: Icons.article_outlined),
];

class TreePage extends StatelessWidget {
  const TreePage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본 — 확장/축소 + 단일 선택', colors),
        ShUiTree(
          nodes: _fileTree,
          defaultExpandedIds: const {'src', 'components'},
          defaultSelectedId: 'table',
        ),
        const SizedBox(height: 24),
        _section('밀도 sm — 좁은 사이드바용', colors),
        ShUiTree(
          nodes: _fileTree,
          size: ShUiTreeSize.sm,
          defaultExpandedIds: const {'src'},
        ),
      ],
    );
  }

  Widget _section(String title, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          color: colors.foreground,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
