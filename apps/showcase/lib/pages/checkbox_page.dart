import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_checkbox.dart';

class CheckboxPage extends StatefulWidget {
  const CheckboxPage({super.key});

  @override
  State<CheckboxPage> createState() => _CheckboxPageState();
}

class _CheckboxPageState extends State<CheckboxPage> {
  bool _checked1 = false;
  bool _checked2 = true;
  bool _indeterminate = true;

  // Group state
  final List<bool> _groupValues = [false, true, false];
  final List<String> _groupLabels = ['Apple', 'Banana', 'Cherry'];

  // Horizontal group
  final List<bool> _hGroupValues = [true, false, true];
  final List<String> _hGroupLabels = ['Bold', 'Italic', 'Underline'];

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Checkbox', style: TextStyle(color: colors.foreground)),
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
          // --- States ---
          _section('States', colors),
          _checkboxRow('Unchecked', colors,
            ShUiCheckbox(
              checked: _checked1,
              onChanged: (v) => setState(() => _checked1 = v),
            ),
          ),
          const SizedBox(height: 12),
          _checkboxRow('Checked', colors,
            ShUiCheckbox(
              checked: _checked2,
              onChanged: (v) => setState(() => _checked2 = v),
            ),
          ),
          const SizedBox(height: 12),
          _checkboxRow('Indeterminate', colors,
            ShUiCheckbox(
              indeterminate: _indeterminate,
              onChanged: (v) => setState(() => _indeterminate = !_indeterminate),
            ),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          _checkboxRow('Disabled unchecked', colors,
            const ShUiCheckbox(
              checked: false,
              enabled: false,
            ),
          ),
          const SizedBox(height: 12),
          _checkboxRow('Disabled checked', colors,
            const ShUiCheckbox(
              checked: true,
              enabled: false,
            ),
          ),
          const SizedBox(height: 12),
          _checkboxRow('Disabled indeterminate', colors,
            const ShUiCheckbox(
              indeterminate: true,
              enabled: false,
            ),
          ),

          const SizedBox(height: 24),

          // --- Vertical Group ---
          _section('Vertical Group', colors),
          ShUiCheckboxGroup(
            orientation: ShUiCheckboxGroupOrientation.vertical,
            gap: 12,
            children: [
              for (var i = 0; i < _groupLabels.length; i++)
                _checkboxRow(_groupLabels[i], colors,
                  ShUiCheckbox(
                    checked: _groupValues[i],
                    onChanged: (v) =>
                        setState(() => _groupValues[i] = v),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Horizontal Group ---
          _section('Horizontal Group', colors),
          ShUiCheckboxGroup(
            orientation: ShUiCheckboxGroupOrientation.horizontal,
            gap: 24,
            children: [
              for (var i = 0; i < _hGroupLabels.length; i++)
                _checkboxRow(_hGroupLabels[i], colors,
                  ShUiCheckbox(
                    checked: _hGroupValues[i],
                    onChanged: (v) =>
                        setState(() => _hGroupValues[i] = v),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _checkboxRow(String label, ShUiColorTokens colors, Widget checkbox) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        checkbox,
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
