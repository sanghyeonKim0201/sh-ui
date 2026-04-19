import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui Dialog — 모달 대화상자.
///
/// 두 가지 방식 지원:
///
/// 1) 명령형 (imperative, 기존 방식):
///    ShUiDialog.show(
///      context: context,
///      builder: (context) => ShUiDialogContent(
///        title: const ShUiDialogTitle('제목'),
///        description: const ShUiDialogDescription('설명 텍스트'),
///        footer: ShUiDialogFooter(children: [...]),
///      ),
///    );
///
/// 2) 선언형 (declarative, controlled):
///    ShUiDialog(
///      open: _open,
///      onOpenChange: (v) => setState(() => _open = v),
///      child: ShUiDialogContent(
///        header: const ShUiDialogHeader(
///          title: '제목',
///          description: '설명',
///        ),
///        body: const Text('본문'),
///        footer: ShUiDialogFooter(children: [...]),
///      ),
///    )
class ShUiDialog extends StatefulWidget {
  /// controlled open 상태.
  final bool open;

  /// open 변경 콜백 (백드롭 탭 / Esc / 하드웨어 백 시 false).
  final ValueChanged<bool>? onOpenChange;

  /// 대화상자 내용 (보통 [ShUiDialogContent]).
  final Widget child;

  /// 배경(백드롭)을 탭하면 닫히는지 여부.
  final bool barrierDismissible;

  const ShUiDialog({
    super.key,
    required this.open,
    required this.child,
    this.onOpenChange,
    this.barrierDismissible = true,
  });

  /// 명령형 API — 기존 호환. Navigator 스택에 push.
  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
  }) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: '닫기',
      barrierColor: Colors.black.withValues(alpha: 0.45),
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

  @override
  State<ShUiDialog> createState() => _ShUiDialogState();
}

class _ShUiDialogState extends State<ShUiDialog>
    with SingleTickerProviderStateMixin {
  OverlayEntry? _entry;
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    final shUi = _resolveTheme(context);
    _ctrl = AnimationController(
      vsync: this,
      duration: shUi.duration.base,
      reverseDuration: shUi.duration.base,
    );
    if (widget.open) {
      // 첫 빌드 후 삽입 (Overlay.of가 안전하게 해소되도록).
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _insertOverlay();
        _ctrl.forward();
      });
    }
  }

  @override
  void didUpdateWidget(covariant ShUiDialog oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.open == oldWidget.open) {
      // 상태가 동일해도 child가 바뀌었을 수 있으므로 entry를 rebuild.
      _entry?.markNeedsBuild();
      return;
    }
    if (widget.open) {
      _insertOverlay();
      _ctrl.forward();
    } else {
      _ctrl.reverse().whenComplete(_removeOverlay);
    }
  }

  @override
  void dispose() {
    _removeOverlay();
    _ctrl.dispose();
    super.dispose();
  }

  ShUiTheme _resolveTheme(BuildContext context) {
    return Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
  }

  void _insertOverlay() {
    if (_entry != null) return;
    final overlay = Overlay.maybeOf(context, rootOverlay: true);
    if (overlay == null) return;
    _entry = OverlayEntry(
      builder: (overlayContext) => _ShUiDialogOverlay(
        animation: _ctrl,
        barrierDismissible: widget.barrierDismissible,
        onBarrierTap: () => widget.onOpenChange?.call(false),
        onEscape: () => widget.onOpenChange?.call(false),
        child: widget.child,
      ),
    );
    overlay.insert(_entry!);
  }

  void _removeOverlay() {
    _entry?.remove();
    _entry = null;
  }

  @override
  Widget build(BuildContext context) {
    // Declarative wrapper는 자체 렌더 공간을 차지하지 않는다.
    // 닫기 제스처(하드웨어 백)는 Overlay 내부 PopScope가 처리.
    return const SizedBox.shrink();
  }
}

class _ShUiDialogOverlay extends StatelessWidget {
  final Animation<double> animation;
  final bool barrierDismissible;
  final VoidCallback onBarrierTap;
  final VoidCallback onEscape;
  final Widget child;

