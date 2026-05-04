"use client";

import {
  HomeIcon,
  LayoutDashboardIcon,
  MapIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarPanel,
  SidebarPanelContent,
  SidebarPanelHeader,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function SidebarPanelDemo() {
  return (
    <div
      style={{
        width: "100%",
        height: 300,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SidebarProvider embedded defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton panelId="search">
                      <SearchIcon />
                      <span>검색</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton panelId="favorites">
                      <StarIcon />
                      <span>즐겨찾기</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton panelId="settings">
                      <SettingsIcon />
                      <span>설정</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarPanel id="search">
          <SidebarPanelHeader>검색</SidebarPanelHeader>
          <SidebarPanelContent>
            <input
              type="search"
              placeholder="장소·주소 검색"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
              }}
            />
            <p className="muted" style={{ fontSize: "0.8125rem", marginTop: "0.75rem" }}>
              최근 검색어 · 추천 장소 등이 여기에…
            </p>
          </SidebarPanelContent>
        </SidebarPanel>

        <SidebarPanel id="favorites">
          <SidebarPanelHeader>즐겨찾기</SidebarPanelHeader>
          <SidebarPanelContent>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              <li>★ 회사</li>
              <li>★ 집</li>
              <li>★ 자주 가는 카페</li>
            </ul>
          </SidebarPanelContent>
        </SidebarPanel>

        <SidebarPanel id="settings">
          <SidebarPanelHeader>설정</SidebarPanelHeader>
          <SidebarPanelContent>
            <p className="muted" style={{ fontSize: "0.8125rem" }}>
              지도 표시 옵션 · 계정 · 언어 등.
            </p>
          </SidebarPanelContent>
        </SidebarPanel>

        <SidebarInset>
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground-muted)",
              background:
                "repeating-linear-gradient(45deg, var(--background-subtle) 0 10px, var(--background) 10px 20px)",
              gap: "0.5rem",
            }}
          >
            <MapIcon />
            <span style={{ fontSize: "0.875rem" }}>지도 영역 (Inset)</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * 일반 라우팅 메뉴 + 보조 패널 혼합 데모
 *  - "홈", "대시보드", "팀" 은 라우팅 버튼 (onClick으로 페이지 이동)
 *  - "검색", "설정" 은 panelId로 보조 패널 열기
 *  한 SidebarMenu 안에 두 종류가 공존. */
export function SidebarMixedDemo() {
  return (
    <div
      style={{
        width: "100%",
        height: 320,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SidebarProvider embedded>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>탐색</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <HomeIcon />
                      <span>홈</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LayoutDashboardIcon />
                      <span>대시보드</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <UsersIcon />
                      <span>팀</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>도구</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton panelId="mixed-search">
                      <SearchIcon />
                      <span>검색</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton panelId="mixed-settings">
                      <SettingsIcon />
                      <span>설정</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarPanel id="mixed-search">
          <SidebarPanelHeader>검색</SidebarPanelHeader>
          <SidebarPanelContent>
            <input
              type="search"
              placeholder="무엇을 찾으세요?"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
              }}
            />
          </SidebarPanelContent>
        </SidebarPanel>

        <SidebarPanel id="mixed-settings">
          <SidebarPanelHeader>설정</SidebarPanelHeader>
          <SidebarPanelContent>
            <p className="muted" style={{ fontSize: "0.8125rem" }}>
              패널 안에 설정 폼을 배치.
            </p>
          </SidebarPanelContent>
        </SidebarPanel>

        <SidebarInset>
          <div
            style={{
              padding: "1rem",
              color: "var(--foreground-muted)",
              fontSize: "0.875rem",
            }}
          >
            메인 콘텐츠 — 좌측 "홈/대시보드/팀"은 페이지 이동, "검색/설정"은 보조 패널.
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
