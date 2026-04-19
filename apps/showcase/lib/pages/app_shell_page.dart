import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_app_shell.dart';

class AppShellPage extends StatelessWidget {
  const AppShellPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: EdgeInsets.all(shUi.spacing.s4),
      children: [
        _sectionTitle('소개', shUi),
        Text(
          'ShUiAppShell은 Scaffold + AppBar + Sidebar + 콘텐츠 스위칭을 한 번에 '
          '선언하는 고수준 위젯이다. 사이드바 아이템을 탭하면 메인 영역의 콘텐츠가 '
          '교체되며, 모바일에서는 자동으로 drawer로 전환된다.',
          style: TextStyle(
            color: colors.foreground,
            fontSize: shUi.text.sm,
            height: 1.55,
          ),
        ),
        SizedBox(height: shUi.spacing.s6),

        _sectionTitle('라이브 예제', shUi),
        Text(
          '아래는 컨테이너 안에 끼워넣은 미니 쇼케이스.',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.sm,
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        Container(
          height: 560,
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          clipBehavior: Clip.antiAlias,
          child: ShUiAppShell(
            title: '내 서비스',
            logo: Icon(Icons.bolt_outlined,
                size: 20, color: colors.foreground),
            actions: [
              IconButton(
                icon: Icon(Icons.notifications_outlined,
                    size: 20, color: colors.foreground),
                onPressed: () {},
              ),
            ],
            groups: [
              ShUiAppShellGroup(
                label: '워크스페이스',
                items: [
                  ShUiAppShellItem(
                    icon: Icons.dashboard_outlined,
                    label: '대시보드',
                    builder: (_) => _pane(
                      shUi,
                      colors,
                      title: '대시보드',
                      desc: '오늘의 방문자, 매출, 주요 지표를 요약해서 보여주는 곳.',
                      icon: Icons.bar_chart,
                    ),
                  ),
                  ShUiAppShellItem(
                    icon: Icons.folder_outlined,
                    label: '프로젝트',
                    builder: (_) => _pane(
                      shUi,
                      colors,
                      title: '프로젝트',
                      desc: '진행 중인 프로젝트 목록과 각 프로젝트의 최근 활동.',
                      icon: Icons.work_outline,
                    ),
                  ),
                  ShUiAppShellItem(
                    icon: Icons.group_outlined,
                    label: '팀',
                    builder: (_) => _pane(
                      shUi,
                      colors,
                      title: '팀',
                      desc: '팀원, 역할, 권한을 관리.',
                      icon: Icons.people_outline,
                    ),
                  ),
                ],
              ),
              ShUiAppShellGroup(
                label: '설정',
                items: [
                  ShUiAppShellItem(
                    icon: Icons.settings_outlined,
                    label: '일반',
                    builder: (_) => _pane(
                      shUi,
                      colors,
                      title: '일반 설정',
                      desc: '언어, 테마, 시간대 같은 기본 환경.',
                      icon: Icons.tune,
                    ),
                  ),
                  ShUiAppShellItem(
                    icon: Icons.key_outlined,
                    label: '보안',
                    builder: (_) => _pane(
                      shUi,
                      colors,
                      title: '보안',
                      desc: '2단계 인증, 세션, API 키 관리.',
                      icon: Icons.security,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        SizedBox(height: shUi.spacing.s8),

        _sectionTitle('언제 쓰나', shUi),
        _bullet(shUi, '대시보드 / 어드민 툴 — 같은 앱 안에서 탭처럼 여러 화면을 오가지만 뒤로가기 스택이 필요 없을 때'),
        _bullet(shUi, '컨텐츠가 많은 웹 앱 — 데스크탑에선 고정 사이드바, 모바일에선 drawer로 자동 전환'),
        _bullet(shUi, '화면 전환 없이 콘텐츠만 바뀌는 SPA 스타일 구조'),
        SizedBox(height: shUi.spacing.s6),

        _sectionTitle('언제 쓰지 말까', shUi),
        _bullet(shUi, '네이티브 앱처럼 "뒤로가기 버튼"이 필요한 경우 — ShUiSidebar 저수준 API + Navigator.push 직접 조합 권장'),
        _bullet(shUi, '화면마다 완전히 다른 네비게이션/헤더가 필요한 경우'),
        SizedBox(height: shUi.spacing.s6),

        _sectionTitle('저수준 API와 차이', shUi),
        Container(
          padding: EdgeInsets.all(shUi.spacing.s4),
          decoration: BoxDecoration(
            color: colors.backgroundSubtle,
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ShUiAppShell (고수준)',
                style: TextStyle(
                  color: colors.foreground,
                  fontWeight: shUi.weight.semibold,
                  fontSize: shUi.text.sm,
                ),
              ),
              SizedBox(height: shUi.spacing.s1),
              Text(
                'Scaffold + AppBar + SidebarProvider + Sidebar + 콘텐츠 스위칭 내장.\n'
                '선언 하나로 완성되는 통합 레이아웃.',
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: shUi.text.xs,
                  height: 1.6,
                ),
              ),
              SizedBox(height: shUi.spacing.s3),
              Text(
                'ShUiSidebar (저수준)',
                style: TextStyle(
                  color: colors.foreground,
                  fontWeight: shUi.weight.semibold,
                  fontSize: shUi.text.sm,
                ),
              ),
              SizedBox(height: shUi.spacing.s1),
              Text(
                '사이드바 컨테이너만 제공. Scaffold/AppBar/Navigator는 직접 조립.\n'
                '라우트 기반 페이지 전환, 커스텀 레이아웃에 적합.',
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: shUi.text.xs,
                  height: 1.6,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _pane(
    ShUiTheme shUi,
    ShUiColorTokens colors, {
    required String title,
    required String desc,
    required IconData icon,
  }) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(shUi.spacing.s6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: colors.foregroundMuted),
            SizedBox(height: shUi.spacing.s3),
            Text(
              title,
              style: TextStyle(
                color: colors.foreground,
                fontSize: shUi.text.lg,
                fontWeight: shUi.weight.semibold,
              ),
            ),
            SizedBox(height: shUi.spacing.s1),
            Text(
              desc,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: shUi.text.sm,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Widget _sectionTitle(String title, ShUiTheme shUi) {
  return Padding(
    padding: EdgeInsets.only(bottom: shUi.spacing.s2),
    child: Text(
      title,
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
