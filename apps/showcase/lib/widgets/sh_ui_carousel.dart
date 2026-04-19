import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// shUi Carousel — 가로 스와이프 캐러셀.
///
/// PageView 기반. 좌우 화살표 버튼([showControls])과 하단 도트 인디케이터
/// ([showIndicators])를 옵션으로 제공한다. [onIndexChanged]로 현재 인덱스를
/// 외부로 노출할 수 있다.
class ShUiCarousel extends StatefulWidget {
  /// 슬라이드로 보여줄 위젯 목록.
  final List<Widget> items;

  /// 슬라이드 높이. 지정하지 않으면 컨텐츠 높이에 따른다 (기본 220).
  final double? itemHeight;

  /// 도트 인디케이터 노출 여부.
  final bool showIndicators;

  /// 좌/우 화살표 버튼 노출 여부.
  final bool showControls;

  /// 초기 인덱스.
  final int? initialIndex;

  /// 인덱스 변경 콜백.
  final ValueChanged<int>? onIndexChanged;

  const ShUiCarousel({
    super.key,
    required this.items,
    this.itemHeight,
    this.showIndicators = true,
    this.showControls = true,
    this.initialIndex,
    this.onIndexChanged,
  });

  @override
  State<ShUiCarousel> createState() => _ShUiCarouselState();
}

class _ShUiCarouselState extends State<ShUiCarousel> {
  late final PageController _controller;
  late int _index;

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex ?? 0;
    _controller = PageController(initialPage: _index);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _goTo(int i) {
    if (i < 0 || i >= widget.items.length) return;
    _controller.animateToPage(
      i,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final height = widget.itemHeight ?? 220;
    // 좁은 폭(mobile 사이즈) 에서는 컨트롤을 숨긴다.
    final width = MediaQuery.of(context).size.width;
    final compact = width < shUi.breakpoint.sm;
    final showControls = widget.showControls && !compact;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: height,
          child: Stack(
            alignment: Alignment.center,
            children: [
              PageView.builder(
                controller: _controller,
                itemCount: widget.items.length,
                onPageChanged: (i) {
                  setState(() => _index = i);
                  widget.onIndexChanged?.call(i);
                },
                itemBuilder: (context, i) {
                  return Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: shUi.spacing.s2,
                    ),
                    child: widget.items[i],
                  );
                },
              ),
              if (showControls) ...[
                Positioned(
                  left: shUi.spacing.s2,
                  child: _NavButton(
                    icon: Icons.chevron_left,
                    onPressed: _index > 0 ? () => _goTo(_index - 1) : null,
                  ),
                ),
                Positioned(
                  right: shUi.spacing.s2,
                  child: _NavButton(
                    icon: Icons.chevron_right,
                    onPressed: _index < widget.items.length - 1
                        ? () => _goTo(_index + 1)
                        : null,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (widget.showIndicators && widget.items.length > 1) ...[
          SizedBox(height: shUi.spacing.s3),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var i = 0; i < widget.items.length; i++)
                GestureDetector(
                  onTap: () => _goTo(i),
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: shUi.duration.base,
                    curve: shUi.ease.standard,
                    margin: EdgeInsets.symmetric(horizontal: shUi.spacing.s1),
                    width: _index == i ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: _index == i
                          ? colors.foreground
                          : colors.borderStrong,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ],
    );
  }
}

class _NavButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback? onPressed;

  const _NavButton({required this.icon, required this.onPressed});

  @override
  State<_NavButton> createState() => _NavButtonState();
}

class _NavButtonState extends State<_NavButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = widget.onPressed == null;

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: widget.onPressed,
          child: AnimatedContainer(
            duration: shUi.duration.fast,
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: _hover && !disabled
                  ? colors.backgroundSubtle
                  : colors.background,
              border: Border.all(color: colors.border),
              borderRadius: BorderRadius.circular(999),
              boxShadow: shUi.shadow.sm,
            ),
            alignment: Alignment.center,
            child: Icon(
              widget.icon,
              size: 18,
              color: colors.foreground,
            ),
          ),
        ),
      ),
    );
  }
}
