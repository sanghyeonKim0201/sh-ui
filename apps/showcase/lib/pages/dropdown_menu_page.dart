import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_button.dart';
import '../widgets/sh_ui_dropdown_menu.dart';

class DropdownMenuPage extends StatefulWidget {
  const DropdownMenuPage({super.key});

  @override
  State<DropdownMenuPage> createState() => _DropdownMenuPageState();
}

class _DropdownMenuPageState extends State<DropdownMenuPage> {
  bool _notifications = true;
  bool _beta = false;
  String _layout = 'comfortable';
  String _lastSelected = '—';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본', colors),
        ShUiDropdownMenu<String>(
          onSelected: (v) => setState(() => _lastSelected = v),
          items: const [
            ShUiDropdownMenuLabel('내 계정'),
            ShUiDropdownMenuItem(value: 'profile', label: '프로필'),
            ShUiDropdownMenuItem(value: 'settings', label: '설정'),
            ShUiDropdownMenuItem(value: 'billing', label: '청구 내역'),
            ShUiDropdownMenuDivider(),
            ShUiDropdownMenuItem(
              value: 'team',
              label: '팀 (준비 중)',
              disabled: true,
            ),
            ShUiDropdownMenuDivider(),
            ShUiDropdownMenuItem(value: 'signout', label: '로그아웃'),
          ],
          child: ShUiButton(
            variant: ShUiButtonVariant.secondary,
            onPressed: null,
            child: const Text('메뉴 열기'),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '마지막 선택: $_lastSelected',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 12),
        ),
        const SizedBox(height: 24),
        _section('체크박스 · 라디오', colors),
        ShUiDropdownMenu<String>(
          onSelected: (v) {
            setState(() {
              if (v == 'notifications') _notifications = !_notifications;
              if (v == 'beta') _beta = !_beta;
              if (v == 'comfortable' || v == 'compact') _layout = v;
            });
          },
          items: [
            const ShUiDropdownMenuLabel('옵션'),
            ShUiDropdownMenuCheckboxItem(
              value: 'notifications',
              label: '알림 받기',
              checked: _notifications,
            ),
            ShUiDropdownMenuCheckboxItem(
              value: 'beta',
              label: '베타 기능 사용',
              checked: _beta,
            ),
            const ShUiDropdownMenuDivider(),
            const ShUiDropdownMenuLabel('레이아웃'),
            ShUiDropdownMenuRadioItem(
              value: 'comfortable',
              label: '넓게',
              selected: _layout == 'comfortable',
            ),
            ShUiDropdownMenuRadioItem(
              value: 'compact',
              label: '좁게',
              selected: _layout == 'compact',
            ),
          ],
          child: ShUiButton(
            variant: ShUiButtonVariant.secondary,
            onPressed: null,
            child: const Text('환경설정'),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '알림: $_notifications · 베타: $_beta · 레이아웃: $_layout',
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
