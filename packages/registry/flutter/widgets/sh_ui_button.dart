import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// 버튼 시각 위계.
/// - [primary]   : 페이지의 1차 액션. 한 화면에 하나만 권장.
/// - [secondary] : 보조 액션. border + 약한 배경.
/// - [ghost]     : 배경 없는 hover 강조 액션.
/// - [danger]    : 파괴적 액션(삭제 등).
/// - [link]      : 텍스트 링크처럼 보이는 인라인 버튼.
enum ShUiButtonVariant { primary, secondary, ghost, danger, link }

/// 버튼 크기.
enum ShUiButtonSize { sm, md, lg }

/// shUi Button — 사용자 액션을 트리거하는 기본 버튼.
///
/// [variant]로 시각 위계, [size]로 크기를 결정한다. [onPressed]가 null이면
/// 비활성 상태로 표시된다. 페이지 이동 목적이면 [ShUiButtonVariant.link]를 사용한다.
///
/// ```dart
/// ShUiButton(
///   onPressed: () {},
///   variant: ShUiButtonVariant.primary,
///   child: const Text('저장'),
/// )
/// ```
class ShUiButton extends StatefulWidget {
  /// 버튼 안에 표시될 콘텐츠. 보통 [Text] 또는 [Icon]+[Text]를 [Row]로 묶어 사용.
  final Widget child;

  /// 탭 콜백. `null`이면 비활성 상태로 렌더되며 hover/press 효과도 제거된다.
  final VoidCallback? onPressed;

  /// 시각 위계.
  /// - [ShUiButtonVariant.primary] — 페이지의 1차 액션 (기본)
  /// - [ShUiButtonVariant.secondary] — 보조 액션
  /// - [ShUiButtonVariant.ghost] — 배경 없는 hover 강조
  /// - [ShUiButtonVariant.danger] — 파괴적 액션
  /// - [ShUiButtonVariant.link] — 텍스트 링크 스타일
  final ShUiButtonVariant variant;

  /// 크기. [ShUiButtonSize.sm] / [ShUiButtonSize.md] (기본) / [ShUiButtonSize.lg].
  final ShUiButtonSize size;

  const ShUiButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = ShUiButtonVariant.primary,
    this.size = ShUiButtonSize.md,
  });

  @override
  State<ShUiButton> createState() => _ShUiButtonState();
}

class _ShUiButtonState extends State<ShUiButton> {
  bool _hover = false;
  bool _pressed = false;

  _Colors _resolveColors(ShUiColorTokens t) {
    switch (widget.variant) {
      case ShUiButtonVariant.primary:
        return _Colors(
          bg: _hover ? t.primaryHover : t.primary,
          fg: t.primaryForeground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.secondary:
        return _Colors(
          bg: _hover ? t.backgroundSubtle : t.backgroundMuted,
          fg: t.foreground,
          border: t.border,
        );
      case ShUiButtonVariant.ghost:
        return _Colors(
          bg: _hover ? t.backgroundMuted : Colors.transparent,
          fg: t.foreground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.danger:
        return _Colors(
          bg: t.danger,
          fg: t.dangerForeground,
          border: Colors.transparent,
        );
      case ShUiButtonVariant.link:
        return _Colors(
          bg: Colors.transparent,
          fg: _pressed ? t.foregroundMuted : t.foreground,
          border: Colors.transparent,
        );
    }
  }

  EdgeInsets _paddingOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => EdgeInsets.symmetric(horizontal: shUi.spacing.s3),
        ShUiButtonSize.md => EdgeInsets.symmetric(horizontal: shUi.spacing.s4),
        ShUiButtonSize.lg => EdgeInsets.symmetric(horizontal: shUi.spacing.s5),
      };

  double _heightOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => shUi.control.sm,
        ShUiButtonSize.md => shUi.control.md,
        ShUiButtonSize.lg => shUi.control.lg,
      };

  double _fontSizeOf(ShUiTheme shUi) => switch (widget.size) {
        ShUiButtonSize.sm => shUi.text.sm,
        ShUiButtonSize.md => shUi.text.sm,
        ShUiButtonSize.lg => shUi.text.base,
      };

  Widget _buildLink(ShUiTheme shUi, _Colors colors, bool disabled) {
    return MouseRegion(
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: disabled ? null : widget.onPressed,
        onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
        onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
        onTapCancel: disabled ? null : () => setState(() => _pressed = false),
        child: DefaultTextStyle(
          style: TextStyle(
            color: colors.fg,
            fontSize: _fontSizeOf(shUi),
            fontWeight: shUi.weight.medium,
            height: 1.2,
            decoration: _hover ? TextDecoration.underline : TextDecoration.none,
            decorationColor: colors.fg,
          ),
          child: widget.child,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = _resolveColors(shUi.colors);
    final disabled = widget.onPressed == null;

    if (widget.variant == ShUiButtonVariant.link) {
      return Opacity(
        opacity: disabled ? shUi.opacity.disabled : 1,
        child: _buildLink(shUi, colors, disabled),
      );
    }

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: disabled ? null : widget.onPressed,
          onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
          onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
          onTapCancel: disabled ? null : () => setState(() => _pressed = false),
          child: AnimatedScale(
            scale: _pressed ? 0.97 : 1.0,
            duration: const Duration(milliseconds: 80),
            curve: Curves.easeOut,
            child: AnimatedContainer(
              duration: shUi.duration.fast,
              height: _heightOf(shUi),
              padding: _paddingOf(shUi),
              decoration: BoxDecoration(
                color: _pressed
                    ? Color.lerp(colors.bg, Colors.black, 0.08)!
                    : colors.bg,
                border: Border.all(color: colors.border),
                borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
              ),
              alignment: Alignment.center,
              child: DefaultTextStyle(
                style: TextStyle(
                  color: colors.fg,
                  fontSize: _fontSizeOf(shUi),
                  fontWeight: shUi.weight.medium,
                  height: 1,
                ),
                child: widget.child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Colors {
  final Color bg;
  final Color fg;
  final Color border;
  const _Colors({required this.bg, required this.fg, required this.border});
}
