import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_input.dart';

class InputPage extends StatefulWidget {
  const InputPage({super.key});

  @override
  State<InputPage> createState() => _InputPageState();
}

class _InputPageState extends State<InputPage> {
  final _basicController = TextEditingController();
  final _prefixController = TextEditingController();
  final _suffixController = TextEditingController();

  @override
  void dispose() {
    _basicController.dispose();
    _prefixController.dispose();
    _suffixController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Input', style: TextStyle(color: colors.foreground)),
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
          ShUiInput(
            controller: _basicController,
            placeholder: 'Enter text...',
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- With Prefix Icon ---
          _section('Prefix Icon', colors),
          ShUiInput(
            controller: _prefixController,
            placeholder: 'Search...',
            prefix: const Icon(Icons.search),
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- With Suffix Icon ---
          _section('Suffix Icon', colors),
          ShUiInput(
            controller: _suffixController,
            placeholder: 'Email address',
            suffix: const Icon(Icons.email_outlined),
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- Password ---
          _section('Password Input', colors),
          const ShUiPasswordInput(
            placeholder: 'Enter password',
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          const ShUiInput(
            placeholder: 'Disabled input',
            enabled: false,
          ),

          const SizedBox(height: 24),

          // --- Read Only ---
          _section('Read Only', colors),
          ShUiInput(
            placeholder: 'Read only input',
            readOnly: true,
            controller: TextEditingController(text: 'Cannot edit this'),
          ),

          const SizedBox(height: 24),

          // --- Invalid ---
          _section('Invalid', colors),
          ShUiInput(
            placeholder: 'Invalid input',
            invalid: true,
            onChanged: (v) {},
          ),

          const SizedBox(height: 24),

          // --- With Max Length ---
          _section('Max Length (20)', colors),
          ShUiInput(
            placeholder: 'Max 20 characters',
            maxLength: 20,
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
