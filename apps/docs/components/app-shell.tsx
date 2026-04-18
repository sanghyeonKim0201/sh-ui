import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { TocSlot } from "@/components/toc-slot";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ui/theme";

export async function AppShell({
  defaultTheme = "light",
  children,
}: {
  defaultTheme?: "light" | "dark";
  children: ReactNode;
}) {
  let defaultOpen = true;
  try {
    const cookieStore = await cookies();
    const sidebarState = cookieStore.get("sidebar_state")?.value;
    defaultOpen = sidebarState !== "false";
  } catch {
    // static generation — 쿠키 없음, 기본값 사용
  }

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderBottom: "1px solid var(--border)",
              position: "sticky",
              top: 0,
              background: "var(--background)",
              zIndex: 10,
            }}
          >
            <SidebarTrigger />
          </header>
          {children}
          <TocSlot />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
