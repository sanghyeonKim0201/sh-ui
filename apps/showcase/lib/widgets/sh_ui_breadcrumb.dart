import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Breadcrumb — 현재 페이지의 계층 위치를 나타내는 내비게이션.
///
/// ShUiBreadcrumb(
///   items: [
///     ShUiBreadcrumbItem(label: '홈', onTap: () => ...),
///     ShUiBreadcrumbItem(label: '컴포넌트', onTap: () => ...),
///     ShUiBreadcrumbItem(label: 'Breadcrumb', isCurrent: true),
///   ],
/// )
class ShUiBreadcrumb extends StatelessWidget {
  final List<ShUiBreadcrumbItem> items;

  /// 구분자 위젯. null이면 ▶ 아이콘.
  final Widget? separator;

  const ShUiBreadcrumb({
    super.key,
    required this.items,
    this.separator,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final effectiveSeparator = separator ??
        Icon(
          Icons.chevron_right,
          size: 16,
          color: colors.foregroundMuted.withValues(alpha: 0.6),
        );

    final children = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      children.add(items[i]);
      if (i < items.length - 1) {
        children.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: effectiveSeparator,
          ),
        );
      }
    }

    return Semantics(
      label: 'Breadcrumb',
      container: true,
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: children,
      ),
    );
  }
}

/// Breadcrumb 내 단일 항목.
///
/// - [onTap]이 주어지면 링크처럼 동작.
/// - [isCurrent] = true면 현재 페이지(탭 불가, 강조).
class ShUiBreadcrumbItem extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool isCurrent;

  const ShUiBreadcrumbItem({
    super.key,
    required this.label,
    this.onTap,
    this.isCurrent = false,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final text = Text(
      label,
      style: TextStyle(
        color: isCurrent ? colors.foreground : colors.foregroundMuted,
        fontSize: shUi.text.sm,
        fontWeight: isCurrent ? shUi.weight.medium : FontWeight.normal,
      ),
    );

    if (isCurrent || onTap == null) {
      return Semantics(
        header: isCurrent,
        child: text,
      );
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        child: text,
      ),
    );
  }
}
