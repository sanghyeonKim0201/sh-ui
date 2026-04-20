import 'dart:async';
import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_progress.dart';

class ProgressPage extends StatefulWidget {
  const ProgressPage({super.key});

  @override
  State<ProgressPage> createState() => _ProgressPageState();
}

class _ProgressPageState extends State<ProgressPage> {
  double _value = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 400), (_) {
      setState(() {
        _value = _value >= 1 ? 0 : _value + 0.05;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('Determinate', colors),
        ShUiProgress(value: _value, semanticLabel: '다운로드'),
        const SizedBox(height: 8),
        Text(
          '현재: ${(_value * 100).round()}%',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
        ),
        const SizedBox(height: 24),
        _section('Indeterminate', colors),
        const ShUiProgress(semanticLabel: '로딩 중'),
        const SizedBox(height: 24),
        _section('두꺼운 바', colors),
        const ShUiProgress(value: 0.75, height: 14),
      ],
    );
  }

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
