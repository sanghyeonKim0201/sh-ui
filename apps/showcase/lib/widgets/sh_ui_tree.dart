import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../foundation/sh_ui_tokens.dart';

/// Tree 밀도. [sm]은 좁은 사이드바용 컴팩트 변형.
enum ShUiTreeSize { sm, md }

/// Tree 노드 모델.
class ShUiTreeNode {
  /// 고유 식별자. 확장/선택 상태 추적에 사용된다.
  final String id;

  /// 행에 표시될 라벨.
  final String label;

  /// 하위 노드 목록 (선택). 비어있지 않으면 확장 가능한 부모로 취급된다.
  final List<ShUiTreeNode>? children;

  /// 라벨 왼쪽에 붙는 아이콘 (선택).
  final IconData? icon;

  /// 비활성화 상태. 선택·확장되지 않고 키보드 네비에서도 건너뛴다.
  final bool disabled;

  const ShUiTreeNode({
    required this.id,
    required this.label,
    this.children,
    this.icon,
    this.disabled = false,
  });

  bool get hasChildren => children != null && children!.isNotEmpty;
}

/// shUi Tree — 계층형 노드를 들여쓰기로 렌더하는 트리 뷰.
///
/// 확장/축소(부모 노드 탭), 단일 선택, disabled 노드 스킵, Semantics(스크린
/// 리더) 및 데스크탑/웹 키보드 네비(화살표·Enter/Space)를 지원한다.
///
/// 확장 상태는 [expandedIds]를 주면 controlled, 없으면 [defaultExpandedIds]로
/// 시드한 내부 상태로 동작한다. 선택 상태도 [selectedId] / [defaultSelectedId]로
/// 동일하게 controlled/uncontrolled를 가른다.
class ShUiTree extends StatefulWidget {
  /// 렌더할 트리 노드 배열.
  final List<ShUiTreeNode> nodes;

  /// 확장된 노드 id 집합 (controlled). null이면 내부 상태를 사용한다.
  final Set<String>? expandedIds;

  /// 초기 확장 노드 id 집합 (uncontrolled).
  final Set<String>? defaultExpandedIds;

  /// 확장 상태 변경 콜백. 변경 후의 확장 id 집합이 전달된다.
  final ValueChanged<Set<String>>? onExpandedChange;

  /// 선택된 노드 id (controlled). null이면 내부 상태를 사용한다.
  final String? selectedId;

  /// 초기 선택 노드 id (uncontrolled).
  final String? defaultSelectedId;

  /// 선택 변경 콜백. 선택된 노드 id(또는 null)가 전달된다.
  final ValueChanged<String?>? onSelect;

  /// 밀도. [ShUiTreeSize.sm]은 좁은 사이드바용 컴팩트 변형.
  final ShUiTreeSize size;

  const ShUiTree({
    super.key,
    required this.nodes,
    this.expandedIds,
    this.defaultExpandedIds,
    this.onExpandedChange,
    this.selectedId,
    this.defaultSelectedId,
    this.onSelect,
    this.size = ShUiTreeSize.md,
  });

  @override
  State<ShUiTree> createState() => _ShUiTreeState();
}

/// 평탄화된 한 행의 메타.
class _FlatRow {
  final ShUiTreeNode node;
  final int level;
  const _FlatRow(this.node, this.level);
}

class _ShUiTreeState extends State<ShUiTree> {
  late Set<String> _expanded;
  String? _selected;
  final FocusNode _focusNode = FocusNode();
  String? _focusedId;

  /// build에서 한 번 계산해 둔, 현재 보이는 행들. 키 이벤트는 build 이후에
  /// 발생하므로 키 핸들러가 이 값을 그대로 재사용해 _flatten() 중복 호출을 피한다.
  List<_FlatRow> _visibleRows = const [];

  bool get _expandedControlled => widget.expandedIds != null;
  bool get _selectedControlled => widget.selectedId != null;

  Set<String> get _effectiveExpanded =>
      _expandedControlled ? widget.expandedIds! : _expanded;
  String? get _effectiveSelected =>
      _selectedControlled ? widget.selectedId : _selected;

