import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_header.dart';

class HeaderPage extends StatefulWidget {
  const HeaderPage({super.key});

  @override
  State<HeaderPage> createState() => _HeaderPageState();
}

class _HeaderPageState extends State<HeaderPage> {
  String _active = '홈';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: EdgeInsets.all(shUi.spacing.s4),
      children: [
        _title('소개', shUi),
        Text(
          'ShUiHeader는 상단 네비게이션 바를 선언한다. 화면 폭에 따라 자동으로 '
          'inline(가로 나열) 또는 drawer(햄버거 + slide) 모드로 전환된다.',
          style: TextStyle(
            color: colors.foreground,
            fontSize: shUi.text.sm,
            height: 1.55,
          ),
        ),
        SizedBox(height: shUi.spacing.s6),

        _title('Auto (반응형) — 현재 실행 환경', shUi),
        Text(
          '기본 모드. 현재 뷰포트(데모 컨테이너 기준) 폭이 breakpoint.md 이상이면 '
          'inline, 미만이면 drawer. 시뮬레이터 창 크기를 조절하거나 회전시켜 전환 확인.',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.sm,
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        _demoContainer(
          shUi,
          colors,
          child: ShUiHeader(
            logo: Icon(Icons.hexagon_outlined,
                size: 20, color: colors.foreground),
            title: 'sh-ui',
            items: _items(),
            trailing: [
              IconButton(
                icon: Icon(Icons.dark_mode_outlined,
                    size: 20, color: colors.foreground),
                onPressed: () {},
              ),
            ],
          ),
        ),
        SizedBox(height: shUi.spacing.s6),

        _title('Inline (강제)', shUi),
        Text(
          '항상 가로 네비 아이템 표시. 모바일 폭에선 오버플로우 가능.',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.sm,
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        _demoContainer(
          shUi,
          colors,
          child: ShUiHeader(
            mode: ShUiHeaderMode.inline,
            logo: Icon(Icons.bolt_outlined,
                size: 20, color: colors.foreground),
            title: 'Brand',
            items: _items(),
          ),
        ),
        SizedBox(height: shUi.spacing.s6),

        _title('Drawer (강제)', shUi),
        Text(
          '데스크탑 폭에서도 햄버거 + drawer 사용. 앱스러운 UX를 원할 때.',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.sm,
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        _demoContainer(
          shUi,
          colors,
          child: ShUiHeader(
            mode: ShUiHeaderMode.drawer,
            logo: Icon(Icons.favorite_outline,
                size: 20, color: colors.foreground),
            title: '모바일 앱',
            items: _items(),
            trailing: [
              IconButton(
                icon: Icon(Icons.search,
                    size: 20, color: colors.foreground),
                onPressed: () {},
              ),
            ],
          ),
        ),
        SizedBox(height: shUi.spacing.s6),

        _title('언제 쓰나', shUi),
        _bullet(shUi, '마케팅 사이트 / 랜딩 페이지 — 최상단 네비 + 모바일에서 햄버거 메뉴'),
        _bullet(shUi, '블로그 / 문서 사이트 — 좌측 사이드바가 부담스러울 때 상단 네비만'),
        _bullet(shUi, 'ShUiAppShell이 과한 간단한 화면 구조'),
        SizedBox(height: shUi.spacing.s6),

        _title('현재 선택', shUi),
        Container(
          padding: EdgeInsets.all(shUi.spacing.s4),
          decoration: BoxDecoration(
            color: colors.backgroundSubtle,
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          child: Text(
            '현재 활성 아이템: $_active',
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.sm,
              fontWeight: shUi.weight.medium,
            ),
          ),
        ),
      ],
    );
  }

  List<ShUiHeaderItem> _items() {
    return [
      ShUiHeaderItem(
        icon: Icons.home_outlined,
        label: '홈',
        isActive: _active == '홈',
        onTap: () => setState(() => _active = '홈'),
      ),
      ShUiHeaderItem(
        icon: Icons.menu_book_outlined,
        label: '문서',
        isActive: _active == '문서',
        onTap: () => setState(() => _active = '문서'),
      ),
      ShUiHeaderItem(
        icon: Icons.widgets_outlined,
        label: '컴포넌트',
        isActive: _active == '컴포넌트',
        onTap: () => setState(() => _active = '컴포넌트'),
      ),
      ShUiHeaderItem(
        icon: Icons.payments_outlined,
        label: '가격',
        isActive: _active == '가격',
        onTap: () => setState(() => _active = '가격'),
      ),
    ];
  }

  Widget _demoContainer(
    ShUiTheme shUi,
    ShUiColorTokens colors, {
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }

  Widget _title(String text, ShUiTheme shUi) {
    return Padding(
      padding: EdgeInsets.only(bottom: shUi.spacing.s2),
      child: Text(
        text,
        style: TextStyle(
          color: shUi.colors.foreground,
          fontSize: shUi.text.lg,
          fontWeight: shUi.weight.semibold,
        ),
      ),
    );
  }

  Widget _bullet(ShUiTheme shUi, String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: shUi.spacing.s2, left: shUi.spacing.s3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(top: 6),
            child: Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                color: shUi.colors.foregroundMuted,
                shape: BoxShape.circle,
              ),
            ),
          ),
          SizedBox(width: shUi.spacing.s2),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: shUi.colors.foreground,
                fontSize: shUi.text.sm,
                height: 1.55,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
