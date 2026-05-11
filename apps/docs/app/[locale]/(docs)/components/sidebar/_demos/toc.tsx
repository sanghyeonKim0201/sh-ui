"use client";

import { useState } from "react";
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
  SidebarTOC,
} from "@/components/ui/sidebar";

const sections = [
  { id: "toc-intro", title: "Intro" },
  { id: "toc-install", title: "Installation" },
  { id: "toc-usage", title: "Usage" },
  { id: "toc-api", title: "API" },
  { id: "toc-faq", title: "FAQ" },
];

export function SidebarTOCDemo() {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

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
        <Sidebar collapsible="none">
          <SidebarHeader>
            <div style={{ padding: "0.25rem 0.5rem", fontWeight: 600 }}>On this page</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarTOC
              sectionIds={sections.map((s) => s.id)}
              root={scrollEl}
              rootMargin="0px 0px -70% 0px"
            >
              <SidebarGroup>
                <SidebarGroupLabel>목차</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sections.map((s) => (
                      <SidebarMenuItem key={s.id}>
                        <SidebarMenuButton
                          sectionId={s.id}
                          render={<a href={`#${s.id}`}>{s.title}</a>}
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarTOC>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div
            ref={setScrollEl}
            style={{
              height: "100%",
              overflowY: "auto",
              padding: "1rem 1.25rem",
              scrollBehavior: "smooth",
            }}
          >
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                style={{
                  minHeight: 260,
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{s.title}</h3>
                <p style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
                  스크롤을 내리면 사이드바의 해당 항목이 자동으로 활성화됩니다.
                </p>
              </section>
            ))}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
