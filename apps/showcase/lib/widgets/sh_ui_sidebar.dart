import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Sidebar — 네비게이션 사이드바 / 드로어.
///
/// 기본(`mode: auto`)은 반응형으로 동작한다.
///   - 화면 폭 >= [ShUiBreakpointTokens.md] → inline (Row 레이아웃 유지)
///   - 화면 폭 <  md → drawer (backdrop + 슬라이드)
/// 강제로 고정하려면 `mode: ShUiSidebarMode.inline` 또는 `.drawer`.
///
/// drawer 모드에서는 사이드바가 숨겨져 있으므로 [ShUiSidebarTrigger]는
/// AppBar 등 바깥에 배치해야 한다.
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

/* ───────── Variant / Mode ───────── */

/// Sidebar 외형 변형.
/// - [sidebar] 기본. 가장자리에 붙어 border로 구분.
/// - [floating] 카드처럼 띄워 여백과 radius를 적용.
/// - [inset] 사이드바는 가장자리에 붙고, 메인 컨텐츠(ShUiSidebarInset)가
///           내부 여백/radius를 가진 형태.
enum ShUiSidebarVariant { sidebar, floating, inset }

/// Sidebar 배치 모드.
/// - [auto] 화면 폭 기준 자동. `>= breakpoint.md` 면 inline, 미만이면 drawer.
/// - [inline] 항상 Row 레이아웃의 고정 사이드바.
/// - [drawer] 항상 backdrop + 슬라이드 drawer.
enum ShUiSidebarMode { auto, inline, drawer }

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

class ShUiSidebar extends StatefulWidget {
  final Widget? header;
  final Widget? footer;
  final List<Widget> children;
  final ShUiSidebarVariant variant;
  final ShUiSidebarMode mode;

  const ShUiSidebar({
    super.key,
    this.header,
    this.footer,
    required this.children,
    this.variant = ShUiSidebarVariant.sidebar,
    this.mode = ShUiSidebarMode.auto,
  });

  @override
  State<ShUiSidebar> createState() => _ShUiSidebarState();
}

