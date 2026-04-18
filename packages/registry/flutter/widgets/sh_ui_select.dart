import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Select — 드롭다운 선택.
///
/// ShUiSelect<String>(
///   value: selected,
///   onChanged: (v) => setState(() => selected = v),
///   placeholder: '과일 선택',
///   items: [
///     ShUiSelectItem(value: 'apple', child: Text('사과')),
///     ShUiSelectItem(value: 'banana', child: Text('바나나')),
///   ],
/// )
class ShUiSelect<T> extends StatefulWidget {
  final T? value;
  final ValueChanged<T?>? onChanged;
  final String? placeholder;
  final List<ShUiSelectItem<T>> items;
  final bool enabled;
  final bool invalid;

  const ShUiSelect({
    super.key,
    this.value,
    this.onChanged,
    this.placeholder,
    required this.items,
    this.enabled = true,
    this.invalid = false,
  });

  @override
  State<ShUiSelect<T>> createState() => _ShUiSelectState<T>();
}

class _ShUiSelectState<T> extends State<ShUiSelect<T>> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _hover = false;
  bool _isOpen = false;

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
        items: widget.items,
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
    for (final item in widget.items) {
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

class ShUiSelectItem<T> {
  final T value;
  final Widget child;
  final bool enabled;

  const ShUiSelectItem({
    required this.value,
    required this.child,
    this.enabled = true,
  });
}

class _SelectOverlay<T> extends StatelessWidget {
  final LayerLink link;
  final double triggerWidth;
  final List<ShUiSelectItem<T>> items;
  final T? selectedValue;
  final ValueChanged<T> onSelect;
  final VoidCallback onDismiss;

  const _SelectOverlay({
    required this.link,
    required this.triggerWidth,
    required this.items,
    this.selectedValue,
    required this.onSelect,
    required this.onDismiss,
  });

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
                  children: items.map((item) {
                    final selected = item.value == selectedValue;
                    return _SelectItemTile<T>(
                      item: item,
                      selected: selected,
                      colors: colors,
                      onSelect: onSelect,
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
}

class _SelectItemTile<T> extends StatefulWidget {
  final ShUiSelectItem<T> item;
  final bool selected;
  final ShUiColorTokens colors;
  final ValueChanged<T> onSelect;

  const _SelectItemTile({
    required this.item,
    required this.selected,
    required this.colors,
    required this.onSelect,
  });

  @override
  State<_SelectItemTile<T>> createState() => _SelectItemTileState<T>();
}

class _SelectItemTileState<T> extends State<_SelectItemTile<T>> {
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
