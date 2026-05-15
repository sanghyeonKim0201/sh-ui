"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderItem,
  HeaderLogo,
  HeaderNav,
  HeaderTitle,
  HeaderTrigger,
} from "./components/ui/header";
import { Button } from "./components/ui/button";

const items = [
  { href: "/", label: "홈" },
  { href: "/docs", label: "문서" },
  { href: "/components", label: "컴포넌트" },
  { href: "/pricing", label: "가격" },
];

export default function App() {
  return (
    <div
      style={{
        width: "100%",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <Header>
        <HeaderTrigger />
        <HeaderBrand>
          <HeaderLogo>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </HeaderLogo>
          <HeaderTitle>sh-ui</HeaderTitle>
        </HeaderBrand>
        <HeaderNav defaultValue="/">
          {items.map((it) => (
            <HeaderItem key={it.href} href={it.href}>
              {it.label}
            </HeaderItem>
          ))}
        </HeaderNav>
        <HeaderActions>
          <Button variant="secondary" size="sm">
            로그인
          </Button>
        </HeaderActions>
      </Header>
    </div>
  );
}
`;

export function HeaderLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="header"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={680}
    />
  );
}
