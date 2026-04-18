export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { SidebarBasicDemo } from "./_demos/basic";
import { SidebarTOCDemo } from "./_demos/toc";
import {
  SidebarHeaderlessFloatingDemo,
  SidebarHeaderlessIconDemo,
  SidebarHeaderlessInsideDemo,
} from "./_demos/headerless";
import { SidebarMixedDemo, SidebarPanelDemo } from "./_demos/panel";

export default function SidebarPage() {
  return (
    <main className="container">
      <h1>Sidebar</h1>
      <p className="muted">
        앱 좌/우측에 고정되는 네비게이션 영역. Provider로 상태를 관리하고 쿠키로 영속화한다. Cmd/Ctrl+B 단축키 내장.
      </p>

      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<SidebarProvider>
  <Sidebar>
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <HomeIcon />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>...</SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    {children}
  </SidebarInset>
</SidebarProvider>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiSidebarProvider(
  child: Row(
    children: [
      ShUiSidebar(
        header: ShUiSidebarHeader(
          child: Builder(
            builder: (context) {
              final isOpen = useSidebar(context)?.open ?? true;
              if (!isOpen) return const Center(child: ShUiSidebarTrigger());
              return Row(children: const [
                Text('sh-ui'),
                Spacer(),
                ShUiSidebarTrigger(),
              ]);
            },
          ),
        ),
        footer: const ShUiSidebarFooter(child: Text('v0.1.0')),
        children: [
          ShUiSidebarGroup(
            label: 'Application',
            children: [
              ShUiSidebarItem(
                icon: Icons.home,
                label: 'Home',
                isActive: true,
                onTap: () {},
              ),
            ],
          ),
        ],
      ),
      Expanded(child: mainContent),
    ],
  ),
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add sidebar`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add sidebar

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_sidebar.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/sidebar/</code>로 복사하고, 아이콘 의존성을 설치한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add lucide-react`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `# Flutter는 Material 아이콘(Icons.*)을 기본 제공 — 별도 의존성 없음
# packages/registry/flutter/widgets/sh_ui_sidebar.dart → lib/widgets/`,
          },
        ]}
      />
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `// app/layout.tsx
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// main_layout.dart
Scaffold(
  body: ShUiSidebarProvider(
    child: Row(
      children: [
        const AppSidebar(),
        Expanded(child: body),
      ],
    ),
  ),
)`,
          },
        ]}
      />

      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `// components/app-sidebar.tsx
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// app_sidebar.dart
class AppSidebar extends StatelessWidget {
  const AppSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return ShUiSidebar(
      header: const ShUiSidebarHeader(child: Text('sh-ui')),
      footer: const ShUiSidebarFooter(child: Text('v0.1.0')),
      children: [
        ShUiSidebarGroup(
          label: '메뉴',
          children: [
            ShUiSidebarItem(icon: Icons.home, label: '홈', onTap: () {}),
          ],
        ),
      ],
    );
  }
}`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Collapsible: icon</h3>
      <p className="muted">
        접혔을 때 아이콘만 남는 형태. 라벨/서브메뉴는 자동 숨김.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo collapsible="icon" />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar collapsible="icon">...</Sidebar>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSidebar는 Provider의 open 상태에 따라 자동으로
