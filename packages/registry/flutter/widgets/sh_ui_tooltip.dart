import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Tooltip — hover/포커스/long-press 시 짧은 설명을 표시.
///
/// Flutter의 [Tooltip]을 sh-ui 토큰으로 스타일링한 래퍼. 터치 기기에서는
/// long-press로, 데스크탑에서는 hover로 표시된다.
///
/// ShUiTooltip(
///   message: '변경 사항을 저장합니다',
///   child: ShUiButton(onPressed: () {}, child: Text('저장')),
/// )
class ShUiTooltip extends StatelessWidget {
  final String message;
  final Widget child;

  /// 트리거 위에 표시할지 아래에 표시할지.
  final bool preferBelow;

  /// 표시까지 지연(ms).
  final Duration waitDuration;

  const ShUiTooltip({
    super.key,
    required this.message,
    required this.child,
    this.preferBelow = true,
    this.waitDuration = const Duration(milliseconds: 300),
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Tooltip(
      message: message,
      preferBelow: preferBelow,
      waitDuration: waitDuration,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      margin: const EdgeInsets.all(4),
      verticalOffset: 16,
      textStyle: TextStyle(
        color: colors.background,
        fontSize: shUi.text.xs,
        height: 1.4,
      ),
      decoration: BoxDecoration(
        color: colors.foreground,
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius - 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}
