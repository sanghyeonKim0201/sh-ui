import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Label — 폼 필드 레이블. title, subtitle, description, caption 하위 구성.
///
/// ShUiLabel(
///   isRequired: true,
///   child: Column(children: [
///     ShUiLabelTitle('이름'),
///     ShUiLabelDescription('성과 이름을 입력해주세요'),
///   ]),
/// )
class ShUiLabel extends StatelessWidget {
  final Widget child;
  final bool isRequired;

  const ShUiLabel({
    super.key,
    required this.child,
    this.isRequired = false,
  });

  @override
  Widget build(BuildContext context) {
    return _ShUiLabelScope(
      isRequired: isRequired,
      child: child,
    );
  }
}

class ShUiLabelTitle extends StatelessWidget {
  final String text;

  const ShUiLabelTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final scope = _ShUiLabelScope.of(context);
    final isRequired = scope?.isRequired ?? false;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          text,
          style: TextStyle(
            color: shUi.colors.foreground,
            fontSize: shUi.text.sm,
            fontWeight: shUi.weight.medium,
            height: 1.4,
          ),
        ),
        if (isRequired) ...[
          const SizedBox(width: 2),
          Text(
            '*',
            style: TextStyle(
              color: shUi.colors.danger,
              fontSize: shUi.text.sm,
              fontWeight: shUi.weight.medium,
            ),
          ),
        ],
      ],
    );
  }
}

class ShUiLabelSubtitle extends StatelessWidget {
  final String text;

  const ShUiLabelSubtitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: shUi.colors.foregroundMuted,
        fontSize: 13,
        fontWeight: shUi.weight.regular,
        height: 1.4,
      ),
    );
  }
}

class ShUiLabelDescription extends StatelessWidget {
  final String text;

  const ShUiLabelDescription(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: shUi.colors.foregroundMuted,
        fontSize: 13,
        height: 1.5,
      ),
    );
  }
}

class ShUiLabelCaption extends StatelessWidget {
  final String text;
  final bool isError;

  const ShUiLabelCaption(this.text, {super.key, this.isError = false});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: isError ? shUi.colors.danger : shUi.colors.foregroundMuted,
        fontSize: shUi.text.xs,
        height: 1.5,
      ),
    );
  }
}

class _ShUiLabelScope extends InheritedWidget {
  final bool isRequired;

  const _ShUiLabelScope({
    required this.isRequired,
    required super.child,
  });

  static _ShUiLabelScope? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_ShUiLabelScope>();
  }

  @override
  bool updateShouldNotify(covariant _ShUiLabelScope old) =>
      isRequired != old.isRequired;
}
