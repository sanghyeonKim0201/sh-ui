import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_breadcrumb.dart';

class BreadcrumbPage extends StatelessWidget {
  const BreadcrumbPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본', colors),
        ShUiBreadcrumb(
          items: [
            ShUiBreadcrumbItem(label: '홈', onTap: () {}),
            ShUiBreadcrumbItem(label: '컴포넌트', onTap: () {}),
            const ShUiBreadcrumbItem(label: 'Breadcrumb', isCurrent: true),
          ],
        ),
        const SizedBox(height: 24),
        _section('단일 레벨', colors),
        const ShUiBreadcrumb(
          items: [
            ShUiBreadcrumbItem(label: '설정', isCurrent: true),
          ],
        ),
        const SizedBox(height: 24),
        _section('커스텀 separator', colors),
        ShUiBreadcrumb(
          separator: Text('/', style: TextStyle(color: colors.foregroundMuted)),
          items: [
            ShUiBreadcrumbItem(label: '문서', onTap: () {}),
            ShUiBreadcrumbItem(label: '가이드', onTap: () {}),
            const ShUiBreadcrumbItem(label: '시작하기', isCurrent: true),
          ],
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
