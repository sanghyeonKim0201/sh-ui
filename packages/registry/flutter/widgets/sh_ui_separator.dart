import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiSeparatorOrientation { horizontal, vertical }

/// sh-ui Separator — 시각적 구분선.
///
/// 가로(height=1px) 또는 세로(width=1px) 방향. 의미 없는 장식 구분이 기본.
/// 스크린리더에 섹션 경계를 알리려면 [decorative]를 false로.
class ShUiSeparator extends StatelessWidget {
  final ShUiSeparatorOrientation orientation;

  /// true면 aria-hidden 상응(장식). false면 Semantics로 구분 역할 노출.
  final bool decorative;

  const ShUiSeparator({
    super.key,
    this.orientation = ShUiSeparatorOrientation.horizontal,
    this.decorative = true,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    final isHorizontal = orientation == ShUiSeparatorOrientation.horizontal;
    final line = Container(
      width: isHorizontal ? double.infinity : 1,
      height: isHorizontal ? 1 : double.infinity,
      color: colors.border,
    );

    if (decorative) {
      return ExcludeSemantics(child: line);
    }
    return Semantics(
      label: '구분선',
      child: line,
    );
  }
}
