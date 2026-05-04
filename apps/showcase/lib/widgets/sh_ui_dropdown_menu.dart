import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui DropdownMenu — 트리거에서 펼쳐지는 명령 메뉴.
///
/// Flutter의 [PopupMenuButton]을 sh-ui 토큰으로 스타일링한 래퍼.
/// 체크박스·라디오 항목과 구분선·라벨을 지원한다.
///
///   ShUiDropdownMenu<String>(
///     child: ShUiButton(onPressed: null, child: Text('메뉴')),
///     items: const [
///       ShUiDropdownMenuItem(value: 'new', label: '새로 만들기'),
///       ShUiDropdownMenuItem(value: 'open', label: '열기'),
///       ShUiDropdownMenuDivider(),
///       ShUiDropdownMenuItem(value: 'close', label: '닫기'),
///     ],
///     onSelected: (value) => print(value),
///   )
class ShUiDropdownMenu<T> extends StatelessWidget {
  /// 트리거 위젯. 탭하면 메뉴가 펼쳐진다.
  final Widget child;

  /// 메뉴 항목 목록.
  final List<ShUiDropdownMenuEntry<T>> items;

  /// 항목 선택 콜백. null이면 비활성.
  final ValueChanged<T>? onSelected;

  /// 트리거에 대한 배치 방향. 기본 bottom.
  final ShUiDropdownMenuSide side;

  /// 툴팁 텍스트. PopupMenuButton의 기본 툴팁을 덮어쓴다.
  final String? tooltip;

  const ShUiDropdownMenu({
    super.key,
    required this.child,
    required this.items,
    this.onSelected,
    this.side = ShUiDropdownMenuSide.bottom,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return PopupMenuButton<T>(
      tooltip: tooltip ?? '',
      onSelected: onSelected,
      enabled: onSelected != null,
      color: colors.background,
      surfaceTintColor: Colors.transparent,
      shadowColor: Colors.black.withValues(alpha: 0.12),
      elevation: 4,
      position: side == ShUiDropdownMenuSide.top
          ? PopupMenuPosition.over
          : PopupMenuPosition.under,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
        side: BorderSide(color: colors.border),
      ),
      padding: const EdgeInsets.all(4),
      itemBuilder: (context) =>
          items.map((e) => e.toPopupMenuEntry(context)).toList(),
      child: child,
    );
  }
}

enum ShUiDropdownMenuSide { top, bottom }

/// DropdownMenu 항목의 베이스 인터페이스.
abstract class ShUiDropdownMenuEntry<T> {
  const ShUiDropdownMenuEntry();
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context);
}

/// 기본 명령 항목.
class ShUiDropdownMenuItem<T> extends ShUiDropdownMenuEntry<T> {
  final T value;
  final String? label;
  final Widget? child;
  final Widget? leading;
  final bool disabled;

  const ShUiDropdownMenuItem({
    required this.value,
    this.label,
    this.child,
    this.leading,
    this.disabled = false,
  }) : assert(label != null || child != null, 'label 또는 child 중 하나는 필요');

  @override
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context) {
    return _buildItem(
      context: context,
      value: value,
      disabled: disabled,
      leading: leading,
      label: label,
      child: child,
    );
  }
}

/// 체크박스 항목 — checked 상태면 ✓ 인디케이터 표시.
class ShUiDropdownMenuCheckboxItem<T> extends ShUiDropdownMenuEntry<T> {
  final T value;
  final String? label;
  final Widget? child;
  final bool checked;
  final bool disabled;

  const ShUiDropdownMenuCheckboxItem({
    required this.value,
    this.label,
    this.child,
    required this.checked,
    this.disabled = false,
  }) : assert(label != null || child != null);

  @override
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context) {
    return _buildItem(
      context: context,
      value: value,
      disabled: disabled,
      leading: checked
          ? const Icon(Icons.check, size: 14)
          : const SizedBox(width: 14),
      label: label,
      child: child,
    );
  }
}

/// 라디오 항목 — selected 상태면 ● 인디케이터 표시.
class ShUiDropdownMenuRadioItem<T> extends ShUiDropdownMenuEntry<T> {
  final T value;
  final String? label;
  final Widget? child;
  final bool selected;
  final bool disabled;

  const ShUiDropdownMenuRadioItem({
    required this.value,
    this.label,
    this.child,
    required this.selected,
    this.disabled = false,
  }) : assert(label != null || child != null);

  @override
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context) {
    return _buildItem(
      context: context,
      value: value,
      disabled: disabled,
      leading: selected
          ? const Icon(Icons.circle, size: 8)
          : const SizedBox(width: 14),
      label: label,
      child: child,
    );
  }
}

/// 구분선.
class ShUiDropdownMenuDivider<T> extends ShUiDropdownMenuEntry<T> {
  const ShUiDropdownMenuDivider();

  @override
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return PopupMenuDivider(
      height: 1,
      color: shUi.colors.border,
    );
  }
}

/// 섹션 라벨 — 탭 불가, 작은 대문자 제목.
class ShUiDropdownMenuLabel<T> extends ShUiDropdownMenuEntry<T> {
  final String label;

  const ShUiDropdownMenuLabel(this.label);

  @override
  PopupMenuEntry<T> toPopupMenuEntry(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return PopupMenuItem<T>(
      enabled: false,
      height: 28,
      padding: const EdgeInsets.fromLTRB(12, 6, 12, 2),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: shUi.colors.foregroundMuted,
          fontSize: 11,
          fontWeight: shUi.weight.semibold,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}

PopupMenuEntry<T> _buildItem<T>({
  required BuildContext context,
  required T value,
  required bool disabled,
  required Widget? leading,
  required String? label,
  required Widget? child,
}) {
  final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
  final colors = shUi.colors;

  return PopupMenuItem<T>(
    value: value,
    enabled: !disabled,
    height: 36,
    padding: const EdgeInsets.symmetric(horizontal: 10),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (leading != null) ...[
          IconTheme(
            data: IconThemeData(color: colors.foreground, size: 14),
            child: leading,
          ),
          const SizedBox(width: 8),
        ],
        Expanded(
          child: DefaultTextStyle(
            style: TextStyle(
              color: disabled ? colors.foregroundMuted : colors.foreground,
              fontSize: shUi.text.sm,
              height: 1.2,
            ),
            overflow: TextOverflow.ellipsis,
            child: child ?? Text(label ?? ''),
          ),
        ),
      ],
    ),
  );
}
