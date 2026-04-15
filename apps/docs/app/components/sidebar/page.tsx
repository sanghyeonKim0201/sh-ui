import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { SidebarBasicDemo } from "./_demos/basic";
import { SidebarTOCDemo } from "./_demos/toc";

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
        <CodePanel
          language="tsx"
          code={`<SidebarProvider>
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
</SidebarProvider>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx hyeon add sidebar`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/sidebar/</code>로 복사하고, 아이콘 의존성을 설치한다.
      </p>
      <CodePanel language="bash" showLineNumbers={false} code={`pnpm add lucide-react`} />
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`// app/layout.tsx
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
}`}
      />

      <CodePanel
        language="tsx"
        code={`// components/app-sidebar.tsx
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
}`}
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
        <CodePanel
          language="tsx"
          code={`<Sidebar collapsible="icon">...</Sidebar>`}
        />
      </Preview>

      <h3>Variant: floating</h3>
      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo variant="floating" />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Sidebar variant="floating">...</Sidebar>`}
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
        <CodePanel
          language="tsx"
          code={`<SidebarTOC sectionIds={["intro", "install", "usage"]}>
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
</SidebarTOC>`}
        />
      </Preview>

      <h3>Collapsible: none (always open)</h3>
      <Preview>
        <Preview.Demo>
          <SidebarBasicDemo collapsible="none" />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Sidebar collapsible="none">...</Sidebar>`}
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
          { name: "SidebarCollapsible", description: "메뉴 항목 펼침/접힘 그룹." },
          { name: "SidebarCollapsibleTrigger", description: "토글 트리거 (chevron 자동)." },
          { name: "SidebarCollapsibleContent", description: "접힘 시 숨겨지는 컨텐츠." },
          { name: "SidebarTOC", description: "페이지 내 섹션 스크롤을 감지해 활성 메뉴를 자동 전환 (Table of Contents)." },
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

      <h3>useSidebar()</h3>
      <p className="muted">
        Provider 하위에서 상태를 직접 다룰 때 사용. 반환값: <code>state</code>, <code>open</code>, <code>setOpen</code>, <code>openMobile</code>, <code>setOpenMobile</code>, <code>isMobile</code>, <code>toggleSidebar</code>.
      </p>

    </main>
  );
}
