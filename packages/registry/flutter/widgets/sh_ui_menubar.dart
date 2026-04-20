import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import 'sh_ui_dropdown_menu.dart';

/// sh-ui Menubar — 상단 앱 메뉴바(파일/편집/보기 등).
///
/// 여러 개의 "메뉴"를 가로로 나열한다. 각 메뉴는 trigger 라벨 + 항목 리스트.
///
///   ShUiMenubar(
///     menus: [
///       ShUiMenubarMenu(
///         label: '파일',
///         items: const [
///           ShUiDropdownMenuItem(value: 'new', label: '새로 만들기'),
///           ShUiDropdownMenuItem(value: 'open', label: '열기…'),
///         ],
///         onSelected: (v) => ...,
///       ),
///       ShUiMenubarMenu(label: '편집', items: [...], onSelected: ...),
///     ],
///   )
class ShUiMenubar extends StatelessWidget {
  final List<ShUiMenubarMenu> menus;

  const ShUiMenubar({
    super.key,
    required this.menus,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: menus
            .map((m) => _MenubarItem(menu: m))
            .toList(),
      ),
    );
  }
}

/// Menubar 한 항목 — 라벨 + 드롭다운 항목 리스트.
class ShUiMenubarMenu {
  final String label;
  final List<ShUiDropdownMenuEntry<dynamic>> items;
  final ValueChanged<dynamic>? onSelected;

  const ShUiMenubarMenu({
    required this.label,
    required this.items,
    this.onSelected,
  });
}

class _MenubarItem extends StatelessWidget {
  final ShUiMenubarMenu menu;

  const _MenubarItem({required this.menu});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ShUiDropdownMenu<dynamic>(
      items: menu.items,
      onSelected: menu.onSelected,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(
          menu.label,
          style: TextStyle(
            color: colors.foreground,
            fontSize: shUi.text.sm,
            height: 1,
          ),
        ),
      ),
    );
  }
}
