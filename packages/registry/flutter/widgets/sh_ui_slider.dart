import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Slider — 범위 슬라이더.
class ShUiSlider extends StatefulWidget {
  final double value;
  final ValueChanged<double>? onChanged;
  final double min;
  final double max;
  final double step;
  final bool enabled;

  const ShUiSlider({
    super.key,
    required this.value,
    this.onChanged,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.enabled = true,
  });

  @override
  State<ShUiSlider> createState() => _ShUiSliderState();
}

class _ShUiSliderState extends State<ShUiSlider> {
  bool _hover = false;
  bool _dragging = false;

  double _clamp(double v) => v.clamp(widget.min, widget.max);

  double _snap(double v) {
    if (widget.step <= 0) return v;
    return widget.min +
        ((v - widget.min) / widget.step).round() * widget.step;
  }

  void _setValue(double next) {
    final snapped = _clamp(_snap(next));
    if (snapped == widget.value) return;
    widget.onChanged?.call(snapped);
  }

  void _handleDrag(Offset localPosition, double trackWidth) {
    final ratio = (localPosition.dx / trackWidth).clamp(0.0, 1.0);
    _setValue(widget.min + ratio * (widget.max - widget.min));
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled || widget.onChanged == null;
    final ratio = widget.max == widget.min
        ? 0.0
        : (widget.value - widget.min) / (widget.max - widget.min);

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final trackWidth = constraints.maxWidth;
            const trackHeight = 6.0;
            const thumbSize = 18.0;
            const totalHeight = thumbSize + 4;

            return GestureDetector(
              onHorizontalDragStart: disabled
                  ? null
                  : (d) {
                      setState(() => _dragging = true);
                      _handleDrag(d.localPosition, trackWidth);
                    },
              onHorizontalDragUpdate: disabled
                  ? null
                  : (d) => _handleDrag(d.localPosition, trackWidth),
              onHorizontalDragEnd: disabled
                  ? null
                  : (_) => setState(() => _dragging = false),
              onTapDown: disabled
                  ? null
                  : (d) => _handleDrag(d.localPosition, trackWidth),
              child: SizedBox(
                width: trackWidth,
                height: totalHeight,
                child: Stack(
                  alignment: Alignment.centerLeft,
                  clipBehavior: Clip.none,
                  children: [
                    // Track
                    Container(
                      width: trackWidth,
                      height: trackHeight,
                      decoration: BoxDecoration(
                        color: colors.backgroundMuted,
                        borderRadius: BorderRadius.circular(trackHeight / 2),
                      ),
                    ),
                    // Range (filled portion)
                    Container(
                      width: ratio * trackWidth,
                      height: trackHeight,
                      decoration: BoxDecoration(
                        color: colors.primary,
                        borderRadius: BorderRadius.circular(trackHeight / 2),
                      ),
                    ),
                    // Thumb
                    Positioned(
                      left: ratio * trackWidth - thumbSize / 2,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 80),
                        width: thumbSize,
                        height: thumbSize,
                        decoration: BoxDecoration(
                          color: colors.background,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: colors.primary,
                            width: shUi.borderWidth.strong,
                          ),
                          boxShadow: (_hover || _dragging)
                              ? [
                                  BoxShadow(
                                    color: colors.primary.withValues(alpha: 0.2),
                                    blurRadius: 8,
                                  ),
                                ]
                              : [],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
