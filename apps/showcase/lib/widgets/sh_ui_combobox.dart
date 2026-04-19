import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import 'sh_ui_select.dart' show ShUiSelectChip;

/// sh-ui Combobox — 검색 가능한 드롭다운 선택.
///
/// ShUiCombobox<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   items: fruits.map((f) => ShUiComboboxItem(value: f, label: f)).toList(),
///   placeholder: '과일 검색...',
/// )
class ShUiCombobox<T> extends StatefulWidget {
  final T? value;
  final ValueChanged<T?>? onChanged;
  final List<ShUiComboboxItem<T>> items;
  final String? placeholder;
  final String? emptyText;
  final bool enabled;

  const ShUiCombobox({
    super.key,
    this.value,
    this.onChanged,
    required this.items,
    this.placeholder,
    this.emptyText = '일치하는 항목 없음',
    this.enabled = true,
  });

  @override
  State<ShUiCombobox<T>> createState() => _ShUiComboboxState<T>();
}

class _ShUiComboboxState<T> extends State<ShUiCombobox<T>> {
  final LayerLink _layerLink = LayerLink();
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  OverlayEntry? _overlay;
  bool _isOpen = false;
  String _filter = '';

  @override
  void initState() {
    super.initState();
    _syncText();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void didUpdateWidget(covariant ShUiCombobox<T> old) {
    super.didUpdateWidget(old);
    if (widget.value != old.value) {
      _syncText();
    }
  }

  void _syncText() {
    if (widget.value != null) {
      for (final item in widget.items) {
        if (item.value == widget.value) {
          _textController.text = item.label;
          return;
        }
      }
    }
    _textController.clear();
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      _open();
    }
  }

