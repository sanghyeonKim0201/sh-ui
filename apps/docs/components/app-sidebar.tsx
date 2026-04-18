"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  BoxesIcon,
  PaletteIcon,
  RocketIcon,
  SlidersHorizontalIcon,
  type LucideIcon,
} from "lucide-react";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import {
  Sidebar,
  SidebarCollapsible,
  SidebarCollapsibleContent,
  SidebarCollapsibleTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const topLinks: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "시작하기", href: "/getting-started", icon: RocketIcon },
  { title: "토큰", href: "/tokens", icon: PaletteIcon },
  { title: "Playground", href: "/playground", icon: SlidersHorizontalIcon },
  { title: "가이드라인", href: "/guidelines", icon: BookOpenIcon },
];

const components: { title: string; href: string }[] = [
  { title: "Button", href: "/components/button" },
  { title: "Card", href: "/components/card" },
  { title: "Checkbox", href: "/components/checkbox" },
  { title: "CodePanel", href: "/components/code-panel" },
  { title: "ColorPicker", href: "/components/color-picker" },
  { title: "Combobox", href: "/components/combobox" },
  { title: "DatePicker", href: "/components/date-picker" },
  { title: "Dialog", href: "/components/dialog" },
  { title: "FileUpload", href: "/components/file-upload" },
  { title: "Input", href: "/components/input" },
  { title: "Label", href: "/components/label" },
  { title: "Popover", href: "/components/popover" },
  { title: "Radio", href: "/components/radio" },
  { title: "Select", href: "/components/select" },
  { title: "Sidebar", href: "/components/sidebar" },
  { title: "Slider", href: "/components/slider" },
  { title: "Switch", href: "/components/switch" },
  { title: "Tabs", href: "/components/tabs" },
  { title: "Textarea", href: "/components/textarea" },
  { title: "Theme", href: "/components/theme" },
  { title: "Toast", href: "/components/toast" },
  { title: "Toggle", href: "/components/toggle" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const componentsActive = pathname.startsWith("/components/");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="sh-ui-brand">
          <span className="sh-ui-brand__mark" aria-hidden>
            H
          </span>
          <span className="sh-ui-brand__name">sh-ui</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Docs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topLinks.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarCollapsible defaultOpen={componentsActive}>
                  <SidebarCollapsibleTrigger>
                    <BoxesIcon />
                    <span>Components</span>
                  </SidebarCollapsibleTrigger>
                  <SidebarCollapsibleContent>
                    <SidebarMenuSub>
                      {components.map((c) => (
                        <SidebarMenuSubItem key={c.href}>
                          <SidebarMenuSubButton asChild isActive={isActive(c.href)}>
                            <Link href={c.href}>
                              <span>{c.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarCollapsibleContent>
                </SidebarCollapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DarkModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
