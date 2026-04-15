import 'package:flutter/material.dart';
import '../foundation/hyeon_tokens.dart';

enum HyeonButtonVariant { primary, secondary, ghost, danger, link }

enum HyeonButtonSize { sm, md, lg }

class HyeonButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final HyeonButtonVariant variant;
  final HyeonButtonSize size;

  const HyeonButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = HyeonButtonVariant.primary,
    this.size = HyeonButtonSize.md,
  });

  @override
  State<HyeonButton> createState() => _HyeonButtonState();
}

class _HyeonButtonState extends State<HyeonButton> {
  bool _hover = false;
  bool _pressed = false;

  _Colors _resolveColors(HyeonColorTokens t) {
    switch (widget.variant) {
      case HyeonButtonVariant.primary:
        return _Colors(
          bg: _hover ? t.primaryHover : t.primary,
          fg: t.primaryForeground,
          border: Colors.transparent,
        );
      case HyeonButtonVariant.secondary:
        return _Colors(
          bg: _hover ? t.backgroundSubtle : t.backgroundMuted,
          fg: t.foreground,
          border: t.border,
        );
      case HyeonButtonVariant.ghost:
        return _Colors(
          bg: _hover ? t.backgroundMuted : Colors.transparent,
          fg: t.foreground,
          border: Colors.transparent,
        );
      case HyeonButtonVariant.danger:
        return _Colors(
          bg: t.danger,
          fg: t.dangerForeground,
          border: Colors.transparent,
        );
      case HyeonButtonVariant.link:
        return _Colors(
          bg: Colors.transparent,
          fg: _pressed ? t.foregroundMuted : t.foreground,
          border: Colors.transparent,
        );
    }
  }

  EdgeInsets get _padding => switch (widget.size) {
        HyeonButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12),
        HyeonButtonSize.md => const EdgeInsets.symmetric(horizontal: 16),
        HyeonButtonSize.lg => const EdgeInsets.symmetric(horizontal: 20),
      };

  double get _height => switch (widget.size) {
        HyeonButtonSize.sm => 32,
        HyeonButtonSize.md => 40,
        HyeonButtonSize.lg => 48,
      };

  double get _fontSize => switch (widget.size) {
        HyeonButtonSize.sm => 14,
        HyeonButtonSize.md => 14,
        HyeonButtonSize.lg => 16,
      };

  Widget _buildLink(HyeonTheme hyeon, _Colors colors, bool disabled) {
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
    final hyeon = Theme.of(context).extension<HyeonTheme>() ?? HyeonTheme.light;
    final colors = _resolveColors(hyeon.colors);
    final disabled = widget.onPressed == null;

    if (widget.variant == HyeonButtonVariant.link) {
      return Opacity(
        opacity: disabled ? 0.5 : 1,
        child: _buildLink(hyeon, colors, disabled),
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
                borderRadius: BorderRadius.circular(hyeon.radius.defaultRadius),
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
