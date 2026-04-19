import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_carousel.dart';
import '../widgets/sh_ui_card.dart';

class CarouselPage extends StatelessWidget {
  const CarouselPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Carousel', style: TextStyle(color: colors.foreground)),
        backgroundColor: colors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.foreground),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: colors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _section('Basic', colors),
          ShUiCarousel(
            itemHeight: 180,
            items: List.generate(5, (i) => _SlideTile(n: i + 1)),
          ),

          const SizedBox(height: 32),

          _section('인디케이터만', colors),
          ShUiCarousel(
            itemHeight: 160,
            showControls: false,
            items: List.generate(4, (i) => _SlideTile(n: i + 1)),
          ),

          const SizedBox(height: 32),

          _section('컨트롤만', colors),
          ShUiCarousel(
            itemHeight: 160,
            showIndicators: false,
            items: List.generate(4, (i) => _SlideTile(n: i + 1)),
          ),

          const SizedBox(height: 32),

          _section('초기 인덱스', colors),
          ShUiCarousel(
            itemHeight: 160,
            initialIndex: 2,
            items: List.generate(5, (i) => _SlideTile(n: i + 1)),
          ),
        ],
      ),
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

class _SlideTile extends StatelessWidget {
  final int n;
  const _SlideTile({required this.n});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return ShUiCard(
      children: [
        ShUiCardContent(
          child: SizedBox(
            height: 100,
            child: Center(
              child: Text(
                '$n',
                style: TextStyle(
                  color: shUi.colors.foreground,
                  fontSize: 32,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
