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

  EdgeInsets get _padding => switch (widget.size) {
        ShUiButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12),
        ShUiButtonSize.md => const EdgeInsets.symmetric(horizontal: 16),
        ShUiButtonSize.lg => const EdgeInsets.symmetric(horizontal: 20),
      };

  double get _height => switch (widget.size) {
        ShUiButtonSize.sm => 32,
        ShUiButtonSize.md => 40,
        ShUiButtonSize.lg => 48,
      };

  double get _fontSize => switch (widget.size) {
        ShUiButtonSize.sm => 14,
        ShUiButtonSize.md => 14,
        ShUiButtonSize.lg => 16,
      };

  Widget _buildLink(ShUiTheme sh-ui, _Colors colors, bool disabled) {
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
            fontSize: _fontSize,
            fontWeight: FontWeight.w500,
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
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = _resolveColors(sh-ui.colors);
    final disabled = widget.onPressed == null;

    if (widget.variant == ShUiButtonVariant.link) {
      return Opacity(
        opacity: disabled ? 0.5 : 1,
        child: _buildLink(sh-ui, colors, disabled),
      );
    }

    return Opacity(
      opacity: disabled ? 0.5 : 1,
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
              duration: const Duration(milliseconds: 120),
              height: _height,
              padding: _padding,
              decoration: BoxDecoration(
                color: _pressed
                    ? Color.lerp(colors.bg, Colors.black, 0.08)!
                    : colors.bg,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(sh-ui.radius.defaultRadius),
              ),
              alignment: Alignment.center,
              child: DefaultTextStyle(
                style: TextStyle(
                  color: colors.fg,
                  fontSize: _fontSize,
                  fontWeight: FontWeight.w500,
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
