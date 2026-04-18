import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Textarea — 여러 줄 텍스트 입력.
class ShUiTextarea extends StatefulWidget {
  final TextEditingController? controller;
  final String? placeholder;
  final bool enabled;
  final bool readOnly;
  final bool invalid;
  final int? maxLength;
  final int minLines;
  final int? maxLines;
  final ValueChanged<String>? onChanged;
  final FocusNode? focusNode;
  final List<TextInputFormatter>? inputFormatters;

  const ShUiTextarea({
    super.key,
    this.controller,
    this.placeholder,
    this.enabled = true,
    this.readOnly = false,
    this.invalid = false,
    this.maxLength,
    this.minLines = 3,
    this.maxLines,
    this.onChanged,
    this.focusNode,
    this.inputFormatters,
  });

  @override
  State<ShUiTextarea> createState() => _ShUiTextareaState();
}

class _ShUiTextareaState extends State<ShUiTextarea> {
  late final FocusNode _focusNode;
  bool _ownsFocusNode = false;
  bool _hover = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _ownsFocusNode = widget.focusNode == null;
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    if (_ownsFocusNode) _focusNode.dispose();
    super.dispose();
  }

  void _onFocusChange() => setState(() {});

  Color _borderColor(ShUiColorTokens colors) {
    if (widget.invalid) return colors.danger;
    if (_focusNode.hasFocus) return colors.foreground;
    if (_hover && widget.enabled && !widget.readOnly) return colors.foregroundMuted;
    return colors.border;
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final focused = _focusNode.hasFocus;

    final bg = (!widget.enabled || widget.readOnly)
        ? colors.backgroundSubtle
        : colors.background;

    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: shUi.duration.fast,
        padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3, vertical: shUi.spacing.s2),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(
            color: _borderColor(colors),
            width: focused ? shUi.borderWidth.strong : shUi.borderWidth.normal,
          ),
          borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
        ),
        child: Opacity(
          opacity: widget.enabled ? 1 : shUi.opacity.disabled,
          child: TextField(
            controller: widget.controller,
            focusNode: _focusNode,
            enabled: widget.enabled,
            readOnly: widget.readOnly,
            maxLength: widget.maxLength,
            minLines: widget.minLines,
            maxLines: widget.maxLines ?? widget.minLines + 5,
            onChanged: widget.onChanged,
            inputFormatters: widget.inputFormatters,
            keyboardType: TextInputType.multiline,
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.sm,
              height: 1.5,
            ),
            cursorColor: colors.foreground,
            decoration: InputDecoration(
              isCollapsed: true,
              contentPadding: EdgeInsets.zero,
              border: InputBorder.none,
              counterText: "",
              hintText: widget.placeholder,
              hintStyle: TextStyle(
                color: colors.foregroundMuted,
                fontSize: shUi.text.sm,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
