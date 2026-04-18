import 'dart:math';
import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui ColorPicker — HSV 기반 색상 선택기.
///
/// ShUiColorPicker(
///   value: Color(0xFF3B82F6),
///   onChanged: (color) => setState(() => selectedColor = color),
/// )
class ShUiColorPicker extends StatefulWidget {
  final Color? value;
  final ValueChanged<Color>? onChanged;
  final Color defaultValue;

  const ShUiColorPicker({
    super.key,
    this.value,
    this.onChanged,
    this.defaultValue = const Color(0xFF000000),
  });

  @override
  State<ShUiColorPicker> createState() => _ShUiColorPickerState();
}

class _ShUiColorPickerState extends State<ShUiColorPicker> {
  late HSVColor _hsv;
  late TextEditingController _hexController;

  Color get _currentColor => widget.value ?? widget.defaultValue;

  @override
  void initState() {
    super.initState();
    _hsv = HSVColor.fromColor(_currentColor);
    _hexController = TextEditingController(text: _colorToHex(_currentColor));
  }

  @override
  void didUpdateWidget(covariant ShUiColorPicker old) {
    super.didUpdateWidget(old);
    if (widget.value != old.value && widget.value != null) {
      _hsv = HSVColor.fromColor(widget.value!);
      _hexController.text = _colorToHex(widget.value!);
    }
  }

  @override
  void dispose() {
    _hexController.dispose();
    super.dispose();
  }

  String _colorToHex(Color c) {
    return '#${c.red.toInt().toRadixString(16).padLeft(2, '0')}'
        '${c.green.toInt().toRadixString(16).padLeft(2, '0')}'
        '${c.blue.toInt().toRadixString(16).padLeft(2, '0')}'
        .toUpperCase();
  }

  void _emit(HSVColor hsv) {
    setState(() => _hsv = hsv);
    final color = hsv.toColor();
    _hexController.text = _colorToHex(color);
    widget.onChanged?.call(color);
  }

  void _onHexSubmit() {
    final text = _hexController.text.trim();
    final hex = text.startsWith('#') ? text : '#$text';
    if (RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(hex)) {
      final value = int.parse(hex.substring(1), radix: 16);
      final color = Color(0xFF000000 | value);
      _emit(HSVColor.fromColor(color));
    } else {
      _hexController.text = _colorToHex(_hsv.toColor());
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final pureHue = HSVColor.fromAHSV(1, _hsv.hue, 1, 1).toColor();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // SV area
        ClipRRect(
          borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          child: SizedBox(
            height: 160,
            child: LayoutBuilder(
              builder: (context, constraints) {
                return GestureDetector(
                  onPanStart: (d) => _onSVDrag(d.localPosition, constraints),
                  onPanUpdate: (d) => _onSVDrag(d.localPosition, constraints),
                  onTapDown: (d) => _onSVDrag(d.localPosition, constraints),
                  child: Stack(
                    children: [
                      // Background hue
                      Container(color: pureHue),
                      // Saturation gradient (white → transparent)
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Colors.white, Colors.transparent],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                        ),
                      ),
                      // Value gradient (transparent → black)
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Colors.transparent, Colors.black],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                      // Thumb
                      Positioned(
                        left: _hsv.saturation * constraints.maxWidth - 7,
                        top: (1 - _hsv.value) * constraints.maxHeight - 7,
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _hsv.toColor(),
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        // Hue slider
        SizedBox(
          height: 16,
          child: LayoutBuilder(
            builder: (context, constraints) {
              return GestureDetector(
                onPanStart: (d) => _onHueDrag(d.localPosition, constraints),
                onPanUpdate: (d) => _onHueDrag(d.localPosition, constraints),
                onTapDown: (d) => _onHueDrag(d.localPosition, constraints),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Stack(
                    children: [
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Color(0xFFFF0000),
                              Color(0xFFFFFF00),
                              Color(0xFF00FF00),
                              Color(0xFF00FFFF),
                              Color(0xFF0000FF),
                              Color(0xFFFF00FF),
                              Color(0xFFFF0000),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        left: (_hsv.hue / 360) * constraints.maxWidth - 7,
                        top: 1,
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: pureHue,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 2,
                              ),
                            ],
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
        SizedBox(height: shUi.spacing.s3),
        // Hex input + swatch
        Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _hsv.toColor(),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
                border: Border.all(color: colors.border),
              ),
            ),
            SizedBox(width: shUi.spacing.s2),
            Expanded(
              child: Container(
                height: shUi.control.sm,
                padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s2),
                decoration: BoxDecoration(
                  color: colors.background,
                  border: Border.all(color: colors.border),
                  borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
                ),
                child: TextField(
                  controller: _hexController,
                  onSubmitted: (_) => _onHexSubmit(),
                  onEditingComplete: _onHexSubmit,
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: 13,
                    fontFamily: 'monospace',
                  ),
                  decoration: const InputDecoration(
                    isCollapsed: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _onSVDrag(Offset local, BoxConstraints constraints) {
    final s = (local.dx / constraints.maxWidth).clamp(0.0, 1.0);
    final v = 1 - (local.dy / constraints.maxHeight).clamp(0.0, 1.0);
    _emit(HSVColor.fromAHSV(1, _hsv.hue, s, v));
  }

  void _onHueDrag(Offset local, BoxConstraints constraints) {
    final h = (local.dx / constraints.maxWidth).clamp(0.0, 1.0) * 360;
    _emit(HSVColor.fromAHSV(1, h, _hsv.saturation, _hsv.value));
  }
}
