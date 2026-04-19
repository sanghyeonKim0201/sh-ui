import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiToggleVariant { outline, ghost }

enum ShUiToggleSize { sm, md, lg }

enum ShUiToggleOrientation { horizontal, vertical }

/// sh-ui Toggle — 눌러서 on/off 전환하는 토글 버튼.
class ShUiToggle extends StatefulWidget {
  final bool pressed;
  final ValueChanged<bool>? onPressedChange;
  final ShUiToggleVariant variant;
  final ShUiToggleSize size;
  final Widget child;

  const ShUiToggle({
    super.key,
    this.pressed = false,
    this.onPressedChange,
    this.variant = ShUiToggleVariant.ghost,
    this.size = ShUiToggleSize.md,
    required this.child,
  });

  @override
  State<ShUiToggle> createState() => _ShUiToggleState();
}

class _ShUiToggleState extends State<ShUiToggle> {
  bool _hover = false;

  EdgeInsets _paddingOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiToggleSize.sm => EdgeInsets.symmetric(horizontal: shUi.spacing.s2),
        ShUiToggleSize.md => EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
        ShUiToggleSize.lg => EdgeInsets.symmetric(horizontal: shUi.spacing.s4),
      };

  double _heightOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiToggleSize.sm => shUi.control.sm,
        ShUiToggleSize.md => shUi.control.md,
        ShUiToggleSize.lg => shUi.control.lg,
      };

  double _fontSizeOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiToggleSize.sm => shUi.text.sm,
        ShUiToggleSize.md => shUi.text.sm,
        ShUiToggleSize.lg => shUi.text.base,
      };

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = widget.onPressedChange == null;

    Color bg;
    Color borderColor;

    if (widget.pressed) {
      bg = colors.backgroundMuted;
      borderColor = widget.variant == ShUiToggleVariant.outline
          ? colors.border
          : Colors.transparent;
    } else if (_hover && !disabled) {
      bg = colors.backgroundSubtle;
      borderColor = widget.variant == ShUiToggleVariant.outline
          ? colors.border
          : Colors.transparent;
    } else {
      bg = Colors.transparent;
      borderColor = widget.variant == ShUiToggleVariant.outline
          ? colors.border
          : Colors.transparent;
    }

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled
              ? null
              : () => widget.onPressedChange!(!widget.pressed),
          child: AnimatedContainer(
            duration: shUi.duration.fast,
            height: _heightOf(shUi),
            padding: _paddingOf(shUi),
            decoration: BoxDecoration(
              color: bg,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            ),
            alignment: Alignment.center,
            child: DefaultTextStyle(
              style: TextStyle(
                color: widget.pressed ? colors.foreground : colors.foregroundMuted,
                fontSize: _fontSizeOf(shUi),
                fontWeight: shUi.weight.medium,
                height: 1,
              ),
              child: IconTheme(
                data: IconThemeData(
                  color: widget.pressed ? colors.foreground : colors.foregroundMuted,
                  size: _fontSizeOf(shUi) + 2,
                ),
                child: widget.child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 토글 그룹 — 여러 토글을 묶어 하나만 또는 복수 선택 가능.
class ShUiToggleGroup<T> extends StatelessWidget {
  final Set<T> value;
  final ValueChanged<Set<T>>? onValueChange;
  final bool multiple;
  final ShUiToggleVariant variant;
  final ShUiToggleSize size;
  final ShUiToggleOrientation orientation;
  final List<ShUiToggleGroupItem<T>> children;

  const ShUiToggleGroup({
    super.key,
    required this.value,
    this.onValueChange,
    this.multiple = false,
    this.variant = ShUiToggleVariant.ghost,
    this.size = ShUiToggleSize.md,
    this.orientation = ShUiToggleOrientation.horizontal,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final layout = orientation == ShUiToggleOrientation.vertical
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: children,
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: children,
          );

    return _ShUiToggleGroupScope(
      value: value,
      onValueChange: onValueChange,
      multiple: multiple,
      variant: variant,
      size: size,
      child: layout,
    );
  }
}

class ShUiToggleGroupItem<T> extends StatelessWidget {
  final T value;
  final Widget child;

  const ShUiToggleGroupItem({
    super.key,
    required this.value,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final scope = _ShUiToggleGroupScope.of<T>(context);
    if (scope == null) return child;

    final pressed = scope.value.contains(value);

    return ShUiToggle(
      pressed: pressed,
      variant: scope.variant,
      size: scope.size,
      onPressedChange: scope.onValueChange == null
          ? null
          : (_) {
              final next = Set<T>.from(scope.value);
              if (pressed) {
                next.remove(value);
              } else {
                if (!scope.multiple) next.clear();
                next.add(value);
              }
              scope.onValueChange!(next);
            },
      child: child,
    );
  }
}

class _ShUiToggleGroupScope<T> extends InheritedWidget {
  final Set<T> value;
  final ValueChanged<Set<T>>? onValueChange;
  final bool multiple;
  final ShUiToggleVariant variant;
  final ShUiToggleSize size;

  const _ShUiToggleGroupScope({
    required this.value,
    this.onValueChange,
    required this.multiple,
    required this.variant,
    required this.size,
    required super.child,
  });

  static _ShUiToggleGroupScope<T>? of<T>(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_ShUiToggleGroupScope<T>>();
  }

  @override
  bool updateShouldNotify(covariant _ShUiToggleGroupScope<T> old) =>
      value != old.value ||
      multiple != old.multiple ||
      variant != old.variant ||
      size != old.size;
}
