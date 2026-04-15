import 'package:flutter/material.dart';
import '../foundation/hyeon_tokens.dart';

/// Hyeon Card — 컴파운드 스타일.
///
/// React 쪽 compound children API와 달리 Flutter는 named params가 관용적이라
/// 동일한 의미 구조를 다음과 같이 표현한다:
///
/// HyeonCard(children: [
///   HyeonCardHeader(
///     title: HyeonCardTitle('Card Title'),
///     description: HyeonCardDescription('Card Description'),
///     action: HyeonButton(
///       variant: HyeonButtonVariant.link,
///       onPressed: () {},
///       child: Text('액션'),
///     ),
///   ),
///   HyeonCardContent(child: Text('본문')),
///   HyeonCardFooter(children: [Text('푸터')]),
/// ])
class HyeonCard extends StatelessWidget {
  final List<Widget> children;

  const HyeonCard({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    final hyeon = Theme.of(context).extension<HyeonTheme>() ?? HyeonTheme.light;
    return Container(
      decoration: BoxDecoration(
        color: hyeon.colors.background,
        border: Border.all(color: hyeon.colors.border),
        borderRadius: BorderRadius.circular(hyeon.radius.defaultRadius),
      ),
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: _withGaps(children, 24),
      ),
    );
  }
}

List<Widget> _withGaps(List<Widget> children, double gap) {
  if (children.length <= 1) return children;
  final out = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    out.add(children[i]);
    if (i != children.length - 1) out.add(SizedBox(height: gap));
  }
  return out;
}

class HyeonCardHeader extends StatelessWidget {
  final Widget? title;
  final Widget? description;
  final Widget? action;

  const HyeonCardHeader({super.key, this.title, this.description, this.action});

  @override
  Widget build(BuildContext context) {
    final stack = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null) title!,
        if (title != null && description != null) const SizedBox(height: 6),
        if (description != null) description!,
      ],
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: action == null
          ? stack
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: stack),
                const SizedBox(width: 16),
                action!,
              ],
            ),
    );
  }
}

class HyeonCardTitle extends StatelessWidget {
  final String text;
  const HyeonCardTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final hyeon = Theme.of(context).extension<HyeonTheme>() ?? HyeonTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: hyeon.colors.foreground,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.25,
        letterSpacing: -0.16,
      ),
    );
  }
}

class HyeonCardDescription extends StatelessWidget {
  final String text;
  const HyeonCardDescription(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final hyeon = Theme.of(context).extension<HyeonTheme>() ?? HyeonTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: hyeon.colors.foregroundMuted,
        fontSize: 14,
        height: 1.5,
      ),
    );
  }
}

class HyeonCardContent extends StatelessWidget {
  final Widget child;
  const HyeonCardContent({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: child,
    );
  }
}

class HyeonCardFooter extends StatelessWidget {
  final List<Widget> children;
  const HyeonCardFooter({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: _withGaps(children, 8),
      ),
    );
  }
}
