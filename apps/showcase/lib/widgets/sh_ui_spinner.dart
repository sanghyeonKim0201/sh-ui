import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiSpinnerSize { sm, md, lg }

/// sh-ui Spinner — 짧은 비동기 작업의 로딩 표시.
///
/// 버튼·입력 등에 인라인으로 사용. 200ms 이상 걸리는 작업에 즉시 피드백을
/// 주는 원칙에 맞춘다.
class ShUiSpinner extends StatelessWidget {
  final ShUiSpinnerSize size;

  /// 색상. 생략 시 현재 텍스트 색 따라감(foreground).
  final Color? color;

  final String? semanticLabel;

  const ShUiSpinner({
    super.key,
    this.size = ShUiSpinnerSize.md,
    this.color,
    this.semanticLabel,
  });

  double _diameter() => switch (size) {
        ShUiSpinnerSize.sm => 14.0,
        ShUiSpinnerSize.md => 18.0,
        ShUiSpinnerSize.lg => 24.0,
      };

  double _strokeWidth() => switch (size) {
        ShUiSpinnerSize.sm => 1.5,
        ShUiSpinnerSize.md => 2.0,
        ShUiSpinnerSize.lg => 2.5,
      };

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final effective = color ?? DefaultTextStyle.of(context).style.color ?? shUi.colors.foreground;
    final diameter = _diameter();

    return Semantics(
      label: semanticLabel ?? '로딩 중',
      liveRegion: true,
      child: SizedBox(
        width: diameter,
        height: diameter,
        child: CircularProgressIndicator(
          strokeWidth: _strokeWidth(),
          valueColor: AlwaysStoppedAnimation<Color>(effective),
        ),
      ),
    );
  }
}
