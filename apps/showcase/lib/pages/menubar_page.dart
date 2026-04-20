import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_dropdown_menu.dart';
import '../widgets/sh_ui_menubar.dart';

class MenubarPage extends StatefulWidget {
  const MenubarPage({super.key});

  @override
  State<MenubarPage> createState() => _MenubarPageState();
}

class _MenubarPageState extends State<MenubarPage> {
  String _lastSelected = '—';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    void handle(dynamic v) => setState(() => _lastSelected = v.toString());

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본', colors),
        ShUiMenubar(
          menus: [
            ShUiMenubarMenu(
              label: '파일',
              onSelected: handle,
              items: const [
                ShUiDropdownMenuItem(value: 'new', label: '새로 만들기'),
                ShUiDropdownMenuItem(value: 'open', label: '열기…'),
                ShUiDropdownMenuDivider(),
                ShUiDropdownMenuItem(value: 'close', label: '닫기'),
              ],
            ),
            ShUiMenubarMenu(
              label: '편집',
              onSelected: handle,
              items: const [
                ShUiDropdownMenuItem(value: 'undo', label: '실행 취소'),
                ShUiDropdownMenuItem(value: 'redo', label: '다시 실행'),
                ShUiDropdownMenuDivider(),
                ShUiDropdownMenuItem(value: 'copy', label: '복사'),
                ShUiDropdownMenuItem(value: 'paste', label: '붙여넣기'),
              ],
            ),
            ShUiMenubarMenu(
              label: '보기',
              onSelected: handle,
              items: const [
                ShUiDropdownMenuItem(value: 'zoom-in', label: '확대'),
                ShUiDropdownMenuItem(value: 'zoom-out', label: '축소'),
                ShUiDropdownMenuItem(value: 'zoom-reset', label: '100%'),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
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
