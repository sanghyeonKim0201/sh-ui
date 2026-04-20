import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_separator.dart';

class SeparatorPage extends StatelessWidget {
  const SeparatorPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('Horizontal', colors),
        SizedBox(
          width: 320,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('라디오 옵션', style: TextStyle(color: colors.foreground)),
              const SizedBox(height: 8),
              const ShUiSeparator(),
              const SizedBox(height: 8),
              Text(
                '설정 섹션 설명',
                style: TextStyle(color: colors.foregroundMuted, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _section('Vertical', colors),
        SizedBox(
          height: 24,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('문서', style: TextStyle(color: colors.foregroundMuted, fontSize: 13)),
              const SizedBox(width: 12),
              const ShUiSeparator(orientation: ShUiSeparatorOrientation.vertical),
              const SizedBox(width: 12),
              Text('편집', style: TextStyle(color: colors.foregroundMuted, fontSize: 13)),
              const SizedBox(width: 12),
              const ShUiSeparator(orientation: ShUiSeparatorOrientation.vertical),
              const SizedBox(width: 12),
              Text('공유', style: TextStyle(color: colors.foregroundMuted, fontSize: 13)),
            ],
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
