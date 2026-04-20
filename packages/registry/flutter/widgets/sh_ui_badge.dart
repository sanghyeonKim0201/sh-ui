import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiBadgeVariant { primary, secondary, success, warning, danger, outline }

enum ShUiBadgeSize { sm, md }

/// sh-ui Badge — 상태·카테고리·수량을 짧게 표기하는 인라인 라벨.
///
/// 색만으로 의미를 전달하지 말고 텍스트·아이콘과 함께 사용한다.
class ShUiBadge extends StatelessWidget {
  final Widget child;
  final ShUiBadgeVariant variant;
  final ShUiBadgeSize size;

  const ShUiBadge({
    super.key,
    required this.child,
    this.variant = ShUiBadgeVariant.primary,
    this.size = ShUiBadgeSize.md,
  });

  /// 텍스트만 넣는 편의 생성자.
  factory ShUiBadge.text(
    String text, {
    Key? key,
    ShUiBadgeVariant variant = ShUiBadgeVariant.primary,
    ShUiBadgeSize size = ShUiBadgeSize.md,
  }) {
    return ShUiBadge(
      key: key,
      variant: variant,
      size: size,
      child: Text(text),
    );
  }

  (Color bg, Color fg, Color border) _colors(ShUiColorTokens c) {
    return switch (variant) {
      ShUiBadgeVariant.primary => (c.primary, c.primaryForeground, Colors.transparent),
      ShUiBadgeVariant.secondary => (c.backgroundMuted, c.foreground, c.border),
      ShUiBadgeVariant.success => (const Color(0xFF16A34A), Colors.white, Colors.transparent),
      ShUiBadgeVariant.warning => (const Color(0xFFD97706), Colors.white, Colors.transparent),
      ShUiBadgeVariant.danger => (c.danger, c.dangerForeground, Colors.transparent),
      ShUiBadgeVariant.outline => (Colors.transparent, c.foreground, c.borderStrong),
    };
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final (bg, fg, border) = _colors(shUi.colors);

    final (double height, double fontSize, EdgeInsets padding) = switch (size) {
      ShUiBadgeSize.sm => (20.0, 11.0, const EdgeInsets.symmetric(horizontal: 6)),
      ShUiBadgeSize.md => (24.0, shUi.text.xs, const EdgeInsets.symmetric(horizontal: 8)),
    };

    return Container(
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(999),
      ),
      alignment: Alignment.center,
      child: DefaultTextStyle(
        style: TextStyle(
          color: fg,
          fontSize: fontSize,
          fontWeight: shUi.weight.medium,
          height: 1,
        ),
        child: IconTheme(
          data: IconThemeData(color: fg, size: fontSize + 2),
          child: child,
        ),
      ),
    );
  }
}
