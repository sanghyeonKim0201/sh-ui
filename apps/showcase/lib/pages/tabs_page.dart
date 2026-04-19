import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_tabs.dart';

class TabsPage extends StatefulWidget {
  const TabsPage({super.key});

  @override
  State<TabsPage> createState() => _TabsPageState();
}

class _TabsPageState extends State<TabsPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Tabs', style: TextStyle(color: colors.foreground)),
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
          // --- Underline ---
          _section('Underline Variant', colors),
          ShUiTabs(
            variant: ShUiTabsVariant.underline,
            tabs: [
              ShUiTab(
                label: '개요',
                child: _tabContent('개요 탭 내용입니다.', colors),
              ),
              ShUiTab(
                label: '기능',
                child: _tabContent('기능 탭 내용입니다.', colors),
              ),
              ShUiTab(
                label: '설정',
                child: _tabContent('설정 탭 내용입니다.', colors),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // --- Pill ---
          _section('Pill Variant', colors),
          ShUiTabs(
            variant: ShUiTabsVariant.pill,
            tabs: [
              ShUiTab(
                label: '전체',
                child: _tabContent('전체 항목을 표시합니다.', colors),
              ),
              ShUiTab(
                label: '활성',
                child: _tabContent('활성 항목만 표시합니다.', colors),
              ),
              ShUiTab(
                label: '보관',
                child: _tabContent('보관된 항목을 표시합니다.', colors),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // --- Plain ---
          _section('Plain Variant', colors),
          ShUiTabs(
            variant: ShUiTabsVariant.plain,
            tabs: [
              ShUiTab(
                label: '탭 1',
                child: _tabContent('Plain 스타일의 첫 번째 탭입니다.', colors),
              ),
              ShUiTab(
                label: '탭 2',
                child: _tabContent('Plain 스타일의 두 번째 탭입니다.', colors),
              ),
              ShUiTab(
                label: '탭 3',
                child: _tabContent('Plain 스타일의 세 번째 탭입니다.', colors),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // --- With Icons ---
          _section('With Icons', colors),
          ShUiTabs(
            variant: ShUiTabsVariant.underline,
            tabs: [
              ShUiTab(
                label: '홈',
                icon: const Icon(Icons.home_outlined),
                child: _tabContent('홈 탭 내용입니다.', colors),
              ),
              ShUiTab(
                label: '검색',
                icon: const Icon(Icons.search),
                child: _tabContent('검색 탭 내용입니다.', colors),
              ),
              ShUiTab(
                label: '프로필',
                icon: const Icon(Icons.person_outline),
                child: _tabContent('프로필 탭 내용입니다.', colors),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // --- Vertical ---
          _section('Vertical (underline)', colors),
          SizedBox(
            height: 180,
            child: ShUiTabs(
              orientation: ShUiTabsOrientation.vertical,
              variant: ShUiTabsVariant.underline,
              tabs: [
                ShUiTab(
                  label: 'One',
                  child: _tabContent('세로 배치 탭 1.', colors),
                ),
                ShUiTab(
                  label: 'Two',
                  child: _tabContent('세로 배치 탭 2.', colors),
                ),
                ShUiTab(
                  label: 'Three',
                  child: _tabContent('세로 배치 탭 3.', colors),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // --- Vertical (pill) ---
          _section('Vertical (pill)', colors),
          SizedBox(
            height: 180,
            child: ShUiTabs(
              orientation: ShUiTabsOrientation.vertical,
              variant: ShUiTabsVariant.pill,
              tabs: [
                ShUiTab(
                  label: '계정',
                  icon: const Icon(Icons.person_outline),
                  child: _tabContent('계정 설정 내용.', colors),
                ),
                ShUiTab(
                  label: '알림',
                  icon: const Icon(Icons.notifications_none),
                  child: _tabContent('알림 설정 내용.', colors),
                ),
                ShUiTab(
                  label: '보안',
                  icon: const Icon(Icons.lock_outline),
                  child: _tabContent('보안 설정 내용.', colors),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabContent(String text, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Text(
        text,
        style: TextStyle(color: colors.foreground, fontSize: 14),
      ),
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
