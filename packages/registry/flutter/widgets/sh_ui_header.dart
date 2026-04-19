import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Header — 상단 네비게이션 바.
///
/// 기본([mode: auto])은 반응형으로 동작한다.
///   - 화면 폭 >= [ShUiBreakpointTokens.md] → 가로 나열된 네비 아이템
///   - 화면 폭 <  md → 햄버거 트리거 + backdrop + 좌측 slide drawer
/// 강제 고정은 `mode: ShUiHeaderMode.inline` 또는 `.drawer`.
///
/// ```dart
/// ShUiHeader(
///   logo: Icon(Icons.hexagon_outlined),
///   title: 'sh-ui',
///   items: [
///     ShUiHeaderItem(label: '홈', isActive: true, onTap: () {}),
///     ShUiHeaderItem(label: '문서', onTap: () {}),
///   ],
///   trailing: [IconButton(icon: Icon(Icons.dark_mode), onPressed: () {})],
/// )
/// ```

/// Header 배치 모드.
enum ShUiHeaderMode { auto, inline, drawer }

/// Header 네비게이션 아이템.
@immutable
class ShUiHeaderItem {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;
  final bool isActive;

  const ShUiHeaderItem({
    required this.label,
    this.icon,
    this.onTap,
    this.isActive = false,
  });
}

class ShUiHeader extends StatefulWidget {
  final Widget? logo;
  final String? title;
  final List<ShUiHeaderItem> items;
  final List<Widget>? trailing;
  final ShUiHeaderMode mode;

  /// drawer 모드에서 슬라이드되는 패널의 폭.
  final double drawerWidth;

  /// 헤더 자체의 높이. 기본 [ShUiControlTokens.md].
  final double? height;

  const ShUiHeader({
    super.key,
    this.logo,
    this.title,
    this.items = const [],
    this.trailing,
    this.mode = ShUiHeaderMode.auto,
    this.drawerWidth = 280,
    this.height,
  });

  @override
  State<ShUiHeader> createState() => _ShUiHeaderState();
}