class _ShUiSidebarState extends State<ShUiSidebar>
    with SingleTickerProviderStateMixin {
  OverlayEntry? _drawerEntry;
  AnimationController? _drawerCtrl;
  bool _lastOverlayOpen = false;

  bool _computeDrawer(BuildContext context, ShUiTheme shUi) {
    switch (widget.mode) {
      case ShUiSidebarMode.inline:
        return false;
      case ShUiSidebarMode.drawer:
        return true;
      case ShUiSidebarMode.auto:
        return MediaQuery.of(context).size.width < shUi.breakpoint.md;
    }
  }

  @override
  void dispose() {
    _removeDrawer();
    _drawerCtrl?.dispose();
    super.dispose();
  }

  void _ensureCtrl(ShUiTheme shUi) {
    _drawerCtrl ??= AnimationController(
      vsync: this,
      duration: shUi.duration.base,
    );
  }

  void _showDrawer() {
    if (_drawerEntry != null || _drawerCtrl == null) return;
    final overlayState = Overlay.maybeOf(context);
    if (overlayState == null) return;
    _drawerEntry = OverlayEntry(builder: _buildDrawerOverlay);
    overlayState.insert(_drawerEntry!);
    _drawerCtrl!.forward();
  }

  void _hideDrawer(VoidCallback onClosed) {
    if (_drawerEntry == null) {
      onClosed();
      return;
    }
    var closed = false;
    void finish() {
      if (closed) return;
      closed = true;
      _drawerCtrl?.value = 0;
      _removeDrawer();
      onClosed();
    }

    _drawerCtrl?.reverse().whenComplete(finish);
    // 새 라우트로 이동해 현재 라우트가 비활성화되면 TickerMode가 꺼져
    // reverse() 애니메이션이 진행되지 않는다. 타이머 fallback으로 강제 제거.
    Future<void>.delayed(const Duration(milliseconds: 400), finish);
  }

  void _removeDrawer() {
    _drawerEntry?.remove();
    _drawerEntry = null;
  }

  Widget _buildDrawerOverlay(BuildContext overlayContext) {
    final shUi =
        Theme.of(overlayContext).extension<ShUiTheme>() ?? ShUiTheme.light;
    final scope = _ShUiSidebarScope.of(context);
    final width = scope?.expandedWidth ?? 256;
    final curve = CurvedAnimation(
      parent: _drawerCtrl!,
      curve: shUi.ease.standard,
    );
    return Stack(
      fit: StackFit.expand,
      children: [
        FadeTransition(
          opacity: curve,
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: ModalBarrier(
              dismissible: true,
              onDismiss: () => scope?.toggle(),
              color: Colors.black.withValues(alpha: 0.25),
            ),
          ),
        ),
        Positioned(
          left: 0,
          top: 0,
          bottom: 0,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(-1, 0),
              end: Offset.zero,
            ).animate(curve),
            child: SizedBox(
              width: width,
              child: Material(
                color: Colors.transparent,
                child: _buildPanel(shUi, forceOpen: true, insetSafeArea: true),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPanel(
    ShUiTheme shUi, {
    required bool forceOpen,
    bool insetSafeArea = false,
  }) {
    final colors = shUi.colors;
    final isFloating = widget.variant == ShUiSidebarVariant.floating;
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
    final margin =
        isFloating ? EdgeInsets.all(shUi.spacing.s2) : EdgeInsets.zero;
    final clip = isFloating ? Clip.antiAlias : Clip.none;
    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.header != null) widget.header!,
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(vertical: shUi.spacing.s4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: widget.children,
            ),
          ),
        ),
        if (widget.footer != null) widget.footer!,
      ],
    );
    return Container(
      margin: margin,
      decoration: decoration,
      clipBehavior: clip,
      // drawer 모드: 배경은 노치 영역까지 연장하되 콘텐츠만 SafeArea 안쪽으로.
      child: insetSafeArea ? SafeArea(right: false, child: content) : content,
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;
    final isDrawer = _computeDrawer(context, shUi);

    _ensureCtrl(shUi);

    // drawer 모드에서 open 상태 변화에 따라 overlay 토글
    if (isDrawer) {
      if (isOpen && !_lastOverlayOpen) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _showDrawer();
        });
      } else if (!isOpen && _lastOverlayOpen) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _hideDrawer(() {});
        });
      }
      _lastOverlayOpen = isOpen;
      // drawer 모드에서는 Row 레이아웃에서 자리를 차지하지 않는다.
      return const SizedBox.shrink();
    }

    // inline 모드로 바뀌면 떠있는 overlay 정리.
    if (_drawerEntry != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _drawerCtrl?.value = 0;
        _removeDrawer();
      });
    }
    _lastOverlayOpen = false;

    final width =
        isOpen ? (scope?.expandedWidth ?? 256) : (scope?.collapsedWidth ?? 56);
    final isFloating = widget.variant == ShUiSidebarVariant.floating;

    return AnimatedContainer(
      duration: shUi.duration.slow,
      curve: shUi.ease.standard,
      width: width + (isFloating ? shUi.spacing.s2 * 2 : 0),
      margin: EdgeInsets.zero,
      child: _buildPanel(shUi, forceOpen: false),
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
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;
    // 접힌 상태(56px)에선 s4(16) 패딩이 너무 커서 trigger(36px)가 경계를
    // 벗어나 hit test 영역이 잘린다. 좌우만 s2로 줄여 트리거가 안쪽에 들어오도록.
    return AnimatedContainer(
      duration: shUi.duration.slow,
      curve: shUi.ease.standard,
      padding: EdgeInsets.symmetric(
        horizontal: isOpen ? shUi.spacing.s4 : shUi.spacing.s2,
        vertical: shUi.spacing.s4,
      ),
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
    final scope = _ShUiSidebarScope.of(context);
    final isOpen = scope?.open ?? true;
    return AnimatedContainer(
      duration: shUi.duration.slow,
      curve: shUi.ease.standard,
      padding: EdgeInsets.symmetric(
        horizontal: isOpen ? shUi.spacing.s4 : shUi.spacing.s2,
        vertical: shUi.spacing.s4,
      ),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: shUi.colors.border)),
      ),
      child: child,
    );
  }
}

