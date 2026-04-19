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
  ShUiSidebarVariant _variant = ShUiSidebarVariant.sidebar;
  String _tocActiveId = 'intro';

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
      body: SingleChildScrollView(
        padding: EdgeInsets.all(shUi.spacing.s4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _sectionTitle('기본 + Variant 스위처', shUi),
            _variantSwitcher(shUi),
            const SizedBox(height: 8),
            SizedBox(
              height: 500,
              child: _buildBasicDemo(shUi, colors),
            ),
            const SizedBox(height: 32),
            _sectionTitle('TOC (Table of Contents)', shUi),
            SizedBox(
              height: 360,
              child: _buildTOCDemo(shUi, colors),
            ),
            const SizedBox(height: 32),
            _sectionTitle('SidebarPanel (보조 확장 패널)', shUi),
            SizedBox(
              height: 360,
              child: _buildPanelDemo(shUi, colors),
            ),
            const SizedBox(height: 32),
            _sectionTitle('중첩 MenuSub (children 확장)', shUi),
            SizedBox(
              height: 420,
              child: _buildMenuSubDemo(shUi, colors),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String label, ShUiTheme shUi) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s2),
      child: Text(
        label,
        style: TextStyle(
          color: shUi.colors.foreground,
          fontSize: shUi.text.lg,
          fontWeight: shUi.weight.semibold,
        ),
      ),
    );
  }

  Widget _variantSwitcher(ShUiTheme shUi) {
    return Wrap(
      spacing: shUi.spacing.s3,
      children: [
        for (final v in ShUiSidebarVariant.values)
          InkWell(
            onTap: () => setState(() => _variant = v),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Radio<ShUiSidebarVariant>(
                  value: v,
                  groupValue: _variant,
                  onChanged: (value) =>
                      setState(() => _variant = value ?? ShUiSidebarVariant.sidebar),
                ),
                Text(
                  v.name,
                  style: TextStyle(
                    color: shUi.colors.foreground,
                    fontSize: shUi.text.sm,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildBasicDemo(ShUiTheme shUi, ShUiColorTokens colors) {
    final isInset = _variant == ShUiSidebarVariant.inset;
    final sidebar = ShUiSidebar(
      variant: _variant,
      header: ShUiSidebarHeader(
        child: Builder(
          builder: (context) {
            final isOpen = useSidebar(context)?.open ?? true;
            if (!isOpen) {
              return const Center(child: ShUiSidebarTrigger());
            }
            return Row(
              children: [
                Icon(Icons.hexagon_outlined, size: 20, color: colors.foreground),
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
              child: Icon(Icons.person, size: 16, color: colors.foregroundMuted),
            );
            if (!isOpen) return Center(child: avatar);
            return Row(
              children: [
                avatar,
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '사용자',
                    style: TextStyle(color: colors.foreground, fontSize: 13),
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
              icon: Icons.notifications_outlined,
              label: '알림',
              isActive: _activeItem == '알림',
              onTap: () => setState(() => _activeItem = '알림'),
            ),
          ],
        ),
      ],
    );

    Widget mainArea = Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.touch_app_outlined, size: 48, color: colors.foregroundMuted),
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
            'variant: ${_variant.name}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),
        ],
      ),
    );

    return Container(
      decoration: BoxDecoration(
        color: isInset ? colors.backgroundSubtle : colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      clipBehavior: Clip.antiAlias,
      child: ShUiSidebarProvider(
        child: Row(
          children: [
            sidebar,
            if (isInset)
              ShUiSidebarInset(child: mainArea)
            else
              Expanded(child: mainArea),
          ],
        ),
      ),
    );
  }

  Widget _buildTOCDemo(ShUiTheme shUi, ShUiColorTokens colors) {
    const tocItems = [
      ShUiSidebarTOCItem(id: 'intro', label: 'Intro'),
      ShUiSidebarTOCItem(
        id: 'usage',
        label: 'Usage',
        children: [
          ShUiSidebarTOCItem(id: 'usage-basic', label: 'Basic'),
          ShUiSidebarTOCItem(id: 'usage-advanced', label: 'Advanced'),
        ],
      ),
      ShUiSidebarTOCItem(id: 'api', label: 'API'),
      ShUiSidebarTOCItem(id: 'faq', label: 'FAQ'),
    ];

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      clipBehavior: Clip.antiAlias,
      child: ShUiSidebarProvider(
        child: Row(
          children: [
            ShUiSidebar(
              header: const ShUiSidebarHeader(
                child: Text(
                  'On this page',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              children: [
                ShUiSidebarTOC(
                  items: tocItems,
                  activeId: _tocActiveId,
                  onItemTap: (id) => setState(() => _tocActiveId = id),
                ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(shUi.spacing.s6),
                child: Text(
                  '활성 섹션 id: $_tocActiveId',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.base,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPanelDemo(ShUiTheme shUi, ShUiColorTokens colors) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      clipBehavior: Clip.antiAlias,
      child: ShUiSidebarProvider(
        defaultOpen: false,
        collapsedWidth: 56,
        child: Row(
          children: [
            ShUiSidebar(
              children: [
                ShUiSidebarItem(
                  icon: Icons.search,
                  label: '검색',
                  panelId: 'search',
                ),
                ShUiSidebarItem(
                  icon: Icons.folder_outlined,
                  label: '탐색기',
                  panelId: 'explorer',
                ),
                ShUiSidebarItem(
                  icon: Icons.extension_outlined,
                  label: '확장',
                  panelId: 'extensions',
                ),
              ],
            ),
            ShUiSidebarPanel(
              panelId: 'search',
              child: _panelBody('검색', '검색어를 입력해 보세요.', colors, shUi),
            ),
            ShUiSidebarPanel(
              panelId: 'explorer',
              child: _panelBody('탐색기', '파일 트리가 여기에 표시됩니다.', colors, shUi),
            ),
            ShUiSidebarPanel(
              panelId: 'extensions',
              child: _panelBody('확장', '설치된 확장 프로그램 목록.', colors, shUi),
            ),
            Expanded(
              child: Center(
                child: Builder(
                  builder: (context) {
                    final active = useSidebar(context)?.activePanelId;
                    return Text(
                      active == null ? '레일 버튼을 눌러 패널 열기' : '패널: $active',
                      style: TextStyle(
                        color: colors.foregroundMuted,
                        fontSize: shUi.text.sm,
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _panelBody(
    String title,
    String body,
    ShUiColorTokens colors,
    ShUiTheme shUi,
  ) {
    return Padding(
      padding: EdgeInsets.all(shUi.spacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.base,
              fontWeight: shUi.weight.semibold,
            ),
          ),
          SizedBox(height: shUi.spacing.s2),
          Text(
            body,
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: shUi.text.sm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSubDemo(ShUiTheme shUi, ShUiColorTokens colors) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      clipBehavior: Clip.antiAlias,
      child: ShUiSidebarProvider(
        child: Row(
          children: [
            ShUiSidebar(
              header: const ShUiSidebarHeader(
                child: Text(
                  '중첩 메뉴',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              children: [
                ShUiSidebarGroup(
                  label: '탐색',
                  children: [
                    ShUiSidebarItem(
                      icon: Icons.home_outlined,
                      label: '홈',
                      isActive: _activeItem == '홈',
                      onTap: () => setState(() => _activeItem = '홈'),
                    ),
                    ShUiSidebarItem(
                      icon: Icons.work_outline,
                      label: '프로젝트',
                      children: [
                        ShUiSidebarItem(
                          label: 'Web',
                          isActive: _activeItem == 'Web',
                          onTap: () => setState(() => _activeItem = 'Web'),
                        ),
                        ShUiSidebarItem(
                          label: 'Mobile',
                          isActive: _activeItem == 'Mobile',
                          onTap: () => setState(() => _activeItem = 'Mobile'),
                        ),
                        ShUiSidebarItem(
                          label: 'Internal',
                          children: [
                            ShUiSidebarItem(
                              label: 'Admin',
                              isActive: _activeItem == 'Admin',
                              onTap: () =>
                                  setState(() => _activeItem = 'Admin'),
                            ),
                            ShUiSidebarItem(
                              label: 'Analytics',
                              isActive: _activeItem == 'Analytics',
                              onTap: () =>
                                  setState(() => _activeItem = 'Analytics'),
                            ),
                          ],
                        ),
                      ],
                    ),
                    ShUiSidebarItem(
                      icon: Icons.settings_outlined,
                      label: '설정',
                      isActive: _activeItem == '설정',
                      onTap: () => setState(() => _activeItem = '설정'),
                    ),
                  ],
                ),
              ],
            ),
            Expanded(
              child: Center(
                child: Text(
                  '선택된 메뉴: $_activeItem',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.base,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
