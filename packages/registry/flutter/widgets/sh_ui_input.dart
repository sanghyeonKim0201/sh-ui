import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../foundation/sh_ui_tokens.dart';

/// shUi 텍스트 입력 필드.
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
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
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
        fontSize: shUi.text.sm,
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
          fontSize: shUi.text.sm,
        ),
      ),
    );

    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: shUi.duration.fast,
        height: shUi.control.md,
        padding: EdgeInsets.only(
          left: widget.prefix == null ? shUi.spacing.s3 : shUi.spacing.s2,
          right: widget.suffix == null ? shUi.spacing.s3 : shUi.spacing.s1,
        ),
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
          child: Row(
            children: [
              if (widget.prefix != null) ...[
                IconTheme(
                  data: IconThemeData(color: colors.foregroundMuted, size: 16),
                  child: widget.prefix!,
                ),
                SizedBox(width: shUi.spacing.s2),
              ],
              Expanded(child: textField),
              if (widget.suffix != null) ...[
                SizedBox(width: shUi.spacing.s1),
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
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Semantics(
      button: true,
      label: visible ? '비밀번호 숨기기' : '비밀번호 표시',
      child: InkWell(
        onTap: onToggle,
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
        child: Padding(
          padding: EdgeInsets.all(shUi.spacing.s2),
          child: Icon(
            visible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            size: 18,
            color: shUi.colors.foregroundMuted,
          ),
        ),
      ),
    );
  }
}

/* ───────── ShUiNumberInput ─────────
 * 정수 입력 + 천 단위 콤마(옵션). onChanged는 num? 콜백.
 * blur 시 min/max로 clamp.
 */

String _shUiFormatNumber(String digits, bool thousandsSeparator) {
  if (digits.isEmpty || digits == '-') return digits;
  final negative = digits.startsWith('-');
  final body = negative ? digits.substring(1) : digits;
  if (body.isEmpty) return negative ? '-' : '';
  String formatted = body;
  if (thousandsSeparator) {
    final re = RegExp(r'\B(?=(\d{3})+(?!\d))');
    formatted = body.replaceAllMapped(re, (_) => ',');
  }
  return negative ? '-$formatted' : formatted;
}

num? _shUiParseNumber(String s) {
  final cleaned = s.replaceAll(RegExp(r'[^\d-]'), '');
  if (cleaned.isEmpty || cleaned == '-') return null;
  return num.tryParse(cleaned);
}

class ShUiNumberInput extends StatefulWidget {
  final num? value;
  final num? defaultValue;
  final ValueChanged<num?>? onChanged;
  final String? placeholder;
  final bool enabled;
  final bool invalid;
  final bool thousandsSeparator;
  final bool allowNegative;
  final num? min;
  final num? max;
  final FocusNode? focusNode;

  const ShUiNumberInput({
    super.key,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.placeholder,
    this.enabled = true,
    this.invalid = false,
    this.thousandsSeparator = true,
    this.allowNegative = true,
    this.min,
    this.max,
    this.focusNode,
  });

  @override
  State<ShUiNumberInput> createState() => _ShUiNumberInputState();
}

class _ShUiNumberInputState extends State<ShUiNumberInput> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;
  bool _ownsFocusNode = false;

  bool get _isControlled => widget.value != null;

  String _displayFor(num? v) => v == null
      ? ''
      : _shUiFormatNumber(v.toString(), widget.thousandsSeparator);

  @override
  void initState() {
    super.initState();
    final initial = widget.value ?? widget.defaultValue;
    _controller = TextEditingController(text: _displayFor(initial));
    _focusNode = widget.focusNode ?? FocusNode();
    _ownsFocusNode = widget.focusNode == null;
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void didUpdateWidget(covariant ShUiNumberInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_isControlled) {
      final next = _displayFor(widget.value);
      if (next != _controller.text) {
        _controller.value = TextEditingValue(
          text: next,
          selection: TextSelection.collapsed(offset: next.length),
        );
      }
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    if (_ownsFocusNode) _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    if (!_focusNode.hasFocus) _clamp();
  }

  void _handleChanged(String raw) {
    final re = widget.allowNegative
        ? RegExp(r'[^\d-]')
        : RegExp(r'[^\d]');
    String cleaned = raw.replaceAll(re, '');
    if (widget.allowNegative) {
      // "-"는 맨 앞에만
      if (cleaned.contains('-')) {
        final first = cleaned.startsWith('-');
        cleaned = cleaned.replaceAll('-', '');
        if (first) cleaned = '-$cleaned';
      }
    }
    final formatted = _shUiFormatNumber(cleaned, widget.thousandsSeparator);
    if (!_isControlled && formatted != _controller.text) {
      _controller.value = TextEditingValue(
        text: formatted,
        selection: TextSelection.collapsed(offset: formatted.length),
      );
    }
    widget.onChanged?.call(_shUiParseNumber(cleaned));
  }

  void _clamp() {
    final n = _shUiParseNumber(_controller.text);
    if (n == null) return;
    num clamped = n;
    if (widget.min != null && clamped < widget.min!) clamped = widget.min!;
    if (widget.max != null && clamped > widget.max!) clamped = widget.max!;
    if (clamped != n) {
      final f = _shUiFormatNumber(clamped.toString(), widget.thousandsSeparator);
      if (!_isControlled) {
        _controller.value = TextEditingValue(
          text: f,
          selection: TextSelection.collapsed(offset: f.length),
        );
      }
      widget.onChanged?.call(clamped);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShUiInput(
      controller: _controller,
      focusNode: _focusNode,
      placeholder: widget.placeholder,
      enabled: widget.enabled,
      invalid: widget.invalid,
      keyboardType: const TextInputType.numberWithOptions(signed: true),
      onChanged: _handleChanged,
    );
  }
}

/* ───────── _DigitsMaskFormatter ─────────
 * 숫자만 남긴 뒤 지정된 포맷 함수로 재포맷. 커서 위치는
 * "커서 앞 숫자 개수"를 기준으로 재계산해 하이픈 삭제/붙여넣기에 대응.
 */
class _DigitsMaskFormatter extends TextInputFormatter {
  final String Function(String digits) format;
  final int maxDigits;
  const _DigitsMaskFormatter({required this.format, required this.maxDigits});

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final rawText = newValue.text;
    final selectionEnd = newValue.selection.end.clamp(0, rawText.length);

    // 커서 앞 숫자 개수
    int digitsBeforeCursor = 0;
    for (int i = 0; i < selectionEnd; i++) {
      if (RegExp(r'\d').hasMatch(rawText[i])) digitsBeforeCursor++;
    }

    final allDigits = rawText.replaceAll(RegExp(r'\D'), '');
    final clipped = allDigits.length > maxDigits
        ? allDigits.substring(0, maxDigits)
        : allDigits;
    if (digitsBeforeCursor > clipped.length) {
      digitsBeforeCursor = clipped.length;
    }

    final formatted = format(clipped);

    // 재배치: 포맷된 문자열에서 digitsBeforeCursor 개의 숫자가 지나간 위치
    int newOffset = formatted.length;
    int seen = 0;
    for (int i = 0; i < formatted.length; i++) {
      if (seen == digitsBeforeCursor) {
        newOffset = i;
        break;
      }
      if (RegExp(r'\d').hasMatch(formatted[i])) seen++;
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: newOffset),
    );
  }
}

