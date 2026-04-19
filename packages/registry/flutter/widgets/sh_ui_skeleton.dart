import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// shUi Skeleton — 데이터 로딩 중 자리를 대신 차지하는 플레이스홀더.
///
/// 기본은 풀너비 직사각형이며, 은은한 shimmer 애니메이션이 적용된다.
/// 편의 생성자:
/// - [ShUiSkeleton.text]  : 한 줄 텍스트 자리 (기본 높이 14px).
/// - [ShUiSkeleton.avatar]: 원형 아바타 자리.
/// - [ShUiSkeleton.block] : 블록 영역 자리 (카드 본문 등).
class ShUiSkeleton extends StatefulWidget {
  /// 너비. `null`이면 가로를 가득 채운다.
  final double? width;

  /// 높이. `null`이면 부모가 주는 높이에 따른다 (기본 16px).
  final double? height;

  /// 모서리 둥글기. `null`이면 토큰의 기본값을 사용한다.
  final double? borderRadius;

  const ShUiSkeleton({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
  });

  /// 한 줄 텍스트 자리. [width]/[height] 기본값을 살짝 낮춰 둔다.
  factory ShUiSkeleton.text({
    Key? key,
    double? width,
    double height = 14,
    double? borderRadius,
  }) {
    return ShUiSkeleton(
      key: key,
      width: width,
      height: height,
      borderRadius: borderRadius,
    );
  }

  /// 원형 아바타 자리. [size] × [size] 정사각형에 완전 원형.
  factory ShUiSkeleton.avatar({
    Key? key,
    double size = 40,
  }) {
    return ShUiSkeleton(
      key: key,
      width: size,
      height: size,
      borderRadius: size / 2,
    );
  }

  /// 풀너비 블록 자리. 카드 본문·이미지 자리 등.
  factory ShUiSkeleton.block({
    Key? key,
    double height = 96,
    double? borderRadius,
  }) {
    return ShUiSkeleton(
      key: key,
      height: height,
      borderRadius: borderRadius,
    );
  }

  @override
  State<ShUiSkeleton> createState() => _ShUiSkeletonState();
}

class _ShUiSkeletonState extends State<ShUiSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      // 토큰 duration.slow (200ms) 기반 6배 — shimmer 사이클은 여유있게.
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final base = shUi.colors.backgroundMuted;
    final highlight = Color.lerp(base, shUi.colors.background, 0.6) ?? base;
    final radius = widget.borderRadius ?? shUi.radius.defaultRadius;

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: widget.width,
        height: widget.height ?? 16,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            final t = _controller.value;
            return DecoratedBox(
              decoration: BoxDecoration(
                color: base,
                gradient: LinearGradient(
                  begin: Alignment(-1 + (2 * t) - 0.6, 0),
                  end: Alignment(-1 + (2 * t) + 0.6, 0),
                  colors: [
                    base,
                    highlight,
                    base,
                  ],
                  stops: const [0.0, 0.5, 1.0],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
