"use client";

import { HomeIcon, InboxIcon, SettingsIcon, UserIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", icon: HomeIcon },
  { title: "Inbox", icon: InboxIcon },
  { title: "Profile", icon: UserIcon },
  { title: "Settings", icon: SettingsIcon },
];

const frameStyle: React.CSSProperties = {
  width: "100%",
  height: 280,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  overflow: "hidden",
  position: "relative",
};

function SidebarBody() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item, i) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={i === 0}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// 닫혔을 때만 Inset 좌상단에 떠 있는 트리거
function OpenTrigger() {
  const { open } = useSidebar();
  if (open) return null;
  return (
    <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", zIndex: 1 }}>
      <SidebarTrigger />
    </div>
  );
}

// 1) 사이드바 내부 상단에 트리거 배치 (닫기) + Inset floating 트리거 (열기)
export function SidebarHeaderlessInsideDemo() {
  return (
    <div style={frameStyle}>
      <SidebarProvider embedded>
        <Sidebar>
          <SidebarHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.25rem 0.5rem",
              }}
            >
              <span style={{ fontWeight: 600 }}>sh-ui</span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarBody />
        </Sidebar>
        <SidebarInset>
          <OpenTrigger />
          <div style={{ padding: "3rem 1rem 1rem", fontSize: "0.875rem" }}>
            메인 콘텐츠 — 별도 헤더 없음
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

// 2) Floating 트리거만으로 — 닫힘: Inset 좌상단 / 열림: 사이드바 헤더 안쪽
export function SidebarHeaderlessFloatingDemo() {
  return (
    <div style={frameStyle}>
      <SidebarProvider embedded defaultOpen={false}>
        <Sidebar>
          <SidebarHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.25rem 0.5rem",
              }}
            >
              <span style={{ fontWeight: 600 }}>sh-ui</span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarBody />
        </Sidebar>
        <SidebarInset>
          <OpenTrigger />
          <div style={{ padding: "3rem 1rem 1rem", fontSize: "0.875rem" }}>
            메인 콘텐츠 — 트리거는 좌상단에 floating
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

// 3) Icon-only 축소 — 닫아도 아이콘 레일이 남아 허전하지 않음
export function SidebarHeaderlessIconDemo() {
  return (
    <div style={frameStyle}>
      <SidebarProvider embedded defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarBody />
        </Sidebar>
        <SidebarInset>
          <div style={{ padding: "1rem", fontSize: "0.875rem" }}>
            메인 콘텐츠 — 사이드바가 아이콘 전용 레일로 축소
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
