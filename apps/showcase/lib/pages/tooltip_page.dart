import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_button.dart';
import '../widgets/sh_ui_tooltip.dart';

class TooltipPage extends StatelessWidget {
  const TooltipPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본', colors),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ShUiTooltip(
              message: '변경 사항을 저장합니다 (⌘S)',
              child: ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () {},
                child: const Text('저장'),
              ),
            ),
            ShUiTooltip(
              message: '팀원과 공유하기',
              child: ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () {},
                child: const Text('공유'),
              ),
            ),
            ShUiTooltip(
              message: '설정',
              child: ShUiButton(
                variant: ShUiButtonVariant.ghost,
                onPressed: () {},
                child: const Icon(Icons.settings_outlined),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          '데스크탑: hover, 모바일/터치: long-press',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: 12,
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
