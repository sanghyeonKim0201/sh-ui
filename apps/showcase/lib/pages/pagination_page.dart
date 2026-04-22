import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_pagination.dart';

class PaginationPage extends StatefulWidget {
  const PaginationPage({super.key});

  @override
  State<PaginationPage> createState() => _PaginationPageState();
}

class _PaginationPageState extends State<PaginationPage> {
  int _page = 1;
  int _pageLarge = 5;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본 — 5 페이지', colors),
        ShUiPagination(
          page: _page,
          pageCount: 5,
          onPageChanged: (p) => setState(() => _page = p),
        ),
        const SizedBox(height: 24),
        _section('많은 페이지 — 생략(…) 포함', colors),
        ShUiPagination(
          page: _pageLarge,
          pageCount: 20,
          siblingCount: 1,
          onPageChanged: (p) => setState(() => _pageLarge = p),
        ),
        const SizedBox(height: 24),
        _section('siblingCount = 2', colors),
        ShUiPagination(
          page: _pageLarge,
          pageCount: 20,
          siblingCount: 2,
          onPageChanged: (p) => setState(() => _pageLarge = p),
        ),
        const SizedBox(height: 24),
        _section('이전/다음 숨기기', colors),
        ShUiPagination(
          page: _pageLarge,
          pageCount: 20,
          showPrevNext: false,
          onPageChanged: (p) => setState(() => _pageLarge = p),
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
