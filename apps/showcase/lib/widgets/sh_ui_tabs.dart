import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiTabsVariant { underline, pill, plain }

enum ShUiTabsOrientation { horizontal, vertical }

/// sh-ui Tabs — 탭 네비게이션.
///
/// ShUiTabs(
///   variant: ShUiTabsVariant.underline,
///   orientation: ShUiTabsOrientation.horizontal,
///   tabs: [
///     ShUiTab(label: '개요', child: Text('개요 내용')),
///     ShUiTab(label: '설정', child: Text('설정 내용')),
///   ],
/// )
class ShUiTabs extends StatefulWidget {
  final List<ShUiTab> tabs;
  final int initialIndex;
  final ValueChanged<int>? onChanged;
  final ShUiTabsVariant variant;
  final ShUiTabsOrientation orientation;

  /// vertical 일 때 탭 리스트의 너비.
  final double verticalListWidth;

  const ShUiTabs({
    super.key,
    required this.tabs,
    this.initialIndex = 0,
    this.onChanged,
    this.variant = ShUiTabsVariant.underline,
    this.orientation = ShUiTabsOrientation.horizontal,
    this.verticalListWidth = 160,
  });

  @override
  State<ShUiTabs> createState() => _ShUiTabsState();
}

class _ShUiTabsState extends State<ShUiTabs> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  void _select(int index) {
    setState(() => _selectedIndex = index);
    widget.onChanged?.call(index);
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final tabList = _ShUiTabList(
      tabs: widget.tabs,
      selectedIndex: _selectedIndex,
      onSelect: _select,
      variant: widget.variant,
      orientation: widget.orientation,
      colors: colors,
      radius: shUi.radius,
    );

    final content = _selectedIndex < widget.tabs.length
        ? widget.tabs[_selectedIndex].child
        : const SizedBox.shrink();

    if (widget.orientation == ShUiTabsOrientation.vertical) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(width: widget.verticalListWidth, child: tabList),
          SizedBox(width: shUi.spacing.s4),
          Expanded(child: content),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        tabList,
        content,
      ],
    );
  }
}

class ShUiTab {
  final String label;
  final Widget? icon;
  final Widget child;

  const ShUiTab({
    required this.label,
    this.icon,
    required this.child,
  });
}

class _ShUiTabList extends StatelessWidget {
  final List<ShUiTab> tabs;
  final int selectedIndex;
  final ValueChanged<int> onSelect;
  final ShUiTabsVariant variant;
  final ShUiTabsOrientation orientation;
  final ShUiColorTokens colors;
  final ShUiRadiusTokens radius;

  const _ShUiTabList({
    required this.tabs,
    required this.selectedIndex,
    required this.onSelect,
    required this.variant,
    required this.orientation,
    required this.colors,
    required this.radius,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final isVertical = orientation == ShUiTabsOrientation.vertical;

    final triggers = List.generate(tabs.length, (i) {
      return _ShUiTabTrigger(
        label: tabs[i].label,
        icon: tabs[i].icon,
        selected: i == selectedIndex,
        onTap: () => onSelect(i),
        variant: variant,
        orientation: orientation,
        colors: colors,
        radius: radius,
      );
    });

    Widget list = isVertical
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: triggers,
          )
        : SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: triggers,
            ),
          );

    // underline variant 구분선
    if (variant == ShUiTabsVariant.underline) {
      list = Container(
        decoration: BoxDecoration(
          border: Border(
            bottom: isVertical
                ? BorderSide.none
                : BorderSide(color: colors.border, width: shUi.borderWidth.normal),
            right: isVertical
                ? BorderSide(color: colors.border, width: shUi.borderWidth.normal)
                : BorderSide.none,
          ),
        ),
        child: list,
      );
    }

    // pill variant 배경
    if (variant == ShUiTabsVariant.pill) {
      list = Container(
        padding: EdgeInsets.all(shUi.spacing.s1),
        decoration: BoxDecoration(
          color: colors.backgroundMuted,
          borderRadius: BorderRadius.circular(radius.defaultRadius),
        ),
        child: list,
      );
    }

    return list;
  }
}

class _ShUiTabTrigger extends StatefulWidget {
  final String label;
  final Widget? icon;
  final bool selected;
  final VoidCallback onTap;
  final ShUiTabsVariant variant;
  final ShUiTabsOrientation orientation;
  final ShUiColorTokens colors;
  final ShUiRadiusTokens radius;

  const _ShUiTabTrigger({
    required this.label,
    this.icon,
    required this.selected,
    required this.onTap,
    required this.variant,
    required this.orientation,
    required this.colors,
    required this.radius,
  });

  @override
  State<_ShUiTabTrigger> createState() => _ShUiTabTriggerState();
}

class _ShUiTabTriggerState extends State<_ShUiTabTrigger> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final isVertical = widget.orientation == ShUiTabsOrientation.vertical;

    Color bg;
    Color fg;
    BoxBorder? border;

    switch (widget.variant) {
      case ShUiTabsVariant.underline:
        bg = Colors.transparent;
        fg = widget.selected ? widget.colors.foreground : widget.colors.foregroundMuted;
        if (widget.selected) {
          border = isVertical
              ? Border(
                  right: BorderSide(
                    color: widget.colors.foreground,
                    width: shUi.borderWidth.strong,
                  ),
                )
              : Border(
                  bottom: BorderSide(
                    color: widget.colors.foreground,
                    width: shUi.borderWidth.strong,
                  ),
                );
        } else {
          border = null;
        }
        break;
      case ShUiTabsVariant.pill:
        bg = widget.selected ? widget.colors.background : Colors.transparent;
        fg = widget.selected ? widget.colors.foreground : widget.colors.foregroundMuted;
        border = null;
        break;
      case ShUiTabsVariant.plain:
        bg = Colors.transparent;
        fg = widget.selected ? widget.colors.foreground : widget.colors.foregroundMuted;
        border = null;
        break;
    }

    if (_hover && !widget.selected) {
      fg = widget.colors.foreground;
    }

    final rowChildren = <Widget>[
      if (widget.icon != null) ...[
        IconTheme(
          data: IconThemeData(color: fg, size: 16),
          child: widget.icon!,
        ),
        const SizedBox(width: 6),
      ],
      Text(
        widget.label,
        style: TextStyle(
          color: fg,
          fontSize: shUi.text.sm,
          fontWeight: widget.selected ? shUi.weight.medium : shUi.weight.regular,
          height: 1,
        ),
      ),
    ];

    final trigger = AnimatedContainer(
      duration: shUi.duration.fast,
      height: isVertical ? shUi.control.md : null,
      padding: EdgeInsets.symmetric(
        horizontal: shUi.spacing.s4,
        vertical: shUi.spacing.s2,
      ),
      decoration: BoxDecoration(
        color: bg,
        border: border,
        borderRadius: widget.variant == ShUiTabsVariant.pill
            ? BorderRadius.circular(widget.radius.defaultRadius - 2)
            : null,
        boxShadow: widget.variant == ShUiTabsVariant.pill && widget.selected
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 2,
                  offset: const Offset(0, 1),
                ),
              ]
            : null,
      ),
      alignment: isVertical ? Alignment.centerLeft : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: rowChildren,
      ),
    );

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: trigger,
      ),
    );
  }
}
