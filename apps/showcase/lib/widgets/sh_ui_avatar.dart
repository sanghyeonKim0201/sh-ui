import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiAvatarSize { sm, md, lg, xl }

/// sh-ui Avatar — 프로필 이미지 + 이니셜/아이콘 fallback.
///
/// [imageUrl]이 주어지면 이미지를 로드하고, 실패 시 [fallback]을 렌더한다.
/// 이미지 없이 이니셜만 보여주려면 [imageUrl]을 생략하고 [fallback]만 제공.
class ShUiAvatar extends StatelessWidget {
  /// 로드할 이미지 URL. 네트워크 또는 asset. null이면 바로 fallback 렌더.
  final String? imageUrl;

  /// 이미지 로드 실패/미제공 시 표시할 위젯(보통 이니셜 Text 또는 Icon).
  final Widget? fallback;

  final ShUiAvatarSize size;
  final String? semanticLabel;

  const ShUiAvatar({
    super.key,
    this.imageUrl,
    this.fallback,
    this.size = ShUiAvatarSize.md,
    this.semanticLabel,
  });

  double _diameter() => switch (size) {
        ShUiAvatarSize.sm => 28.0,
        ShUiAvatarSize.md => 40.0,
        ShUiAvatarSize.lg => 48.0,
        ShUiAvatarSize.xl => 64.0,
      };

  double _fontSize() => switch (size) {
        ShUiAvatarSize.sm => 11.0,
        ShUiAvatarSize.md => 13.0,
        ShUiAvatarSize.lg => 14.0,
        ShUiAvatarSize.xl => 16.0,
      };

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final diameter = _diameter();

    final fallbackWidget = DefaultTextStyle(
      style: TextStyle(
        color: colors.foregroundMuted,
        fontSize: _fontSize(),
        fontWeight: shUi.weight.medium,
        letterSpacing: 0.3,
      ),
      textAlign: TextAlign.center,
      child: IconTheme(
        data: IconThemeData(
          color: colors.foregroundMuted,
          size: _fontSize() + 4,
        ),
        child: fallback ?? const SizedBox.shrink(),
      ),
    );

    final content = imageUrl != null
        ? Image.network(
            imageUrl!,
            fit: BoxFit.cover,
            width: diameter,
            height: diameter,
            errorBuilder: (_, __, ___) => fallbackWidget,
            loadingBuilder: (context, child, progress) {
              if (progress == null) return child;
              return fallbackWidget;
            },
          )
        : fallbackWidget;

    return Semantics(
      label: semanticLabel,
      image: imageUrl != null,
      child: Container(
        width: diameter,
        height: diameter,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: colors.backgroundMuted,
          shape: BoxShape.circle,
        ),
        clipBehavior: Clip.antiAlias,
        child: content,
      ),
    );
  }
}
