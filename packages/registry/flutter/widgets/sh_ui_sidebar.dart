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

/* ───────── Variant ───────── */

/// Sidebar 외형 변형.
/// - [sidebar] 기본. 가장자리에 붙어 border로 구분.
/// - [floating] 카드처럼 띄워 여백과 radius를 적용.
/// - [inset] 사이드바는 가장자리에 붙고, 메인 컨텐츠(ShUiSidebarInset)가
///           내부 여백/radius를 가진 형태.
enum ShUiSidebarVariant { sidebar, floating, inset }

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
  String? _activePanelId;

  bool get open => _open;
  String? get activePanelId => _activePanelId;

  void toggle() => setState(() => _open = !_open);
  void setOpen(bool value) => setState(() => _open = value);

  /// 같은 id를 다시 주면 닫힘(토글). null이면 명시적으로 닫기.
  void setActivePanel(String? id) {
    setState(() {
      _activePanelId = (_activePanelId == id) ? null : id;
    });
  }

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
      activePanelId: _activePanelId,
      setActivePanel: setActivePanel,
      child: widget.child,
    );
  }
}

class _ShUiSidebarScope extends InheritedWidget {
  final bool open;
  final double expandedWidth;
  final double collapsedWidth;
  final VoidCallback toggle;
  final String? activePanelId;
  final ValueChanged<String?> setActivePanel;

  const _ShUiSidebarScope({
    required this.open,
    required this.expandedWidth,
    required this.collapsedWidth,
    required this.toggle,
    required this.activePanelId,
    required this.setActivePanel,
    required super.child,
  });

  static _ShUiSidebarScope? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_ShUiSidebarScope>();
  }

  @override
  bool updateShouldNotify(covariant _ShUiSidebarScope old) =>
      open != old.open || activePanelId != old.activePanelId;
}

/* ───────── useSidebar equivalent ───────── */

class ShUiSidebarState {
  final bool open;
  final VoidCallback toggle;
  final double expandedWidth;
  final double collapsedWidth;
  final String? activePanelId;
  final ValueChanged<String?> setActivePanel;

  const ShUiSidebarState({
    required this.open,
    required this.toggle,
    required this.expandedWidth,
    required this.collapsedWidth,
    required this.activePanelId,
    required this.setActivePanel,
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
    activePanelId: scope.activePanelId,
    setActivePanel: scope.setActivePanel,
  );
}

/* ───────── Sidebar ───────── */

class ShUiSidebar extends StatelessWidget {
  final Widget? header;
  final Widget? footer;
  final List<Widget> children;
  final ShUiSidebarVariant variant;

  const ShUiSidebar({
    super.key,
    this.header,
    this.footer,
    required this.children,
    this.variant = ShUiSidebarVariant.sidebar,
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

    final isFloating = variant == ShUiSidebarVariant.floating;

    // floating: 카드 형태. margin + radius + border 전체 적용.
    // inset: 사이드바 자체는 기본(sidebar)과 동일한 flush 배치.
    //        내부 여백은 ShUiSidebarInset에서 담당.
    // sidebar: 가장자리에 flush + 우측 border.
    final decoration = isFloating
        ? BoxDecoration(
            color: colors.backgroundSubtle,
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            border: Border.all(color: colors.border),
            boxShadow: shUi.shadow.sm,
          )
        : BoxDecoration(
            color: colors.backgroundSubtle,
            border: Border(right: BorderSide(color: colors.border)),
          );

    final margin = isFloating
        ? EdgeInsets.all(shUi.spacing.s2)
        : EdgeInsets.zero;

    final clip = isFloating
        ? Clip.antiAlias
        : Clip.none;

    return AnimatedContainer(
      duration: shUi.duration.slow,
      curve: shUi.ease.standard,
      width: width + (isFloating ? shUi.spacing.s2 * 2 : 0),
      margin: EdgeInsets.zero,
      child: Container(
        margin: margin,
        decoration: decoration,
        clipBehavior: clip,
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
      ),
    );
  }
}

/* ───────── Inset (variant=inset 짝) ─────────
 * 사이드바 옆 메인 영역을 둥근 카드 형태로 감싸는 래퍼.
 * variant=inset 사이드바와 함께 쓰면 shadcn/ui 풍의 "inset" 레이아웃이 완성된다.
 */

class ShUiSidebarInset extends StatelessWidget {
  final Widget child;

