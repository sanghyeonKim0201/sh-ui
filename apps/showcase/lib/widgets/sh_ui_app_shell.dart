import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import 'sh_ui_sidebar.dart';

/// sh-ui App Shell — 사이드바 기반 앱 레이아웃을 한 번에 선언한다.
///
/// Scaffold + AppBar + ShUiSidebarProvider + ShUiSidebar + 메인 콘텐츠 교체를
/// 내장하고, 선택된 아이템에 따라 본문과 AppBar 타이틀을 자동으로 바꾼다.
/// 모바일에서는 drawer, 데스크탑에서는 inline 사이드바로 자동 전환.
///
/// 직접 Navigator push로 라우트를 쌓는 패턴이 필요한 경우에는 [ShUiSidebar]와
/// [Scaffold]를 직접 조합한다. 이 위젯은 "한 화면에서 콘텐츠를 스위칭하는
/// 단일 쉘 레이아웃"에 특화되어 있다.
///
/// ```dart
/// ShUiAppShell(
///   title: 'My App',
///   groups: [
///     ShUiAppShellGroup(label: '메뉴', items: [
///       ShUiAppShellItem(
///         icon: Icons.home,
///         label: '홈',
///         builder: (_) => HomeContent(),
///       ),
///       ShUiAppShellItem(
///         icon: Icons.settings,
///         label: '설정',
///         builder: (_) => SettingsContent(),
///       ),
///     ]),
///   ],
/// )
/// ```

/// 사이드바 그룹 선언.
@immutable
class ShUiAppShellGroup {
  /// 그룹 카테고리 라벨. 미지정 시 라벨 없이 항목만 노출.
  final String? label;

  /// 그룹에 속한 메뉴 항목 목록.
  final List<ShUiAppShellItem> items;

  /// 그룹 라벨 탭으로 접기/펼치기 가능.
  final bool collapsible;

  /// [collapsible] 활성 시 초기 확장 여부.
  final bool initiallyExpanded;

  const ShUiAppShellGroup({
    this.label,
    required this.items,
    this.collapsible = true,
    this.initiallyExpanded = true,
  });
}

/// 사이드바 아이템 선언. 탭하면 [builder]가 메인 영역에 렌더된다.
@immutable
class ShUiAppShellItem {
  /// 라벨 좌측에 붙는 아이콘 (선택).
  final IconData? icon;

  /// 메뉴 라벨. AppBar 타이틀로도 사용된다(item 선택 시 자동 갱신).
  final String label;

  /// 선택 시 메인 영역에 표시할 위젯을 반환. [Scaffold] 없이 body-only 위젯을 반환해야 한다.
  final WidgetBuilder builder;

  const ShUiAppShellItem({
    this.icon,
    required this.label,
    required this.builder,
  });
}

/// shUi App Shell 위젯. 위 파일 헤더 dartdoc 참고.
///
/// 사이드바 그룹/아이템과 AppBar 상수 옵션만 선언하면 한 줄로 앱 셸이 완성된다.
/// 항상 한 화면에서 콘텐츠를 스위칭하는 단일 쉘 패턴에 사용한다.
class ShUiAppShell extends StatefulWidget {
  /// AppBar 좌측 로고/아이콘. 사이드바 헤더에도 동일하게 노출된다.
  final Widget? logo;

  /// 앱 이름. 사이드바 헤더 텍스트.
  final String? title;

  /// AppBar 우측 actions.
  final List<Widget>? actions;

  /// 사이드바 그룹들.
  final List<ShUiAppShellGroup> groups;

  /// 초기 선택 아이템 인덱스 (group 무관하게 flat 인덱스). 기본 0.
  final int initialIndex;

  /// 선택 변경 콜백 (flat 인덱스).
  final ValueChanged<int>? onIndexChanged;

  /// 메인이 비어있을 때(initialIndex가 범위 밖 등) 표시할 placeholder.
  final WidgetBuilder? emptyBuilder;

