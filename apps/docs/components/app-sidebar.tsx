"use client";

import { useTranslations } from "next-intl";
import { allPlugins } from "sh-ui-cli/api";
import {
  BookOpenIcon,
  BoxesIcon,
  BrushIcon,
  FolderPlusIcon,
  HistoryIcon,
  LayersIcon,
  LayoutTemplateIcon,
  PaletteIcon,
  PlugIcon,
  PuzzleIcon,
  RocketIcon,
  TerminalIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Sidebar,
  SidebarCollapsible,
  SidebarCollapsibleContent,
  SidebarCollapsibleTrigger,
  SidebarContent,
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

type TopLink = { key: string; href: string; icon: LucideIcon };

const topLinks: TopLink[] = [
  { key: "gettingStarted", href: "/getting-started", icon: RocketIcon },
  { key: "create", href: "/create", icon: FolderPlusIcon },
  { key: "cli", href: "/cli", icon: TerminalIcon },
  { key: "mcp", href: "/mcp", icon: PlugIcon },
  { key: "cssFramework", href: "/css-framework", icon: LayersIcon },
  { key: "tokens", href: "/tokens", icon: PaletteIcon },
  { key: "theming", href: "/theming", icon: BrushIcon },
  { key: "guidelines", href: "/guidelines", icon: BookOpenIcon },
  { key: "recipes", href: "/recipes", icon: WrenchIcon },
  { key: "examples", href: "/examples", icon: LayoutTemplateIcon },
  { key: "changelog", href: "/changelog", icon: HistoryIcon },
];

// 플러그인 목록은 sh-ui-cli/api 의 allPlugins 에서 derive — 단일 진실.
const plugins: { title: string; href: string }[] = allPlugins.map((p) => ({
  title: p.name,
  href: `/plugins/${p.name}`,
}));

const components: { title: string; href: string }[] = [
  { title: "Accordion", href: "/components/accordion" },
  { title: "Avatar", href: "/components/avatar" },
  { title: "Badge", href: "/components/badge" },
  { title: "Breadcrumb", href: "/components/breadcrumb" },
  { title: "Button", href: "/components/button" },
  { title: "Calendar", href: "/components/calendar" },
  { title: "Card", href: "/components/card" },
  { title: "Carousel", href: "/components/carousel" },
  { title: "Checkbox", href: "/components/checkbox" },
  { title: "CodeEditor", href: "/components/code-editor" },
  { title: "CodePanel", href: "/components/code-panel" },
  { title: "CodeTabs", href: "/components/code-tabs" },
  { title: "ColorPicker", href: "/components/color-picker" },
  { title: "Combobox", href: "/components/combobox" },
  { title: "ContextMenu", href: "/components/context-menu" },
  { title: "DatePicker", href: "/components/date-picker" },
  { title: "Dialog", href: "/components/dialog" },
  { title: "DropdownMenu", href: "/components/dropdown-menu" },
  { title: "FileUpload", href: "/components/file-upload" },
  { title: "Form", href: "/components/form" },
  { title: "Header", href: "/components/header" },
  { title: "Input", href: "/components/input" },
  { title: "Label", href: "/components/label" },
  { title: "MarkdownEditor", href: "/components/markdown-editor" },
  { title: "Menubar", href: "/components/menubar" },
  { title: "NumericInput", href: "/components/numeric-input" },
  { title: "PageTOC", href: "/components/page-toc" },
  { title: "Pagination", href: "/components/pagination" },
  { title: "Popover", href: "/components/popover" },
  { title: "Progress", href: "/components/progress" },
  { title: "Radio", href: "/components/radio" },
  { title: "RichTextEditor", href: "/components/rich-text-editor" },
  { title: "Select", href: "/components/select" },
  { title: "Separator", href: "/components/separator" },
  { title: "Sidebar", href: "/components/sidebar" },
  { title: "Skeleton", href: "/components/skeleton" },
  { title: "Slider", href: "/components/slider" },
  { title: "Spinner", href: "/components/spinner" },
  { title: "Switch", href: "/components/switch" },
  { title: "Tabs", href: "/components/tabs" },
  { title: "Textarea", href: "/components/textarea" },
  { title: "Theme", href: "/components/theme" },
  { title: "Toast", href: "/components/toast" },
  { title: "Toggle", href: "/components/toggle" },
  { title: "Tooltip", href: "/components/tooltip" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const componentsActive = pathname.startsWith("/components/");
  const pluginsActive = pathname.startsWith("/plugins/");

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
          <SidebarGroupLabel>{tSidebar("groupLabel")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topLinks.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{tSidebar(`links.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarCollapsible defaultOpen={pluginsActive}>
                  <SidebarCollapsibleTrigger>
                    <PuzzleIcon />
                    <span>{tSidebar("links.plugins")}</span>
                  </SidebarCollapsibleTrigger>
                  <SidebarCollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === "/plugins"}>
                          <Link href="/plugins">
                            <span>{tCommon("viewAll")}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {plugins.map((p) => (
                        <SidebarMenuSubItem key={p.href}>
                          <SidebarMenuSubButton asChild isActive={isActive(p.href)}>
                            <Link href={p.href}>
                              <span>{p.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarCollapsibleContent>
                </SidebarCollapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarCollapsible defaultOpen={componentsActive}>
                  <SidebarCollapsibleTrigger>
                    <BoxesIcon />
                    <span>{tSidebar("links.components")}</span>
                  </SidebarCollapsibleTrigger>
                  <SidebarCollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === "/components"}>
                          <Link href="/components">
                            <span>{tCommon("viewAll")}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
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
    </Sidebar>
  );
}
