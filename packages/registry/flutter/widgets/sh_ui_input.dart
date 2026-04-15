import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui 텍스트 입력 필드.
/// Material TextField를 기반으로 토큰 스타일을 입힌다.
class ShUiInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? placeholder;
  final String? initialValue;
  final bool enabled;
  final bool readOnly;
  final bool obscureText;
  final bool invalid;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final int? maxLength;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final FocusNode? focusNode;
  final Widget? prefix;
  final Widget? suffix;

  const ShUiInput({
    super.key,
    this.controller,
    this.placeholder,
    this.initialValue,
    this.enabled = true,
    this.readOnly = false,
    this.obscureText = false,
    this.invalid = false,
    this.keyboardType,
    this.inputFormatters,
    this.maxLength,
    this.onChanged,
    this.onSubmitted,
    this.focusNode,
    this.prefix,
    this.suffix,
  });

  @override
  State<ShUiInput> createState() => _ShUiInputState();
}

class _ShUiInputState extends State<ShUiInput> {
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
    if (_hover && widget.enabled && !widget.readOnly) return colors.borderStrong;
    return colors.border;
  }

  @override
  Widget build(BuildContext context) {
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = sh-ui.colors;
    final focused = _focusNode.hasFocus;

    final bg = (!widget.enabled || widget.readOnly)
        ? colors.backgroundSubtle
        : colors.background;

    final textField = TextField(
      controller: widget.controller,
      focusNode: _focusNode,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      obscureText: widget.obscureText,
      keyboardType: widget.keyboardType,
      inputFormatters: widget.inputFormatters,
      maxLength: widget.maxLength,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      style: TextStyle(
        color: colors.foreground,
        fontSize: 14,
        height: 1.2,
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
          fontSize: 14,
        ),
      ),
    );

    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        height: 40,
        padding: EdgeInsets.only(
          left: widget.prefix == null ? 12 : 8,
          right: widget.suffix == null ? 12 : 4,
        ),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(
            color: _borderColor(colors),
            width: focused ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(sh-ui.radius.defaultRadius),
        ),
        child: Opacity(
          opacity: widget.enabled ? 1 : 0.5,
          child: Row(
            children: [
              if (widget.prefix != null) ...[
                IconTheme(
                  data: IconThemeData(color: colors.foregroundMuted, size: 16),
                  child: widget.prefix!,
                ),
                const SizedBox(width: 8),
              ],
              Expanded(child: textField),
              if (widget.suffix != null) ...[
                const SizedBox(width: 4),
                IconTheme(
                  data: IconThemeData(color: colors.foregroundMuted, size: 16),
                  child: widget.suffix!,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/* ───────── ShUiPasswordInput ───────── */

class ShUiPasswordInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? placeholder;
  final bool enabled;
  final bool invalid;
  final bool hideToggle;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final FocusNode? focusNode;

  const ShUiPasswordInput({
    super.key,
    this.controller,
    this.placeholder,
    this.enabled = true,
    this.invalid = false,
    this.hideToggle = false,
    this.onChanged,
    this.onSubmitted,
    this.focusNode,
  });

  @override
  State<ShUiPasswordInput> createState() => _ShUiPasswordInputState();
}

class _ShUiPasswordInputState extends State<ShUiPasswordInput> {
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return ShUiInput(
      controller: widget.controller,
      placeholder: widget.placeholder,
      enabled: widget.enabled,
      invalid: widget.invalid,
      obscureText: !_visible,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      focusNode: widget.focusNode,
      suffix: widget.hideToggle
          ? null
          : _ToggleButton(
              visible: _visible,
              onToggle: () => setState(() => _visible = !_visible),
            ),
    );
  }
}

class _ToggleButton extends StatelessWidget {
  final bool visible;
  final VoidCallback onToggle;
  const _ToggleButton({required this.visible, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Semantics(
      button: true,
      label: visible ? '비밀번호 숨기기' : '비밀번호 표시',
      child: InkWell(
        onTap: onToggle,
        borderRadius: BorderRadius.circular(sh-ui.radius.defaultRadius - 2),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(
            visible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            size: 18,
            color: sh-ui.colors.foregroundMuted,
          ),
        ),
      ),
    );
  }
}