  @override
  void initState() {
    super.initState();
    _expanded = {...?widget.defaultExpandedIds};
    _selected = widget.defaultSelectedId;
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  /// 현재 확장 상태 기준으로 보이는 행만 평탄화한다.
  List<_FlatRow> _flatten() {
    final rows = <_FlatRow>[];
    final expanded = _effectiveExpanded;
    void walk(List<ShUiTreeNode> nodes, int level) {
      for (final node in nodes) {
        rows.add(_FlatRow(node, level));
        if (node.hasChildren && expanded.contains(node.id)) {
          walk(node.children!, level + 1);
        }
      }
    }

    walk(widget.nodes, 0);
    return rows;
  }

  void _toggleExpand(String id) {
    final next = {..._effectiveExpanded};
    if (next.contains(id)) {
      next.remove(id);
    } else {
      next.add(id);
    }
    if (!_expandedControlled) {
      setState(() => _expanded = next);
    }
    widget.onExpandedChange?.call(next);
  }

  void _setExpanded(String id, bool expand) {
    final current = _effectiveExpanded;
    if (expand == current.contains(id)) return;
    _toggleExpand(id);
  }

  void _select(String? id) {
    if (!_selectedControlled) {
      setState(() => _selected = id);
    }
    widget.onSelect?.call(id);
  }

  /// 노드 행 탭: 자식이 있으면 확장 토글 + 선택, 없으면 선택만.
  void _onRowTap(ShUiTreeNode node) {
    if (node.disabled) return;
    setState(() => _focusedId = node.id);
    if (node.hasChildren) {
      _toggleExpand(node.id);
    }
    _select(node.id);
  }

  // ── 키보드 네비게이션 ──────────────────────────────────────────────

  List<_FlatRow> _navigableRows(List<_FlatRow> rows) =>
      rows.where((r) => !r.node.disabled).toList();

  KeyEventResult _handleKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }
    final rows = _visibleRows;
    final navigable = _navigableRows(rows);
    if (navigable.isEmpty) return KeyEventResult.ignored;

    // 현재 포커스 인덱스 (없으면 첫 항목 직전으로 가정).
    int currentIndex =
        navigable.indexWhere((r) => r.node.id == _focusedId);
    final key = event.logicalKey;

