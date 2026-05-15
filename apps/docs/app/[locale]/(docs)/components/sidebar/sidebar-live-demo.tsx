"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
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
} from "./components/ui/sidebar";

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const items = [
  { title: "Home", d: "M3 12l9-9 9 9M5 10v10h14V10" },
  { title: "Inbox", d: "M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v7H2v-7l3-7z" },
  { title: "Profile", d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
  { title: "Settings", d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
];

export default function App() {
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
        <Sidebar collapsible="offcanvas">
          <SidebarHeader>
            <div style={{ padding: "0.25rem 0.5rem", fontWeight: 600 }}>sh-ui</div>
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
                        <Icon d={item.d} />
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
          <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <SidebarTrigger />
            <span style={{ color: "var(--foreground-muted)" }}>Main content</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
`;

export function SidebarLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="sidebar"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={760}
    />
  );
}
