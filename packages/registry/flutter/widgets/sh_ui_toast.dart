import 'dart:async';
import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiToastVariant { defaultVariant, success, danger, warning }

enum ShUiToastPosition {
  topLeft,
  topRight,
  topCenter,
  bottomLeft,
  bottomRight,
  bottomCenter,
}

/// 토스트 데이터.
class _ToastItem {
  final String id;
  final String? title;
  final String? description;
  final ShUiToastVariant variant;
  final Duration duration;
  final Widget? action;

  const _ToastItem({
    required this.id,
    this.title,
    this.description,
    required this.variant,
    required this.duration,
    this.action,
  });
}

/// 토스트 입력.
class ShUiToastInput {
  final String? title;
  final String? description;
  final ShUiToastVariant variant;
  final Duration duration;
  final Widget? action;

  const ShUiToastInput({
    this.title,
    this.description,
    this.variant = ShUiToastVariant.defaultVariant,
    this.duration = const Duration(seconds: 4),
    this.action,
  });
}

/// sh-ui Toast — 전역 토스트 알림 시스템.
///
/// 사용법:
///   1) 앱 최상위에 ShUiToaster를 배치.
///      MaterialApp(builder: (_, child) => ShUiToaster(child: child!))
///
///   2) 어디서든 호출.
///      ShUiToast.show(context, description: '저장됨');
///      ShUiToast.success(context, description: '완료!');
///      ShUiToast.danger(context, description: '오류 발생');
///      ShUiToast.warning(context, description: '주의');
class ShUiToast {
  ShUiToast._();

  static String show(
    BuildContext context, {
    String? title,
    String? description,
    ShUiToastVariant variant = ShUiToastVariant.defaultVariant,
    Duration duration = const Duration(seconds: 4),
    Widget? action,
  }) {
    final state = _ShUiToasterState._of(context);
    return state._add(ShUiToastInput(
      title: title,
      description: description,
      variant: variant,
      duration: duration,
      action: action,
    ));
  }

  static String success(BuildContext context, {String? title, String? description}) =>
      show(context, title: title, description: description, variant: ShUiToastVariant.success);

  static String danger(BuildContext context, {String? title, String? description}) =>
      show(context, title: title, description: description, variant: ShUiToastVariant.danger);

  static String warning(BuildContext context, {String? title, String? description}) =>
      show(context, title: title, description: description, variant: ShUiToastVariant.warning);

  static void dismiss(BuildContext context, String id) {
    final state = _ShUiToasterState._of(context);
    state._remove(id);
  }
}

/// 토스트를 렌더링하는 Toaster 위젯. 앱 최상위에 배치.
class ShUiToaster extends StatefulWidget {
  final Widget child;
  final ShUiToastPosition position;

  const ShUiToaster({
    super.key,
    required this.child,
    this.position = ShUiToastPosition.bottomRight,
  });

  @override
  State<ShUiToaster> createState() => _ShUiToasterState();
}

class _ShUiToasterState extends State<ShUiToaster> {
  final List<_ToastItem> _toasts = [];
  int _counter = 0;

  static _ShUiToasterState _of(BuildContext context) {
    final state = context.findAncestorStateOfType<_ShUiToasterState>();
    if (state == null) {
      throw FlutterError('ShUiToaster가 위젯 트리에 없습니다. 앱 최상위에 ShUiToaster를 배치하세요.');
    }
    return state;
  }

  String _add(ShUiToastInput input) {
    final id = 'sh-toast-${++_counter}';
    setState(() {
      _toasts.add(_ToastItem(
        id: id,
        title: input.title,
        description: input.description,
        variant: input.variant,
        duration: input.duration,
        action: input.action,
      ));
    });
    return id;
  }

  void _remove(String id) {
    setState(() {
      _toasts.removeWhere((t) => t.id == id);
    });
  }

  Alignment _positionAlignment() {
    switch (widget.position) {
      case ShUiToastPosition.topLeft:
        return Alignment.topLeft;
      case ShUiToastPosition.topRight:
        return Alignment.topRight;
      case ShUiToastPosition.topCenter:
        return Alignment.topCenter;
      case ShUiToastPosition.bottomLeft:
        return Alignment.bottomLeft;
      case ShUiToastPosition.bottomRight:
        return Alignment.bottomRight;
      case ShUiToastPosition.bottomCenter:
        return Alignment.bottomCenter;
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Stack(
      children: [
        widget.child,
        if (_toasts.isNotEmpty)
          Positioned.fill(
            child: IgnorePointer(
              ignoring: false,
              child: Align(
                alignment: _positionAlignment(),
                child: Padding(
                  padding: EdgeInsets.all(shUi.spacing.s4),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: _toasts.map((item) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: shUi.spacing.s2),
                        child: _ShUiToastCard(
                          item: item,
                          onDismiss: () => _remove(item.id),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ShUiToastCard extends StatefulWidget {
  final _ToastItem item;
  final VoidCallback onDismiss;

  const _ShUiToastCard({required this.item, required this.onDismiss});

  @override
  State<_ShUiToastCard> createState() => _ShUiToastCardState();
}

class _ShUiToastCardState extends State<_ShUiToastCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _opacity;
  late final Animation<Offset> _slide;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: ShUiTheme.light.duration.slow,
    );
    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _controller.forward();

    if (widget.item.duration.inMilliseconds > 0) {
      _timer = Timer(widget.item.duration, _exit);
    }
  }

  void _exit() {
    _controller.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Color _variantColor(ShUiColorTokens colors) {
    switch (widget.item.variant) {
      case ShUiToastVariant.defaultVariant:
        return colors.foreground;
      case ShUiToastVariant.success:
        return const Color(0xFF22C55E);
      case ShUiToastVariant.danger:
        return colors.danger;
      case ShUiToastVariant.warning:
        return const Color(0xFFF59E0B);
    }
  }

  IconData? _variantIcon() {
    switch (widget.item.variant) {
      case ShUiToastVariant.defaultVariant:
        return null;
      case ShUiToastVariant.success:
        return Icons.check_circle_outline;
      case ShUiToastVariant.danger:
        return Icons.cancel_outlined;
      case ShUiToastVariant.warning:
        return Icons.warning_amber_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final variantColor = _variantColor(colors);
    final icon = _variantIcon();

    return SlideTransition(
      position: _slide,
      child: FadeTransition(
        opacity: _opacity,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 360, minWidth: 280),
          padding: EdgeInsets.symmetric(horizontal: shUi.spacing.s4, vertical: shUi.spacing.s3),
          decoration: BoxDecoration(
            color: colors.background,
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: variantColor),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.item.title != null)
                      Text(
                        widget.item.title!,
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: shUi.text.sm,
                          fontWeight: shUi.weight.semibold,
                          height: 1.3,
                        ),
                      ),
                    if (widget.item.description != null) ...[
                      if (widget.item.title != null) const SizedBox(height: 2),
                      Text(
                        widget.item.description!,
                        style: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (widget.item.action != null) ...[
                SizedBox(width: shUi.spacing.s2),
                widget.item.action!,
              ],
              SizedBox(width: shUi.spacing.s1),
              GestureDetector(
                onTap: _exit,
                child: Text(
                  '×',
                  style: TextStyle(
                    color: colors.foregroundMuted,
                    fontSize: shUi.text.base,
                    height: 1,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