    if (key == LogicalKeyboardKey.arrowDown) {
      final nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1).clamp(0, navigable.length - 1);
      setState(() => _focusedId = navigable[nextIndex].node.id);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowUp) {
      final prevIndex =
          currentIndex <= 0 ? 0 : (currentIndex - 1);
      setState(() => _focusedId = navigable[prevIndex].node.id);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowRight) {
      if (currentIndex < 0) return KeyEventResult.ignored;
      final row = navigable[currentIndex];
      if (row.node.hasChildren) {
        if (!_effectiveExpanded.contains(row.node.id)) {
          _setExpanded(row.node.id, true);
        } else {
          // 이미 확장됨 → 첫 자식으로 이동. 확장 상태 변경이 없으므로
          // build에서 계산한 _visibleRows가 그대로 유효하다.
          final after = _navigableRows(_visibleRows);
          final idx = after.indexWhere((r) => r.node.id == row.node.id);
          if (idx >= 0 && idx + 1 < after.length &&
              after[idx + 1].level > row.level) {
            setState(() => _focusedId = after[idx + 1].node.id);
          }
        }
      }
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowLeft) {
      if (currentIndex < 0) return KeyEventResult.ignored;
      final row = navigable[currentIndex];
      if (row.node.hasChildren && _effectiveExpanded.contains(row.node.id)) {
        _setExpanded(row.node.id, false);
      } else if (row.level > 0) {
        // 부모로 이동.
        final all = rows;
        final pos = all.indexWhere((r) => r.node.id == row.node.id);
        for (var i = pos - 1; i >= 0; i--) {
          if (all[i].level < row.level && !all[i].node.disabled) {
            setState(() => _focusedId = all[i].node.id);
            break;
          }
        }
      }
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.home) {
      setState(() => _focusedId = navigable.first.node.id);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.end) {
      setState(() => _focusedId = navigable.last.node.id);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.space) {
      if (currentIndex < 0) return KeyEventResult.ignored;
      _onRowTap(navigable[currentIndex].node);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final rows = _flatten();
    _visibleRows = rows;

    return Focus(
      focusNode: _focusNode,
      onKeyEvent: _handleKey,
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final row in rows)
              _ShUiTreeRow(
                key: ValueKey(row.node.id),
                node: row.node,
                level: row.level,
                size: widget.size,
                isExpanded:
                    row.node.hasChildren && _effectiveExpanded.contains(row.node.id),
                isSelected: _effectiveSelected == row.node.id,
                isFocused: _focusedId == row.node.id,
                onTap: () {
                  _focusNode.requestFocus();
                  _onRowTap(row.node);
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _ShUiTreeRow extends StatefulWidget {
  final ShUiTreeNode node;
  final int level;
  final ShUiTreeSize size;
  final bool isExpanded;
  final bool isSelected;
  final bool isFocused;
  final VoidCallback onTap;

  const _ShUiTreeRow({
    super.key,
    required this.node,
    required this.level,
    required this.size,
    required this.isExpanded,
    required this.isSelected,
    required this.isFocused,
    required this.onTap,
  });

  @override
  State<_ShUiTreeRow> createState() => _ShUiTreeRowState();
}

class _ShUiTreeRowState extends State<_ShUiTreeRow> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final node = widget.node;
    final disabled = node.disabled;
    final sm = widget.size == ShUiTreeSize.sm;

    final fontSize = sm ? shUi.text.xs : shUi.text.sm;
    final vPad = sm ? shUi.spacing.s1 : shUi.spacing.s2;
    final indent = shUi.spacing.s4 * widget.level;

    final highlighted =
        widget.isSelected || (widget.isFocused && !disabled);
    final bg = highlighted
        ? colors.backgroundMuted
        : (_hover && !disabled ? colors.backgroundMuted : Colors.transparent);

    final row = MouseRegion(
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: disabled ? null : widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: shUi.duration.fast,
          curve: shUi.ease.standard,
          padding: EdgeInsets.fromLTRB(
            shUi.spacing.s2 + indent,
            vPad,
            shUi.spacing.s2,
            vPad,
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius:
                BorderRadius.circular(shUi.radius.defaultRadius - 2),
            border: widget.isFocused && !disabled
                ? Border.all(
                    color: colors.ring,
                    width: shUi.borderWidth.strong,
                  )
                : Border.all(color: Colors.transparent, width: shUi.borderWidth.strong),
          ),
          child: Row(
            children: [
              // chevron — leaf면 자리만 유지(visibility hidden).
              SizedBox(
                width: shUi.spacing.s4,
                child: node.hasChildren
                    ? AnimatedRotation(
                        turns: widget.isExpanded ? 0.25 : 0.0,
                        duration: shUi.duration.fast,
                        curve: shUi.ease.standard,
                        child: Icon(
                          Icons.chevron_right,
                          size: sm ? 14 : 16,
                          color: colors.foregroundMuted,
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
              SizedBox(width: shUi.spacing.s2),
              if (node.icon != null) ...[
                Icon(
                  node.icon,
                  size: sm ? 14 : 16,
                  color: colors.foregroundMuted,
                ),
                SizedBox(width: shUi.spacing.s2),
              ],
              Expanded(
                child: Text(
                  node.label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: disabled ? colors.foregroundMuted : colors.foreground,
                    fontSize: fontSize,
                    fontWeight: widget.isSelected
                        ? shUi.weight.medium
                        : shUi.weight.regular,
                    height: 1.25,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    return Semantics(
      selected: widget.isSelected,
      enabled: !disabled,
      expanded: node.hasChildren ? widget.isExpanded : null,
      label: node.label,
      button: true,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: row,
      ),
    );
  }
}
