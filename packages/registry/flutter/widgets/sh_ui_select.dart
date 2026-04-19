import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Select — 드롭다운 선택.
///
/// 기본 사용 (flat items):
/// ShUiSelect<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   placeholder: '과일 선택',
///   items: [
///     ShUiSelectItem(value: 'apple', child: Text('사과')),
///     ShUiSelectItem(value: 'banana', child: Text('바나나')),
///   ],
/// )
///
/// 그룹/구분선 사용 (structured elements):
/// ShUiSelect<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   placeholder: '국가 선택',
///   elements: [
///     ShUiSelectGroup(label: '아시아', items: [
///       ShUiSelectItem(value: 'kr', child: Text('대한민국')),
///       ShUiSelectItem(value: 'jp', child: Text('일본')),
///     ]),
///     ShUiSelectSeparator(),
///     ShUiSelectGroup(label: '유럽', items: [
///       ShUiSelectItem(value: 'de', child: Text('독일')),
///     ]),
///   ],
/// )
class ShUiSelect<T> extends StatefulWidget {
  final T? value;
  final ValueChanged<T?>? onChanged;
  final String? placeholder;

  /// flat 구조. [elements]와 동시에 지정하지 않는 것을 권장.
  /// 둘 다 지정되면 [elements]가 우선 사용된다.
  final List<ShUiSelectItem<T>>? items;

  /// 그룹/구분선/라벨을 포함하는 구조화된 목록.
  final List<ShUiSelectElement>? elements;

  final bool enabled;
  final bool invalid;

  const ShUiSelect({
    super.key,
    this.value,
    this.onChanged,
    this.placeholder,
    this.items,
    this.elements,
    this.enabled = true,
    this.invalid = false,
  }) : assert(items != null || elements != null,
            'ShUiSelect: items 또는 elements 중 하나는 제공되어야 합니다.');

  @override
  State<ShUiSelect<T>> createState() => _ShUiSelectState<T>();
}