  /// 사이드바 variant.
  final ShUiSidebarVariant sidebarVariant;

  const ShUiAppShell({
    super.key,
    this.logo,
    this.title,
    this.actions,
    required this.groups,
    this.initialIndex = 0,
    this.onIndexChanged,
    this.emptyBuilder,
    this.sidebarVariant = ShUiSidebarVariant.sidebar,
  });

  @override
  State<ShUiAppShell> createState() => _ShUiAppShellState();
}

class _ShUiAppShellState extends State<ShUiAppShell> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  /// 그룹을 평탄화해 flat 아이템 리스트로 반환.
  List<ShUiAppShellItem> get _flatItems =>
      widget.groups.expand((g) => g.items).toList();

  void _select(int flatIndex, BuildContext itemCtx, ShUiTheme shUi) {
    if (flatIndex == _selectedIndex) {
      // drawer 모드에서 같은 아이템을 다시 탭해도 drawer는 닫히도록.
      _maybeCloseDrawer(itemCtx, shUi);
      return;
    }
    setState(() => _selectedIndex = flatIndex);
    widget.onIndexChanged?.call(flatIndex);
    _maybeCloseDrawer(itemCtx, shUi);
  }

  void _maybeCloseDrawer(BuildContext itemCtx, ShUiTheme shUi) {
    final scope = useSidebar(itemCtx);
    final isNarrow =
        MediaQuery.of(itemCtx).size.width < shUi.breakpoint.md;
    if (scope != null && scope.open && isNarrow) {
      scope.toggle();
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final items = _flatItems;
    final selected = (items.isNotEmpty && _selectedIndex < items.length)
        ? items[_selectedIndex]
        : null;

    return ShUiSidebarProvider(
      defaultOpen: true,
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          leading: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: ShUiSidebarTrigger(),
          ),
          title: Text(
            selected?.label ?? widget.title ?? '',
            style: TextStyle(
              color: colors.foreground,
              fontWeight: shUi.weight.semibold,
            ),
          ),
          backgroundColor: colors.background,
          elevation: 0,
          scrolledUnderElevation: 0.5,
          actions: widget.actions,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: colors.border),
          ),
        ),
        body: Row(
          children: [
            ShUiSidebar(
              variant: widget.sidebarVariant,
              header: (widget.logo != null || widget.title != null)
                  ? ShUiSidebarHeader(child: _buildHeader(shUi, colors))
                  : null,
              children: [
                for (final group in widget.groups)
                  ShUiSidebarGroup(
                    label: group.label,
                    collapsible: group.collapsible,
                    initiallyExpanded: group.initiallyExpanded,
                    children: [
                      for (final item in group.items)
                        _buildItem(item, items.indexOf(item), shUi),
                    ],
                  ),
              ],
            ),
            Expanded(
              child: selected != null
                  ? Builder(builder: selected.builder)
                  : (widget.emptyBuilder != null
                      ? Builder(builder: widget.emptyBuilder!)
                      : const SizedBox.shrink()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ShUiTheme shUi, ShUiColorTokens colors) {
    return Builder(
      builder: (ctx) {
        final isOpen = useSidebar(ctx)?.open ?? true;
        if (!isOpen) {
          return Center(
            child: widget.logo ??
                Icon(Icons.apps, size: 20, color: colors.foreground),
          );
        }
        return Row(
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
                    fontSize: shUi.text.lg,
                    fontWeight: shUi.weight.bold,
                    letterSpacing: -0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildItem(ShUiAppShellItem item, int flatIndex, ShUiTheme shUi) {
    return Builder(
      builder: (itemCtx) => ShUiSidebarItem(
        icon: item.icon,
        label: item.label,
        isActive: flatIndex == _selectedIndex,
        onTap: () => _select(flatIndex, itemCtx, shUi),
      ),
    );
  }
}
