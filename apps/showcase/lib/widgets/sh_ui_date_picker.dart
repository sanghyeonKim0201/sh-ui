import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui DatePicker — 날짜 선택.
///
/// ShUiDatePicker(
///   value: selectedDate,
///   onValueChange: (date) => setState(() => selectedDate = date),
///   placeholder: '날짜 선택',
/// )
class ShUiDatePicker extends StatefulWidget {
  final DateTime? value;
  final ValueChanged<DateTime?>? onValueChange;
  final String placeholder;
  final DateTime? min;
  final DateTime? max;
  final String Function(DateTime)? formatDate;
  final bool enabled;

  const ShUiDatePicker({
    super.key,
    this.value,
    this.onValueChange,
    this.placeholder = '날짜 선택',
    this.min,
    this.max,
    this.formatDate,
    this.enabled = true,
  });

  @override
  State<ShUiDatePicker> createState() => _ShUiDatePickerState();
}

class _ShUiDatePickerState extends State<ShUiDatePicker> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlay;
  bool _isOpen = false;
  late DateTime _focusedMonth;

  @override
  void initState() {
    super.initState();
    _focusedMonth = widget.value ?? DateTime.now();
  }

  String _defaultFormat(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  void _open() {
    if (_overlay != null) return;
    _focusedMonth = widget.value ?? DateTime.now();
    _overlay = OverlayEntry(builder: (_) => _buildOverlay());
    Overlay.of(context).insert(_overlay!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlay?.remove();
    _overlay = null;
    if (mounted) setState(() => _isOpen = false);
  }

  void _select(DateTime date) {
    widget.onValueChange?.call(date);
    _close();
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  Widget _buildOverlay() {
    return _DatePickerOverlay(
      link: _layerLink,
      selected: widget.value,
      focusedMonth: _focusedMonth,
      onFocusedMonthChange: (d) {
        _focusedMonth = d;
        _overlay?.markNeedsBuild();
      },
      onSelect: _select,
      onDismiss: _close,
      min: widget.min,
      max: widget.max,
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled;
    final fmt = widget.formatDate ?? _defaultFormat;
    final displayText = widget.value != null ? fmt(widget.value!) : null;

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
                Icon(Icons.calendar_today_outlined,
                    size: 16, color: colors.foregroundMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// sh-ui DateRangePicker — 날짜 범위 선택.
class ShUiDateRangePicker extends StatefulWidget {
  final DateTimeRange? value;
  final ValueChanged<DateTimeRange?>? onValueChange;
  final String placeholder;
  final DateTime? min;
  final DateTime? max;
  final String Function(DateTime)? formatDate;
  final bool enabled;

  const ShUiDateRangePicker({
    super.key,
    this.value,
    this.onValueChange,
    this.placeholder = '시작일 ~ 종료일',
    this.min,
    this.max,
    this.formatDate,
    this.enabled = true,
  });

  @override
  State<ShUiDateRangePicker> createState() => _ShUiDateRangePickerState();
}

class _ShUiDateRangePickerState extends State<ShUiDateRangePicker> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlay;
  bool _isOpen = false;
  late DateTime _focusedMonth;
  DateTime? _picking; // 첫 번째 날짜 선택 후 두 번째 대기 중

  @override
  void initState() {
    super.initState();
    _focusedMonth = widget.value?.start ?? DateTime.now();
  }

  String _defaultFormat(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  void _open() {
    if (_overlay != null) return;
    _picking = null;
    _focusedMonth = widget.value?.start ?? DateTime.now();
    _overlay = OverlayEntry(builder: (_) => _buildOverlay());
    Overlay.of(context).insert(_overlay!);
    setState(() => _isOpen = true);
  }

  void _close() {
    _overlay?.remove();
    _overlay = null;
    if (mounted) setState(() => _isOpen = false);
  }

  void _select(DateTime date) {
    if (_picking == null) {
      _picking = date;
      _overlay?.markNeedsBuild();
    } else {
      final from = _picking!.isBefore(date) ? _picking! : date;
      final to = _picking!.isBefore(date) ? date : _picking!;
      widget.onValueChange?.call(DateTimeRange(start: from, end: to));
      _picking = null;
      _close();
    }
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  Widget _buildOverlay() {
    return _DatePickerOverlay(
      link: _layerLink,
      selected: _picking,
      focusedMonth: _focusedMonth,
      onFocusedMonthChange: (d) {
        _focusedMonth = d;
        _overlay?.markNeedsBuild();
      },
      onSelect: _select,
      onDismiss: _close,
      min: widget.min,
      max: widget.max,
      rangeFrom: _picking ?? widget.value?.start,
      rangeTo: _picking != null ? null : widget.value?.end,
      hint: _picking != null ? '종료일을 선택하세요' : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled;
    final fmt = widget.formatDate ?? _defaultFormat;
    final displayText = widget.value != null
        ? '${fmt(widget.value!.start)} ~ ${fmt(widget.value!.end)}'
        : null;

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
                Icon(Icons.calendar_today_outlined,
                    size: 16, color: colors.foregroundMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/* ───────── Calendar overlay (shared) ───────── */

class _DatePickerOverlay extends StatelessWidget {
  final LayerLink link;
  final DateTime? selected;
  final DateTime focusedMonth;
  final ValueChanged<DateTime> onFocusedMonthChange;
  final ValueChanged<DateTime> onSelect;
  final VoidCallback onDismiss;
  final DateTime? min;
  final DateTime? max;
  final DateTime? rangeFrom;
  final DateTime? rangeTo;
  final String? hint;

  const _DatePickerOverlay({
    required this.link,
    this.selected,
    required this.focusedMonth,
    required this.onFocusedMonthChange,
    required this.onSelect,
    required this.onDismiss,
    this.min,
    this.max,
    this.rangeFrom,
    this.rangeTo,
    this.hint,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

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
              width: 280,
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
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (hint != null) ...[
                    Text(
                      hint!,
                      style: TextStyle(
                        color: colors.foregroundMuted,
                        fontSize: shUi.text.xs,
                      ),
                    ),
                    SizedBox(height: shUi.spacing.s2),
                  ],
                  _ShUiCalendar(
                    focusedMonth: focusedMonth,
                    selected: selected,
                    onSelect: onSelect,
                    onFocusedMonthChange: onFocusedMonthChange,
                    min: min,
                    max: max,
                    rangeFrom: rangeFrom,
                    rangeTo: rangeTo,
                    colors: colors,
                    radius: shUi.radius,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/* ───────── Calendar grid ───────── */

const _weekLabels = ['일', '월', '화', '수', '목', '금', '토'];

bool _isSameDay(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;

class _ShUiCalendar extends StatelessWidget {
  final DateTime focusedMonth;
  final DateTime? selected;
  final ValueChanged<DateTime> onSelect;
  final ValueChanged<DateTime> onFocusedMonthChange;
  final DateTime? min;
  final DateTime? max;
  final DateTime? rangeFrom;
  final DateTime? rangeTo;
  final ShUiColorTokens colors;
  final ShUiRadiusTokens radius;

  const _ShUiCalendar({
    required this.focusedMonth,
    this.selected,
    required this.onSelect,
    required this.onFocusedMonthChange,
    this.min,
    this.max,
    this.rangeFrom,
    this.rangeTo,
    required this.colors,
    required this.radius,
  });

  List<_DayCell> _getDaysGrid() {
    final year = focusedMonth.year;
    final month = focusedMonth.month;
    final first = DateTime(year, month, 1);
    final startDay = first.weekday % 7; // 0=Sun
    final daysInMonth = DateTime(year, month + 1, 0).day;
    final prevDays = DateTime(year, month, 0).day;

    final cells = <_DayCell>[];

    for (var i = startDay - 1; i >= 0; i--) {
      cells.add(_DayCell(
        date: DateTime(year, month - 1, prevDays - i),
        current: false,
      ));
    }
    for (var d = 1; d <= daysInMonth; d++) {
      cells.add(_DayCell(date: DateTime(year, month, d), current: true));
    }
    final remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (var d = 1; d <= remaining; d++) {
        cells.add(_DayCell(date: DateTime(year, month + 1, d), current: false));
      }
    }

    return cells;
  }

  bool _isDisabled(DateTime date) {
    if (min != null && date.isBefore(DateTime(min!.year, min!.month, min!.day))) {
      return true;
    }
    if (max != null && date.isAfter(DateTime(max!.year, max!.month, max!.day))) {
      return true;
    }
    return false;
  }

  bool _isInRange(DateTime date) {
    if (rangeFrom == null) return false;
    final end = rangeTo;
    if (end == null) return false;
    final start = rangeFrom!.isBefore(end) ? rangeFrom! : end;
    final finish = rangeFrom!.isBefore(end) ? end : rangeFrom!;
    return !date.isBefore(start) && !date.isAfter(finish);
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final year = focusedMonth.year;
    final month = focusedMonth.month;
    final cells = _getDaysGrid();
    final today = DateTime.now();
    final monthLabel = '$year년 $month월';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () {
                final m = month - 1;
                onFocusedMonthChange(
                  m < 1 ? DateTime(year - 1, 12, 1) : DateTime(year, m, 1),
                );
              },
              child: Icon(Icons.chevron_left, size: 20, color: colors.foreground),
            ),
            Text(
              monthLabel,
              style: TextStyle(
                color: colors.foreground,
                fontSize: shUi.text.sm,
                fontWeight: shUi.weight.semibold,
              ),
            ),
            GestureDetector(
              onTap: () {
                final m = month + 1;
                onFocusedMonthChange(
                  m > 12 ? DateTime(year + 1, 1, 1) : DateTime(year, m, 1),
                );
              },
              child: Icon(Icons.chevron_right, size: 20, color: colors.foreground),
            ),
          ],
        ),
        SizedBox(height: shUi.spacing.s2),
        // Weekday labels
        Row(
          children: _weekLabels
              .map((l) => Expanded(
                    child: Center(
                      child: Text(
                        l,
                        style: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: shUi.text.xs,
                          fontWeight: shUi.weight.medium,
                        ),
                      ),
                    ),
                  ))
              .toList(),
        ),
        SizedBox(height: shUi.spacing.s1),
        // Day grid
        ...List.generate((cells.length / 7).ceil(), (row) {
          return Row(
            children: List.generate(7, (col) {
              final idx = row * 7 + col;
              if (idx >= cells.length) return const Expanded(child: SizedBox());
              final cell = cells[idx];
              final disabled = _isDisabled(cell.date);
              final isSelected = selected != null && _isSameDay(cell.date, selected!);
              final isToday = _isSameDay(cell.date, today);
              final inRange = _isInRange(cell.date);

              return Expanded(
                child: _DayButton(
                  day: cell.date.day,
                  current: cell.current,
                  selected: isSelected,
                  today: isToday,
                  inRange: inRange,
                  disabled: disabled,
                  onTap: disabled ? null : () => onSelect(cell.date),
                  colors: colors,
                  radius: radius,
                ),
              );
            }),
          );
        }),
      ],
    );
  }
}

class _DayCell {
  final DateTime date;
  final bool current;
  _DayCell({required this.date, required this.current});
}

class _DayButton extends StatefulWidget {
  final int day;
  final bool current;
  final bool selected;
  final bool today;
  final bool inRange;
  final bool disabled;
  final VoidCallback? onTap;
  final ShUiColorTokens colors;
  final ShUiRadiusTokens radius;

  const _DayButton({
    required this.day,
    required this.current,
    required this.selected,
    required this.today,
    required this.inRange,
    required this.disabled,
    this.onTap,
    required this.colors,
    required this.radius,
  });

  @override
  State<_DayButton> createState() => _DayButtonState();
}

class _DayButtonState extends State<_DayButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;

    if (widget.selected) {
      bg = widget.colors.primary;
      fg = widget.colors.primaryForeground;
    } else if (widget.inRange) {
      bg = widget.colors.primary.withValues(alpha: 0.1);
      fg = widget.colors.foreground;
    } else if (_hover && !widget.disabled) {
      bg = widget.colors.backgroundMuted;
      fg = widget.colors.foreground;
    } else {
      bg = Colors.transparent;
      fg = widget.current ? widget.colors.foreground : widget.colors.foregroundMuted;
    }

    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          height: shUi.control.sm,
          margin: const EdgeInsets.all(1),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(widget.radius.defaultRadius - 2),
            border: widget.today && !widget.selected
                ? Border.all(color: widget.colors.primary, width: shUi.borderWidth.normal)
                : null,
          ),
          alignment: Alignment.center,
          child: Opacity(
            opacity: widget.disabled ? 0.3 : 1,
            child: Text(
              '${widget.day}',
              style: TextStyle(
                color: fg,
                fontSize: 13,
                fontWeight: widget.today || widget.selected
                    ? shUi.weight.semibold
                    : shUi.weight.regular,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
