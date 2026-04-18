import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_date_picker.dart';

class DatePickerPage extends StatefulWidget {
  const DatePickerPage({super.key});

  @override
  State<DatePickerPage> createState() => _DatePickerPageState();
}

class _DatePickerPageState extends State<DatePickerPage> {
  DateTime? _singleDate;
  DateTimeRange? _dateRange;
  DateTime? _minMaxDate;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final now = DateTime.now();

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Date Picker', style: TextStyle(color: colors.foreground)),
        backgroundColor: colors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.foreground),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: colors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // --- Single Date ---
          _section('Single Date', colors),
          ShUiDatePicker(
            value: _singleDate,
            onValueChange: (d) => setState(() => _singleDate = d),
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 날짜: ${_singleDate != null ? _formatDate(_singleDate!) : '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- Date Range ---
          _section('Date Range', colors),
          ShUiDateRangePicker(
            value: _dateRange,
            onValueChange: (r) => setState(() => _dateRange = r),
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 범위: ${_dateRange != null ? '${_formatDate(_dateRange!.start)} ~ ${_formatDate(_dateRange!.end)}' : '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- With Min/Max ---
          _section('Min / Max Constraint', colors),
          Text(
            '선택 가능 범위: ${_formatDate(now)} ~ ${_formatDate(now.add(const Duration(days: 30)))}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
          ),
          const SizedBox(height: 8),
          ShUiDatePicker(
            value: _minMaxDate,
            onValueChange: (d) => setState(() => _minMaxDate = d),
            placeholder: '날짜 선택 (30일 이내)',
            min: now,
            max: now.add(const Duration(days: 30)),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          const ShUiDatePicker(
            enabled: false,
            placeholder: '선택 불가',
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

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
