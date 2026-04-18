import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

enum ShUiPopoverSide { top, right, bottom, left }

enum ShUiPopoverAlign { start, center, end }

/// sh-ui Popover — 트리거 위젯에 붙는 플로팅 팝업.
///
/// ShUiPopover(
///   trigger: (show) => ShUiButton(onPressed: show, child: Text('열기')),
///   content: (close) => Padding(
///     padding: EdgeInsets.all(16),
///     child: Text('팝오버 내용'),
///   ),
/// )
class ShUiPopover extends StatefulWidget {
  /// 트리거 빌더. show 콜백을 받아 팝오버를 연다.
  final Widget Function(VoidCallback show) trigger;

  /// 컨텐츠 빌더. close 콜백을 받아 팝오버를 닫는다.
  final Widget Function(VoidCallback close) content;

  final ShUiPopoverSide side;
  final ShUiPopoverAlign align;
  final double sideOffset;

  const ShUiPopover({
    super.key,
    required this.trigger,
    required this.content,
    this.side = ShUiPopoverSide.bottom,
    this.align = ShUiPopoverAlign.start,
    this.sideOffset = 8,
  });

  @override
  State<ShUiPopover> createState() => _ShUiPopoverState();
}

class _ShUiPopoverState extends State<ShUiPopover> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;

  void _show() {
    if (_overlayEntry != null) return;

    _overlayEntry = OverlayEntry(
      builder: (context) => _PopoverOverlay(
        link: _layerLink,
        side: widget.side,
        align: widget.align,
        sideOffset: widget.sideOffset,
        onDismiss: _close,
        content: widget.content(_close),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _close() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: widget.trigger(_show),
    );
  }
}

class _PopoverOverlay extends StatelessWidget {
  final LayerLink link;
  final ShUiPopoverSide side;
  final ShUiPopoverAlign align;
  final double sideOffset;
  final VoidCallback onDismiss;
  final Widget content;

  const _PopoverOverlay({
    required this.link,
    required this.side,
    required this.align,
    required this.sideOffset,
    required this.onDismiss,
    required this.content,
  });

  Offset _computeOffset() {
    switch (side) {
      case ShUiPopoverSide.bottom:
        return Offset(0, sideOffset);
      case ShUiPopoverSide.top:
        return Offset(0, -sideOffset);
      case ShUiPopoverSide.right:
        return Offset(sideOffset, 0);
      case ShUiPopoverSide.left:
        return Offset(-sideOffset, 0);
    }
  }

  Alignment _targetAnchor() {
    switch (side) {
      case ShUiPopoverSide.bottom:
        switch (align) {
          case ShUiPopoverAlign.start:
            return Alignment.bottomLeft;
          case ShUiPopoverAlign.center:
            return Alignment.bottomCenter;
          case ShUiPopoverAlign.end:
            return Alignment.bottomRight;
        }
      case ShUiPopoverSide.top:
        switch (align) {
          case ShUiPopoverAlign.start:
            return Alignment.topLeft;
          case ShUiPopoverAlign.center:
            return Alignment.topCenter;
          case ShUiPopoverAlign.end:
            return Alignment.topRight;
        }
      case ShUiPopoverSide.right:
        return Alignment.centerRight;
      case ShUiPopoverSide.left:
        return Alignment.centerLeft;
    }
  }

  Alignment _followerAnchor() {
    switch (side) {
      case ShUiPopoverSide.bottom:
        switch (align) {
          case ShUiPopoverAlign.start:
            return Alignment.topLeft;
          case ShUiPopoverAlign.center:
            return Alignment.topCenter;
          case ShUiPopoverAlign.end:
            return Alignment.topRight;
        }
      case ShUiPopoverSide.top:
        switch (align) {
          case ShUiPopoverAlign.start:
            return Alignment.bottomLeft;
          case ShUiPopoverAlign.center:
            return Alignment.bottomCenter;
          case ShUiPopoverAlign.end:
            return Alignment.bottomRight;
        }
      case ShUiPopoverSide.right:
        return Alignment.centerLeft;
      case ShUiPopoverSide.left:
        return Alignment.centerRight;
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: onDismiss,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox.expand(),
          ),
        ),
        CompositedTransformFollower(
          link: link,
          targetAnchor: _targetAnchor(),
          followerAnchor: _followerAnchor(),
          offset: _computeOffset(),
          child: Material(
            color: Colors.transparent,
            child: Container(
              constraints: const BoxConstraints(maxWidth: 320),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: colors.border),
                borderRadius:
                    BorderRadius.circular(shUi.radius.defaultRadius),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: content,
            ),
          ),
        ),
      ],
    );
  }
}

class ShUiPopoverTitle extends StatelessWidget {
  final String text;

  const ShUiPopoverTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Text(
      text,
      style: TextStyle(
        color: shUi.colors.foreground,
        fontSize: shUi.text.sm,
        fontWeight: shUi.weight.semibold,
        height: 1.3,
      ),
    );
  }
}

class ShUiPopoverDescription extends StatelessWidget {
  final String text;

  const ShUiPopoverDescription(this.text, {super.key});

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
