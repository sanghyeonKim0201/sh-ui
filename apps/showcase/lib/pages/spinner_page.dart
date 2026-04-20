import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_spinner.dart';

class SpinnerPage extends StatelessWidget {
  const SpinnerPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('Sizes', colors),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: const [
            ShUiSpinner(size: ShUiSpinnerSize.sm),
            SizedBox(width: 16),
            ShUiSpinner(size: ShUiSpinnerSize.md),
            SizedBox(width: 16),
            ShUiSpinner(size: ShUiSpinnerSize.lg),
          ],
        ),
        const SizedBox(height: 24),
        _section('색상 상속', colors),
        DefaultTextStyle.merge(
          style: TextStyle(color: colors.primary),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              ShUiSpinner(size: ShUiSpinnerSize.md),
              SizedBox(width: 8),
              Text('저장 중…'),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _section('명시적 색상', colors),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ShUiSpinner(color: colors.primary),
            const SizedBox(width: 16),
            ShUiSpinner(color: colors.danger),
          ],
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
