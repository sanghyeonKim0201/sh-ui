import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_time_picker.dart';

class TimePickerPage extends StatefulWidget {
  const TimePickerPage({super.key});

  @override
  State<TimePickerPage> createState() => _TimePickerPageState();
}

class _TimePickerPageState extends State<TimePickerPage> {
  DateTime? _basicTime;
  DateTime? _controlledTime;
  DateTime? _hour12Time;
  DateTime? _secondsTime;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final now = DateTime.now();

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        // --- Basic ---
        _section('Basic', colors),
        ShUiTimePicker(
          value: _basicTime,
          onValueChange: (t) => setState(() => _basicTime = t),
        ),
        const SizedBox(height: 12),
        Text(
          '선택된 시각: ${_basicTime != null ? _formatTime(_basicTime!) : '없음'}',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
        ),

        const SizedBox(height: 24),

        // --- Controlled (min/max) ---
        _section('Controlled — Min / Max', colors),
        Text(
          '선택 가능 범위: 09:00 ~ 18:00',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
        ),
        const SizedBox(height: 8),
        ShUiTimePicker(
          value: _controlledTime,
          onValueChange: (t) => setState(() => _controlledTime = t),
          placeholder: '업무 시간 내 선택',
          min: DateTime(now.year, now.month, now.day, 9),
          max: DateTime(now.year, now.month, now.day, 18),
        ),

        const SizedBox(height: 24),

        // --- hour12 ---
        _section('12시간제 (오전/오후)', colors),
        ShUiTimePicker(
          value: _hour12Time,
          onValueChange: (t) => setState(() => _hour12Time = t),
          hour12: true,
        ),

        const SizedBox(height: 24),

        // --- showSeconds ---
        _section('초 단위 표시', colors),
        ShUiTimePicker(
          value: _secondsTime,
          onValueChange: (t) => setState(() => _secondsTime = t),
          showSeconds: true,
          minuteStep: 5,
        ),

        const SizedBox(height: 24),

        // --- Disabled ---
        _section('Disabled', colors),
        const ShUiTimePicker(
          enabled: false,
          placeholder: '선택 불가',
        ),
      ],
    );
  }

  String _formatTime(DateTime d) =>
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  Widget _section(String title, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          color: colors.foreground,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
