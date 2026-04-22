import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Pagination — 페이지 단위 내비게이션.
///
/// ShUiPagination(
///   page: 3,
///   pageCount: 10,
///   siblingCount: 1,
///   onPageChanged: (p) => ...,
/// )
///
/// - [page] / [pageCount]는 1-based.
/// - [siblingCount] 만큼 현재 페이지 양옆을 펼치고, 그 바깥은 "..."로 접는다.
/// - 첫/마지막 페이지 번호는 항상 보인다.
class ShUiPagination extends StatelessWidget {
  final int page;
  final int pageCount;
  final int siblingCount;
  final ValueChanged<int>? onPageChanged;
  final bool showPrevNext;

  const ShUiPagination({
    super.key,
    required this.page,
    required this.pageCount,
    this.siblingCount = 1,
    this.onPageChanged,
    this.showPrevNext = true,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    if (pageCount <= 0) return const SizedBox.shrink();

    final tokens = _buildRange();

    final children = <Widget>[];

    if (showPrevNext) {
      children.add(
        _NavButton(
          label: '이전',
          icon: Icons.chevron_left,
          iconLeading: true,
          enabled: page > 1 && onPageChanged != null,
          onTap: () => onPageChanged?.call(page - 1),
          shUi: shUi,
          colors: colors,
        ),
      );
    }

    for (final token in tokens) {
      if (token is int) {
        final isActive = token == page;
        children.add(
          _PageButton(
            label: '$token',
            isActive: isActive,
            enabled: !isActive && onPageChanged != null,
            onTap: () => onPageChanged?.call(token),
            shUi: shUi,
            colors: colors,
          ),
        );
      } else {
        children.add(_Ellipsis(colors: colors, shUi: shUi));
      }
    }

    if (showPrevNext) {
      children.add(
        _NavButton(
          label: '다음',
          icon: Icons.chevron_right,
          iconLeading: false,
          enabled: page < pageCount && onPageChanged != null,
          onTap: () => onPageChanged?.call(page + 1),
          shUi: shUi,
          colors: colors,
        ),
      );
    }

    return Semantics(
      label: 'Pagination',
      container: true,
      child: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 4,
        runSpacing: 4,
        children: children,
      ),
    );
  }

  /// 현재 페이지 주변 ±siblingCount + 양 끝 + dots 토큰.
  List<Object> _buildRange() {
    final totalSlots = siblingCount * 2 + 5;
    if (pageCount <= totalSlots) {
      return [for (var i = 1; i <= pageCount; i++) i];
    }

    final leftSibling = (page - siblingCount).clamp(1, pageCount);
    final rightSibling = (page + siblingCount).clamp(1, pageCount);

    final showLeftDots = leftSibling > 2;
    final showRightDots = rightSibling < pageCount - 1;

    if (!showLeftDots && showRightDots) {
      final leftCount = 3 + 2 * siblingCount;
      return [
        for (var i = 1; i <= leftCount; i++) i,
        _Dots.instance,
        pageCount,
      ];
    }

    if (showLeftDots && !showRightDots) {
      final rightCount = 3 + 2 * siblingCount;
      return [
        1,
        _Dots.instance,
        for (var i = pageCount - rightCount + 1; i <= pageCount; i++) i,
      ];
    }

    return [
      1,
      _Dots.instance,
      for (var i = leftSibling; i <= rightSibling; i++) i,
      _Dots.instance,
      pageCount,
    ];
  }
}

class _Dots {
  static const _Dots instance = _Dots._();
  const _Dots._();
}

class _PageButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final bool enabled;
  final VoidCallback onTap;
  final ShUiTheme shUi;
  final ShUiColorTokens colors;

  const _PageButton({
    required this.label,
    required this.isActive,
    required this.enabled,
    required this.onTap,
    required this.shUi,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isActive ? colors.foreground : Colors.transparent;
    final fg = isActive ? colors.background : colors.foreground;
    final radius = BorderRadius.circular(shUi.radius.defaultRadius);

    return Semantics(
      selected: isActive,
      button: !isActive,
      label: isActive ? '현재 페이지 $label' : '페이지 $label',
      child: Material(
        color: bg,
        borderRadius: radius,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: radius,
          child: Container(
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            padding: const EdgeInsets.symmetric(horizontal: 10),
            alignment: Alignment.center,
            child: Text(
              label,
              style: TextStyle(
                color: fg,
                fontSize: shUi.text.sm,
                fontWeight:
                    isActive ? shUi.weight.medium : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool iconLeading;
  final bool enabled;
  final VoidCallback onTap;
  final ShUiTheme shUi;
  final ShUiColorTokens colors;

  const _NavButton({
    required this.label,
    required this.icon,
    required this.iconLeading,
    required this.enabled,
    required this.onTap,
    required this.shUi,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(shUi.radius.defaultRadius);
    final iconWidget = Icon(icon, size: 16, color: colors.foreground);
    final textWidget = Text(
      label,
      style: TextStyle(color: colors.foreground, fontSize: shUi.text.sm),
    );

    return Opacity(
      opacity: enabled ? 1 : shUi.opacity.disabled,
      child: Material(
        color: Colors.transparent,
        borderRadius: radius,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: radius,
          child: Container(
            constraints: const BoxConstraints(minHeight: 36),
            padding: const EdgeInsets.symmetric(horizontal: 10),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: iconLeading
                  ? [iconWidget, const SizedBox(width: 6), textWidget]
                  : [textWidget, const SizedBox(width: 6), iconWidget],
            ),
          ),
        ),
      ),
    );
  }
}

class _Ellipsis extends StatelessWidget {
  final ShUiColorTokens colors;
  final ShUiTheme shUi;

  const _Ellipsis({required this.colors, required this.shUi});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 36,
      height: 36,
      child: Center(
        child: Text(
          '…',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.base,
          ),
        ),
      ),
    );
  }
}
