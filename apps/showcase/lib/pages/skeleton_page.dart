import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_skeleton.dart';
import '../widgets/sh_ui_card.dart';

class SkeletonPage extends StatelessWidget {
  const SkeletonPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
          _section('Basic', colors),
          SizedBox(
            width: 320,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                ShUiSkeleton(height: 20, width: 220),
                SizedBox(height: 12),
                ShUiSkeleton(height: 16),
                SizedBox(height: 12),
                ShUiSkeleton(height: 16, width: 270),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _section('아바타 + 텍스트 줄', colors),
          SizedBox(
            width: 320,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ShUiSkeleton.avatar(size: 40),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      ShUiSkeleton(height: 14, width: 160),
                      SizedBox(height: 8),
                      ShUiSkeleton(height: 12, width: 100),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _section('카드 플레이스홀더', colors),
          SizedBox(
            width: 360,
            child: ShUiCard(
              children: [
                const ShUiCardHeader(
                  title: _HeaderSkeleton(),
                ),
                ShUiCardContent(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      ShUiSkeleton(height: 14),
                      SizedBox(height: 8),
                      ShUiSkeleton(height: 14, width: 280),
                      SizedBox(height: 8),
                      ShUiSkeleton(height: 14, width: 200),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _section('Block', colors),
          SizedBox(
            width: 360,
            child: ShUiSkeleton.block(height: 120),
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

class _HeaderSkeleton extends StatelessWidget {
  const _HeaderSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        ShUiSkeleton(height: 18, width: 160),
        SizedBox(height: 8),
        ShUiSkeleton(height: 14, width: 240),
      ],
    );
  }
}
