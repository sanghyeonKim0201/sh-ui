import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_badge.dart';

class BadgePage extends StatelessWidget {
  const BadgePage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('Variants', colors),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ShUiBadge.text('Primary'),
            ShUiBadge.text('Secondary', variant: ShUiBadgeVariant.secondary),
            ShUiBadge.text('Success', variant: ShUiBadgeVariant.success),
            ShUiBadge.text('Warning', variant: ShUiBadgeVariant.warning),
            ShUiBadge.text('Danger', variant: ShUiBadgeVariant.danger),
            ShUiBadge.text('Outline', variant: ShUiBadgeVariant.outline),
          ],
        ),
        const SizedBox(height: 24),
        _section('Sizes', colors),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            ShUiBadge.text('Small', size: ShUiBadgeSize.sm),
            ShUiBadge.text('Medium', size: ShUiBadgeSize.md),
          ],
        ),
        const SizedBox(height: 24),
        _section('아이콘 + 텍스트', colors),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: const [
            ShUiBadge(
              variant: ShUiBadgeVariant.success,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check, size: 12),
                  SizedBox(width: 4),
                  Text('완료'),
                ],
              ),
            ),
            ShUiBadge(
              variant: ShUiBadgeVariant.warning,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.warning_amber_rounded, size: 12),
                  SizedBox(width: 4),
                  Text('주의'),
                ],
              ),
            ),
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