  const ShUiSidebarInset({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    return Expanded(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          0,
          shUi.spacing.s2,
          shUi.spacing.s2,
          shUi.spacing.s2,
        ),
        child: Container(
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            border: Border.all(color: colors.border),
          ),
          clipBehavior: Clip.antiAlias,
          child: child,
        ),
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

/* ───────── Item ─────────
 *
 * - `panelId`가 지정되면 탭 시 해당 id의 ShUiSidebarPanel을 토글한다.
 *   activePanelId와 일치하면 자동으로 isActive 처럼 보이도록 강조한다.
 * - `children`이 지정되면 서브메뉴처럼 동작:
 *   - 탭 시 확장/축소 토글 (chevron 회전, AnimatedSize)
 *   - children은 들여쓰기되어 아래 렌더
 */

class ShUiSidebarItem extends StatefulWidget {
  final IconData? icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final String? panelId;
  final List<ShUiSidebarItem>? children;
  final int _depth;

  const ShUiSidebarItem({
    super.key,
    this.icon,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.panelId,
    this.children,
  }) : _depth = 0;

  const ShUiSidebarItem._nested({
    super.key,
    this.icon,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.panelId,
    this.children,
    required int depth,
  }) : _depth = depth;

  @override
  State<ShUiSidebarItem> createState() => _ShUiSidebarItemState();
}

class _ShUiSidebarItemState extends State<ShUiSidebarItem>
    with SingleTickerProviderStateMixin {
  bool _hover = false;
  bool _expanded = false;

  bool get _hasChildren =>
      widget.children != null && widget.children!.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;

    // panelId 기반 자동 활성 판정.
    final panelActive =
        widget.panelId != null && scope?.activePanelId == widget.panelId;
    final resolvedActive = widget.isActive || panelActive;

    Color bg;
    Color fg;

    if (resolvedActive) {
      bg = colors.backgroundMuted;
      fg = colors.foreground;
    } else if (_hover) {
      bg = colors.backgroundMuted;
      fg = colors.foreground;
    } else {
      bg = Colors.transparent;
      fg = colors.foregroundMuted;
    }

    void handleTap() {
      // panelId가 있으면 panel 토글
      if (widget.panelId != null && scope != null) {
        scope.setActivePanel(widget.panelId);
      }
      // children이 있으면 확장 토글
      if (_hasChildren) {
        setState(() => _expanded = !_expanded);
      }
      widget.onTap?.call();
    }

    final indent = widget._depth * shUi.spacing.s4;

    final row = MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: handleTap,
        child: AnimatedContainer(
          duration: shUi.duration.fast,
          margin: EdgeInsets.fromLTRB(
            shUi.spacing.s2 + indent,
            1,
            shUi.spacing.s2,
            1,
          ),
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
                          fontWeight: resolvedActive
                              ? shUi.weight.medium
                              : shUi.weight.regular,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (_hasChildren)
                      AnimatedRotation(
                        duration: shUi.duration.base,
                        curve: shUi.ease.standard,
                        turns: _expanded ? 0.25 : 0,
                        child: Icon(
                          Icons.chevron_right,
                          size: 16,
                          color: fg,
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

    if (!_hasChildren) return row;

    // 서브메뉴: AnimatedSize로 높이 애니메이션.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        row,
        AnimatedSize(
          duration: shUi.duration.base,
          curve: shUi.ease.standard,
          alignment: Alignment.topCenter,
          child: (_expanded && isOpen)
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (final child in widget.children!)
                      ShUiSidebarItem._nested(
                        key: child.key,
                        icon: child.icon,
                        label: child.label,
                        isActive: child.isActive,
                        onTap: child.onTap,
                        panelId: child.panelId,
                        children: child.children,
                        depth: widget._depth + 1,
                      ),
                  ],
                )
              : const SizedBox.shrink(),
        ),
      ],
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

/* ───────── TOC (Table of Contents) ─────────
 *
 * 페이지 내 섹션 링크를 트리 형태로 렌더한다.
 * React와 달리 Flutter에는 IntersectionObserver가 없으므로
 * 활성 섹션 id는 호출자가 직접 관리해 `activeId`로 주입한다.
 *
 * ShUiSidebarTOC(
 *   activeId: _activeId,
 *   onItemTap: (id) => _scrollTo(id),
 *   items: const [
 *     ShUiSidebarTOCItem(id: 'intro', label: 'Intro'),
 *     ShUiSidebarTOCItem(id: 'usage', label: 'Usage', children: [
 *       ShUiSidebarTOCItem(id: 'usage-basic', label: 'Basic'),
 *     ]),
 *   ],
 * )
 */

class ShUiSidebarTOCItem {
  final String id;
  final String label;
  final List<ShUiSidebarTOCItem>? children;

  const ShUiSidebarTOCItem({
    required this.id,
    required this.label,
    this.children,
  });
}

class ShUiSidebarTOC extends StatelessWidget {
  final List<ShUiSidebarTOCItem> items;
  final String? activeId;
  final ValueChanged<String>? onItemTap;

  const ShUiSidebarTOC({
    super.key,
    required this.items,
    this.activeId,
    this.onItemTap,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final item in items)
            _TOCNode(item: item, depth: 0, activeId: activeId, onItemTap: onItemTap),
        ],
      ),
    );
  }
}

class _TOCNode extends StatefulWidget {
  final ShUiSidebarTOCItem item;
  final int depth;
  final String? activeId;
  final ValueChanged<String>? onItemTap;

