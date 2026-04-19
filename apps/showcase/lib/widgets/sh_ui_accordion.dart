import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// Accordion 열림 동작 모드.
/// - [single]   : 한 번에 하나만 열림.
/// - [multiple] : 동시에 여러 개 열림.
enum ShUiAccordionType { single, multiple }

/// Accordion 항목 모델.
class ShUiAccordionItem {
  /// 고유 식별자. 열림/닫힘 상태 추적에 사용된다.
  final String value;

  /// 헤더 타이틀.
  final String title;

  /// 펼친 뒤 표시될 본문.
  final Widget content;

  /// 헤더 왼쪽에 붙는 아이콘 (선택).
  final IconData? leadingIcon;

  /// 비활성화 상태.
  final bool disabled;

  const ShUiAccordionItem({
    required this.value,
    required this.title,
    required this.content,
    this.leadingIcon,
    this.disabled = false,
  });
}

/// shUi Accordion — 수직으로 쌓인 접이식 섹션 목록.
///
/// [type]이 [ShUiAccordionType.single]이면 [initialValue]는 `String?`로,
/// [ShUiAccordionType.multiple]이면 `List<String>?`로 전달한다.
/// 상태 변경 시 [onValueChange]로 현재 열린 value(들)를 통지한다.
class ShUiAccordion extends StatefulWidget {
  final List<ShUiAccordionItem> items;
  final ShUiAccordionType type;

  /// 초기 열림 값. single이면 `String?`, multiple이면 `List<String>?`.
  final Object? initialValue;

  /// 상태 변경 콜백. single이면 `String?`, multiple이면 `List<String>`이 전달된다.
  final ValueChanged<Object?>? onValueChange;

  const ShUiAccordion({
    super.key,
    required this.items,
    this.type = ShUiAccordionType.multiple,
    this.initialValue,
    this.onValueChange,
  });

  @override
  State<ShUiAccordion> createState() => _ShUiAccordionState();
}

class _ShUiAccordionState extends State<ShUiAccordion> {
  late Set<String> _open;

  @override
  void initState() {
    super.initState();
    _open = _resolveInitial(widget.initialValue, widget.type);
  }

  static Set<String> _resolveInitial(Object? v, ShUiAccordionType type) {
    if (v == null) return <String>{};
    if (type == ShUiAccordionType.single) {
      return v is String ? {v} : <String>{};
    }
    return v is List<String> ? v.toSet() : <String>{};
  }

  void _toggle(String value) {
    setState(() {
      if (widget.type == ShUiAccordionType.single) {
        if (_open.contains(value)) {
          _open = <String>{};
        } else {
          _open = {value};
        }
      } else {
        _open = {..._open};
        if (_open.contains(value)) {
          _open.remove(value);
        } else {
          _open.add(value);
        }
      }
    });
    if (widget.onValueChange != null) {
      if (widget.type == ShUiAccordionType.single) {
        widget.onValueChange!(_open.isEmpty ? null : _open.first);
      } else {
        widget.onValueChange!(_open.toList());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: shUi.colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < widget.items.length; i++) ...[
            _ShUiAccordionItemView(
              item: widget.items[i],
              isOpen: _open.contains(widget.items[i].value),
              onTap: () {
                if (!widget.items[i].disabled) {
                  _toggle(widget.items[i].value);
                }
              },
              isFirst: i == 0,
              isLast: i == widget.items.length - 1,
            ),
            if (i != widget.items.length - 1)
              Container(height: 1, color: shUi.colors.border),
          ],
        ],
      ),
    );
  }
}

class _ShUiAccordionItemView extends StatefulWidget {
  final ShUiAccordionItem item;
  final bool isOpen;
  final VoidCallback onTap;
  final bool isFirst;
  final bool isLast;

  const _ShUiAccordionItemView({
    required this.item,
    required this.isOpen,
    required this.onTap,
    required this.isFirst,
    required this.isLast,
  });

  @override
  State<_ShUiAccordionItemView> createState() => _ShUiAccordionItemViewState();
}

class _ShUiAccordionItemViewState extends State<_ShUiAccordionItemView> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = widget.item.disabled;

    return Opacity(
      opacity: disabled ? shUi.opacity.disabled : 1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          MouseRegion(
            cursor: disabled
                ? SystemMouseCursors.basic
                : SystemMouseCursors.click,
            onEnter: (_) => setState(() => _hover = true),
            onExit: (_) => setState(() => _hover = false),
            child: GestureDetector(
              onTap: disabled ? null : widget.onTap,
              behavior: HitTestBehavior.opaque,
              child: AnimatedContainer(
                duration: shUi.duration.fast,
                color: _hover && !disabled
                    ? colors.backgroundSubtle
                    : Colors.transparent,
                padding: EdgeInsets.symmetric(
                  horizontal: shUi.spacing.s4,
                  vertical: shUi.spacing.s3,
                ),
                child: Row(
                  children: [
                    if (widget.item.leadingIcon != null) ...[
                      Icon(
                        widget.item.leadingIcon,
                        size: 16,
                        color: colors.foregroundMuted,
                      ),
                      SizedBox(width: shUi.spacing.s2),
                    ],
                    Expanded(
                      child: Text(
                        widget.item.title,
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: shUi.text.sm,
                          fontWeight: shUi.weight.medium,
                          height: 1.25,
                        ),
                      ),
                    ),
                    AnimatedRotation(
                      turns: widget.isOpen ? 0.5 : 0.0,
                      duration: shUi.duration.base,
                      curve: shUi.ease.standard,
                      child: Icon(
                        Icons.keyboard_arrow_down,
                        size: 18,
                        color: colors.foregroundMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          AnimatedSize(
            duration: shUi.duration.base,
            curve: shUi.ease.standard,
            alignment: Alignment.topCenter,
            child: widget.isOpen
                ? Padding(
                    padding: EdgeInsets.fromLTRB(
                      shUi.spacing.s4,
                      0,
                      shUi.spacing.s4,
                      shUi.spacing.s3,
                    ),
                    child: DefaultTextStyle(
                      style: TextStyle(
                        color: colors.foregroundMuted,
                        fontSize: shUi.text.sm,
                        height: 1.5,
                      ),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: widget.item.content,
                      ),
                    ),
                  )
                : const SizedBox(width: double.infinity, height: 0),
          ),
        ],
      ),
    );
  }
}
