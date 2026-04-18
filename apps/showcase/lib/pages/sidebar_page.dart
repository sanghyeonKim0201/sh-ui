import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_sidebar.dart';

class SidebarPage extends StatefulWidget {
  const SidebarPage({super.key});

  @override
  State<SidebarPage> createState() => _SidebarPageState();
}

class _SidebarPageState extends State<SidebarPage> {
  String _activeItem = '홈';

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Sidebar', style: TextStyle(color: colors.foreground)),
        backgroundColor: colors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.foreground),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: colors.border),
        ),
      ),
      body: SizedBox(
        height: 500,
        child: ShUiSidebarProvider(
          child: Row(
            children: [
              ShUiSidebar(
                header: ShUiSidebarHeader(
                  child: Builder(
                    builder: (context) {
                      final isOpen = useSidebar(context)?.open ?? true;
                      if (!isOpen) {
                        return const Center(child: ShUiSidebarTrigger());
                      }
                      return Row(
                        children: [
                          Icon(Icons.hexagon_outlined,
                              size: 20, color: colors.foreground),
                          const SizedBox(width: 8),
                          Text(
                            'sh-ui',
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const Spacer(),
                          const ShUiSidebarTrigger(),
                        ],
                      );
                    },
                  ),
                ),
                footer: ShUiSidebarFooter(
                  child: Builder(
                    builder: (context) {
                      final isOpen = useSidebar(context)?.open ?? true;
                      final avatar = CircleAvatar(
                        radius: 14,
                        backgroundColor: colors.backgroundMuted,
                        child: Icon(Icons.person,
                            size: 16, color: colors.foregroundMuted),
                      );
                      if (!isOpen) {
                        return Center(child: avatar);
                      }
                      return Row(
                        children: [
                          avatar,
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '사용자',
                              style: TextStyle(
                                color: colors.foreground,
                                fontSize: 13,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                children: [
                  ShUiSidebarGroup(
                    label: '메뉴',
                    children: [
                      ShUiSidebarItem(
                        icon: Icons.home_outlined,
                        label: '홈',
                        isActive: _activeItem == '홈',
                        onTap: () => setState(() => _activeItem = '홈'),
                      ),
                      ShUiSidebarItem(
                        icon: Icons.dashboard_outlined,
                        label: '대시보드',
                        isActive: _activeItem == '대시보드',
                        onTap: () => setState(() => _activeItem = '대시보드'),
                      ),
                      ShUiSidebarItem(
                        icon: Icons.folder_outlined,
                        label: '프로젝트',
                        isActive: _activeItem == '프로젝트',
                        onTap: () => setState(() => _activeItem = '프로젝트'),
                      ),
                    ],
                  ),
                  const ShUiSidebarSeparator(),
                  ShUiSidebarGroup(
                    label: '설정',
                    children: [
                      ShUiSidebarItem(
                        icon: Icons.settings_outlined,
                        label: '일반 설정',
                        isActive: _activeItem == '일반 설정',
                        onTap: () => setState(() => _activeItem = '일반 설정'),
                      ),
                      ShUiSidebarItem(
                        icon: Icons.security_outlined,
                        label: '보안',
                        isActive: _activeItem == '보안',
                        onTap: () => setState(() => _activeItem = '보안'),
                      ),
                      ShUiSidebarItem(
                        icon: Icons.notifications_outlined,
                        label: '알림',
                        isActive: _activeItem == '알림',
                        onTap: () => setState(() => _activeItem = '알림'),
                      ),
                    ],
                  ),
                ],
              ),
              // Main content area
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.touch_app_outlined,
                        size: 48,
                        color: colors.foregroundMuted,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '선택된 메뉴: $_activeItem',
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '사이드바 항목을 클릭해보세요.\n헤더의 메뉴 아이콘으로 접기/펼치기할 수 있습니다.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
