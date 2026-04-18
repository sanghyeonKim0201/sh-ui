import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiSwitchSize { sm, md }

/// sh-ui Switch — 토글 스위치. sm/md 사이즈.
class ShUiSwitch extends StatefulWidget {
  final bool checked;
  final ValueChanged<bool>? onChanged;
  final ShUiSwitchSize size;
  final bool enabled;

  const ShUiSwitch({
    super.key,
    this.checked = false,
    this.onChanged,
    this.size = ShUiSwitchSize.md,
    this.enabled = true,
  });

  @override
  State<ShUiSwitch> createState() => _ShUiSwitchState();
}

class _ShUiSwitchState extends State<ShUiSwitch> {
  bool _hover = false;

  double get _trackWidth => switch (widget.size) {
        ShUiSwitchSize.sm => 36,
        ShUiSwitchSize.md => 44,
      };

  double get _trackHeight => switch (widget.size) {
        ShUiSwitchSize.sm => 20,
        ShUiSwitchSize.md => 24,
      };

  double get _thumbSize => switch (widget.size) {
        ShUiSwitchSize.sm => 14,
        ShUiSwitchSize.md => 18,
      };

  double get _thumbPadding => 3;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled || widget.onChanged == null;

    final trackColor = widget.checked ? colors.primary : colors.backgroundMuted;
    final thumbColor = widget.checked ? colors.primaryForeground : colors.foregroundMuted;
    final thumbOffset = widget.checked
        ? _trackWidth - _thumbSize - _thumbPadding * 2
        : 0.0;

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled ? null : () => widget.onChanged!(!widget.checked),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            curve: Curves.easeOut,
            width: _trackWidth,
            height: _trackHeight,
            decoration: BoxDecoration(
              color: _hover && !disabled
                  ? Color.lerp(trackColor, colors.foreground, 0.08)!
                  : trackColor,
              borderRadius: BorderRadius.circular(_trackHeight / 2),
              border: Border.all(
                color: widget.checked ? Colors.transparent : colors.border,
              ),
            ),
            child: Stack(
              children: [
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOut,
                  left: _thumbPadding + thumbOffset,
                  top: _thumbPadding,
                  child: Container(
                    width: _thumbSize,
                    height: _thumbSize,
                    decoration: BoxDecoration(
                      color: widget.checked ? thumbColor : colors.background,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 2,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
