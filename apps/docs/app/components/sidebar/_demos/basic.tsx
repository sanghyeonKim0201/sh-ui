"use client";

import { HomeIcon, InboxIcon, SettingsIcon, UserIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", icon: HomeIcon },
  { title: "Inbox", icon: InboxIcon },
  { title: "Profile", icon: UserIcon },
  { title: "Settings", icon: SettingsIcon },
];

export interface SidebarBasicDemoProps {
  collapsible?: "offcanvas" | "icon" | "none";
  variant?: "sidebar" | "floating" | "inset";
}

export function SidebarBasicDemo({
  collapsible = "offcanvas",
  variant = "sidebar",
}: SidebarBasicDemoProps) {
  return (
    <div
      style={{
        width: "100%",
        height: 360,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SidebarProvider embedded>
        <Sidebar collapsible={collapsible} variant={variant}>
          <SidebarHeader>
            <div style={{ padding: "0.25rem 0.5rem", fontWeight: 600 }}>Hyeon</div>
          </SidebarHeader>
          <SidebarSeparator />
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
          <SidebarFooter>
            <div style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              v0.1.0
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <SidebarTrigger />
            <span style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
              Cmd/Ctrl + B 로 토글
            </span>
          </header>
          <div style={{ padding: "1rem", fontSize: "0.875rem" }}>
            메인 콘텐츠 영역
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