// collapsedWidth(기본 56)까지 폭을 줄이고 아이콘만 표시한다.
ShUiSidebarProvider(
  defaultOpen: false,
  collapsedWidth: 56,
  child: ShUiSidebar(
    children: [
      ShUiSidebarItem(icon: Icons.home, label: '홈', onTap: () {}),
    ],
  ),
)`,
            },
          ]}
        />
      </Preview>

      <h3>Variant: floating</h3>
      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo variant="floating" />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar variant="floating">...</Sidebar>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSidebar는 variant 파라미터를 제공하지 않는다.
// 플로팅 스타일이 필요하면 Container/decoration 으로 감싸 커스터마이즈한다.`,
            },
          ]}
        />
      </Preview>

      <h3>TOC (Table of Contents — 스크롤 기반 활성화)</h3>
      <p className="muted">
        문서 페이지처럼 하나의 페이지 안에서 섹션을 나눠 쓸 때 사용한다. <code>SidebarTOC</code>로 감싸고, 각 메뉴 버튼에
        <code> sectionId</code>만 넘기면 IntersectionObserver로 현재 뷰포트의 섹션을 감지해 자동으로 활성화해준다.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarTOCDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<SidebarTOC sectionIds={["intro", "install", "usage"]}>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton sectionId="intro" asChild>
        <a href="#intro">Intro</a>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton sectionId="install" asChild>
        <a href="#install">Install</a>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton sectionId="usage" asChild>
        <a href="#usage">Usage</a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarTOC>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSidebar는 TOC(스크롤 기반 자동 활성화)를 기본 제공하지 않는다.
// ScrollController + VisibilityDetector로 직접 활성 섹션을 추적해
// ShUiSidebarItem(isActive: ...) 에 반영한다.
ShUiSidebarGroup(
  label: 'On this page',
  children: [
    ShUiSidebarItem(
      label: 'Intro',
      isActive: _activeId == 'intro',
      onTap: () => _scrollTo('intro'),
    ),
    ShUiSidebarItem(
      label: 'Install',
      isActive: _activeId == 'install',
      onTap: () => _scrollTo('install'),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>헤더 없는 레이아웃의 트리거 배치</h3>
      <p className="muted">
        페이지 상단에 별도 헤더가 없을 때 <code>SidebarTrigger</code>를 어디에 둘지에 대한 세 가지 패턴.
      </p>

      <h4>1. 사이드바 내부 상단에 배치</h4>
      <p className="muted">
        <code>SidebarHeader</code> 안에 브랜드 마크와 함께 트리거를 두면, 메인 영역에 헤더를 만들 필요가 없다.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarHeaderlessInsideDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar>
  <SidebarHeader>
    <div className="flex items-center justify-between">
      <span>sh-ui</span>
      <SidebarTrigger />   {/* 닫기 */}
    </div>
  </SidebarHeader>
  <SidebarContent>...</SidebarContent>
</Sidebar>
<SidebarInset>
  <OpenTrigger />          {/* 열기 — 닫혔을 때만 노출 */}
  {children}
</SidebarInset>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// useSidebar(context).open 으로 상태를 확인해 열림/닫힘 UI를 분기.
ShUiSidebar(
  header: ShUiSidebarHeader(
    child: Builder(
      builder: (context) {
        final isOpen = useSidebar(context)?.open ?? true;
        if (!isOpen) return const Center(child: ShUiSidebarTrigger());
        return Row(children: const [
          Text('sh-ui'),
          Spacer(),
          ShUiSidebarTrigger(),
        ]);
      },
    ),
  ),
  children: const [/* ... */],
)`,
            },
          ]}
        />
      </Preview>

      <h4>2. Floating 트리거</h4>
      <p className="muted">
        사이드바가 닫혔을 때 메인 영역 좌상단에 떠 있는 버튼 하나로 노출. 배경이 비어 허전해 보이는 걸 감수하되, 레이아웃을 완전히 비우고 싶을 때.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarHeaderlessFloatingDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// 닫힘: Inset 좌상단 floating / 열림: 사이드바 헤더 안의 트리거로 닫기
<Sidebar>
  <SidebarHeader>
    <SidebarTrigger />
  </SidebarHeader>
  <SidebarContent>...</SidebarContent>
</Sidebar>
<SidebarInset>
  <OpenTrigger />
  {children}
</SidebarInset>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Stack으로 메인 영역 좌상단에 트리거를 플로팅으로 올린다.
ShUiSidebarProvider(
  defaultOpen: false,
  child: Row(children: [
    ShUiSidebar(
      header: const ShUiSidebarHeader(child: ShUiSidebarTrigger()),
      children: const [/* ... */],
    ),
    Expanded(
      child: Stack(children: [
        mainContent,
        Positioned(
          top: 8,
          left: 8,
          child: Builder(
            builder: (context) {
              final isOpen = useSidebar(context)?.open ?? false;
              if (isOpen) return const SizedBox.shrink();
              return const ShUiSidebarTrigger();
            },
          ),
        ),
      ]),
    ),
  ]),
)`,
            },
          ]}
        />
      </Preview>

      <h4>3. Icon-only 레일</h4>
      <p className="muted">
        <code>collapsible=&quot;icon&quot;</code>으로 두면 닫아도 아이콘 레일이 남아 허전함이 없다. 헤더 없는 앱에 가장 자연스러운 기본값.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarHeaderlessIconDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar collapsible="icon">
  <SidebarHeader>
    <SidebarTrigger />
  </SidebarHeader>
  <SidebarContent>...</SidebarContent>
