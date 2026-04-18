import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Radio — 토큰 기반 라디오 버튼.
class ShUiRadio<T> extends StatefulWidget {
  final T value;
  final T? groupValue;
  final ValueChanged<T>? onChanged;
  final bool enabled;

  const ShUiRadio({
    super.key,
    required this.value,
    required this.groupValue,
    this.onChanged,
    this.enabled = true,
  });

  @override
  State<ShUiRadio<T>> createState() => _ShUiRadioState<T>();
}

class _ShUiRadioState<T> extends State<ShUiRadio<T>> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final selected = widget.value == widget.groupValue;
    final disabled = !widget.enabled || widget.onChanged == null;

    final borderColor = selected
        ? colors.primary
        : (_hover ? colors.foregroundMuted : colors.border);

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled ? null : () => widget.onChanged!(widget.value),
          child: AnimatedContainer(
            duration: shUi.duration.fast,
            width: 18,
            height: 18,
            decoration: BoxDecoration(
              color: colors.background,
              border: Border.all(color: borderColor, width: 1.5),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: AnimatedContainer(
                duration: shUi.duration.fast,
                width: selected ? 8 : 0,
                height: selected ? 8 : 0,
                decoration: BoxDecoration(
                  color: colors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 라디오 그룹 — vertical 또는 horizontal 배치.
enum ShUiRadioGroupOrientation { vertical, horizontal }

class ShUiRadioGroup extends StatelessWidget {
  final List<Widget> children;
  final ShUiRadioGroupOrientation orientation;
  final double gap;

  const ShUiRadioGroup({
    super.key,
    required this.children,
    this.orientation = ShUiRadioGroupOrientation.vertical,
    this.gap = 8,
  });

  @override
  Widget build(BuildContext context) {
    if (orientation == ShUiRadioGroupOrientation.horizontal) {
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
