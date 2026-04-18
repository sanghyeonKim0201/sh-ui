import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Sidebar — 네비게이션 사이드바 / 드로어.
///
/// Flutter에서는 Drawer 패턴과 조합하여 사용한다.
/// 데스크탑에서는 고정 사이드바, 모바일에서는 드로어로 동작.
///
/// ShUiSidebarProvider(
///   child: Row(
///     children: [
///       ShUiSidebar(
///         header: ShUiSidebarHeader(child: Text('앱 이름')),
///         children: [
///           ShUiSidebarGroup(
///             label: '메뉴',
///             children: [
///               ShUiSidebarItem(icon: Icons.home, label: '홈', isActive: true),
///               ShUiSidebarItem(icon: Icons.settings, label: '설정'),
///             ],
///           ),
///         ],
///       ),
///       Expanded(child: mainContent),
///     ],
///   ),
/// )

/* ───────── Provider ───────── */

class ShUiSidebarProvider extends StatefulWidget {
  final Widget child;
  final bool defaultOpen;
  final double expandedWidth;
  final double collapsedWidth;

  const ShUiSidebarProvider({
    super.key,
    required this.child,
    this.defaultOpen = true,
    this.expandedWidth = 256,
    this.collapsedWidth = 56,
  });

  @override
  State<ShUiSidebarProvider> createState() => ShUiSidebarProviderState();
}

class ShUiSidebarProviderState extends State<ShUiSidebarProvider> {
  late bool _open;

  bool get open => _open;

  void toggle() => setState(() => _open = !_open);
  void setOpen(bool value) => setState(() => _open = value);

  @override
  void initState() {
    super.initState();
    _open = widget.defaultOpen;
  }

  @override
  Widget build(BuildContext context) {
    return _ShUiSidebarScope(
      open: _open,
      expandedWidth: widget.expandedWidth,
      collapsedWidth: widget.collapsedWidth,
      toggle: toggle,
      child: widget.child,
    );
  }
}

class _ShUiSidebarScope extends InheritedWidget {
  final bool open;
  final double expandedWidth;
  final double collapsedWidth;
  final VoidCallback toggle;

  const _ShUiSidebarScope({
    required this.open,
    required this.expandedWidth,
    required this.collapsedWidth,
    required this.toggle,
    required super.child,
  });

  static _ShUiSidebarScope? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_ShUiSidebarScope>();
  }

  @override
  bool updateShouldNotify(covariant _ShUiSidebarScope old) =>
      open != old.open;
}

/* ───────── useSidebar equivalent ───────── */

class ShUiSidebarState {
  final bool open;
  final VoidCallback toggle;
  final double expandedWidth;
  final double collapsedWidth;

  const ShUiSidebarState({
    required this.open,
    required this.toggle,
    required this.expandedWidth,
    required this.collapsedWidth,
  });
}

ShUiSidebarState? useSidebar(BuildContext context) {
  final scope = _ShUiSidebarScope.of(context);
  if (scope == null) return null;
  return ShUiSidebarState(
    open: scope.open,
    toggle: scope.toggle,
    expandedWidth: scope.expandedWidth,
    collapsedWidth: scope.collapsedWidth,
  );
}

/* ───────── Sidebar ───────── */

class ShUiSidebar extends StatelessWidget {
  final Widget? header;
  final Widget? footer;
  final List<Widget> children;

  const ShUiSidebar({
    super.key,
    this.header,
    this.footer,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;
    final width = isOpen
        ? (scope?.expandedWidth ?? 256)
        : (scope?.collapsedWidth ?? 56);

    return AnimatedContainer(
      duration: shUi.duration.slow,
      curve: Curves.easeOut,
      width: width,
      decoration: BoxDecoration(
        color: colors.backgroundSubtle,
        border: Border(right: BorderSide(color: colors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (header != null) header!,
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(vertical: shUi.spacing.s2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children,
              ),
            ),
          ),
          if (footer != null) footer!,
        ],
      ),
    );
  }
}