</Sidebar>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter에서는 Provider의 collapsedWidth가 기본 아이콘 레일 역할.
ShUiSidebarProvider(
  defaultOpen: false,
  collapsedWidth: 56,
  child: ShUiSidebar(
    header: const ShUiSidebarHeader(child: ShUiSidebarTrigger()),
    children: [
      ShUiSidebarItem(icon: Icons.home, label: '홈', onTap: () {}),
      ShUiSidebarItem(icon: Icons.settings, label: '설정', onTap: () {}),
    ],
  ),
)`,
            },
          ]}
        />
      </Preview>

      <h3>레일 + 보조 패널 (SidebarPanel)</h3>
      <p className="muted">
        네이버 지도·VS Code 활동 바 같은 <strong>모드 전환기</strong> 패턴. 좁은 아이콘 레일의 버튼을 누르면 바로 옆에 <code>SidebarPanel</code>이 펼쳐지고, 같은 버튼을 다시 누르거나 패널의 × 버튼을 누르면 닫힙니다. 한 번에 하나의 패널만 활성.
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarPanelDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar collapsible="icon">
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton panelId="search">
        <SearchIcon /><span>검색</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</Sidebar>

<SidebarPanel id="search">
  <SidebarPanelHeader>검색</SidebarPanelHeader>
  <SidebarPanelContent>...</SidebarPanelContent>
</SidebarPanel>

<SidebarInset>{children}</SidebarInset>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSidebar는 panelId / SidebarPanel을 기본 제공하지 않는다.
// 직접 상태(activePanel)를 관리해 Row에 추가 패널 위젯을 렌더한다.
String? _activePanel;

Row(children: [
  ShUiSidebar(
    children: [
      ShUiSidebarItem(
        icon: Icons.search,
        label: '검색',
        isActive: _activePanel == 'search',
        onTap: () => setState(() {
          _activePanel = _activePanel == 'search' ? null : 'search';
        }),
      ),
    ],
  ),
  if (_activePanel == 'search')
    SizedBox(width: 280, child: SearchPanel(onClose: () => setState(() => _activePanel = null))),
  Expanded(child: mainContent),
])`,
            },
          ]}
        />
      </Preview>

      <h3>일반 메뉴 + 보조 패널 혼합</h3>
      <p className="muted">
        한 <code>SidebarMenu</code> 안에서 <strong>페이지 이동 버튼</strong>과 <strong>패널 트리거</strong>를 섞어 쓸 수 있습니다. <code>panelId</code>를 주면 보조 패널을 열고, 주지 않으면 일반 버튼으로 동작(링크는 <code>asChild</code>).
      </p>
      <Preview>
        <Preview.Demo>
          <SidebarMixedDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<SidebarMenu>
  {/* 라우팅 */}
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={pathname === "/"}>
      <Link href="/"><HomeIcon /><span>홈</span></Link>
    </SidebarMenuButton>
  </SidebarMenuItem>

  {/* 보조 패널 */}
  <SidebarMenuItem>
    <SidebarMenuButton panelId="search">
      <SearchIcon /><span>검색</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
