import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui TimePicker — 시각 선택 (세그먼트 스테퍼).
///
/// ShUiTimePicker(
///   value: selectedTime,
///   onValueChange: (time) => setState(() => selectedTime = time),
///   placeholder: '시간 선택',
/// )
///
/// 내부 표현은 항상 24시간제. `hour12`는 표시(트리거 텍스트 + 오버레이 세그먼트)만
/// 12시간제로 바꾸고, 저장되는 [DateTime]의 `hour`는 그대로 24시간제를 유지한다.
/// `min`/`max`는 하루 중 시각(시*3600+분*60+초)으로만 비교해 클램프하며 날짜 부분은
/// 무시한다. React `time-picker` 컴포넌트(`getSegments`/`clampSegments`/`wrap`/
/// `to12h`/`from12h`)와 동일한 규칙.
class ShUiTimePicker extends StatefulWidget {
  final DateTime? value;
  final ValueChanged<DateTime?>? onValueChange;
  final String placeholder;
  final bool hour12;
  final bool showSeconds;
  final int minuteStep;
  final int secondStep;
  final DateTime? min;
  final DateTime? max;
  final bool enabled;

  const ShUiTimePicker({
    super.key,
    this.value,
    this.onValueChange,
    this.placeholder = '시간 선택',
    this.hour12 = false,
    this.showSeconds = false,
    this.minuteStep = 1,
    this.secondStep = 1,
    this.min,
    this.max,
    this.enabled = true,
  });

  @override
  State<ShUiTimePicker> createState() => _ShUiTimePickerState();
}