class _ShUiHeaderState extends State<ShUiHeader>
    with SingleTickerProviderStateMixin {
  OverlayEntry? _drawerEntry;
  AnimationController? _drawerCtrl;
  bool _isOpen = false;

  bool _computeDrawer(BuildContext context, ShUiTheme shUi) {
    switch (widget.mode) {
      case ShUiHeaderMode.inline:
        return false;
      case ShUiHeaderMode.drawer:
        return true;
      case ShUiHeaderMode.auto:
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

  void _toggleDrawer(ShUiTheme shUi) {
    if (_isOpen) {
      _closeDrawer();
    } else {
      _openDrawer(shUi);
    }
  }

  void _openDrawer(ShUiTheme shUi) {
    if (_drawerEntry != null || _drawerCtrl == null) return;
    final overlay = Overlay.maybeOf(context);
    if (overlay == null) return;
    _drawerEntry = OverlayEntry(builder: (ctx) => _buildDrawerOverlay(ctx, shUi));
    overlay.insert(_drawerEntry!);
    _drawerCtrl!.forward();
    setState(() => _isOpen = true);
  }

  void _closeDrawer() {
    if (_drawerEntry == null || _drawerCtrl == null) {
      setState(() => _isOpen = false);
      return;
    }
    var closed = false;
    void finish() {
      if (closed) return;
      closed = true;
      _drawerCtrl?.value = 0;
      _removeDrawer();
      if (mounted) setState(() => _isOpen = false);
    }

    _drawerCtrl?.reverse().whenComplete(finish);
    Future<void>.delayed(const Duration(milliseconds: 400), finish);
  }

  void _removeDrawer() {
    _drawerEntry?.remove();
    _drawerEntry = null;
  }

  Widget _buildDrawerOverlay(BuildContext overlayCtx, ShUiTheme shUi) {
    final colors = shUi.colors;
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
              onDismiss: _closeDrawer,
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
              width: widget.drawerWidth,
              child: Material(
                color: Colors.transparent,
                child: Container(
                  decoration: BoxDecoration(
                    color: colors.backgroundSubtle,
                    border: Border(right: BorderSide(color: colors.border)),
                  ),
                  // 배경은 노치/홈 인디케이터 영역까지 연장하고, 콘텐츠만 SafeArea 안으로.
                  child: SafeArea(
                    right: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Drawer 헤더 — 로고 + 닫기
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: shUi.spacing.s4,
                            vertical: shUi.spacing.s4,
                          ),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(color: colors.border),
                            ),
                          ),
                          child: Row(
                            children: [
                              if (widget.logo != null) ...[
                                widget.logo!,
                                SizedBox(width: shUi.spacing.s2),
                              ],
                              if (widget.title != null)
                                Expanded(
                                  child: Text(
                                    widget.title!,
                                    style: TextStyle(
                                      color: colors.foreground,
                                      fontSize: shUi.text.base,
                                      fontWeight: shUi.weight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                )
                              else
                                const Spacer(),
                              IconButton(
                                icon: Icon(
                                  Icons.close,
                                  size: 20,
                                  color: colors.foreground,
                                ),
                                onPressed: _closeDrawer,
                              ),
                            ],
                          ),
                        ),
                        // 아이템 목록
                        Expanded(
                          child: ListView(
                            padding: EdgeInsets.symmetric(
                              vertical: shUi.spacing.s2,
                            ),
                            children: [
                              for (final item in widget.items)
                                _DrawerItemTile(
                                  item: item,
                                  onTap: () {
                                    item.onTap?.call();
                                    _closeDrawer();
                                  },
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    _ensureCtrl(shUi);
    final isDrawer = _computeDrawer(context, shUi);
    final height = widget.height ?? shUi.control.md;

    // drawer 모드에서 라우트가 비활성화될 때 overlay 자동 정리용 플래그.
    if (!isDrawer && _drawerEntry != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _drawerCtrl?.value = 0;
        _removeDrawer();
        if (mounted) setState(() => _isOpen = false);
      });
    }

    return Container(
      height: height,
      padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          // 좌측: drawer 모드면 햄버거, 아니면 로고+타이틀
          if (isDrawer)
            IconButton(
              icon: Icon(Icons.menu, size: 22, color: colors.foreground),
              onPressed: () => _toggleDrawer(shUi),
            ),
          if (widget.logo != null) ...[
            if (!isDrawer) widget.logo!,
            if (isDrawer) widget.logo!,
            SizedBox(width: shUi.spacing.s2),
          ],
          if (widget.title != null)
            Text(
              widget.title!,
              style: TextStyle(
                color: colors.foreground,
                fontSize: shUi.text.base,
                fontWeight: shUi.weight.bold,
                letterSpacing: -0.3,
              ),
            ),
          // 중앙/우측: inline 모드에서 네비 아이템
          if (!isDrawer && widget.items.isNotEmpty) ...[
            SizedBox(width: shUi.spacing.s6),
            Expanded(
              child: Row(
                children: [
                  for (final item in widget.items)
                    _InlineItemTile(item: item),
                ],
              ),
            ),
          ] else
            const Spacer(),
          // 트레일링
          if (widget.trailing != null)
            for (final w in widget.trailing!) w,
        ],
      ),
    );
  }
}

/// inline 모드용 네비 아이템. 텍스트 버튼 스타일.
class _InlineItemTile extends StatefulWidget {
  final ShUiHeaderItem item;

  const _InlineItemTile({required this.item});

  @override
  State<_InlineItemTile> createState() => _InlineItemTileState();
}

class _InlineItemTileState extends State<_InlineItemTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final active = widget.item.isActive;
    final fg = active || _hover ? colors.foreground : colors.foregroundMuted;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.item.onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: shUi.spacing.s3,
            vertical: shUi.spacing.s2,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.item.icon != null) ...[
                Icon(widget.item.icon, size: 16, color: fg),
                SizedBox(width: shUi.spacing.s1),
              ],
              Text(
                widget.item.label,
                style: TextStyle(
                  color: fg,
                  fontSize: shUi.text.sm,
                  fontWeight:
                      active ? shUi.weight.semibold : shUi.weight.medium,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// drawer 모드용 아이템 타일. 세로 리스트 엔트리.
class _DrawerItemTile extends StatefulWidget {
  final ShUiHeaderItem item;
  final VoidCallback onTap;

  const _DrawerItemTile({required this.item, required this.onTap});

  @override
  State<_DrawerItemTile> createState() => _DrawerItemTileState();
}

class _DrawerItemTileState extends State<_DrawerItemTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final active = widget.item.isActive;
    Color bg;
    Color fg;
    if (active) {
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
        child: Container(
          margin: EdgeInsets.symmetric(
            horizontal: shUi.spacing.s2,
            vertical: 1,
          ),
          padding: EdgeInsets.symmetric(
            horizontal: shUi.spacing.s3,
            vertical: shUi.spacing.s2 + 2, // s2(8) + 2 = 10
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
          ),
          child: Row(
            children: [
              if (widget.item.icon != null) ...[
                Icon(widget.item.icon, size: 18, color: fg),
                SizedBox(width: shUi.spacing.s3),
              ],
              Expanded(
                child: Text(
                  widget.item.label,
                  style: TextStyle(
                    color: fg,
                    fontSize: shUi.text.sm,
                    fontWeight:
                        active ? shUi.weight.semibold : shUi.weight.regular,
                  ),
                ),
              ),
              if (active)
                Icon(
                  Icons.chevron_right,
                  size: 16,
                  color: shUi.colors.foregroundMuted,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
