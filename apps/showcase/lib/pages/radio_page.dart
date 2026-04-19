import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_radio.dart';

class RadioPage extends StatefulWidget {
  const RadioPage({super.key});

  @override
  State<RadioPage> createState() => _RadioPageState();
}

class _RadioPageState extends State<RadioPage> {
  String? _basicValue = 'option1';
  String? _verticalValue = 'apple';
  String? _horizontalValue = 'sm';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
          // --- Basic ---
          _section('Basic', colors),
          _radioRow('Option 1', colors,
            ShUiRadio<String>(
              value: 'option1',
              groupValue: _basicValue,
              onChanged: (v) => setState(() => _basicValue = v),
            ),
          ),
          const SizedBox(height: 12),
          _radioRow('Option 2', colors,
            ShUiRadio<String>(
              value: 'option2',
              groupValue: _basicValue,
              onChanged: (v) => setState(() => _basicValue = v),
            ),
          ),
          const SizedBox(height: 12),
          _radioRow('Option 3', colors,
            ShUiRadio<String>(
              value: 'option3',
              groupValue: _basicValue,
              onChanged: (v) => setState(() => _basicValue = v),
            ),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          _radioRow('Selected (disabled)', colors,
            const ShUiRadio<String>(
              value: 'a',
              groupValue: 'a',
              enabled: false,
            ),
          ),
          const SizedBox(height: 12),
          _radioRow('Unselected (disabled)', colors,
            const ShUiRadio<String>(
              value: 'b',
              groupValue: 'a',
              enabled: false,
            ),
          ),

          const SizedBox(height: 24),

          // --- Vertical Group ---
          _section('Vertical Group', colors),
          ShUiRadioGroup(
            orientation: ShUiRadioGroupOrientation.vertical,
            gap: 12,
            children: [
              for (final fruit in ['apple', 'banana', 'cherry'])
                _radioRow(fruit[0].toUpperCase() + fruit.substring(1), colors,
                  ShUiRadio<String>(
                    value: fruit,
                    groupValue: _verticalValue,
                    onChanged: (v) =>
                        setState(() => _verticalValue = v),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Horizontal Group ---
          _section('Horizontal Group', colors),
          ShUiRadioGroup(
            orientation: ShUiRadioGroupOrientation.horizontal,
            gap: 24,
            children: [
              for (final size in ['sm', 'md', 'lg'])
                _radioRow(size.toUpperCase(), colors,
                  ShUiRadio<String>(
                    value: size,
                    groupValue: _horizontalValue,
                    onChanged: (v) =>
                        setState(() => _horizontalValue = v),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Current Selection ---
          _section('Current Selection', colors),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.backgroundSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.border),
            ),
            child: Text(
              'Basic: $_basicValue\n'
              'Vertical: $_verticalValue\n'
              'Horizontal: $_horizontalValue',
              style: TextStyle(
                color: colors.foreground,
                fontSize: 13,
                fontFamily: 'monospace',
                height: 1.6,
              ),
            ),
          ),
        ],
    );
  }

  Widget _radioRow(String label, ShUiColorTokens colors, Widget radio) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        radio,
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(color: colors.foreground, fontSize: 14),
        ),
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
