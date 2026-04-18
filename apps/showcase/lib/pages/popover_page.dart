import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_popover.dart';
import '../widgets/sh_ui_button.dart';

class PopoverPage extends StatefulWidget {
  const PopoverPage({super.key});

  @override
  State<PopoverPage> createState() => _PopoverPageState();
}

class _PopoverPageState extends State<PopoverPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Popover', style: TextStyle(color: colors.foreground)),
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
          // --- Bottom (default) ---
          _section('Bottom (Default)', colors),
          ShUiPopover(
            side: ShUiPopoverSide.bottom,
            trigger: (show) => ShUiButton(
              onPressed: show,
              child: const Text('아래로 열기'),
            ),
            content: (close) => Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ShUiPopoverTitle('팝오버 제목'),
                  const SizedBox(height: 4),
                  const ShUiPopoverDescription(
                    '팝오버 설명 텍스트입니다. 다양한 정보를 표시할 수 있습니다.',
                  ),
                  const SizedBox(height: 12),
                  ShUiButton(
                    size: ShUiButtonSize.sm,
                    variant: ShUiButtonVariant.secondary,
                    onPressed: close,
                    child: const Text('닫기'),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Top ---
          _section('Top', colors),
          const SizedBox(height: 120),
          ShUiPopover(
            side: ShUiPopoverSide.top,
            trigger: (show) => ShUiButton(
              variant: ShUiButtonVariant.secondary,
              onPressed: show,
              child: const Text('위로 열기'),
            ),
            content: (close) => Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ShUiPopoverTitle('위쪽 팝오버'),
                  const SizedBox(height: 4),
                  const ShUiPopoverDescription('트리거 위에 표시되는 팝오버입니다.'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Right ---
          _section('Right', colors),
          ShUiPopover(
            side: ShUiPopoverSide.right,
            trigger: (show) => ShUiButton(
              variant: ShUiButtonVariant.ghost,
              onPressed: show,
              child: const Text('오른쪽으로 열기'),
            ),
            content: (close) => Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ShUiPopoverTitle('오른쪽 팝오버'),
                  const SizedBox(height: 4),
                  const ShUiPopoverDescription('트리거 오른쪽에 표시됩니다.'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Left ---
          _section('Left', colors),
          Align(
            alignment: Alignment.centerRight,
            child: ShUiPopover(
              side: ShUiPopoverSide.left,
              trigger: (show) => ShUiButton(
                variant: ShUiButtonVariant.ghost,
                onPressed: show,
                child: const Text('왼쪽으로 열기'),
              ),
              content: (close) => Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const ShUiPopoverTitle('왼쪽 팝오버'),
                    const SizedBox(height: 4),
                    const ShUiPopoverDescription('트리거 왼쪽에 표시됩니다.'),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // --- Rich Content ---
          _section('Rich Content', colors),
          ShUiPopover(
            side: ShUiPopoverSide.bottom,
            trigger: (show) => ShUiButton(
              onPressed: show,
              child: const Text('상세 정보'),
            ),
            content: (close) => Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ShUiPopoverTitle('위젯 정보'),
                  const SizedBox(height: 8),
                  _popoverRow('이름', 'ShUiPopover', colors),
                  const SizedBox(height: 4),
                  _popoverRow('버전', '1.0.0', colors),
                  const SizedBox(height: 4),
                  _popoverRow('위치', 'bottom / top / left / right', colors),
                  const SizedBox(height: 12),
                  ShUiButton(
                    size: ShUiButtonSize.sm,
                    onPressed: close,
                    child: const Text('확인'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _popoverRow(String label, String value, ShUiColorTokens colors) {
    return Row(
      children: [
        SizedBox(
          width: 50,
          child: Text(
            label,
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 12,
            ),
          ),
        ),
        Flexible(
          child: Text(
            value,
            style: TextStyle(
              color: colors.foreground,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
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