</SidebarMenu>

<SidebarPanel id="search">...</SidebarPanel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 라우팅 항목과 패널 트리거를 한 그룹에 섞어 배치.
ShUiSidebarGroup(
  label: '탐색',
  children: [
    ShUiSidebarItem(
      icon: Icons.home,
      label: '홈',
      isActive: _route == '/',
      onTap: () => context.go('/'),
    ),
    ShUiSidebarItem(
      icon: Icons.search,
      label: '검색',
      isActive: _activePanel == 'search',
      onTap: () => setState(() {
        _activePanel = _activePanel == 'search' ? null : 'search';
      }),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>Collapsible: none (always open)</h3>
      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo collapsible="none" />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Sidebar collapsible="none">...</Sidebar>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 토글을 노출하지 않으면 사이드바는 항상 열린 상태로 유지된다.
ShUiSidebarProvider(
  defaultOpen: true,
  child: Row(children: [
    ShUiSidebar(children: const [/* ... */]),
    Expanded(child: mainContent),
  ]),
)`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "SidebarProvider", description: "사이드바 상태/쿠키/단축키를 관리하는 루트." },
          { name: "Sidebar", description: "사이드바 본체. side / variant / collapsible 지원." },
          { name: "SidebarTrigger", description: "토글 버튼 (Cmd/Ctrl+B 단축키와 동일 동작)." },
          { name: "SidebarInset", description: "사이드바 옆 메인 컨텐츠 영역." },
          { name: "SidebarHeader", description: "사이드바 상단 영역." },
          { name: "SidebarContent", description: "스크롤 가능한 본문 영역." },
          { name: "SidebarFooter", description: "사이드바 하단 영역." },
          { name: "SidebarSeparator", description: "구분선." },
          { name: "SidebarGroup", description: "메뉴 그룹 컨테이너." },
          { name: "SidebarGroupLabel", description: "그룹 라벨." },
          { name: "SidebarGroupContent", description: "그룹 내부 콘텐츠 래퍼." },
          { name: "SidebarMenu", description: "메뉴 ul." },
          { name: "SidebarMenuItem", description: "메뉴 li." },
          { name: "SidebarMenuButton", description: "메뉴 버튼. asChild로 Link 등과 결합 가능." },
          { name: "SidebarMenuSub", description: "서브 메뉴 ul (들여쓰기 + 좌측 라인)." },
          { name: "SidebarMenuSubItem", description: "서브 메뉴 li." },
          { name: "SidebarMenuSubButton", description: "서브 메뉴 버튼/링크." },
          { name: "SidebarCollapsible", description: "메뉴 항목 펼침/접힘 그룹. 접힌 icon 사이드바에서는 Popover 플라이아웃으로 자동 전환." },
          { name: "SidebarCollapsibleTrigger", description: "토글 트리거 (chevron 자동)." },
          { name: "SidebarCollapsibleContent", description: "접힘 시 숨겨지는 컨텐츠. icon 모드에선 Popover로 렌더." },
          { name: "SidebarTOC", description: "페이지 내 섹션 스크롤을 감지해 활성 메뉴를 자동 전환 (Table of Contents)." },
          { name: "SidebarPanel", description: "레일 버튼(panelId)과 짝지어 펼쳐지는 보조 패널. 한 번에 하나만 활성." },
          { name: "SidebarPanelHeader", description: "보조 패널의 상단 영역 (타이틀 등)." },
          { name: "SidebarPanelContent", description: "보조 패널의 스크롤 가능한 본문 영역." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>SidebarProvider</h3>
      <p className="muted">사이드바 상태를 관리한다. 앱 루트 또는 레이아웃에 한 번만 둔다.</p>
      <PropsTable
        rows={[
          { prop: "defaultOpen", type: "boolean", default: "true", description: "초기 열림 상태." },
          { prop: "open", type: "boolean", description: "제어 모드. 외부에서 상태를 직접 관리할 때." },
          { prop: "onOpenChange", type: "(open: boolean) => void", description: "제어 모드용 상태 변경 콜백." },
          { prop: "embedded", type: "boolean", description: "부모 컨테이너 안에 임베드 (문서 데모용)." },
        ]}
      />

      <h3>Sidebar</h3>
      <PropsTable
        rows={[
          { prop: "side", type: `"left" | "right"`, default: `"left"`, description: "사이드바 위치." },
          { prop: "variant", type: `"sidebar" | "floating" | "inset"`, default: `"sidebar"`, description: "외형 변형." },
          { prop: "collapsible", type: `"offcanvas" | "icon" | "none"`, default: `"offcanvas"`, description: "접힘 동작. icon은 폭만 줄임, offcanvas는 완전히 사라짐." },
        ]}
      />

      <h3>SidebarMenuButton</h3>
      <PropsTable
        rows={[
          { prop: "isActive", type: "boolean", description: "활성 상태 표시. 명시되면 sectionId보다 우선한다." },
          { prop: "sectionId", type: "string", description: "SidebarTOC 안에서 활성 섹션 id와 같을 때 자동 활성화." },
          { prop: "panelId", type: "string", description: "클릭 시 같은 id의 SidebarPanel을 토글. activePanel이 일치하면 자동 활성화." },
          { prop: "size", type: `"sm" | "md" | "lg"`, default: `"md"` },
          { prop: "asChild", type: "boolean", description: "단일 자식 엘리먼트(예: Next Link)에 props를 합쳐 전달." },
        ]}
      />

      <h3>SidebarMenuSubButton</h3>
      <PropsTable
        rows={[
          { prop: "isActive", type: "boolean" },
          { prop: "sectionId", type: "string", description: "SidebarTOC 안에서 활성 섹션 id와 같을 때 자동 활성화." },
          { prop: "size", type: `"sm" | "md"`, default: `"md"` },
        ]}
      />

      <h3>SidebarTOC</h3>
      <p className="muted">
        페이지 내 섹션을 관측해 현재 보이는 섹션 id를 하위 메뉴 버튼의 <code>sectionId</code>에 전달한다. 내부적으로
        IntersectionObserver를 사용한다.
      </p>
      <PropsTable
        rows={[
          { prop: "sectionIds", type: "string[]", description: "감시할 섹션의 DOM id 목록 (문서 등장 순서)." },
          { prop: "rootMargin", type: "string", default: `"-20% 0px -70% 0px"`, description: "IntersectionObserver rootMargin. 활성 전환 시점 조절." },
          { prop: "root", type: "Element | null", default: "null", description: "스크롤 컨테이너. 기본은 viewport." },
          { prop: "defaultActiveId", type: "string", description: "초기 활성 섹션. 기본은 sectionIds[0]." },
          { prop: "onActiveChange", type: "(id?: string) => void", description: "활성 섹션 변경 콜백 (URL 해시 동기화 등)." },
        ]}
      />

      <h3>SidebarPanel</h3>
      <PropsTable
        rows={[
          { prop: "id", type: "string", description: "SidebarMenuButton의 panelId와 매칭되는 식별자." },
        ]}
      />

      <h3>useSidebar()</h3>
      <p className="muted">
        Provider 하위에서 상태를 직접 다룰 때 사용. 반환값: <code>state</code>, <code>open</code>, <code>setOpen</code>, <code>openMobile</code>, <code>setOpenMobile</code>, <code>isMobile</code>, <code>toggleSidebar</code>, <code>activePanel</code>, <code>setActivePanel</code>.
      </p>

    </main>
  );
}