  const _TOCNode({
    required this.item,
    required this.depth,
    required this.activeId,
    required this.onItemTap,
  });

  @override
  State<_TOCNode> createState() => _TOCNodeState();
}

class _TOCNodeState extends State<_TOCNode> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final isActive = widget.activeId == widget.item.id;
    final fg = isActive
        ? colors.foreground
        : (_hover ? colors.foreground : colors.foregroundMuted);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        MouseRegion(
          cursor: SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: GestureDetector(
            onTap: () => widget.onItemTap?.call(widget.item.id),
            child: Container(
              color: Colors.transparent,
              padding: EdgeInsets.fromLTRB(
                shUi.spacing.s4 + widget.depth * shUi.spacing.s3,
                shUi.spacing.s1,
                shUi.spacing.s4,
                shUi.spacing.s1,
              ),
              child: Text(
                widget.item.label,
                style: TextStyle(
                  color: fg,
                  fontSize: shUi.text.sm,
                  fontWeight:
                      isActive ? shUi.weight.medium : shUi.weight.regular,
                ),
              ),
            ),
          ),
        ),
        if (widget.item.children != null)
          for (final child in widget.item.children!)
            _TOCNode(
              item: child,
              depth: widget.depth + 1,
              activeId: widget.activeId,
              onItemTap: widget.onItemTap,
            ),
      ],
    );
  }
}

/* ───────── Panel (보조 확장 패널) ─────────
 *
 * ShUiSidebarItem의 panelId와 매칭되는 id로 열리는 보조 패널.
 * 사이드바 바로 옆(Row)에 배치하면 된다. activePanelId가 일치할 때만 렌더.
 */

class ShUiSidebarPanel extends StatelessWidget {
  final String panelId;
  final Widget child;
  final double width;

  const ShUiSidebarPanel({
    super.key,
    required this.panelId,
    required this.child,
    this.width = 280,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final scope = _ShUiSidebarScope.of(context);
    final open = scope?.activePanelId == panelId;

    return AnimatedSize(
      duration: shUi.duration.base,
      curve: shUi.ease.standard,
      alignment: Alignment.centerLeft,
      child: open
          ? Container(
              width: width,
              decoration: BoxDecoration(
                color: colors.background,
                border: Border(right: BorderSide(color: colors.border)),
              ),
              child: child,
            )
          : const SizedBox.shrink(),
    );
  }
}