  const _ShUiDialogOverlay({
    required this.animation,
    required this.barrierDismissible,
    required this.onBarrierTap,
    required this.onEscape,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final curved = CurvedAnimation(parent: animation, curve: shUi.ease.standard);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) onEscape();
      },
      child: FocusScope(
        autofocus: true,
        child: Shortcuts(
          shortcuts: const <ShortcutActivator, Intent>{
            SingleActivator(LogicalKeyboardKey.escape): _DismissIntent(),
          },
          child: Actions(
            actions: <Type, Action<Intent>>{
              _DismissIntent: CallbackAction<_DismissIntent>(
                onInvoke: (_) {
                  onEscape();
                  return null;
                },
              ),
            },
            child: Stack(
              children: [
                // Backdrop
                Positioned.fill(
                  child: FadeTransition(
                    opacity: curved,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: barrierDismissible ? onBarrierTap : null,
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.45),
                      ),
                    ),
                  ),
                ),
                // Popup
                Positioned.fill(
                  child: Center(
                    child: FadeTransition(
                      opacity: curved,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.96, end: 1.0)
                            .animate(curved),
                        // popup 영역은 별도 GestureDetector로 감싸 backdrop 탭 전파 차단.
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () {},
                          child: _ShUiDialogCloseScope(
                            onClose: onEscape,
                            child: child,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DismissIntent extends Intent {
  const _DismissIntent();
}

/// 선언형 편의 위젯 — child를 감싸 tap 시 콜백 실행.
/// 내부 child에 onPressed:null을 주어도 이 위젯의 onTap이 동작한다.
class ShUiDialogTrigger extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;

  const ShUiDialogTrigger({
    super.key,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: child,
    );
  }
}

/// 대화상자 컨텐츠 래퍼.
///
/// 두 가지 사용법 모두 지원 (하위 호환):
/// - 기존: title / description / child / footer
/// - 신규: header / body / footer
class ShUiDialogContent extends StatelessWidget {
  final Widget? title;
  final Widget? description;
  final Widget? footer;
  final Widget? child;

  /// 신규: header (보통 [ShUiDialogHeader]).
  /// header가 제공되면 title/description은 무시된다.
  final Widget? header;

  /// 신규: body (child의 별칭).
  /// body가 제공되면 child 대신 사용된다.
  final Widget? body;

  final bool showCloseButton;
  final double maxWidth;

  const ShUiDialogContent({
    super.key,
    this.title,
    this.description,
    this.footer,
    this.child,
    this.header,
    this.body,
    this.showCloseButton = true,
    this.maxWidth = 480,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    // header 우선, 없으면 title/description으로 조합.
    final Widget? resolvedHeader = header ??
        ((title != null || description != null)
            ? _LegacyHeader(title: title, description: description)
            : null);
    final Widget? resolvedBody = body ?? child;

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
          boxShadow: shUi.shadow.xl,
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (resolvedHeader != null) resolvedHeader,
                if (resolvedHeader != null && resolvedBody != null)
                  SizedBox(height: shUi.spacing.s4),
                if (resolvedBody != null) resolvedBody,
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

/// 신규 선언형 헤더 — title/description을 문자열로 받는 축약 API.
class ShUiDialogHeader extends StatelessWidget {
  final String? title;
  final String? description;

  /// 커스텀 위젯이 필요한 경우 title/description 대신 사용.
  final Widget? titleWidget;
  final Widget? descriptionWidget;

  const ShUiDialogHeader({
    super.key,
    this.title,
    this.description,
    this.titleWidget,
    this.descriptionWidget,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final t = titleWidget ?? (title != null ? ShUiDialogTitle(title!) : null);
    final d = descriptionWidget ??
        (description != null ? ShUiDialogDescription(description!) : null);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (t != null) t,
        if (t != null && d != null) SizedBox(height: shUi.spacing.s2),
        if (d != null) d,
      ],
    );
  }
}

class _LegacyHeader extends StatelessWidget {
  final Widget? title;
  final Widget? description;

  const _LegacyHeader({this.title, this.description});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null) title!,
        if (title != null && description != null)
          SizedBox(height: shUi.spacing.s2),
        if (description != null) description!,
      ],
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
        onTap: () {
          // 명령형(Navigator.pop)과 선언형(Overlay+onOpenChange) 모두에서 닫힘.
          // 선언형 상위에서는 _ShUiDialogCloseScope가 있으면 그걸 호출.
          final scope = _ShUiDialogCloseScope.maybeOf(context);
          if (scope != null) {
            scope.onClose();
            return;
          }
          // Navigator route(명령형 show) 에서만 pop.
          final route = ModalRoute.of(context);
          if (route != null) {
            Navigator.of(context).pop();
          }
        },
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

/// 선언형 모드에서 × 버튼 등이 `onOpenChange(false)`를 호출할 수 있도록 제공하는 InheritedWidget.
/// 선언형 모드가 아닐 땐 제공되지 않으며, × 버튼은 Navigator.pop 경로를 사용한다.
class _ShUiDialogCloseScope extends InheritedWidget {
  final VoidCallback onClose;

  const _ShUiDialogCloseScope({
    required this.onClose,
    required super.child,
  });

  static _ShUiDialogCloseScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_ShUiDialogCloseScope>();
  }

  @override
  bool updateShouldNotify(_ShUiDialogCloseScope oldWidget) =>
      oldWidget.onClose != onClose;
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
