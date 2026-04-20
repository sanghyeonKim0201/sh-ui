import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Progress — 작업 진행도를 가로 바로 표시.
///
/// [value]가 `null`이면 indeterminate(무한 루프). 0.0 ~ 1.0 범위의 값을 주면
/// determinate로 동작.
class ShUiProgress extends StatelessWidget {
  /// 0.0 ~ 1.0 사이의 진행률. null이면 indeterminate.
  final double? value;

  /// 바 높이. 기본 8px.
  final double height;

  /// 접근성: 스크린리더 라벨.
  final String? semanticLabel;

  const ShUiProgress({
    super.key,
    this.value,
    this.height = 8,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Semantics(
      label: semanticLabel,
      value: value != null ? '${(value! * 100).round()}%' : null,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(999),
        child: SizedBox(
          height: height,
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: colors.backgroundMuted,
            valueColor: AlwaysStoppedAnimation<Color>(colors.primary),
            minHeight: height,
          ),
        ),
      ),
    );
  }
}