/* ───────── ShUiPhoneInput (KR) ───────── */

String _shUiFormatPhoneKR(String digits) {
  final d = digits.length > 11 ? digits.substring(0, 11) : digits;
  if (d.isEmpty) return '';
  if (d.startsWith('02')) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return '${d.substring(0, 2)}-${d.substring(2)}';
    if (d.length <= 9) {
      return '${d.substring(0, 2)}-${d.substring(2, 5)}-${d.substring(5)}';
    }
    return '${d.substring(0, 2)}-${d.substring(2, 6)}-${d.substring(6, d.length > 10 ? 10 : d.length)}';
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return '${d.substring(0, 3)}-${d.substring(3)}';
  if (d.length <= 10) {
    return '${d.substring(0, 3)}-${d.substring(3, 6)}-${d.substring(6)}';
  }
  return '${d.substring(0, 3)}-${d.substring(3, 7)}-${d.substring(7)}';
}

class ShUiPhoneInput extends StatefulWidget {
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onChanged;
  final String? placeholder;
  final bool enabled;
  final bool invalid;
  final FocusNode? focusNode;

  const ShUiPhoneInput({
    super.key,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.placeholder,
    this.enabled = true,
    this.invalid = false,
    this.focusNode,
  });

  @override
  State<ShUiPhoneInput> createState() => _ShUiPhoneInputState();
}

class _ShUiPhoneInputState extends State<ShUiPhoneInput> {
  late final TextEditingController _controller;

  bool get _isControlled => widget.value != null;

  @override
  void initState() {
    super.initState();
    final initialDigits = (widget.value ?? widget.defaultValue ?? '')
        .replaceAll(RegExp(r'\D'), '');
    _controller = TextEditingController(text: _shUiFormatPhoneKR(initialDigits));
  }