/* ───────── Group ───────── */

class ShUiSidebarGroup extends StatefulWidget {
  final String? label;
  final List<Widget> children;

  /// `true`면 label 탭으로 접기/펼치기 가능. `label`이 있어야 의미가 있다.
  final bool collapsible;

  /// `collapsible: true`일 때 초기 확장 상태.
  final bool initiallyExpanded;

  const ShUiSidebarGroup({
    super.key,
    this.label,
    required this.children,
    this.collapsible = false,
    this.initiallyExpanded = true,
  });

  @override
  State<ShUiSidebarGroup> createState() => _ShUiSidebarGroupState();
}

class _ShUiSidebarGroupState extends State<ShUiSidebarGroup>
    with SingleTickerProviderStateMixin {
  late bool _expanded;

  @override
  void initState() {
    super.initState();
    _expanded = widget.initiallyExpanded;
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final scope = _ShUiSidebarScope.of(context);
    final isSidebarOpen = scope?.open ?? true;

    final hasLabel = widget.label != null && isSidebarOpen;
    final canCollapse = widget.collapsible && hasLabel;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasLabel)
            _buildLabel(shUi, canCollapse: canCollapse),
          AnimatedSize(
            duration: shUi.duration.fast,
            curve: shUi.ease.standard,
            alignment: Alignment.topCenter,
            child: (canCollapse && !_expanded)
                ? const SizedBox(width: double.infinity)
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.min,
                    children: widget.children,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(ShUiTheme shUi, {required bool canCollapse}) {
    final textStyle = TextStyle(
      color: shUi.colors.foregroundMuted,
      fontSize: shUi.text.xs,
      fontWeight: shUi.weight.medium,
      letterSpacing: 0.5,
    );

    if (!canCollapse) {
      return Padding(
        padding: EdgeInsets.symmetric(
          horizontal: shUi.spacing.s4,
          vertical: shUi.spacing.s1,
        ),
        child: Text(widget.label!, style: textStyle),
      );
    }

    return InkWell(
      onTap: () => setState(() => _expanded = !_expanded),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: shUi.spacing.s4,
          vertical: shUi.spacing.s1,
        ),
        child: Row(
          children: [
            Expanded(child: Text(widget.label!, style: textStyle)),
            AnimatedRotation(
              turns: _expanded ? 0 : -0.25,
              duration: shUi.duration.fast,
              curve: shUi.ease.standard,
              child: Icon(
                Icons.keyboard_arrow_down,
                size: 16,
                color: shUi.colors.foregroundMuted,
              ),
            ),
          ],
        ),
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

    final expandedLayout = Row(
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
            softWrap: false,
          ),
        ),
        if (_hasChildren)
          AnimatedRotation(
            duration: shUi.duration.base,
            curve: shUi.ease.standard,
            turns: _expanded ? 0.25 : 0,
            child: Icon(Icons.chevron_right, size: 16, color: fg),
          ),
      ],
    );

    final collapsedLayout = Center(
      child: widget.icon != null
          ? Icon(widget.icon, size: 20, color: fg)
          : Text(
              widget.label.isNotEmpty ? widget.label[0] : '',
              style: TextStyle(color: fg, fontSize: shUi.text.sm),
            ),
    );

    final row = MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: handleTap,
        child: AnimatedContainer(
          duration: shUi.duration.slow,
          curve: shUi.ease.standard,
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
          child: ClipRect(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final w = constraints.maxWidth.isFinite
                    ? constraints.maxWidth
                    : 0.0;
                return AnimatedCrossFade(
                  duration: shUi.duration.slow,
                  sizeCurve: shUi.ease.standard,
                  firstCurve: shUi.ease.standard,
                  secondCurve: shUi.ease.standard,
                  alignment: Alignment.centerLeft,
                  crossFadeState: isOpen
                      ? CrossFadeState.showFirst
                      : CrossFadeState.showSecond,
                  firstChild: SizedBox(width: w, child: expandedLayout),
                  secondChild: SizedBox(width: w, child: collapsedLayout),
                );
              },
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