class _ShUiTimePickerState extends State<ShUiTimePicker> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlay;
  bool _isOpen = false;

  // 오버레이가 열려 있는 동안 표시할 "작업 중" 값. widget.value를 매 스텝마다
  // 곧바로 읽으면, 부모가 onValueChange 콜백 안에서 setState를 호출해도 그 갱신은
  // 다음 프레임에야 이 State의 widget으로 반영되므로 오버레이가 한 스텝 뒤처져
  // 보인다. _draft를 스텝 시점에 동기적으로 갱신해 이 지연을 없앤다. 부모가
  // 값을 외부에서 바꾸면 didUpdateWidget이 다시 동기화한다.
  DateTime? _draft;

  @override
  void initState() {
    super.initState();
    _draft = widget.value;
  }

  @override
  void didUpdateWidget(covariant ShUiTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _draft = widget.value;
      _overlay?.markNeedsBuild();
    }
  }

  DateTime get _current => _draft ?? DateTime.now();

  int _wrap(int v, int min, int max) {
    final range = max - min + 1;
    return ((v - min) % range + range) % range + min;
  }

  int _secondsOfDay(int h, int m, int s) => h * 3600 + m * 60 + s;

  int _timeSecondsOf(DateTime d) => _secondsOfDay(d.hour, d.minute, d.second);

  /// base(현재 draft)의 날짜를 보존한 채 시/분/초만 교체하고, min/max를 하루 중
  /// 시각으로 클램프한 새 DateTime을 만든다.
  DateTime _apply(int h, int m, int s) {
    final base = _current;
    var secs = _secondsOfDay(h, m, s);
    if (widget.min != null) {
      final minSecs = _timeSecondsOf(widget.min!);
      if (secs < minSecs) secs = minSecs;
    }
    if (widget.max != null) {
      final maxSecs = _timeSecondsOf(widget.max!);
      if (secs > maxSecs) secs = maxSecs;
    }
    return DateTime(
      base.year,
      base.month,
      base.day,
      secs ~/ 3600,
      (secs % 3600) ~/ 60,
      secs % 60,
    );
  }

  void _emit(int h, int m, int s) {
    final next = _apply(h, m, s);
    _draft = next;
    widget.onValueChange?.call(next);
    _overlay?.markNeedsBuild();
  }

  void _stepHours(int delta) {
    final current = _current;
    int nextHour;
    if (widget.hour12) {
      final hour12 = current.hour % 12 == 0 ? 12 : current.hour % 12;
      final isPm = current.hour >= 12;
      final nextHour12 = _wrap(hour12 + delta, 1, 12);
      nextHour = (nextHour12 % 12) + (isPm ? 12 : 0);
    } else {
      nextHour = _wrap(current.hour + delta, 0, 23);
    }
    _emit(nextHour, current.minute, current.second);
  }

  void _stepMinutes(int delta) {
    final current = _current;
    final nextMinute = _wrap(current.minute + delta * widget.minuteStep, 0, 59);
    _emit(current.hour, nextMinute, current.second);
  }

  void _stepSeconds(int delta) {
    final current = _current;
    final nextSecond = _wrap(current.second + delta * widget.secondStep, 0, 59);
    _emit(current.hour, current.minute, nextSecond);
  }

  /// 오전/오후 토글. 12시간제 숫자는 그대로 두고 오전·오후만 바꾼다.
  void _toggleMeridiem(bool pm) {
    final current = _current;
    final hour12 = current.hour % 12 == 0 ? 12 : current.hour % 12;
    final nextHour = (hour12 % 12) + (pm ? 12 : 0);
    _emit(nextHour, current.minute, current.second);
  }

  void _open() {
    if (_overlay != null) return;
    _draft = widget.value;
    _overlay = OverlayEntry(builder: (_) => _buildOverlay());
    Overlay.of(context).insert(_overlay!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlay?.remove();
    _overlay = null;
    if (mounted) setState(() => _isOpen = false);
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  Widget _buildOverlay() {
    final current = _current;
    return _TimePickerOverlay(
      link: _layerLink,
      hour: current.hour,
      minute: current.minute,
      second: current.second,
      hour12: widget.hour12,
      showSeconds: widget.showSeconds,
      onStepHours: _stepHours,
      onStepMinutes: _stepMinutes,
      onStepSeconds: _stepSeconds,
      onToggleMeridiem: _toggleMeridiem,
      onDismiss: _close,
    );
  }

  /// 트리거에 표시할 텍스트. hour12면 `오전/오후 h:mm(:ss)`, 아니면
  /// `HH:MM(:SS)`. Intl 의존 없이 padLeft로만 포맷한다.
  String? _formattedValue() {
    final d = widget.value;
    if (d == null) return null;
    String two(int n) => n.toString().padLeft(2, '0');
    final sec = widget.showSeconds ? ':${two(d.second)}' : '';
    if (widget.hour12) {
      final meridiem = d.hour < 12 ? '오전' : '오후';
      var h = d.hour % 12;
      if (h == 0) h = 12;
      return '$meridiem $h:${two(d.minute)}$sec';
    }
    return '${two(d.hour)}:${two(d.minute)}$sec';
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled;
    final displayText = _formattedValue();

    return CompositedTransformTarget(
      link: _layerLink,
      child: Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: GestureDetector(
          onTap: disabled ? null : () => _isOpen ? _close() : _open(),
          child: Container(
            height: shUi.control.md,
            padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
            decoration: BoxDecoration(
              color: colors.background,
              border: Border.all(
                color: _isOpen ? colors.foreground : colors.border,
                width: _isOpen ? shUi.borderWidth.strong : shUi.borderWidth.normal,
              ),
              borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    displayText ?? widget.placeholder,
                    style: TextStyle(
                      color: displayText != null
                          ? colors.foreground
                          : colors.foregroundMuted,
                      fontSize: shUi.text.sm,
                    ),
                  ),
                ),
                Icon(Icons.access_time, size: 16, color: colors.foregroundMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/* ───────── 세그먼트 스테퍼 오버레이 ───────── */

class _TimePickerOverlay extends StatelessWidget {
  final LayerLink link;
  final int hour;
  final int minute;
  final int second;
  final bool hour12;
  final bool showSeconds;
  final ValueChanged<int> onStepHours;
  final ValueChanged<int> onStepMinutes;
  final ValueChanged<int> onStepSeconds;
  final ValueChanged<bool> onToggleMeridiem;
  final VoidCallback onDismiss;

  const _TimePickerOverlay({
    required this.link,
    required this.hour,
    required this.minute,
    required this.second,
    required this.hour12,
    required this.showSeconds,
    required this.onStepHours,
    required this.onStepMinutes,
    required this.onStepSeconds,
    required this.onToggleMeridiem,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    String two(int n) => n.toString().padLeft(2, '0');
    final displayHour = hour12 ? (hour % 12 == 0 ? 12 : hour % 12) : hour;
    final isPm = hour >= 12;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: onDismiss,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        CompositedTransformFollower(
          link: link,
          offset: const Offset(0, 44),
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: EdgeInsets.all(shUi.spacing.s3),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _TimeSegment(
                    label: '시',
                    display: two(displayHour),
                    onStep: onStepHours,
                    colors: colors,
                    shUi: shUi,
                  ),
                  _SegmentSeparator(colors: colors, shUi: shUi),
                  _TimeSegment(
                    label: '분',
                    display: two(minute),
                    onStep: onStepMinutes,
                    colors: colors,
                    shUi: shUi,
                  ),
                  if (showSeconds) ...[
                    _SegmentSeparator(colors: colors, shUi: shUi),
                    _TimeSegment(
                      label: '초',
                      display: two(second),
                      onStep: onStepSeconds,
                      colors: colors,
                      shUi: shUi,
                    ),
                  ],
                  if (hour12) ...[
                    SizedBox(width: shUi.spacing.s2),
                    _MeridiemSegment(
                      isPm: isPm,
                      onToggle: onToggleMeridiem,
                      colors: colors,
                      shUi: shUi,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SegmentSeparator extends StatelessWidget {
  final ShUiColorTokens colors;
  final ShUiTheme shUi;

  const _SegmentSeparator({required this.colors, required this.shUi});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s1),
      child: Text(
        ':',
        style: TextStyle(
          color: colors.foregroundMuted,
          fontSize: shUi.text.lg,
          fontWeight: shUi.weight.semibold,
        ),
      ),
    );
  }
}

/// 시/분/초 세그먼트 하나 — 위 화살표 / 값 / 아래 화살표 / 라벨.
class _TimeSegment extends StatelessWidget {
  final String label;
  final String display;
  final ValueChanged<int> onStep;
  final ShUiColorTokens colors;
  final ShUiTheme shUi;

  const _TimeSegment({
    required this.label,
    required this.display,
    required this.onStep,
    required this.colors,
    required this.shUi,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepButton(
          icon: Icons.keyboard_arrow_up,
          onTap: () => onStep(1),
          colors: colors,
        ),
        Padding(
          padding: EdgeInsets.symmetric(vertical: shUi.spacing.s1),
          child: Text(
            display,
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.lg,
              fontWeight: shUi.weight.semibold,
            ),
          ),
        ),
        _StepButton(
          icon: Icons.keyboard_arrow_down,
          onTap: () => onStep(-1),
          colors: colors,
        ),
        SizedBox(height: shUi.spacing.s1),
        Text(
          label,
          style: TextStyle(color: colors.foregroundMuted, fontSize: shUi.text.xs),
        ),
      ],
    );
  }
}

class _StepButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final ShUiColorTokens colors;

  const _StepButton({
    required this.icon,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 28,
      height: 24,
      child: IconButton(
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
        icon: Icon(icon, size: 18, color: colors.foregroundMuted),
        onPressed: onTap,
        splashRadius: 14,
      ),
    );
  }
}

/// 오전/오후 토글 — 활성 상태를 강조 색으로 표시하는 두 버튼.
class _MeridiemSegment extends StatelessWidget {
  final bool isPm;
  final ValueChanged<bool> onToggle;
  final ShUiColorTokens colors;
  final ShUiTheme shUi;

  const _MeridiemSegment({
    required this.isPm,
    required this.onToggle,
    required this.colors,
    required this.shUi,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _MeridiemButton(
          label: '오전',
          active: !isPm,
          onTap: () => onToggle(false),
          colors: colors,
          shUi: shUi,
        ),
        SizedBox(height: shUi.spacing.s1),
        _MeridiemButton(
          label: '오후',
          active: isPm,
          onTap: () => onToggle(true),
          colors: colors,
          shUi: shUi,
        ),
      ],
    );
  }
}

class _MeridiemButton extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  final ShUiColorTokens colors;
  final ShUiTheme shUi;

  const _MeridiemButton({
    required this.label,
    required this.active,
    required this.onTap,
    required this.colors,
    required this.shUi,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: shUi.spacing.s2,
          vertical: shUi.spacing.s1,
        ),
        decoration: BoxDecoration(
          color: active ? colors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
          border: Border.all(color: active ? colors.primary : colors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? colors.primaryForeground : colors.foregroundMuted,
            fontSize: shUi.text.xs,
            fontWeight: shUi.weight.medium,
          ),
        ),
      ),
    );
  }
}
