import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_slider.dart';

class SliderPage extends StatefulWidget {
  const SliderPage({super.key});

  @override
  State<SliderPage> createState() => _SliderPageState();
}

class _SliderPageState extends State<SliderPage> {
  double _defaultValue = 50;
  double _customValue = 0.5;
  double _steppedValue = 20;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Slider', style: TextStyle(color: colors.foreground)),
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
          // --- Default (0-100) ---
          _section('Default (0 - 100)', colors),
          ShUiSlider(
            value: _defaultValue,
            onChanged: (v) => setState(() => _defaultValue = v),
          ),
          const SizedBox(height: 8),
          Text(
            'Value: ${_defaultValue.toInt()}',
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
            ),
          ),

          const SizedBox(height: 24),

          // --- Custom Range (0-1, step 0.1) ---
          _section('Custom Range (0.0 - 1.0, step 0.1)', colors),
          ShUiSlider(
            value: _customValue,
            min: 0,
            max: 1,
            step: 0.1,
            onChanged: (v) => setState(() => _customValue = v),
          ),
          const SizedBox(height: 8),
          Text(
            'Value: ${_customValue.toStringAsFixed(1)}',
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
            ),
          ),

          const SizedBox(height: 24),

          // --- Stepped (0-100, step 20) ---
          _section('Stepped (0 - 100, step 20)', colors),
          ShUiSlider(
            value: _steppedValue,
            min: 0,
            max: 100,
            step: 20,
            onChanged: (v) => setState(() => _steppedValue = v),
          ),
          const SizedBox(height: 8),
          Text(
            'Value: ${_steppedValue.toInt()}',
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
            ),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          const ShUiSlider(
            value: 30,
            enabled: false,
          ),
          const SizedBox(height: 8),
          Text(
            'Value: 30 (disabled)',
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
            ),
          ),

          const SizedBox(height: 24),

          // --- Example: Volume Control ---
          _section('Example: Volume Control', colors),
          Row(
            children: [
              Icon(
                _defaultValue == 0
                    ? Icons.volume_off
                    : _defaultValue < 50
                        ? Icons.volume_down
                        : Icons.volume_up,
                color: colors.foreground,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ShUiSlider(
                  value: _defaultValue,
                  onChanged: (v) => setState(() => _defaultValue = v),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 32,
                child: Text(
                  '${_defaultValue.toInt()}',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
        ],
      ),
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
