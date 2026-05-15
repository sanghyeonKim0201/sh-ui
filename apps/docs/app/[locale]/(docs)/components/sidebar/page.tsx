export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
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
import { VariantSource } from "@/components/variant-source";
import { SidebarMixedDemo, SidebarPanelDemo } from "./_demos/panel";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { SidebarLiveDemo } from "./sidebar-live-demo";

const sources = loadComponentSources("sidebar");

export default function SidebarPage() {
  return (
    <main className="container">
      <h1>Sidebar</h1>
      <p className="muted">
        앱 좌/우측에 고정되는 네비게이션 영역. Provider로 상태를 관리하고 쿠키로 영속화한다. Cmd/Ctrl+B 단축키 내장.
      </p>

      <SidebarLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add sidebar`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add sidebar

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_sidebar.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="sidebar" />
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

      <h3>Mode: 반응형 drawer (Flutter)</h3>
      <p className="muted">
        Flutter <code>ShUiSidebar</code>는 <code>mode</code> 파라미터로 배치 방식을 제어한다. 기본값 <code>auto</code>는 React의 반응형 동작을 그대로 따라 — 화면 폭이 <code>breakpoint.md</code>(768px) 미만이면 자동으로 backdrop + 슬라이드 drawer로 바뀐다. drawer 모드에서는 사이드바가 숨겨져 있으니 <code>ShUiSidebarTrigger</code>는 AppBar 등 바깥에 둬야 한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "auto",
            label: "auto (기본)",
            language: "dart",
            code: `// 화면 폭 ≥ breakpoint.md → inline
// 미만 → drawer (backdrop + 슬라이드)
ShUiSidebarProvider(
  child: Scaffold(
    appBar: AppBar(
      leading: const ShUiSidebarTrigger(),  // drawer 모드 대비 바깥에 배치
      title: const Text('내 앱'),
    ),
    body: Row(children: [
      ShUiSidebar(
        mode: ShUiSidebarMode.auto,         // 기본값이므로 생략 가능
        children: const [/* ... */],
      ),
      const Expanded(child: mainContent),
    ]),
  ),
)`,
          },
          {
            value: "drawer",
            label: "drawer (강제)",
            language: "dart",
            code: `// 데스크탑에서도 항상 drawer로 쓰고 싶을 때
ShUiSidebar(
  mode: ShUiSidebarMode.drawer,
  children: const [/* ... */],
)`,
          },
          {
            value: "inline",
            label: "inline (강제)",
            language: "dart",
            code: `// 좁은 화면에서도 항상 Row에 고정하고 싶을 때
ShUiSidebar(
  mode: ShUiSidebarMode.inline,
  children: const [/* ... */],
)`,
          },
        ]}
      />

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
              code: `// Flutter ShUiSidebar는 variant 파라미터를 지원한다: sidebar / floating / inset.
ShUiSidebarProvider(
  child: Row(children: [
    ShUiSidebar(
      variant: ShUiSidebarVariant.floating,
      children: const [/* ... */],
    ),
    const Expanded(child: mainContent),
  ]),
)`,
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
      <SidebarMenuButton sectionId="intro" render={<a href="#intro">Intro</a>} />
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton sectionId="install" render={<a href="#install">Install</a>} />
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton sectionId="usage" render={<a href="#usage">Usage</a>} />
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarTOC>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 ShUiSidebarTOC + ShUiSidebarTOCItem 로 트리형 TOC를 제공한다.
// (IntersectionObserver 없으므로 activeId는 호출자가 ScrollController 등으로 관리)
ShUiSidebarTOC(
  activeId: _activeId,
  onItemTap: (id) => _scrollTo(id),
  items: const [
    ShUiSidebarTOCItem(id: 'intro', label: 'Intro'),
    ShUiSidebarTOCItem(id: 'usage', label: 'Usage', children: [
      ShUiSidebarTOCItem(id: 'usage-basic', label: 'Basic'),
      ShUiSidebarTOCItem(id: 'usage-advanced', label: 'Advanced'),
    ]),
    ShUiSidebarTOCItem(id: 'api', label: 'API'),
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
              code: `// ShUiSidebarItem(panelId: ...) + ShUiSidebarPanel(panelId: ...) 조합.
// activePanelId는 ShUiSidebarProvider가 관리하고, 아이템 탭 시 토글된다.
ShUiSidebarProvider(
  defaultOpen: false,
  collapsedWidth: 56,
  child: Row(children: [
    ShUiSidebar(children: const [
      ShUiSidebarItem(icon: Icons.search, label: '검색', panelId: 'search'),
      ShUiSidebarItem(icon: Icons.folder_outlined, label: '탐색기', panelId: 'explorer'),
    ]),
    ShUiSidebarPanel(
      panelId: 'search',
      child: SearchPanelBody(),
    ),
    ShUiSidebarPanel(
      panelId: 'explorer',
      child: ExplorerPanelBody(),
    ),
    const Expanded(child: mainContent),
  ]),
)`,
            },
          ]}
        />
      </Preview>

      <h3>일반 메뉴 + 보조 패널 혼합</h3>
      <p className="muted">
        한 <code>SidebarMenu</code> 안에서 <strong>페이지 이동 버튼</strong>과 <strong>패널 트리거</strong>를 섞어 쓸 수 있습니다. <code>panelId</code>를 주면 보조 패널을 열고, 주지 않으면 일반 버튼으로 동작(링크는 <code>render</code> prop 으로 Next Link 슬롯).
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
    <SidebarMenuButton
      isActive={pathname === "/"}
      render={<Link href="/"><HomeIcon /><span>홈</span></Link>}
    />
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
              code: `// 라우팅 항목과 panelId 트리거를 한 그룹에 혼합.
ShUiSidebarGroup(
  label: '탐색',
  children: [
    ShUiSidebarItem(
      icon: Icons.home,
      label: '홈',
      isActive: _route == '/',
      onTap: () => context.go('/'),
    ),
    // panelId 지정 → activePanelId로 자동 활성 판정
    ShUiSidebarItem(
      icon: Icons.search,
      label: '검색',
      panelId: 'search',
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>중첩 서브메뉴 (MenuSub)</h3>
      <p className="muted">
        메뉴 항목에 하위 항목을 넣어 펼침/접힘 동작으로 표시한다. React는 <code>SidebarMenuSub</code> 컴포넌트, Flutter는 <code>ShUiSidebarItem.children</code> 파라미터를 사용한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton>프로젝트</SidebarMenuButton>
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton href="#web">Web</SidebarMenuSubButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton href="#mobile">Mobile</SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuItem>
</SidebarMenu>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// ShUiSidebarItem(children: [...]) 로 서브메뉴 구성.
// 탭 시 chevron 회전 + AnimatedSize로 펼침/접힘된다.
ShUiSidebarItem(
  icon: Icons.work_outline,
  label: '프로젝트',
  children: [
    ShUiSidebarItem(label: 'Web', onTap: () => context.go('/web')),
    ShUiSidebarItem(label: 'Mobile', onTap: () => context.go('/mobile')),
    ShUiSidebarItem(
      label: 'Internal',
      children: [
        ShUiSidebarItem(label: 'Admin', onTap: () => context.go('/admin')),
        ShUiSidebarItem(label: 'Analytics', onTap: () => context.go('/analytics')),
      ],
    ),
  ],
)`,
          },
        ]}
      />

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
          { name: "SidebarMenuButton", description: "메뉴 버튼. render prop 으로 Link 등과 결합." },
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
          { prop: "render", type: "React.ReactElement", description: "다른 엘리먼트(예: Next Link)로 대체. cloneElement 로 props/className/ref 자동 머지." },
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

      <h2>접근성</h2>
      <ul>
        <li>모바일 드로어 — <code>role=&quot;dialog&quot;</code> + <code>aria-modal=&quot;true&quot;</code> + 포커스 트랩(<code>Tab</code> 순환 경계), <code>Esc</code> 닫기, 열기 트리거로 포커스 복귀</li>
        <li>데스크탑 collapsible — <code>SidebarCollapsibleTrigger</code>가 <code>aria-expanded</code> 자동 관리</li>
        <li>드로어 backdrop은 <code>aria-hidden</code> 처리</li>
        <li>menu-button / menu-sub-button은 네이티브 <code>&lt;a&gt;</code> 또는 <code>&lt;button&gt;</code> 시맨틱을 유지 (<code>render</code> prop 으로 Next Link 래핑 가능)</li>
      </ul>

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        Sidebar 는 <code>--sidebar-width</code>·<code>--sidebar-bg</code>·
        <code>--sidebar-fg</code> 등 cascade 변수를 노출한다 (다수 내부 rule 에서
        DRY 재사용 + 후손 cascade 가 필요한 케이스 — 예외 정당). 그 외 일반적인
        스타일 조정은 <code>style</code> / <code>className</code> 으로 직접 —
        <a href="/guidelines">가이드라인</a> 의 "스타일 커스터마이즈" 섹션 참조.
      </p>
    </main>
  );
}
