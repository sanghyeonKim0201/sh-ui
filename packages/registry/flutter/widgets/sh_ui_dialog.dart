import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Dialog — 모달 대화상자.
///
/// ShUiDialog.show(
///   context: context,
///   builder: (context) => ShUiDialogContent(
///     title: ShUiDialogTitle('제목'),
///     description: ShUiDialogDescription('설명 텍스트'),
///     footer: ShUiDialogFooter(children: [
///       ShUiButton(onPressed: () => Navigator.pop(context), child: Text('확인')),
///     ]),
///   ),
/// );
class ShUiDialog {
  ShUiDialog._();

  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
  }) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: '닫기',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 150),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.96, end: 1.0).animate(
              CurvedAnimation(parent: animation, curve: Curves.easeOut),
            ),
            child: child,
          ),
        );
      },
      pageBuilder: (context, animation, secondaryAnimation) {
        return Center(child: builder(context));
      },
    );
  }
}

/// 대화상자 컨텐츠 래퍼.
class ShUiDialogContent extends StatelessWidget {
  final Widget? title;
  final Widget? description;
  final Widget? footer;
  final Widget? child;
  final bool showCloseButton;
  final double maxWidth;

  const ShUiDialogContent({
    super.key,
    this.title,
    this.description,
    this.footer,
    this.child,
    this.showCloseButton = true,
    this.maxWidth = 480,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Material(
      color: Colors.transparent,
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        margin: EdgeInsets.all(shUi.spacing.s6),
        padding: EdgeInsets.all(shUi.spacing.s6),
        decoration: BoxDecoration(
          color: colors.background,
          border: Border.all(color: colors.border),
          borderRadius: BorderRadius.circular(shUi.radius.defaultRadius + 4),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.12),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null) title!,
                if (title != null && description != null)
                  SizedBox(height: shUi.spacing.s2),
                if (description != null) description!,
                if ((title != null || description != null) && child != null)
                  SizedBox(height: shUi.spacing.s4),
                if (child != null) child!,
                if (footer != null) ...[
                  SizedBox(height: shUi.spacing.s6),
                  footer!,
                ],
              ],
            ),
            if (showCloseButton)
              Positioned(
                top: 0,
                right: 0,
                child: _ShUiDialogCloseButton(colors: colors),
              ),
          ],
        ),
      ),
    );
  }
}

class _ShUiDialogCloseButton extends StatefulWidget {
  final ShUiColorTokens colors;

  const _ShUiDialogCloseButton({required this.colors});

  @override
  State<_ShUiDialogCloseButton> createState() => _ShUiDialogCloseButtonState();
}

class _ShUiDialogCloseButtonState extends State<_ShUiDialogCloseButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: () => Navigator.of(context).pop(),
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: _hover
                ? widget.colors.backgroundMuted
                : Colors.transparent,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Center(
            child: Text(
              '×',
              style: TextStyle(
                color: widget.colors.foregroundMuted,
                fontSize: shUi.text.lg,
                height: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class ShUiDialogTitle extends StatelessWidget {
  final String text;

  const ShUiDialogTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: shUi.colors.foreground,
        fontSize: shUi.text.lg,
        fontWeight: shUi.weight.semibold,
        height: 1.3,
      ),
    );
  }
}

class ShUiDialogDescription extends StatelessWidget {
  final String text;

  const ShUiDialogDescription(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: shUi.colors.foregroundMuted,
        fontSize: shUi.text.sm,
        height: 1.5,
      ),
    );
  }
}

class ShUiDialogFooter extends StatelessWidget {
  final List<Widget> children;
  final MainAxisAlignment alignment;

  const ShUiDialogFooter({
    super.key,
    required this.children,
    this.alignment = MainAxisAlignment.end,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Row(
      mainAxisAlignment: alignment,
      children: _withGaps(children, shUi.spacing.s2),
    );
  }
}

List<Widget> _withGaps(List<Widget> children, double gap) {
  if (children.length <= 1) return children;
  final out = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    out.add(children[i]);
    if (i != children.length - 1) out.add(SizedBox(width: gap));
  }
  return out;
}