  @override
  void didUpdateWidget(covariant ShUiPhoneInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_isControlled) {
      final d = (widget.value ?? '').replaceAll(RegExp(r'\D'), '');
      final f = _shUiFormatPhoneKR(d);
      if (f != _controller.text) {
        _controller.value = TextEditingValue(
          text: f,
          selection: TextSelection.collapsed(offset: f.length),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleChanged(String formatted) {
    final digits = formatted.replaceAll(RegExp(r'\D'), '');
    widget.onChanged?.call(digits);
  }

  @override
  Widget build(BuildContext context) {
    return ShUiInput(
      controller: _controller,
      focusNode: widget.focusNode,
      placeholder: widget.placeholder,
      enabled: widget.enabled,
      invalid: widget.invalid,
      keyboardType: TextInputType.phone,
      inputFormatters: [
        _DigitsMaskFormatter(format: _shUiFormatPhoneKR, maxDigits: 11),
      ],
      onChanged: _handleChanged,
    );
  }
}

/* ───────── ShUiBusinessNumberInput (KR 사업자등록번호) ───────── */

String _shUiFormatBRN(String digits) {
  final d = digits.length > 10 ? digits.substring(0, 10) : digits;
  if (d.length <= 3) return d;
  if (d.length <= 5) return '${d.substring(0, 3)}-${d.substring(3)}';
  return '${d.substring(0, 3)}-${d.substring(3, 5)}-${d.substring(5)}';
}

/// 국세청 사업자등록번호 체크섬 알고리즘.
/// 9자리에 가중치 [1,3,7,1,3,7,1,3,5]를 곱해 합산,
/// 9번째 자리의 5배를 10으로 나눈 몫을 더한 후
/// (10 - (합 mod 10)) mod 10 이 마지막 자리와 일치하면 유효.
bool isValidBRN(String digits) {
  final d = digits.replaceAll(RegExp(r'\D'), '');
  if (d.length != 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  int sum = 0;
  for (int i = 0; i < 9; i++) {
    sum += int.parse(d[i]) * w[i];
  }
  sum += ((int.parse(d[8]) * 5) / 10).floor();
  final check = (10 - (sum % 10)) % 10;
  return check == int.parse(d[9]);
}

class ShUiBusinessNumberInput extends StatefulWidget {
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onChanged;
  final String? placeholder;
  final bool enabled;
  final bool invalid;
  final bool validateChecksum;
  final FocusNode? focusNode;

  const ShUiBusinessNumberInput({
    super.key,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.placeholder,
    this.enabled = true,
    this.invalid = false,
    this.validateChecksum = false,
    this.focusNode,
  });

  @override
  State<ShUiBusinessNumberInput> createState() =>
      _ShUiBusinessNumberInputState();
}

class _ShUiBusinessNumberInputState extends State<ShUiBusinessNumberInput> {
  late final TextEditingController _controller;

  bool get _isControlled => widget.value != null;

  @override
  void initState() {
    super.initState();
    final initialDigits = (widget.value ?? widget.defaultValue ?? '')
        .replaceAll(RegExp(r'\D'), '');
    _controller = TextEditingController(text: _shUiFormatBRN(initialDigits));
  }

  @override
  void didUpdateWidget(covariant ShUiBusinessNumberInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_isControlled) {
      final d = (widget.value ?? '').replaceAll(RegExp(r'\D'), '');
      final f = _shUiFormatBRN(d);
      if (f != _controller.text) {
        _controller.value = TextEditingValue(
          text: f,
          selection: TextSelection.collapsed(offset: f.length),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleChanged(String formatted) {
    final digits = formatted.replaceAll(RegExp(r'\D'), '');
    widget.onChanged?.call(digits);
  }

  bool get _computedInvalid {
    if (widget.invalid) return true;
    if (!widget.validateChecksum) return false;
    final d = _controller.text.replaceAll(RegExp(r'\D'), '');
    return d.length == 10 && !isValidBRN(d);
  }

  @override
  Widget build(BuildContext context) {
    return ShUiInput(
      controller: _controller,
      focusNode: widget.focusNode,
      placeholder: widget.placeholder,
      enabled: widget.enabled,
      invalid: _computedInvalid,
      keyboardType: TextInputType.number,
      inputFormatters: [
        _DigitsMaskFormatter(format: _shUiFormatBRN, maxDigits: 10),
      ],
      onChanged: _handleChanged,
    );
  }
}