/* ───────── Trigger ───────── */

class ShUiSidebarTrigger extends StatelessWidget {
  const ShUiSidebarTrigger({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = _ShUiSidebarScope.of(context);
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;

    return GestureDetector(
      onTap: scope?.toggle,
      child: Padding(
        padding: EdgeInsets.all(shUi.spacing.s2),
        child: Icon(
          Icons.menu,
          size: 20,
          color: shUi.colors.foreground,
        ),
      ),
    );
  }
}

/* ───────── Header / Footer ───────── */

class ShUiSidebarHeader extends StatelessWidget {
  final Widget child;

  const ShUiSidebarHeader({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Container(
      padding: EdgeInsets.all(shUi.spacing.s4),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: shUi.colors.border)),
      ),
      child: child,
    );
  }
}

class ShUiSidebarFooter extends StatelessWidget {
  final Widget child;

  const ShUiSidebarFooter({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Container(
      padding: EdgeInsets.all(shUi.spacing.s4),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: shUi.colors.border)),
      ),
      child: child,
    );
  }
}

/* ───────── Group ───────── */

class ShUiSidebarGroup extends StatelessWidget {
  final String? label;
  final List<Widget> children;

  const ShUiSidebarGroup({
    super.key,
    this.label,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label != null && isOpen)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s4, vertical: shUi.spacing.s1),
              child: Text(
                label!,
                style: TextStyle(
                  color: shUi.colors.foregroundMuted,
                  fontSize: shUi.text.xs,
                  fontWeight: shUi.weight.medium,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ...children,
        ],
      ),
    );
  }
}

/* ───────── Item ───────── */

class ShUiSidebarItem extends StatefulWidget {
  final IconData? icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;

  const ShUiSidebarItem({
    super.key,
    this.icon,
    required this.label,
    this.isActive = false,
    this.onTap,
  });

  @override
  State<ShUiSidebarItem> createState() => _ShUiSidebarItemState();
}

class _ShUiSidebarItemState extends State<ShUiSidebarItem> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;

    Color bg;
    Color fg;

    if (widget.isActive) {
      bg = colors.backgroundMuted;
      fg = colors.foreground;
    } else if (_hover) {
      bg = colors.backgroundMuted;
      fg = colors.foreground;
    } else {
      bg = Colors.transparent;
      fg = colors.foregroundMuted;
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: shUi.duration.fast,
          margin: EdgeInsets.symmetric(horizontal: shUi.spacing.s2, vertical: 1),
          padding: EdgeInsets.symmetric(
            horizontal: isOpen ? shUi.spacing.s3 : 0,
            vertical: shUi.spacing.s2,
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius:
                BorderRadius.circular(shUi.radius.defaultRadius - 2),
          ),
          child: isOpen
              ? Row(
                  children: [
                    if (widget.icon != null) ...[
                      Icon(widget.icon, size: 18, color: fg),
                      const SizedBox(width: 10),
                    ],
                    Expanded(
                      child: Text(
                        widget.label,
                        style: TextStyle(
                          color: fg,
                          fontSize: shUi.text.sm,
                          fontWeight: widget.isActive
                              ? shUi.weight.medium
                              : shUi.weight.regular,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                )
              : Center(
                  child: widget.icon != null
                      ? Icon(widget.icon, size: 20, color: fg)
                      : Text(
                          widget.label.isNotEmpty ? widget.label[0] : '',
                          style: TextStyle(color: fg, fontSize: shUi.text.sm),
                        ),
                ),
        ),
      ),
    );
  }
}

/* ───────── Separator ───────── */

class ShUiSidebarSeparator extends StatelessWidget {
  const ShUiSidebarSeparator({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s4, vertical: shUi.spacing.s2),
      child: Divider(height: 1, color: shUi.colors.border),
    );
  }
}
