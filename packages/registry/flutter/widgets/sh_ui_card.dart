import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Card — 컴파운드 스타일.
///
/// React 쪽 compound children API와 달리 Flutter는 named params가 관용적이라
/// 동일한 의미 구조를 다음과 같이 표현한다:
///
/// ShUiCard(children: [
///   ShUiCardHeader(
///     title: ShUiCardTitle('Card Title'),
///     description: ShUiCardDescription('Card Description'),
///     action: ShUiButton(
///       variant: ShUiButtonVariant.link,
///       onPressed: () {},
///       child: Text('액션'),
///     ),
///   ),
///   ShUiCardContent(child: Text('본문')),
///   ShUiCardFooter(children: [Text('푸터')]),
/// ])
class ShUiCard extends StatelessWidget {
  final List<Widget> children;

  const ShUiCard({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Container(
      decoration: BoxDecoration(
        color: sh-ui.colors.background,
        border: Border.all(color: sh-ui.colors.border),
        borderRadius: BorderRadius.circular(sh-ui.radius.defaultRadius),
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

class ShUiCardHeader extends StatelessWidget {
  final Widget? title;
  final Widget? description;
  final Widget? action;

  const ShUiCardHeader({super.key, this.title, this.description, this.action});

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

class ShUiCardTitle extends StatelessWidget {
  final String text;
  const ShUiCardTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: sh-ui.colors.foreground,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.25,
        letterSpacing: -0.16,
      ),
    );
  }
}

class ShUiCardDescription extends StatelessWidget {
  final String text;
  const ShUiCardDescription(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final sh-ui = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: sh-ui.colors.foregroundMuted,
        fontSize: 14,
        height: 1.5,
      ),
    );
  }
}

class ShUiCardContent extends StatelessWidget {
  final Widget child;
  const ShUiCardContent({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: child,
    );
  }
}

class ShUiCardFooter extends StatelessWidget {
  final List<Widget> children;
  const ShUiCardFooter({super.key, required this.children});

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
