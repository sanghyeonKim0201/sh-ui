import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_color_picker.dart';

class ColorPickerPage extends StatefulWidget {
  const ColorPickerPage({super.key});

  @override
  State<ColorPickerPage> createState() => _ColorPickerPageState();
}

class _ColorPickerPageState extends State<ColorPickerPage> {
  Color _color = const Color(0xFF3B82F6);

  String _colorToHex(Color c) {
    return '#${c.red.toInt().toRadixString(16).padLeft(2, '0')}'
        '${c.green.toInt().toRadixString(16).padLeft(2, '0')}'
        '${c.blue.toInt().toRadixString(16).padLeft(2, '0')}'
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title:
            Text('Color Picker', style: TextStyle(color: colors.foreground)),
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
          // --- Live Preview ---
          _section('Color Preview', colors),
          Container(
            height: 80,
            decoration: BoxDecoration(
              color: _color,
              borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
              border: Border.all(color: colors.border),
            ),
            alignment: Alignment.center,
            child: Text(
              _colorToHex(_color),
              style: TextStyle(
                color: _color.computeLuminance() > 0.5
                    ? Colors.black
                    : Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
                fontFamily: 'monospace',
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Picker ---
          _section('Color Picker', colors),
          ShUiColorPicker(
            value: _color,
            onChanged: (c) => setState(() => _color = c),
          ),

          const SizedBox(height: 24),

          // --- Color Info ---
          _section('Color Info', colors),
          _infoRow('HEX', _colorToHex(_color), colors),
          const SizedBox(height: 8),
          _infoRow(
            'RGB',
            'R: ${_color.red.toInt()}  G: ${_color.green.toInt()}  B: ${_color.blue.toInt()}',
            colors,
          ),
          const SizedBox(height: 8),
          _infoRow(
            'Luminance',
            _color.computeLuminance().toStringAsFixed(3),
            colors,
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, ShUiColorTokens colors) {
    return Row(
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: colors.foreground,
            fontSize: 13,
            fontFamily: 'monospace',
          ),
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
