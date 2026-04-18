import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_textarea.dart';

class TextareaPage extends StatefulWidget {
  const TextareaPage({super.key});

  @override
  State<TextareaPage> createState() => _TextareaPageState();
}

class _TextareaPageState extends State<TextareaPage> {
  final _basicController = TextEditingController();
  final _countController = TextEditingController();
  int _charCount = 0;
  static const _maxChars = 200;

  @override
  void dispose() {
    _basicController.dispose();
    _countController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Textarea', style: TextStyle(color: colors.foreground)),
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
          // --- Basic ---
          _section('Basic', colors),
          ShUiTextarea(
            controller: _basicController,
            placeholder: 'Type your message here...',
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- With Character Count ---
          _section('Character Count', colors),
          ShUiTextarea(
            controller: _countController,
            placeholder: 'Write something...',
            maxLength: _maxChars,
            onChanged: (v) {
              setState(() => _charCount = v.length);
            },
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '$_charCount / $_maxChars',
              style: TextStyle(
                color: _charCount > _maxChars
                    ? colors.danger
                    : colors.foregroundMuted,
                fontSize: 12,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          const ShUiTextarea(
            placeholder: 'Disabled textarea',
            enabled: false,
          ),

          const SizedBox(height: 24),

          // --- Read Only ---
          _section('Read Only', colors),
          ShUiTextarea(
            controller: TextEditingController(
              text: 'This content is read-only and cannot be edited.',
            ),
            readOnly: true,
          ),

          const SizedBox(height: 24),

          // --- Invalid ---
          _section('Invalid', colors),
          ShUiTextarea(
            placeholder: 'This field has an error',
            invalid: true,
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- Custom Min/Max Lines ---
          _section('Custom Lines (min: 5, max: 10)', colors),
          ShUiTextarea(
            placeholder: 'Taller textarea...',
            minLines: 5,
            maxLines: 10,
            onChanged: (v) {},
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
