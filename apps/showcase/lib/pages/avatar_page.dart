import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_avatar.dart';

class AvatarPage extends StatelessWidget {
  const AvatarPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('이미지 + Fallback', colors),
        const Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            ShUiAvatar(
              imageUrl: 'https://i.pravatar.cc/80?img=12',
              fallback: Text('상'),
              semanticLabel: '김상현',
            ),
            ShUiAvatar(
              imageUrl: 'https://invalid-url.example/none.jpg',
              fallback: Text('JD'),
            ),
            ShUiAvatar(fallback: Text('SK')),
            ShUiAvatar(fallback: Icon(Icons.person_outline)),
          ],
        ),
        const SizedBox(height: 24),
        _section('Sizes', colors),
        const Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            ShUiAvatar(size: ShUiAvatarSize.sm, fallback: Text('SM')),
            ShUiAvatar(size: ShUiAvatarSize.md, fallback: Text('MD')),
            ShUiAvatar(size: ShUiAvatarSize.lg, fallback: Text('LG')),
            ShUiAvatar(size: ShUiAvatarSize.xl, fallback: Text('XL')),
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
