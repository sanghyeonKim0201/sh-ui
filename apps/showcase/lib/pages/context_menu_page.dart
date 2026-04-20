import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_context_menu.dart';
import '../widgets/sh_ui_dropdown_menu.dart';

class ContextMenuPage extends StatefulWidget {
  const ContextMenuPage({super.key});

  @override
  State<ContextMenuPage> createState() => _ContextMenuPageState();
}

class _ContextMenuPageState extends State<ContextMenuPage> {
  String _lastSelected = '—';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본', colors),
        Text(
          '아래 영역에서 우클릭 (데스크탑) 또는 길게 누르기 (모바일)',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
        ),
        const SizedBox(height: 12),
        ShUiContextMenu<String>(
          onSelected: (v) => setState(() => _lastSelected = v),
          items: const [
            ShUiDropdownMenuLabel('편집'),
            ShUiDropdownMenuItem(value: 'cut', label: '잘라내기'),
            ShUiDropdownMenuItem(value: 'copy', label: '복사'),
            ShUiDropdownMenuItem(value: 'paste', label: '붙여넣기'),
            ShUiDropdownMenuDivider(),
            ShUiDropdownMenuItem(value: 'delete', label: '삭제'),
          ],
          child: Container(
            width: 320,
            height: 128,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: colors.backgroundSubtle,
              border: Border.all(
                color: colors.border,
                style: BorderStyle.solid,
              ),
              borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
            ),
            child: Text(
              '이 영역에서 우클릭',
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: shUi.text.sm,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '마지막 선택: $_lastSelected',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
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
