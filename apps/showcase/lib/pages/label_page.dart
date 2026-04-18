import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_label.dart';

class LabelPage extends StatefulWidget {
  const LabelPage({super.key});

  @override
  State<LabelPage> createState() => _LabelPageState();
}

class _LabelPageState extends State<LabelPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Label', style: TextStyle(color: colors.foreground)),
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
          // --- Title ---
          _section('Title', colors),
          const ShUiLabel(
            child: ShUiLabelTitle('Username'),
          ),

          const SizedBox(height: 24),

          // --- Title with Required ---
          _section('Title (Required)', colors),
          const ShUiLabel(
            isRequired: true,
            child: ShUiLabelTitle('Email'),
          ),

          const SizedBox(height: 24),

          // --- Subtitle ---
          _section('Subtitle', colors),
          const ShUiLabelSubtitle('Optional subtitle text'),

          const SizedBox(height: 24),

          // --- Description ---
          _section('Description', colors),
          const ShUiLabelDescription(
            'This is a description that provides additional context about the form field.',
          ),

          const SizedBox(height: 24),

          // --- Caption ---
          _section('Caption', colors),
          const ShUiLabelCaption('This is a helper caption'),

          const SizedBox(height: 12),

          const ShUiLabelCaption(
            'This field is required',
            isError: true,
          ),

          const SizedBox(height: 24),

          // --- Full Composition ---
          _section('Full Composition', colors),
          _demoCard(
            colors,
            const ShUiLabel(
              isRequired: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShUiLabelTitle('Full Name'),
                  SizedBox(height: 2),
                  ShUiLabelDescription(
                    'Enter your first and last name as shown on your ID.',
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          _demoCard(
            colors,
            const ShUiLabel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShUiLabelTitle('Bio'),
                  SizedBox(height: 2),
                  ShUiLabelSubtitle('Optional'),
                  SizedBox(height: 4),
                  ShUiLabelDescription(
                    'Tell us a bit about yourself. This will be shown on your profile.',
                  ),
                  SizedBox(height: 8),
                  ShUiLabelCaption('Max 160 characters'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          _demoCard(
            colors,
            const ShUiLabel(
              isRequired: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShUiLabelTitle('Password'),
                  SizedBox(height: 2),
                  ShUiLabelDescription(
                    'Must be at least 8 characters with one uppercase letter.',
                  ),
                  SizedBox(height: 8),
                  ShUiLabelCaption(
                    'Password is too short',
                    isError: true,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- All Parts Reference ---
          _section('All Parts Reference', colors),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.backgroundSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.border),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShUiLabel(
                  isRequired: true,
                  child: ShUiLabelTitle('ShUiLabelTitle'),
                ),
                SizedBox(height: 8),
                ShUiLabelSubtitle('ShUiLabelSubtitle'),
                SizedBox(height: 8),
                ShUiLabelDescription('ShUiLabelDescription'),
                SizedBox(height: 8),
                ShUiLabelCaption('ShUiLabelCaption'),
                SizedBox(height: 4),
                ShUiLabelCaption('ShUiLabelCaption (error)', isError: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _demoCard(ShUiColorTokens colors, Widget child) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.backgroundSubtle,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.border),
      ),
      child: child,
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
