import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SearchDialog } from "@/components/search-dialog";
import { TocSlot } from "@/components/toc-slot";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  let defaultOpen = true;
  try {
    const cookieStore = await cookies();
    const sidebarState = cookieStore.get("sidebar_state")?.value;
    defaultOpen = sidebarState !== "false";
  } catch {
    // static generation — 쿠키 없음, 기본값 사용
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="docs-header">
          <SidebarTrigger />
          <div className="docs-header__actions">
            <SearchDialog />
            <LocaleSwitcher />
            <DarkModeToggle />
          </div>
        </header>
        <div className="docs-main">
          {children}
          <TocSlot />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
