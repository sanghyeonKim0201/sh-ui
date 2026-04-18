import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

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
