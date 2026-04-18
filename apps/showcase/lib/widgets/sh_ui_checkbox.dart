import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Checkbox — 토큰 기반 커스텀 체크박스.
/// indeterminate(중간) 상태도 지원한다.
class ShUiCheckbox extends StatefulWidget {
  final bool checked;
  final bool indeterminate;
  final ValueChanged<bool>? onChanged;
  final bool enabled;

  const ShUiCheckbox({
    super.key,
    this.checked = false,
    this.indeterminate = false,
    this.onChanged,
    this.enabled = true,
  });

  @override
  State<ShUiCheckbox> createState() => _ShUiCheckboxState();
}

class _ShUiCheckboxState extends State<ShUiCheckbox> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final active = widget.checked || widget.indeterminate;
    final disabled = !widget.enabled || widget.onChanged == null;

    final bg = active ? colors.primary : colors.background;
    final borderColor = active ? colors.primary : (_hover ? colors.foregroundMuted : colors.border);
    final iconColor = active ? colors.primaryForeground : Colors.transparent;

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled ? null : () => widget.onChanged!(!widget.checked),
          child: AnimatedContainer(
            duration: shUi.duration.fast,
            width: 18,
            height: 18,
            decoration: BoxDecoration(
              color: bg,
              border: Border.all(color: borderColor, width: 1.5),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Center(
              child: CustomPaint(
                size: const Size(12, 12),
                painter: widget.indeterminate
                    ? _MinusIconPainter(color: iconColor)
                    : _CheckIconPainter(color: iconColor),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CheckIconPainter extends CustomPainter {
  final Color color;
  _CheckIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path()
      ..moveTo(size.width * 0.15, size.height * 0.5)
      ..lineTo(size.width * 0.4, size.height * 0.75)
      ..lineTo(size.width * 0.85, size.height * 0.2);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CheckIconPainter old) => old.color != color;
}

class _MinusIconPainter extends CustomPainter {
  final Color color;
  _MinusIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(
      Offset(size.width * 0.2, size.height * 0.5),
      Offset(size.width * 0.8, size.height * 0.5),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _MinusIconPainter old) => old.color != color;
}

/// 체크박스 그룹 — vertical 또는 horizontal 배치.
enum ShUiCheckboxGroupOrientation { vertical, horizontal }

class ShUiCheckboxGroup extends StatelessWidget {
  final List<Widget> children;
  final ShUiCheckboxGroupOrientation orientation;
  final double gap;

  const ShUiCheckboxGroup({
    super.key,
    required this.children,
    this.orientation = ShUiCheckboxGroupOrientation.vertical,
    this.gap = 8,
  });

  @override
  Widget build(BuildContext context) {
    if (orientation == ShUiCheckboxGroupOrientation.horizontal) {
      return Wrap(spacing: gap, runSpacing: gap, children: children);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: _withGaps(children, gap),
    );
  }
}

List<Widget> _withGaps(List<Widget> children, double gap) {
  if (children.length <= 1) return children;
  final out = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    out.add(children[i]);
    if (i != children.length - 1) out.add(SizedBox(height: gap));
  }
  return out;
}