  @override
  void dispose() {
    _close();
    _textController.dispose();
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  void _open() {
    if (_overlay != null) return;
    _filter = '';
    _overlay = OverlayEntry(builder: (_) => _buildOverlay());
    Overlay.of(context).insert(_overlay!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlay?.remove();
    _overlay = null;
    if (mounted) {
      setState(() => _isOpen = false);
      _syncText();
    }
  }

  void _select(ShUiComboboxItem<T> item) {
    widget.onChanged?.call(item.value);
    _focusNode.unfocus();
    _close();
  }

  void _onTextChanged(String text) {
    _filter = text.toLowerCase();
    _overlay?.markNeedsBuild();
  }

  List<ShUiComboboxItem<T>> get _filteredItems {
    if (_filter.isEmpty) return widget.items;
    return widget.items
        .where((item) => item.label.toLowerCase().contains(_filter))
        .toList();
  }

  Widget _buildOverlay() {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final renderBox = context.findRenderObject() as RenderBox;
    final width = renderBox.size.width;
    final filtered = _filteredItems;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: _close,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        CompositedTransformFollower(
          link: _layerLink,
          offset: const Offset(0, 44),
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: width,
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
                child: filtered.isEmpty
                    ? Padding(
                        padding: EdgeInsets.all(shUi.spacing.s3),
                        child: Text(
                          widget.emptyText ?? '',
                          style: TextStyle(
                            color: colors.foregroundMuted,
                            fontSize: shUi.text.sm,
                          ),
                        ),
                      )
                    : ListView(
                        shrinkWrap: true,
                        padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
                        children: filtered.map((item) {
                          final selected = item.value == widget.value;
                          return _ComboboxItemTile<T>(
                            item: item,
                            selected: selected,
                            colors: colors,
                            onSelect: () => _select(item),
                          );
                        }).toList(),
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
    final disabled = !widget.enabled;

    return CompositedTransformTarget(
      link: _layerLink,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: Container(
          height: shUi.control.md,
          padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
          decoration: BoxDecoration(
            color: colors.background,
            border: Border.all(
              color: _isOpen ? colors.foreground : colors.border,
              width: _isOpen ? shUi.borderWidth.strong : shUi.borderWidth.normal,
            ),
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _textController,
                  focusNode: _focusNode,
                  enabled: !disabled,
                  onChanged: _onTextChanged,
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.sm,
                  ),
                  decoration: InputDecoration(
                    isCollapsed: true,
                    contentPadding: EdgeInsets.zero,
                    border: InputBorder.none,
                    hintText: widget.placeholder,
                    hintStyle: TextStyle(
                      color: colors.foregroundMuted,
                      fontSize: shUi.text.sm,
                    ),
                  ),
                ),
              ),
              Icon(
                Icons.unfold_more,
                size: 16,
                color: colors.foregroundMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ShUiComboboxItem<T> {
  final T value;
  final String label;

  const ShUiComboboxItem({required this.value, required this.label});
}

class _ComboboxItemTile<T> extends StatefulWidget {
  final ShUiComboboxItem<T> item;
  final bool selected;
  final ShUiColorTokens colors;
  final VoidCallback onSelect;

  const _ComboboxItemTile({
    required this.item,
    required this.selected,
    required this.colors,
    required this.onSelect,
  });

  @override
  State<_ComboboxItemTile<T>> createState() => _ComboboxItemTileState<T>();
}

class _ComboboxItemTileState<T> extends State<_ComboboxItemTile<T>> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onSelect,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3, vertical: shUi.spacing.s2),
          color: _hover ? widget.colors.backgroundSubtle : Colors.transparent,
          child: Row(
            children: [
              SizedBox(
                width: shUi.spacing.s5,
                child: widget.selected
                    ? Icon(Icons.check, size: 14, color: widget.colors.foreground)
                    : null,
              ),
              SizedBox(width: shUi.spacing.s1),
              Expanded(
                child: Text(
                  widget.item.label,
                  style: TextStyle(
                    color: widget.colors.foreground,
                    fontSize: shUi.text.sm,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// sh-ui MultiCombobox — 다중 선택 + 검색 가능한 드롭다운.
///
/// React의 `<Combobox multiple>` + `ComboboxChips` 에 대응.
///
/// 기본 사용:
/// ShUiMultiCombobox<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   items: cities.map((c) => ShUiComboboxItem(value: c, label: c)).toList(),
///   placeholder: '도시 추가...',
/// )
///
/// 칩 커스터마이즈: [chipsBuilder]. 생략하면 기본 칩이 입력 위에 표시된다.
class ShUiMultiCombobox<T> extends StatefulWidget {
  final List<T> value;
  final ValueChanged<List<T>>? onChanged;
  final List<ShUiComboboxItem<T>> items;
  final String? placeholder;
  final String? emptyText;
  final bool enabled;
  final bool invalid;

  /// 트리거 내부 input 위에 표시될 칩 영역 커스텀 렌더러.
  /// 지정하지 않으면 [ShUiSelectChip]으로 자동 렌더.
  final Widget Function(List<T> values, void Function(T) onRemove)? chipsBuilder;

  const ShUiMultiCombobox({
    super.key,
    required this.value,
    required this.onChanged,
    required this.items,
    this.placeholder,
    this.emptyText = '일치하는 항목 없음',
    this.enabled = true,
    this.invalid = false,
    this.chipsBuilder,
  });

  @override
  State<ShUiMultiCombobox<T>> createState() => _ShUiMultiComboboxState<T>();
}

class _ShUiMultiComboboxState<T> extends State<ShUiMultiCombobox<T>> {
  final LayerLink _layerLink = LayerLink();
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  OverlayEntry? _overlay;
  bool _isOpen = false;
  String _filter = '';

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _close();
    _textController.dispose();
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      _open();
    }
  }

  void _open() {
    if (_overlay != null) return;
    _overlay = OverlayEntry(builder: (_) => _buildOverlay());
    Overlay.of(context).insert(_overlay!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlay?.remove();
    _overlay = null;
    if (mounted) {
      setState(() {
        _isOpen = false;
        _filter = '';
      });
      _textController.clear();
    }
  }

  void _toggle(ShUiComboboxItem<T> item) {
    final next = List<T>.from(widget.value);
    if (next.contains(item.value)) {
      next.remove(item.value);
    } else {
      next.add(item.value);
    }
    widget.onChanged?.call(next);
    _overlay?.markNeedsBuild();
  }

  void _remove(T v) {
    final next = List<T>.from(widget.value)..remove(v);
    widget.onChanged?.call(next);
    if (mounted) setState(() {});
    _overlay?.markNeedsBuild();
  }

  void _onTextChanged(String text) {
    _filter = text.toLowerCase();
    _overlay?.markNeedsBuild();
  }

  List<ShUiComboboxItem<T>> get _filteredItems {
    if (_filter.isEmpty) return widget.items;
    return widget.items
        .where((item) => item.label.toLowerCase().contains(_filter))
        .toList();
  }

  String _labelFor(T v) {
    for (final item in widget.items) {
      if (item.value == v) return item.label;
    }
    return v.toString();
  }

  Widget _buildOverlay() {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return const SizedBox.shrink();
    final width = renderBox.size.width;
    final height = renderBox.size.height;
    final filtered = _filteredItems;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: _close,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        CompositedTransformFollower(
          link: _layerLink,
          offset: Offset(0, height + 4),
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: width,
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
                child: filtered.isEmpty
                    ? Padding(
                        padding: EdgeInsets.all(shUi.spacing.s3),
                        child: Text(
                          widget.emptyText ?? '',
                          style: TextStyle(
                            color: colors.foregroundMuted,
                            fontSize: shUi.text.sm,
                          ),
                        ),
                      )
                    : ListView(
                        shrinkWrap: true,
                        padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
                        children: filtered.map((item) {
                          final selected = widget.value.contains(item.value);
                          return _ComboboxItemTile<T>(
                            item: item,
                            selected: selected,
                            colors: colors,
                            onSelect: () => _toggle(item),
                          );
                        }).toList(),
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
    final disabled = !widget.enabled || widget.onChanged == null;

    Color borderColor;
    if (widget.invalid) {
      borderColor = colors.danger;
    } else if (_isOpen) {
      borderColor = colors.foreground;
    } else {
      borderColor = colors.border;
    }

    final hasChips = widget.value.isNotEmpty;
    final chipsChild = hasChips
        ? (widget.chipsBuilder != null
            ? widget.chipsBuilder!(widget.value, _remove)
            : Wrap(
                spacing: shUi.spacing.s1,
                runSpacing: shUi.spacing.s1,
                children: widget.value
                    .map(
                      (v) => ShUiSelectChip(
                        label: _labelFor(v),
                        onRemove: () => _remove(v),
                      ),
                    )
                    .toList(),
              ))
        : null;

    return CompositedTransformTarget(
      link: _layerLink,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (chipsChild != null)
                Padding(
                  padding: EdgeInsets.only(
                    top: shUi.spacing.s1,
                    bottom: shUi.spacing.s1,
                  ),
                  child: chipsChild,
                ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      focusNode: _focusNode,
                      enabled: !disabled,
                      onChanged: _onTextChanged,
                      style: TextStyle(
                        color: colors.foreground,
                        fontSize: shUi.text.sm,
                      ),
                      decoration: InputDecoration(
                        isCollapsed: true,
                        contentPadding: EdgeInsets.symmetric(
                          vertical: shUi.spacing.s2,
                        ),
                        border: InputBorder.none,
                        hintText: widget.placeholder,
                        hintStyle: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: shUi.text.sm,
                        ),
                      ),
                    ),
                  ),
                  Icon(
                    Icons.unfold_more,
                    size: 16,
                    color: colors.foregroundMuted,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
