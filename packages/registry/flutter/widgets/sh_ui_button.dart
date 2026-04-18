import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiButtonVariant { primary, secondary, ghost, danger, link }

enum ShUiButtonSize { sm, md, lg }

class ShUiButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final ShUiButtonVariant variant;
  final ShUiButtonSize size;

  const ShUiButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = ShUiButtonVariant.primary,
    this.size = ShUiButtonSize.md,
  });

  @override
  State<ShUiButton> createState() => _ShUiButtonState();
}

class _ShUiButtonState extends State<ShUiButton> {
  bool _hover = false;
  bool _pressed = false;

  _Colors _resolveColors(ShUiColorTokens t) {
    switch (widget.variant) {
      case ShUiButtonVariant.primary:
        return _Colors(
          bg: _hover ? t.primaryHover : t.primary,
          fg: t.primaryForeground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.secondary:
        return _Colors(
          bg: _hover ? t.backgroundSubtle : t.backgroundMuted,
          fg: t.foreground,
          border: t.border,
        );
      case ShUiButtonVariant.ghost:
        return _Colors(
          bg: _hover ? t.backgroundMuted : Colors.transparent,
          fg: t.foreground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.danger:
        return _Colors(
          bg: t.danger,
          fg: t.dangerForeground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.link:
        return _Colors(
          bg: Colors.transparent,
          fg: _pressed ? t.foregroundMuted : t.foreground,
          border: Colors.transparent,
        );
    }
  }

  EdgeInsets _paddingOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
        ShUiButtonSize.md => EdgeInsets.symmetric(horizontal: shUi.spacing.s4),
        ShUiButtonSize.lg => EdgeInsets.symmetric(horizontal: shUi.spacing.s5),
      };

  double _heightOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => shUi.control.sm,
        ShUiButtonSize.md => shUi.control.md,
        ShUiButtonSize.lg => shUi.control.lg,
      };

  double _fontSizeOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => shUi.text.sm,
        ShUiButtonSize.md => shUi.text.sm,
        ShUiButtonSize.lg => shUi.text.base,
      };

  Widget _buildLink(ShUiTheme shUi, _Colors colors, bool disabled) {
    return MouseRegion(
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: disabled ? null : widget.onPressed,
        onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
        onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
        onTapCancel: disabled ? null : () => setState(() => _pressed = false),
        child: DefaultTextStyle(
          style: TextStyle(
            color: colors.fg,
            fontSize: _fontSizeOf(shUi),
            fontWeight: shUi.weight.medium,
            height: 1.2,
            decoration: _hover ? TextDecoration.underline : TextDecoration.none,
            decorationColor: colors.fg,
          ),
          child: widget.child,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = _resolveColors(shUi.colors);
    final disabled = widget.onPressed == null;

    if (widget.variant == ShUiButtonVariant.link) {
      return Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: _buildLink(shUi, colors, disabled),
      );
    }

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled ? null : widget.onPressed,
          onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
          onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
          onTapCancel: disabled ? null : () => setState(() => _pressed = false),
          child: AnimatedScale(
            scale: _pressed ? 0.97 : 1.0,
            duration: const Duration(milliseconds: 80),
            curve: Curves.easeOut,
            child: AnimatedContainer(
              duration: shUi.duration.fast,
              height: _heightOf(shUi),
              padding: _paddingOf(shUi),
              decoration: BoxDecoration(
                color: _pressed
                    ? Color.lerp(colors.bg, Colors.black, 0.08)!
                    : colors.bg,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
              ),
              alignment: Alignment.center,
              child: DefaultTextStyle(
                style: TextStyle(
                  color: colors.fg,
                  fontSize: _fontSizeOf(shUi),
                  fontWeight: shUi.weight.medium,
                  height: 1,
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

class _Colors {
  final Color bg;
  final Color fg;
  final Color border;
  const _Colors({required this.bg, required this.fg, required this.border});
}
