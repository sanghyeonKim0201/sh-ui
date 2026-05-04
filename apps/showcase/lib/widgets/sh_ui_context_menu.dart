import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import 'sh_ui_dropdown_menu.dart';

/// sh-ui ContextMenu — 우클릭(데스크탑) / long-press(모바일)로 열리는 메뉴.
///
/// DropdownMenu와 같은 항목 타입(ShUiDropdownMenu* 계열)을 그대로 사용한다.
///
///   ShUiContextMenu<String>(
///     items: const [
///       ShUiDropdownMenuItem(value: 'copy', label: '복사'),
///       ShUiDropdownMenuItem(value: 'paste', label: '붙여넣기'),
///       ShUiDropdownMenuDivider(),
///       ShUiDropdownMenuItem(value: 'delete', label: '삭제'),
///     ],
///     onSelected: (value) => ...,
///     child: Container(... 우클릭 감지할 영역 ...),
///   )
class ShUiContextMenu<T> extends StatelessWidget {
  /// 우클릭/long-press 감지 영역 위젯.
  final Widget child;

  final List<ShUiDropdownMenuEntry<T>> items;
  final ValueChanged<T>? onSelected;

  const ShUiContextMenu({
    super.key,
    required this.child,
    required this.items,
    this.onSelected,
  });

  Future<void> _showAt(BuildContext context, Offset globalPosition) async {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final overlay = Overlay.of(context).context.findRenderObject() as RenderBox;

    final selected = await showMenu<T>(
      context: context,
      position: RelativeRect.fromRect(
        Rect.fromPoints(globalPosition, globalPosition),
        Offset.zero & overlay.size,
      ),
      color: colors.background,
      surfaceTintColor: Colors.transparent,
      shadowColor: Colors.black.withValues(alpha: 0.12),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
        side: BorderSide(color: colors.border),
      ),
      items: items.map((e) => e.toPopupMenuEntry(context)).toList(),
    );

    if (selected != null) onSelected?.call(selected);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onSecondaryTapDown: (details) {
        _showAt(context, details.globalPosition);
      },
      onLongPressStart: (details) {
        _showAt(context, details.globalPosition);
      },
      child: child,
    );
  }
}