class _ShUiSelectState<T> extends State<ShUiSelect<T>> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _hover = false;
  bool _isOpen = false;

  /// elements가 있으면 elements를, 아니면 items를 elements 형태로 래핑.
  List<ShUiSelectElement> get _resolvedElements {
    if (widget.elements != null) return widget.elements!;
    return widget.items ?? const [];
  }

  /// 모든 item을 flat하게 순회 — 선택된 child lookup용.
  Iterable<ShUiSelectItem> _flatItems() sync* {
    for (final el in _resolvedElements) {
      if (el is ShUiSelectItem) {
        yield el;
      } else if (el is ShUiSelectGroup) {
        for (final item in el.items) {
          yield item;
        }
      }
    }
  }

  void _toggle() {
    if (_isOpen) {
      _close();
    } else {
      _open();
    }
  }

  void _open() {
    final overlay = Overlay.of(context);
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => _SelectOverlay<T>(
        link: _layerLink,
        triggerWidth: size.width,
        elements: _resolvedElements,
        selectedValue: widget.value,
        onSelect: (value) {
          widget.onChanged?.call(value);
          _close();
        },
        onDismiss: _close,
      ),
    );

    overlay.insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) setState(() => _isOpen = false);
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled || widget.onChanged == null;

    // 현재 선택된 아이템의 child를 찾아 표시
    Widget? selectedChild;
    for (final item in _flatItems()) {
      if (item.value == widget.value) {
        selectedChild = item.child;
        break;
      }
    }

    Color borderColor;
    if (widget.invalid) {
      borderColor = colors.danger;
    } else if (_isOpen) {
      borderColor = colors.foreground;
    } else if (_hover && !disabled) {
      borderColor = colors.foregroundMuted;
    } else {
      borderColor = colors.border;
    }

    return CompositedTransformTarget(
      link: _layerLink,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: MouseRegion(
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: GestureDetector(
            onTap: disabled ? null : _toggle,
            child: AnimatedContainer(
              duration: shUi.duration.fast,
              height: shUi.control.md,
              padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(
                  color: borderColor,
                  width: _isOpen ? shUi.borderWidth.strong : shUi.borderWidth.normal,
                ),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: selectedChild != null
                        ? DefaultTextStyle(
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: shUi.text.sm,
                            ),
                            child: selectedChild,
                          )
                        : Text(
                            widget.placeholder ?? '',
                            style: TextStyle(
                              color: colors.foregroundMuted,
                              fontSize: shUi.text.sm,
                            ),
                          ),
                  ),
                  Icon(
                    _isOpen
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    size: 18,
                    color: colors.foregroundMuted,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Select 내부에 올 수 있는 요소의 공통 베이스.
/// 서브타입: [ShUiSelectItem], [ShUiSelectGroup], [ShUiSelectSeparator].
abstract class ShUiSelectElement {
  const ShUiSelectElement();
}

class ShUiSelectItem<T> extends ShUiSelectElement {
  final T value;
  final Widget child;
  final bool enabled;

  const ShUiSelectItem({
    required this.value,
    required this.child,
    this.enabled = true,
  });
}

/// 여러 [ShUiSelectItem]을 라벨 아래 묶는 그룹.
class ShUiSelectGroup extends ShUiSelectElement {
  final String label;
  final List<ShUiSelectItem> items;

  const ShUiSelectGroup({
    required this.label,
    required this.items,
  });
}

/// 요소들 사이의 얇은 구분선.
class ShUiSelectSeparator extends ShUiSelectElement {
  const ShUiSelectSeparator();
}

class _SelectOverlay<T> extends StatelessWidget {
  final LayerLink link;
  final double triggerWidth;
  final List<ShUiSelectElement> elements;
  final T? selectedValue;
  final ValueChanged<T> onSelect;
  final VoidCallback onDismiss;

  const _SelectOverlay({
    required this.link,
    required this.triggerWidth,
    required this.elements,
    this.selectedValue,
    required this.onSelect,
    required this.onDismiss,
  });

  Widget _buildItem(ShUiTheme shUi, ShUiSelectItem item) {
    final selected = item.value == selectedValue;
    return _SelectItemTile(
      item: item,
      selected: selected,
      colors: shUi.colors,
      onSelect: (v) {
        // T로 캐스팅. elements 사용 시 value 타입 책임은 호출자에 있다.
        onSelect(v as T);
      },
    );
  }

  List<Widget> _buildChildren(ShUiTheme shUi) {
    final colors = shUi.colors;
    final result = <Widget>[];

    for (final el in elements) {
      if (el is ShUiSelectItem) {
        result.add(_buildItem(shUi, el));
      } else if (el is ShUiSelectGroup) {
        // 그룹 라벨
        result.add(Padding(
          padding: EdgeInsets.fromLTRB(
            shUi.spacing.s3,
            shUi.spacing.s2,
            shUi.spacing.s3,
            shUi.spacing.s1,
          ),
          child: Text(
            el.label.toUpperCase(),
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: shUi.text.xs,
              fontWeight: shUi.weight.semibold,
              letterSpacing: 0.5,
            ),
          ),
        ));
        for (final item in el.items) {
          result.add(_buildItem(shUi, item));
        }
      } else if (el is ShUiSelectSeparator) {
        result.add(Padding(
          padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
          child: Divider(
            color: colors.border,
            height: 1,
            thickness: 1,
          ),
        ));
      }
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Stack(
      children: [
        // Backdrop — dismiss on tap
        Positioned.fill(
          child: GestureDetector(
            onTap: onDismiss,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        // Dropdown
        CompositedTransformFollower(
          link: link,
          offset: const Offset(0, 44),
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: triggerWidth,
              constraints: const BoxConstraints(maxHeight: 240),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
                child: ListView(
                  shrinkWrap: true,
                  padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
                  children: _buildChildren(shUi),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SelectItemTile extends StatefulWidget {
  final ShUiSelectItem item;
  final bool selected;
  final ShUiColorTokens colors;
  final ValueChanged<dynamic> onSelect;

  const _SelectItemTile({
    required this.item,
    required this.selected,
    required this.colors,
    required this.onSelect,
  });

  @override
  State<_SelectItemTile> createState() => _SelectItemTileState();
}

class _SelectItemTileState extends State<_SelectItemTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.item.enabled
            ? () => widget.onSelect(widget.item.value)
            : null,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3, vertical: shUi.spacing.s2),
          color: _hover ? widget.colors.backgroundSubtle : Colors.transparent,
          child: Row(
            children: [
              Expanded(
                child: DefaultTextStyle(
                  style: TextStyle(
                    color: widget.colors.foreground,
                    fontSize: shUi.text.sm,
                  ),
                  child: widget.item.child,
                ),
              ),
              if (widget.selected)
                Icon(Icons.check, size: 14, color: widget.colors.foreground),
            ],
          ),
        ),
      ),
    );
  }
}

/// sh-ui MultiSelect — 다중 선택 드롭다운.
///
/// React의 `MultiSelect` + `MultiSelectValue` 에 대응.
///
/// 기본 사용:
/// ShUiMultiSelect<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   elements: const [
///     ShUiSelectItem(value: 'apple', child: Text('사과')),
///     ShUiSelectItem(value: 'banana', child: Text('바나나')),
///   ],
///   placeholder: '과일 선택',
/// )
///
/// 칩 렌더 커스터마이즈:
/// ShUiMultiSelect<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   elements: [...],
///   chipsBuilder: (values, onRemove) => Wrap(
///     spacing: 4,
///     children: values
///         .map((v) => ShUiSelectChip(label: v, onRemove: () => onRemove(v)))
///         .toList(),
///   ),
/// )
class ShUiMultiSelect<T> extends StatefulWidget {
  final List<T> value;
  final ValueChanged<List<T>>? onChanged;
  final List<ShUiSelectElement> elements;
  final String? placeholder;

  /// 트리거 내부에 표시할 칩 렌더러. 지정하지 않으면 쉼표 join 텍스트.
  final Widget Function(List<T> values, void Function(T) onRemove)? chipsBuilder;

  final bool enabled;
  final bool invalid;

  const ShUiMultiSelect({
    super.key,
    required this.value,
    required this.onChanged,
    required this.elements,
    this.placeholder,
    this.chipsBuilder,
    this.enabled = true,
    this.invalid = false,
  });

  @override
  State<ShUiMultiSelect<T>> createState() => _ShUiMultiSelectState<T>();
}

class _ShUiMultiSelectState<T> extends State<ShUiMultiSelect<T>> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _hover = false;
  bool _isOpen = false;

  Iterable<ShUiSelectItem> _flatItems() sync* {
    for (final el in widget.elements) {
      if (el is ShUiSelectItem) {
        yield el;
      } else if (el is ShUiSelectGroup) {
        for (final item in el.items) {
          yield item;
        }
      }
    }
  }

  void _toggleItem(T v) {
    final next = List<T>.from(widget.value);
    if (next.contains(v)) {
      next.remove(v);
    } else {
      next.add(v);
    }
    widget.onChanged?.call(next);
    _overlayEntry?.markNeedsBuild();
  }

  void _remove(T v) {
    final next = List<T>.from(widget.value)..remove(v);
    widget.onChanged?.call(next);
    _overlayEntry?.markNeedsBuild();
  }

  void _open() {
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (_) => _MultiSelectOverlay<T>(
        link: _layerLink,
        triggerWidth: size.width,
        elements: widget.elements,
        selectedValues: widget.value,
        onToggle: _toggleItem,
        onDismiss: _close,
      ),
    );
    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) setState(() => _isOpen = false);
  }

  void _toggle() {
    if (_isOpen) {
      _close();
    } else {
      _open();
    }
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  String _joinedLabel() {
    final labels = <String>[];
    for (final item in _flatItems()) {
      if (widget.value.contains(item.value)) {
        final c = item.child;
        if (c is Text && c.data != null) {
          labels.add(c.data!);
        } else {
          labels.add(item.value.toString());
        }
      }
    }
    return labels.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled || widget.onChanged == null;

    Color borderColor;
    if (widget.invalid) {
      borderColor = colors.danger;
    } else if (_isOpen) {
      borderColor = colors.foreground;
    } else if (_hover && !disabled) {
      borderColor = colors.foregroundMuted;
    } else {
      borderColor = colors.border;
    }

    Widget inner;
    if (widget.value.isEmpty) {
      inner = Text(
        widget.placeholder ?? '',
        style: TextStyle(
          color: colors.foregroundMuted,
          fontSize: shUi.text.sm,
        ),
      );
    } else if (widget.chipsBuilder != null) {
      inner = widget.chipsBuilder!(widget.value, _remove);
    } else {
      inner = Text(
        _joinedLabel(),
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: colors.foreground,
          fontSize: shUi.text.sm,
        ),
      );
    }

    return CompositedTransformTarget(
      link: _layerLink,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: MouseRegion(
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: GestureDetector(
            onTap: disabled ? null : _toggle,
            child: AnimatedContainer(
              duration: shUi.duration.fast,
              constraints: BoxConstraints(minHeight: shUi.control.md),
              padding: EdgeInsets.symmetric(
                horizontal: shUi.spacing.s3,
                vertical: shUi.spacing.s1,
              ),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(
                  color: borderColor,
                  width: _isOpen ? shUi.borderWidth.strong : shUi.borderWidth.normal,
                ),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
              ),
              child: Row(
                children: [
                  Expanded(child: inner),
                  Icon(
                    _isOpen
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    size: 18,
                    color: colors.foregroundMuted,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MultiSelectOverlay<T> extends StatelessWidget {
  final LayerLink link;
  final double triggerWidth;
  final List<ShUiSelectElement> elements;
  final List<T> selectedValues;
  final ValueChanged<T> onToggle;
  final VoidCallback onDismiss;

  const _MultiSelectOverlay({
    required this.link,
    required this.triggerWidth,
    required this.elements,
    required this.selectedValues,
    required this.onToggle,
    required this.onDismiss,
  });

  Widget _buildItem(ShUiTheme shUi, ShUiSelectItem item) {
    final selected = selectedValues.contains(item.value);
    return _MultiSelectItemTile(
      item: item,
      selected: selected,
      colors: shUi.colors,
      onToggle: (v) => onToggle(v as T),
    );
  }

  List<Widget> _buildChildren(ShUiTheme shUi) {
    final colors = shUi.colors;
    final result = <Widget>[];

    for (final el in elements) {
      if (el is ShUiSelectItem) {
        result.add(_buildItem(shUi, el));
      } else if (el is ShUiSelectGroup) {
        result.add(Padding(
          padding: EdgeInsets.fromLTRB(
            shUi.spacing.s3,
            shUi.spacing.s2,
            shUi.spacing.s3,
            shUi.spacing.s1,
          ),
          child: Text(
            el.label.toUpperCase(),
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: shUi.text.xs,
              fontWeight: shUi.weight.semibold,
              letterSpacing: 0.5,
            ),
          ),
        ));
        for (final item in el.items) {
          result.add(_buildItem(shUi, item));
        }
      } else if (el is ShUiSelectSeparator) {
        result.add(Padding(
          padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
          child: Divider(
            color: colors.border,
            height: 1,
            thickness: 1,
          ),
        ));
      }
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: onDismiss,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        CompositedTransformFollower(
          link: link,
          offset: const Offset(0, 44),
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: triggerWidth,
              constraints: const BoxConstraints(maxHeight: 240),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
                child: ListView(
                  shrinkWrap: true,
                  padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
                  children: _buildChildren(shUi),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _MultiSelectItemTile extends StatefulWidget {
  final ShUiSelectItem item;
  final bool selected;
  final ShUiColorTokens colors;
  final ValueChanged<dynamic> onToggle;

  const _MultiSelectItemTile({
    required this.item,
    required this.selected,
    required this.colors,
    required this.onToggle,
  });

  @override
  State<_MultiSelectItemTile> createState() => _MultiSelectItemTileState();
}

class _MultiSelectItemTileState extends State<_MultiSelectItemTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final c = widget.colors;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.item.enabled
            ? () => widget.onToggle(widget.item.value)
            : null,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: shUi.spacing.s3,
            vertical: shUi.spacing.s2,
          ),
          color: _hover ? c.backgroundSubtle : Colors.transparent,
          child: Row(
            children: [
              // 체크박스 인디케이터 (왼쪽)
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: widget.selected ? c.foreground : Colors.transparent,
                  border: Border.all(
                    color: widget.selected ? c.foreground : c.border,
                    width: shUi.borderWidth.normal,
                  ),
                  borderRadius: BorderRadius.circular(shUi.radius.defaultRadius / 2),
                ),
                child: widget.selected
                    ? Icon(Icons.check, size: 12, color: c.background)
                    : null,
              ),
              SizedBox(width: shUi.spacing.s2),
              Expanded(
                child: DefaultTextStyle(
                  style: TextStyle(
                    color: c.foreground,
                    fontSize: shUi.text.sm,
                  ),
                  child: widget.item.child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// sh-ui SelectChip — MultiSelect/MultiCombobox 트리거에 표시되는 작은 칩.
///
/// ShUiSelectChip(label: '사과', onRemove: () => handleRemove('apple'))
class ShUiSelectChip extends StatelessWidget {
  final String label;
  final VoidCallback? onRemove;

  const ShUiSelectChip({
    super.key,
    required this.label,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final c = shUi.colors;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: shUi.spacing.s2,
        vertical: shUi.spacing.s1,
      ),
      decoration: BoxDecoration(
        color: c.backgroundSubtle,
        border: Border.all(color: c.border, width: shUi.borderWidth.normal),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              color: c.foreground,
              fontSize: shUi.text.xs,
            ),
          ),
          if (onRemove != null) ...[
            SizedBox(width: shUi.spacing.s1),
            GestureDetector(
              onTap: onRemove,
              behavior: HitTestBehavior.opaque,
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                child: Icon(
                  Icons.close,
                  size: 12,
                  color: c.foregroundMuted,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
